import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/PostCard";
import { ArrowRight, BookOpen, Loader2, Search, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogCategory() {
  const [, params] = useRoute("/blogs/:category");
  const categorySlug = params?.category || "";

  // Fetch categories directly from the database via API
  const { data: dbCategories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const matchedDbCategory = dbCategories.find(
    (c) => c.slug?.toLowerCase() === categorySlug.toLowerCase()
  );

  // Database-driven metadata with clean dynamic fallbacks
  const meta = {
    name: matchedDbCategory?.name || categorySlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    tagline: matchedDbCategory?.tagline || "Sitecore Knowledge",
    description: matchedDbCategory?.description || `Explore our latest articles and tutorials on ${categorySlug.replace(/-/g, " ")}.`,
  };

  const { data: posts, isLoading: postsLoading } = usePosts(meta.name);
  const [searchQuery, setSearchQuery] = useState("");

  if (categoriesLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Client-side filter
  const categoryPosts = (posts || []).filter(
    (p) => p.category?.toLowerCase() === meta.name.toLowerCase()
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = categoryPosts.filter((post) => {
    if (!normalizedQuery) return true;
    const searchableText = `${post.title} ${post.summary} ${post.content}`.replace(/<[^>]*>/g, "").toLowerCase();
    return searchableText.includes(normalizedQuery);
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen pb-24">
      <div className="relative bg-secondary text-secondary-foreground py-24 mb-16 overflow-hidden" data-testid={`hero-category-${categorySlug}`}>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-50 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-bold tracking-wider uppercase mb-6 border border-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              {meta.tagline}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-white leading-tight"
              data-testid="text-category-name"
            >
              {meta.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl"
              data-testid="text-category-description"
            >
              {meta.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex items-center gap-2 text-sm text-secondary-foreground/60"
            >
              <BookOpen className="h-4 w-4" />
              <span>{categoryPosts.length} {categoryPosts.length === 1 ? "article" : "articles"} in this collection</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-20 -mt-5 mb-12 rounded-2xl border border-border bg-card/95 p-3 shadow-xl shadow-black/5 backdrop-blur md:flex md:items-center md:justify-between md:gap-6 md:p-4">
          <div className="hidden md:block px-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Browse the collection</p>
            <p className="mt-1 text-sm text-muted-foreground">Find a guide by title or topic.</p>
          </div>
          <div className="relative flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Search ${meta.name} articles`}
              aria-label={`Search ${meta.name} articles`}
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              data-testid="input-category-search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear article search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {featuredPost && (
          <section className="mb-14">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Start here</p>
                <h2 className="mt-2 text-2xl font-display font-bold md:text-3xl">Featured guide</h2>
              </div>
              <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                Scroll to explore <ArrowRight className="h-4 w-4" />
              </span>
            </div>
            <motion.div
              key={featuredPost.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PostCard post={featuredPost} featured />
            </motion.div>
          </section>
        )}

        {remainingPosts.length > 0 && (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Keep reading</p>
                <h2 className="mt-2 text-2xl font-display font-bold md:text-3xl">More from this topic</h2>
              </div>
              <span className="text-sm text-muted-foreground">{remainingPosts.length} more {remainingPosts.length === 1 ? "article" : "articles"}</span>
            </div>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border" data-testid="empty-category-state">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchQuery ? `No articles match “${searchQuery}”.` : "No posts in this category yet."}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              {searchQuery ? "Try a different title or topic." : "We're working on it — check back soon for fresh content!"}
            </p>
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Clear search <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}