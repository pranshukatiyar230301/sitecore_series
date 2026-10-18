# SitecoreSeries Blog Platform

## Overview

A full-stack blog platform focused on Sitecore technology content. The application serves as a technical blog with articles organized by Sitecore product categories (Content Hub, SXA, JSS, XM Cloud, etc.). Features include blog listing, category filtering, individual post pages, and a contact form.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and interactions
- **Form Handling**: React Hook Form with Zod validation

The frontend follows a pages-based structure where each route maps to a component in `client/src/pages/`. Shared components live in `client/src/components/` with UI primitives in the `ui/` subdirectory. Custom hooks abstract data fetching logic (`use-posts.ts`, `use-contact.ts`).

### Backend Architecture
- **Framework**: Express.js running on Node.js
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Build Process**: esbuild for server bundling, Vite for client bundling

The server uses a storage abstraction layer (`server/storage.ts`) that implements an `IStorage` interface, making it easy to swap data sources. Routes are registered in `server/routes.ts` and auto-seed sample blog posts on first run.

### Shared Code
The `shared/` directory contains code used by both client and server:
- `schema.ts`: Drizzle table definitions for `posts` and `contactSubmissions`, plus Zod insert schemas
- `routes.ts`: API route contracts with input/output type definitions

### Database Schema
Two main tables:
- **posts**: id, title, slug (unique), content, summary, category, coverImage, createdAt
- **contactSubmissions**: id, name, email, message, createdAt

### Development vs Production
- Development: Vite dev server with HMR proxied through Express
- Production: Static files served from `dist/public`, server bundled to `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but sessions not actively used in current implementation)

### Key NPM Packages
- **drizzle-orm / drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Async state management
- **zod / drizzle-zod**: Schema validation and type generation
- **framer-motion**: Animation library
- **date-fns**: Date formatting utilities
- **Radix UI primitives**: Accessible component foundations via shadcn/ui

### External Services
- **Google Fonts**: Inter, Playfair Display, and JetBrains Mono font families
- **Unsplash**: Stock images for blog post covers (referenced via URLs)

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner`: Development tooling (conditional loading)