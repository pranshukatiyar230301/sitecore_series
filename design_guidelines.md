# SitecoreSeries Blog Platform - Design Guidelines

## Design Approach
**System**: Hybrid approach drawing from Vercel's technical elegance + Medium's reading experience + Stripe's professional restraint. Focus on information architecture and reading comfort for developers.

## Typography System
**Font Stack**: 
- Headings: Inter (700, 600, 500) - technical clarity
- Body: Inter (400, 500) - optimal screen reading
- Code: JetBrains Mono (400, 500) - developer familiarity

**Hierarchy**:
- H1: 48px/56px (hero), 36px/44px (page)
- H2: 32px/40px
- H3: 24px/32px
- H4: 20px/28px
- Body: 18px/28px (articles), 16px/24px (UI)
- Code inline: 16px/24px

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24 (p-2, h-8, my-12, etc.)

**Content Widths**:
- Article content: max-w-3xl (optimal reading ~680px)
- Page containers: max-w-7xl
- Full-width sections: w-full with inner constraints

**Grid Strategy**:
- Article listings: 2-3 column grid (md:grid-cols-2 lg:grid-cols-3)
- Featured posts: Asymmetric 2-column (large + 2 stacked)
- Tags/categories: 4-6 columns on desktop

## Component Library

**Navigation Header**:
- Sticky top navigation with subtle shadow on scroll
- Logo left, primary nav center, search + profile right
- Height: h-16, backdrop blur when scrolling
- Search: Expandable with keyboard shortcut indicator (⌘K)

**Hero Section** (Homepage):
- Full-width hero with gradient overlay on image
- Height: 60vh minimum
- Featured article with large title, excerpt, author, read time
- CTA button with blur background (backdrop-filter: blur(12px), semi-transparent white/blue)
- Breadcrumb trail at top

**Article Cards**:
- Clean card design with subtle border, no heavy shadows
- Thumbnail image (16:9 aspect ratio)
- Category tag (small, rounded, subtle blue background)
- Title (font-semibold, 20px)
- Excerpt (2 lines, text-gray-600)
- Author avatar + name, date, read time (flex row)
- Hover: Subtle lift (translate-y-1) + border color shift

**Article Reading Layout**:
- Two-column on desktop: Main content (max-w-3xl) + Sticky sidebar (w-80)
- Sidebar includes: Table of contents, Related articles, Author bio, Share buttons
- Generous vertical rhythm (space-y-8 for sections)
- Code blocks: Dark theme with syntax highlighting, copy button top-right
- Inline code: Subtle gray background, slightly smaller font
- Pull quotes: Left border accent, larger text, italic
- Images: Full-width within content column, captions in smaller gray text

**Category/Tag Pages**:
- Header with category name, description, article count
- Filter bar: Sort (Latest/Popular/Trending), Tags as pills
- Grid layout with pagination

**Footer**:
- Three-column layout: About/Resources, Categories, Newsletter signup
- Newsletter: Inline form with email input + subscribe button
- Social links (icon-only, subtle hover states)
- Copyright + Legal links at bottom

**Sidebar Components** (for article pages):
- Table of Contents: Auto-generated, active section highlighted, smooth scroll
- Author Card: Avatar, name, bio snippet, follow button, social links
- Related Articles: 3-4 cards with small thumbnails
- Tags: Wrapped pills layout

**Search Interface**:
- Modal overlay (triggered by header search)
- Large search input with instant results
- Results grouped: Articles, Categories, Tags
- Keyboard navigation support

## Images

**Required Images**:
1. **Hero Image** (Homepage): Modern workspace/code environment, 1920x800px minimum, subtle gradient overlay (dark to transparent top-to-bottom)
2. **Article Thumbnails**: 16:9 ratio, technical/abstract imagery, 800x450px
3. **Author Avatars**: Circular, 64x64px for cards, 128x128px for author pages
4. **Category Headers**: Abstract/tech patterns, 1200x300px

**Image Treatment**: 
- All images use subtle border-radius (rounded-lg)
- Lazy loading for performance
- Alt text required for accessibility

## Interaction Patterns

**Buttons**:
- Primary: Blue background, white text, medium roundness
- Secondary: Blue border, blue text, transparent background
- Ghost: No border/background, blue text, hover background
- On images: Backdrop blur (blur-xl), semi-transparent white background

**Hover States**:
- Links: Underline appears, color shift to darker blue
- Cards: Slight elevation + border color change
- Buttons: Brightness increase, subtle scale (102%)

**Loading States**:
- Skeleton screens for article cards (gray animated pulse)
- Progress bar for page transitions (top of viewport)

## Special Features

**Code Blocks**:
- Dark theme (VS Code-inspired)
- Language label top-left
- Copy button top-right
- Line numbers for multi-line blocks
- Syntax highlighting via Prism.js/Highlight.js

**Reading Progress**:
- Horizontal bar at very top (fixed), fills as user scrolls
- Subtle blue color matching accent

**Responsive Behavior**:
- Mobile: Single column, simplified nav (hamburger), stacked layouts
- Tablet: 2-column grids, condensed sidebar
- Desktop: Full 3-column grids, persistent sidebars

This design prioritizes reading comfort, technical credibility, and efficient content discovery while maintaining visual sophistication appropriate for a professional developer audience.