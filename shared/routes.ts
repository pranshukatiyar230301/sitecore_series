import { z } from 'zod';
import { insertContactSchema, insertNewsletterSubscriberSchema, insertPostSchema, posts, contactSubmissions, newsletterSubscribers, jobs, insertJobSchema } from './schema';

export const api = {
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts',
      input: z.object({
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:slug',
      responses: {
        200: z.custom<typeof posts.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs',
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/jobs',
      input: insertJobSchema,
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/jobs/:id',
      input: insertJobSchema.partial(),
      responses: {
        200: z.custom<typeof jobs.$inferSelect>(),
        400: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/jobs/:id',
      responses: {
        200: z.object({ ok: z.boolean() }),
        404: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertContactSchema,
      responses: {
        201: z.custom<typeof contactSubmissions.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  newsletter: {
    subscribe: {
      method: 'POST' as const,
      path: '/api/newsletter/subscribe',
      input: insertNewsletterSubscriberSchema,
      responses: {
        201: z.object({ subscribed: z.boolean(), alreadySubscribed: z.boolean() }),
        400: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}