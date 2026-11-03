import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  authorName: text("author_name"),
  coverImage: text("cover_image"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  location: text("location").notNull(),
  link: text("link"),
  image: text("image"),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const podcasts = pgTable("podcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  host: text("host"),
  episodeDate: text("episode_date"),
  episodeUrl: text("episode_url"),
  image: text("image"),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  group: text("group").notNull().default("Core"),
  sortOrder: integer("sort_order").notNull().default(0),
  tagline: text("tagline"),
  description: text("description"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  jobType: text("job_type").notNull(),
  location: text("location").notNull(),
  applyUrl: text("apply_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true }).extend({
  email: z.string().trim().email("Please enter a valid email address"),
});
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, createdAt: true }).extend({
  email: z.string().trim().email("Please enter a valid email address"),
});
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertPodcastSchema = createInsertSchema(podcasts).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// Explicitly configured insert schema to allow unlimited length rich text & valid apply URL
export const insertJobSchema = createInsertSchema(jobs, {
  companyName: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  jobType: z.string().min(1, "Job type is required"),
  location: z.string().min(1, "Location is required"),
  applyUrl: z.string().url("Must be a valid URL starting with http:// or https://"),
}).omit({ id: true, createdAt: true });

export const upsertSiteContentSchema = z.object({ key: z.string().min(1), data: z.any() });

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Contact = typeof contactSubmissions.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type SiteContent = typeof siteContent.$inferSelect;