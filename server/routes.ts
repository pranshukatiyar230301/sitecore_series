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
import path from "path";
import fs from "fs";
import { runSeed } from "./seed";
import { sendContactEmail } from "./email";

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const provided = (req.headers["x-admin-token"] as string | undefined) || "";
  if (!expected) return res.status(500).json({ message: "Admin password not configured" });
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = (path.extname(file.originalname) || "").toLowerCase().slice(0, 8);
      const safeExt = /^\.(jpe?g|png|gif|webp|svg|avif)$/i.test(ext) ? ext : ".bin";
      cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${safeExt}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", immutable: true }));
  runSeed().catch(console.error);

  function isAdminRequest(req: Request) {
    const expected = process.env.ADMIN_PASSWORD || "";
    const provided = (req.headers["x-admin-token"] as string | undefined) || "";
    if (!expected || provided.length !== expected.length) return false;
    try { return timingSafeEqual(Buffer.from(provided), Buffer.from(expected)); } catch { return false; }
  }

  // Posts
  app.get(api.posts.list.path, async (req, res) => {
    const posts = await storage.getPosts(req.query.category as string | undefined, { includeUnpublished: isAdminRequest(req) });
    res.json(posts);
  });
  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(req.params.slug, { includeUnpublished: isAdminRequest(req) });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  // Admin: login + verify
  app.post("/api/admin/login", (req, res) => {
    const expected = process.env.ADMIN_PASSWORD || "";
    const { password } = req.body || {};
    if (!expected) return res.status(500).json({ message: "Admin password not configured" });
    if (typeof password !== "string" || password !== expected) return res.status(401).json({ message: "Invalid password" });
    res.json({ token: expected });
  });
  app.get("/api/admin/verify", adminAuth, (_req, res) => res.json({ ok: true }));

  // Admin: posts CRUD
  app.post("/api/admin/posts", adminAuth, async (req, res) => {
    try { res.status(201).json(await storage.createPost(insertPostSchema.parse(req.body))); }
    catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.patch("/api/admin/posts/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
      const data = insertPostSchema.partial().parse(req.body);
      const updated = await storage.updatePost(id, data);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.delete("/api/admin/posts/:id", adminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const ok = await storage.deletePost(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  });

  // Admin: image upload
  app.post("/api/admin/upload", adminAuth, (req, res) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) return res.status(400).json({ message: err.message || "Upload failed" });
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      res.status(201).json({ url: `/uploads/${req.file.filename}` });
    });
  });

  // ----- Site content (singletons: home / about / contact) -----
  const ALLOWED_KEYS = new Set(["home", "about", "contact"]);
  app.get("/api/site-content/:key", async (req, res) => {
    if (!ALLOWED_KEYS.has(req.params.key)) return res.status(404).json({ message: "Unknown key" });
    const data = await storage.getSiteContent(req.params.key);
    res.json(data ?? null);
  });
  app.put("/api/admin/site-content/:key", adminAuth, async (req, res) => {
    if (!ALLOWED_KEYS.has(req.params.key)) return res.status(400).json({ message: "Unknown key" });
    const r = await storage.setSiteContent(req.params.key, req.body);
    res.json(r);
  });

  // ----- Events -----
  app.get("/api/events", async (req, res) => {
    res.json(await storage.listEvents({ includeUnpublished: isAdminRequest(req) }));
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

  // ----- Podcasts -----
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

  // ----- Categories -----
  app.get("/api/categories", async (_req, res) => res.json(await storage.listCategories()));
  app.post("/api/admin/categories", adminAuth, async (req, res) => {
    try { res.status(201).json(await storage.createCategory(insertCategorySchema.parse(req.body))); }
    catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.patch("/api/admin/categories/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await storage.updateCategory(id, insertCategorySchema.partial().parse(req.body));
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e: any) { res.status(400).json({ message: e?.message || "Invalid input" }); }
  });
  app.delete("/api/admin/categories/:id", adminAuth, async (req, res) => {
    const ok = await storage.deleteCategory(parseInt(req.params.id, 10));
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  });

  // Admin: contact submissions list
  app.get("/api/admin/contact-submissions", adminAuth, async (_req, res) => {
    res.json(await storage.listContactSubmissions());
  });

  // Public: contact submit
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      // Fire-and-forget email; do not block response on transient SendGrid errors
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
