import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  insertPostSchema, insertContactSchema,
  insertNewsletterSubscriberSchema,
  insertEventSchema, insertPodcastSchema, insertCategorySchema,
} from "@shared/schema";
import { z } from "zod";
import { timingSafeEqual, randomBytes } from "crypto";
import multer from "multer";
import axios from "axios";
import { runSeed } from "./seed";
import { sendContactEmail } from "./email";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

// Simple custom in-memory cache
const memoryCache = new Map<string, { data: any; expiry: number }>();

function getCache(key: string) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCache(key: string, data: any, ttlSeconds = 60) {
  memoryCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

function clearCache() {
  memoryCache.clear();
}

// Secure Token generated on startup so plaintext password is never exposed in API responses
const activeAdminToken = randomBytes(32).toString("hex");

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const provided = (req.headers["x-admin-token"] as string | undefined) || "";
  if (!expected) return res.status(500).json({ message: "Admin password not configured" });

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const c = Buffer.from(activeAdminToken);

  const isValid = (a.length === b.length && timingSafeEqual(a, b)) ||
                  (a.length === c.length && timingSafeEqual(a, c));

  if (!isValid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Use memory storage so files are held in RAM temporarily before streaming to ImgBB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  runSeed().catch(console.error);

  // Enforce HTTPS redirection in production
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https" && process.env.NODE_ENV === "production") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
    }
    next();
  });

  // Keep-Alive Self-Ping for Render Free Tier (Pings every 10 mins to prevent sleep)
  const TEN_MINUTES = 10 * 60 * 1000;
  setInterval(() => {
    const siteUrl = process.env.PUBLIC_SITE_URL || "https://sitecoreseries.com";
    axios.get(`${siteUrl}/api/categories`)
      .catch((err) => console.error("[Keep-Alive] Ping background check error:", err.message));
  }, TEN_MINUTES);

  function isAdminRequest(req: Request) {
    const expected = process.env.ADMIN_PASSWORD || "";
    const provided = (req.headers["x-admin-token"] as string | undefined) || "";
    if (!expected) return false;
    
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    const c = Buffer.from(activeAdminToken);

    return (a.length === b.length && timingSafeEqual(a, b)) ||
           (a.length === c.length && timingSafeEqual(a, c));
  }

  // SEO: Dynamic XML Sitemap Endpoint
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400");

      const smStream = new SitemapStream({ hostname: "https://sitecoreseries.com" });

      const staticPages = [
        { url: "/", changefreq: "daily", priority: 1.0 },
        { url: "/about", changefreq: "monthly", priority: 0.8 },
        { url: "/contact", changefreq: "monthly", priority: 0.7 },
        { url: "/podcasts", changefreq: "weekly", priority: 0.8 },
        { url: "/events", changefreq: "weekly", priority: 0.8 },
        { url: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
        { url: "/terms-of-service", changefreq: "yearly", priority: 0.3 },
      ];

      staticPages.forEach((page) => smStream.write(page));

      const allPosts = await storage.getPosts(undefined, { includeUnpublished: false });
      allPosts.forEach((post) => {
        smStream.write({
          url: `/post/${post.slug}`,
          changefreq: "weekly",
          priority: 0.9,
          lastmod: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        });
      });

      const categories = await storage.listCategories();
      categories.forEach((cat) => {
        smStream.write({
          url: `/blogs/${cat.slug}`,
          changefreq: "weekly",
          priority: 0.8,
        });
      });

      smStream.end();
      const xml = await streamToPromise(Readable.from(smStream)).then((data) => data.toString());
      res.send(xml);
    } catch (e) {
      console.error("Sitemap generation error:", e);
      res.status(500).end();
    }
  });

  // SEO: Dynamic Robots.txt Endpoint
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /admin

Sitemap: https://sitecoreseries.com/sitemap.xml
`);
  });

  // Posts
  app.get(api.posts.list.path, async (req, res) => {
    const isAdmin = isAdminRequest(req);
    const cacheKey = `posts_list_${req.query.category || "all"}_${isAdmin}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    const posts = await storage.getPosts(req.query.category as string | undefined, { includeUnpublished: isAdmin });
    setCache(cacheKey, posts, 60);
    res.json(posts);
  });

  app.get(api.posts.get.path, async (req, res) => {
    const isAdmin = isAdminRequest(req);
    const cacheKey = `post_slug_${req.params.slug}_${isAdmin}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    const post = await storage.getPost(req.params.slug, { includeUnpublished: isAdmin });
    if (!post) return res.status(404).json({ message: "Post not found" });
    setCache(cacheKey, post, 60);
    res.json(post);
  });

  // Admin: secure login (returns session token instead of plaintext password)
  app.post("/api/admin/login", (req, res) => {
    const expected = process.env.ADMIN_PASSWORD || "";
    const { password } = req.body || {};
    if (!expected) return res.status(500).json({ message: "Admin password not configured" });
    if (typeof password !== "string" || password !== expected) return res.status(401).json({ message: "Invalid password" });
    
    res.json({ token: activeAdminToken });
  });

  app.get("/api/admin/verify", adminAuth, (_req, res) => res.json({ ok: true }));

  // Admin: posts CRUD
  app.post("/api/admin/posts", adminAuth, async (req, res) => {
    try { 
      const newPost = await storage.createPost(insertPostSchema.parse(req.body));
      clearCache();
      res.status(201).json(newPost); 
    }
    catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });

  app.patch("/api/admin/posts/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
      const data = insertPostSchema.partial().parse(req.body);
      const updated = await storage.updatePost(id, data);
      if (!updated) return res.status(404).json({ message: "Not found" });
      clearCache();
      res.json(updated);
    } catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });

  app.delete("/api/admin/posts/:id", adminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const ok = await storage.deletePost(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    clearCache();
    res.json({ ok: true });
  });

  // Admin: ImgBB upload
  app.post("/api/admin/upload", adminAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const apiKey = process.env.IMGBB_API_KEY || "bef465d53a9867ficed9226d09574e498";
      const base64Image = req.file.buffer.toString("base64");

      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("image", base64Image);

      const response = await axios.post("https://api.imgbb.com/1/upload", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.data && response.data.success) {
        return res.status(201).json({ url: response.data.data.url });
      } else {
        return res.status(400).json({ message: "Failed to upload image to cloud storage" });
      }
    } catch (err: any) {
      console.error("ImgBB upload error:", err?.response?.data || err.message);
      return res.status(500).json({ message: "Image upload failed" });
    }
  });

  // Site content
  const ALLOWED_KEYS = new Set(["home", "about", "contact", "footer"]);
  app.get("/api/site-content/:key", async (req, res) => {
    if (!ALLOWED_KEYS.has(req.params.key)) return res.status(404).json({ message: "Unknown key" });
    const data = await storage.getSiteContent(req.params.key);
    res.json(data ?? null);
  });
  app.put("/api/admin/site-content/:key", adminAuth, async (req, res) => {
    if (!ALLOWED_KEYS.has(req.params.key)) return res.status(400).json({ message: "Unknown key" });
    const r = await storage.setSiteContent(req.params.key, req.body);
    clearCache();
    res.json(r);
  });

  // Events (Filtered: 5-day expiration & sorted by nearest start date first)
  app.get("/api/events", async (req, res) => {
    const isAdmin = isAdminRequest(req);
    const allEvents = await storage.listEvents({ includeUnpublished: isAdmin });
    
    const now = new Date();
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

    const filteredEvents = allEvents
      .filter((event) => {
        if (isAdmin) return true;
        const eventTime = new Date(event.startDate).getTime();
        return eventTime >= now.getTime() - fiveDaysInMs;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    res.json(filteredEvents);
  });

  app.post("/api/admin/events", adminAuth, async (req, res) => {
    try { res.status(201).json(await storage.createEvent(insertEventSchema.parse(req.body))); }
    catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.patch("/api/admin/events/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await storage.updateEvent(id, insertEventSchema.partial().parse(req.body));
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.delete("/api/admin/events/:id", adminAuth, async (req, res) => {
    const ok = await storage.deleteEvent(parseInt(req.params.id, 10));
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  });

  // Podcasts
  app.get("/api/podcasts", async (req, res) => {
    res.json(await storage.listPodcasts({ includeUnpublished: isAdminRequest(req) }));
  });
  app.post("/api/admin/podcasts", adminAuth, async (req, res) => {
    try { res.status(201).json(await storage.createPodcast(insertPodcastSchema.parse(req.body))); }
    catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.patch("/api/admin/podcasts/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await storage.updatePodcast(id, insertPodcastSchema.partial().parse(req.body));
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.delete("/api/admin/podcasts/:id", adminAuth, async (req, res) => {
    const ok = await storage.deletePodcast(parseInt(req.params.id, 10));
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  });

  // Categories
  app.get("/api/categories", async (_req, res) => {
    const cached = getCache("categories_list");
    if (cached) return res.json(cached);
    const cats = await storage.listCategories();
    setCache("categories_list", cats, 60);
    res.json(cats);
  });
  app.post("/api/admin/categories", adminAuth, async (req, res) => {
    try { 
      const cat = await storage.createCategory(insertCategorySchema.parse(req.body));
      clearCache();
      res.status(201).json(cat); 
    }
    catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.patch("/api/admin/categories/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await storage.updateCategory(id, insertCategorySchema.partial().parse(req.body));
      if (!updated) return res.status(404).json({ message: "Not found" });
      clearCache();
      res.json(updated);
    } catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.delete("/api/admin/categories/:id", adminAuth, async (req, res) => {
    const ok = await storage.deleteCategory(parseInt(req.params.id, 10));
    if (!ok) return res.status(404).json({ message: "Not found" });
    clearCache();
    res.json({ ok: true });
  });

  // Admin: contact submissions
  app.get("/api/admin/contact-submissions", adminAuth, async (_req, res) => {
    res.json(await storage.listContactSubmissions());
  });

  // Public: contact submit
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      sendContactEmail(data).catch((err) => console.error("[email] unexpected:", err));
      res.status(201).json(contact);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.newsletter.subscribe.path, async (req, res) => {
    try {
      const data = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.createNewsletterSubscriber(data);
      res.status(201).json({ subscribed: true, alreadySubscribed: !subscriber });
    } catch (e: any) {
      res.status(400).json({ message: e?.message || "Invalid email address" });
    }
  });

  return httpServer;
}