import { Link } from "wouter";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Rocket, Star, Quote, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: home, isLoading: homeLoading } = useQuery<any>({ queryKey: ["/api/site-content", "home"] });
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  const testimonialScrollRef = useRef<HTMLDivElement>(null);
  const recentPostsScrollRef = useRef<HTMLDivElement>(null);
  
  // Carousel state for Mission & Vision section
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

  useEffect(() => {
    if (window.location.hash === "#newsletter") {
      requestAnimationFrame(() => document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" }));
    }
  }, []);

  useEffect(() => {
    if (!newsletterSubscribed) return;
    const timeout = window.setTimeout(() => setNewsletterSubscribed(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [newsletterSubscribed]);

  async function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email: newsletterEmail });
      const result = await response.json() as { alreadySubscribed?: boolean };
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      toast({
        title: result.alreadySubscribed ? "You’re already subscribed" : "You’re on the list",
        description: result.alreadySubscribed ? "We’ll keep sending the latest updates." : "The latest updates will be sent to your inbox.",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error?.message || "Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  function scrollTestimonials(direction: "left" | "right") {
    if (testimonialScrollRef.current) {
      const { scrollLeft, clientWidth } = testimonialScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      testimonialScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  }

  function scrollRecentPosts(direction: "left" | "right") {
    if (recentPostsScrollRef.current) {
      const { scrollLeft, clientWidth } = recentPostsScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      recentPostsScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  }

  function nextMission(totalCards: number) {
    setCurrentMissionIndex((prev) => (prev + 1) % totalCards);
  }

  function prevMission(totalCards: number) {
    setCurrentMissionIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }

  if (postsLoading || homeLoading || !home) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const featuredPost = posts?.[0];
  const recentPosts = posts?.slice(1) || []; 
  const hero = home.hero || {};
  const whyCards = home.whyCards || [];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center bg-secondary py-16 lg:py-20 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-48 -left-48 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/15 text-white text-xs font-semibold uppercase tracking-widest mb-6 shadow-xl"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Established Editorial & Intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.05] tracking-tight"
            >
              {hero.titleLine1} <br className="hidden lg:block" />
              {hero.titleLine2 && <>{hero.titleLine2} </>}
              {hero.titleHighlight && <span className="text-primary italic font-serif font-normal">{hero.titleHighlight}</span>}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-secondary-foreground/85 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-light"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {hero.primaryCtaLabel && (
                hero.primaryCtaHref?.startsWith("#") ? (
                  <a href={hero.primaryCtaHref} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-full text-base font-semibold px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                      {hero.primaryCtaLabel}
                    </Button>
                  </a>
                ) : (
                  <Link href={hero.primaryCtaHref || "/"} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-full text-base font-semibold px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                      {hero.primaryCtaLabel}
                    </Button>
                  </Link>
                )
              )}
              {hero.secondaryCtaLabel && (
                <Link href={hero.secondaryCtaHref || "/"} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base font-semibold px-8 h-12 border-white/20 text-white hover:bg-white/15 hover:border-white/40 transition-all backdrop-blur-sm">
                    {hero.secondaryCtaLabel}
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {home.stats?.length > 0 && (
        <section className="relative -mt-10 z-20 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="max-w-5xl mx-auto bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10 border border-border/80 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {home.stats.map((stat: any, i: number) => (
                <div key={i} className="text-center group border-r last:border-r-0 border-border/50 px-2">
                  <div className="text-2xl md:text-4xl font-display font-black text-foreground group-hover:text-primary transition-colors">{stat.value}</div>
                  <div className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {featuredPost && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <PostCard post={featuredPost} featured />
          </div>
        </div>
      )}

      {/* Highlights Section */}
      {home.highlights?.length > 0 && (
        <section id="whats-hot" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Curated Collections
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold mb-2 tracking-tight">{home.highlightSectionTitle}</h2>
            <p className="text-muted-foreground text-base">{home.highlightSectionSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {home.highlights.map((b: any, i: number) => (
              <Link key={i} href={b.href || "/"}>
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 p-6 h-full cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-all pointer-events-none" />
                  <div className="relative z-10">
                    {b.eyebrow && <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-3">{b.eyebrow}</span>}
                    <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{b.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4 font-normal text-sm">{b.desc}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary group-hover:gap-2.5 transition-all pt-3 border-t border-border/50">
                    Read series <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {home.testimonials?.length > 0 && (
        <section className="py-16 bg-secondary/5 border-y border-border/50 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            
            <div className="relative flex flex-col items-center text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                <Quote className="h-3.5 w-3.5" /> Endorsements
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight">
                {home.testimonialsTitle || "What developers say"}
              </h2>

              <div className="flex items-center gap-2 sm:absolute sm:right-0 sm:bottom-0 mt-4 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-10 w-10 border-border bg-card shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all"
                  onClick={() => scrollTestimonials("left")}
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-10 w-10 border-border bg-card shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all"
                  onClick={() => scrollTestimonials("right")}
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div 
              ref={testimonialScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {home.testimonials.map((t: any, i: number) => (
                <div 
                  key={i} 
                  className="min-w-[300px] sm:min-w-[360px] md:min-w-[380px] max-w-[420px] flex-shrink-0 snap-start bg-card p-6 rounded-3xl border border-border/85 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative flex flex-col justify-between"
                >
                  <div>
                    <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10 pointer-events-none" />
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground/90 leading-relaxed mb-6 italic font-serif text-sm">"{t.content}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/80">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {t.name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-primary tracking-wide">{t.name}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles Section */}
      <section className="py-10 bg-secondary/5 border-y border-border/50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          <div className="relative flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-2">
              <Sparkles className="h-3 w-3" /> Fresh Insights
            </div>
            <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-tight">
              Recent Articles
            </h2>

            <div className="flex items-center gap-1.5 sm:absolute sm:right-0 sm:bottom-0 mt-2 sm:mt-0">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-8 w-8 border-border bg-card shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all"
                onClick={() => scrollRecentPosts("left")}
                aria-label="Previous articles"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-8 w-8 border-border bg-card shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all"
                onClick={() => scrollRecentPosts("right")}
                aria-label="Next articles"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div 
            ref={recentPostsScrollRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {recentPosts.map((post) => (
              <div 
                key={post.id} 
                className="min-w-[240px] sm:min-w-[270px] md:min-w-[290px] max-w-[310px] flex-shrink-0 snap-start bg-card p-4 rounded-2xl border border-border/85 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {post.coverImage && (
                    <Link href={`/posts/${post.slug || post.id}`}>
                      <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-muted cursor-pointer">
                        <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 mb-2 text-foreground hover:text-primary transition-colors">
                    <Link href={`/posts/${post.slug || post.id}`}>{post.title}</Link>
                  </h3>
                </div>
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                  <Link href={`/posts/${post.slug || post.id}`} className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
                    Read <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <div className="w-full text-center py-6 text-muted-foreground font-medium text-xs">
                No recent posts found. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why We Exist Section */}
      {whyCards.length > 0 && (
        <section className="relative bg-secondary text-white py-16 overflow-hidden">
          <div className="absolute top-0 left-0 w-2/3 h-full bg-gradient-to-r from-primary/20 to-transparent opacity-40 pointer-events-none" />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20 shadow-lg">
                <Rocket className="h-3.5 w-3.5" /> Mission & Vision
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-3 tracking-tight">
                {home.whyTitle}
              </h2>
              <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto font-light">
                {home.whySubtitle}
              </p>
            </div>

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-3xl mx-auto min-h-[240px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMissionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                      <Rocket className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-mono text-white/40 font-semibold tracking-wider">
                      0{currentMissionIndex + 1} / 0{whyCards.length}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-bold mb-4 text-white">
                    {whyCards[currentMissionIndex]?.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed font-light text-base sm:text-lg">
                    {whyCards[currentMissionIndex]?.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <div className="flex gap-2">
                  {whyCards.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMissionIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentMissionIndex ? "w-8 bg-primary" : "w-2.5 bg-white/20 hover:bg-white/40"}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-10 w-10 border-white/20 bg-white/5 text-white shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all backdrop-blur-sm"
                    onClick={() => prevMission(whyCards.length)}
                    aria-label="Previous card"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-10 w-10 border-white/20 bg-white/5 text-white shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all backdrop-blur-sm"
                    onClick={() => nextMission(whyCards.length)}
                    aria-label="Next card"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/about">
                <Button size="lg" className="rounded-full text-base font-semibold px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                  Our Story
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full text-base font-semibold px-8 h-12 border-white/20 text-white hover:bg-white/15 hover:border-white/40 transition-all backdrop-blur-sm">
                  Write with us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section id="newsletter" className="bg-background py-16 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-xl shadow-black/5 border border-border/80 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold mb-3 tracking-tight">{home.newsletterTitle}</h2>
              <p className="text-muted-foreground text-base mb-6 max-w-xl mx-auto font-normal">{home.newsletterSubtitle}</p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(event) => { setNewsletterEmail(event.target.value); setNewsletterSubscribed(false); }}
                  autoComplete="email"
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  className="flex-grow px-5 py-3 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm text-sm"
                />
                <Button type="submit" size="lg" disabled={newsletterSubmitting} className="rounded-full px-7 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-white font-bold h-11 sm:h-auto text-sm">
                  {newsletterSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                </Button>
              </form>
              
              {newsletterSubscribed && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900" 
                  role="status"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Thanks for subscribing. You’re all set.
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}