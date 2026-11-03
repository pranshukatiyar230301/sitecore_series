import { db } from "./db";
import {
  posts, contactSubmissions, siteContent, events, podcasts, categories,
  newsletterSubscribers, jobs,
  type InsertContact, type InsertNewsletterSubscriber, type InsertPost, type InsertEvent, type InsertPodcast, type InsertCategory, type InsertJob,
} from "@shared/schema";
import { eq, desc, and, asc, lt } from "drizzle-orm";

export interface IStorage {
  getPosts(category?: string, opts?: { includeUnpublished?: boolean }): Promise<typeof posts.$inferSelect[]>;
  getPost(slug: string, opts?: { includeUnpublished?: boolean }): Promise<typeof posts.$inferSelect | undefined>;
  getPostById(id: number): Promise<typeof posts.$inferSelect | undefined>;
  createPost(post: InsertPost): Promise<typeof posts.$inferSelect>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<typeof posts.$inferSelect | undefined>;
  deletePost(id: number): Promise<boolean>;

  createContact(contact: InsertContact): Promise<typeof contactSubmissions.$inferSelect>;
  listContactSubmissions(): Promise<typeof contactSubmissions.$inferSelect[]>;
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<typeof newsletterSubscribers.$inferSelect | undefined>;

  getSiteContent(key: string): Promise<any>;
  setSiteContent(key: string, data: any): Promise<typeof siteContent.$inferSelect>;

  listEvents(opts?: { includeUnpublished?: boolean }): Promise<typeof events.$inferSelect[]>;
  createEvent(e: InsertEvent): Promise<typeof events.$inferSelect>;
  updateEvent(id: number, e: Partial<InsertEvent>): Promise<typeof events.$inferSelect | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  listPodcasts(opts?: { includeUnpublished?: boolean }): Promise<typeof podcasts.$inferSelect[]>;
  createPodcast(p: InsertPodcast): Promise<typeof podcasts.$inferSelect>;
  updatePodcast(id: number, p: Partial<InsertPodcast>): Promise<typeof podcasts.$inferSelect | undefined>;
  deletePodcast(id: number): Promise<boolean>;

  listCategories(): Promise<typeof categories.$inferSelect[]>;
  createCategory(c: InsertCategory): Promise<typeof categories.$inferSelect>;
  updateCategory(id: number, c: Partial<InsertCategory>): Promise<typeof categories.$inferSelect | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  listJobs(): Promise<typeof jobs.$inferSelect[]>;
  createJob(job: InsertJob): Promise<typeof jobs.$inferSelect>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<typeof jobs.$inferSelect | undefined>;
  deleteJob(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // In-Memory Cache Map for fast content delivery
  private cache = new Map<string, { data: any; expiry: number }>();

  private getCached<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  private setCache(key: string, data: any, ttlSeconds = 300) {
    this.cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
  }

  private invalidateCache(pattern: string) {
    for (const k of this.cache.keys()) {
      if (k.includes(pattern)) this.cache.delete(k);
    }
  }

  async getPosts(category?: string, opts?: { includeUnpublished?: boolean }) {
    const conds = [] as any[];
    if (category) conds.push(eq(posts.category, category));
    if (!opts?.includeUnpublished) conds.push(eq(posts.published, true));
    const where = conds.length ? (conds.length === 1 ? conds[0] : and(...conds)) : undefined;
    const q = db.select().from(posts).orderBy(desc(posts.createdAt));
    return await (where ? q.where(where) : q);
  }

  async getPost(slug: string, opts?: { includeUnpublished?: boolean }) {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (!post) return undefined;
    if (!opts?.includeUnpublished && !post.published) return undefined;
    return post;
  }

  async getPostById(id: number) {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost) {
    const [r] = await db.insert(posts).values(post).returning();
    this.invalidateCache("posts");
    return r;
  }

  async updatePost(id: number, data: Partial<InsertPost>) {
    const [r] = await db.update(posts).set({ ...data, createdAt: new Date() }).where(eq(posts.id, id)).returning();
    this.invalidateCache("posts");
    return r;
  }

  async deletePost(id: number) {
    const r = await db.delete(posts).where(eq(posts.id, id)).returning();
    this.invalidateCache("posts");
    return r.length > 0;
  }

  async createContact(contact: InsertContact) {
    const [r] = await db.insert(contactSubmissions).values(contact).returning();
    return r;
  }

  async listContactSubmissions() {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber) {
    const [r] = await db.insert(newsletterSubscribers)
      .values(subscriber)
      .onConflictDoNothing({ target: newsletterSubscribers.email })
      .returning();
    return r;
  }

  async getSiteContent(key: string) {
    const cacheKey = `site_content_${key}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const [r] = await db.select().from(siteContent).where(eq(siteContent.key, key));
    if (r?.data) {
      this.setCache(cacheKey, r.data, 600); // Cache for 10 mins
    }
    return r?.data;
  }

  async setSiteContent(key: string, data: any) {
    const existing = await db.select().from(siteContent).where(eq(siteContent.key, key));
    let r;
    if (existing.length) {
      [r] = await db.update(siteContent).set({ data, updatedAt: new Date() }).where(eq(siteContent.key, key)).returning();
    } else {
      [r] = await db.insert(siteContent).values({ key, data }).returning();
    }
    this.invalidateCache(`site_content_${key}`);
    return r;
  }

  async listEvents(opts?: { includeUnpublished?: boolean }) {
    const allEvents = await db.select().from(events);
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return allEvents
      .filter((event) => {
        if (!opts?.includeUnpublished && !event.published) return false;
        const eventTime = new Date(event.startDate).getTime();
        return eventTime >= now - fiveDaysInMs;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  async createEvent(e: InsertEvent) { const [r] = await db.insert(events).values(e).returning(); return r; }
  async updateEvent(id: number, e: Partial<InsertEvent>) {
    const [r] = await db.update(events).set({ ...e, createdAt: new Date() }).where(eq(events.id, id)).returning();
    return r;
  }
  async deleteEvent(id: number) {
    const r = await db.delete(events).where(eq(events.id, id)).returning();
    return r.length > 0;
  }

  async listPodcasts(opts?: { includeUnpublished?: boolean }) {
    const q = db.select().from(podcasts).orderBy(desc(podcasts.episodeDate));
    if (opts?.includeUnpublished) return await q;
    return await q.where(eq(podcasts.published, true));
  }
  async createPodcast(p: InsertPodcast) { const [r] = await db.insert(podcasts).values(p).returning(); return r; }
  async updatePodcast(id: number, p: Partial<InsertPodcast>) {
    const [r] = await db.update(podcasts).set({ ...p, createdAt: new Date() }).where(eq(podcasts.id, id)).returning();
    return r;
  }
  async deletePodcast(id: number) {
    const r = await db.delete(podcasts).where(eq(podcasts.id, id)).returning();
    return r.length > 0;
  }

  async listCategories() {
    const cacheKey = "categories_list";
    const cached = this.getCached<typeof categories.$inferSelect[]>(cacheKey);
    if (cached) return cached;

    const res = await db.select().from(categories).orderBy(asc(categories.group), asc(categories.sortOrder), asc(categories.name));
    this.setCache(cacheKey, res, 600);
    return res;
  }

  async createCategory(c: InsertCategory) {
    const [r] = await db.insert(categories).values(c).returning();
    this.invalidateCache("categories");
    return r;
  }
  async updateCategory(id: number, c: Partial<InsertCategory>) {
    const [r] = await db.update(categories).set(c).where(eq(categories.id, id)).returning();
    this.invalidateCache("categories");
    return r;
  }
  async deleteCategory(id: number) {
    const r = await db.delete(categories).where(eq(categories.id, id)).returning();
    this.invalidateCache("categories");
    return r.length > 0;
  }

  async listJobs() {
    // Non-blocking asynchronous background cleanup of stale 30-day jobs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    db.delete(jobs).where(lt(jobs.createdAt, thirtyDaysAgo)).catch((err) => console.error("Jobs cleanup error:", err));

    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async createJob(job: InsertJob) {
    const [r] = await db.insert(jobs).values(job).returning();
    return r;
  }
  async updateJob(id: number, job: Partial<InsertJob>) {
    const [r] = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return r;
  }
  async deleteJob(id: number) {
    const r = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return r.length > 0;
  }
}

export const storage = new DatabaseStorage();