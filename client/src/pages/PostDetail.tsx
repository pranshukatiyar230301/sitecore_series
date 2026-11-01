import { useRoute, Link } from "wouter";
import { usePost } from "@/hooks/use-posts";
import { Loader2, Calendar, User, Tag, ArrowLeft, Facebook, Twitter, Linkedin, Link as LinkIcon, Clock } from "lucide-react";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:slug");
  const [, paramsSingular] = useRoute("/post/:slug");
  const slugOrId = params?.slug || paramsSingular?.slug;
  
  const { data: post, isLoading } = usePost(slugOrId || "");
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-foreground">Post Not Found</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md">
          The article you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-medium text-sm shadow-md shadow-primary/20 hover:scale-105">
            Return Home
          </button>
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=640");
  }

  async function copyArticleLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      toast({ title: "Link copied", description: "The article link is ready to share." });
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand("copy");
      textArea.remove();
      toast({
        title: copied ? "Link copied" : "Could not copy link",
        description: copied ? "The article link is ready to share." : "Please copy the URL from your browser.",
        variant: copied ? "default" : "destructive",
      });
    }
  }

  return (
    <article className="min-h-screen pb-20 sm:pb-28">
      {/* Header Banner */}
      <div className="bg-secondary text-secondary-foreground pt-20 sm:pt-28 pb-20 sm:pb-28 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-secondary-foreground/60 mb-4">
              SitecoreSeries / Article
            </p>
            
            <Link href={`/blogs/${post.category?.toLowerCase().replace(/ /g, '-') || 'general'}`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs sm:text-sm font-medium mb-6 cursor-pointer backdrop-blur-md border border-white/10 shadow-xs">
                <Tag className="h-3.5 w-3.5 text-primary" />
                {post.category || "General"}
              </div>
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight tracking-tight break-words"
            >
              {post.title}
            </motion.h1>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-secondary-foreground/80 text-xs sm:text-sm md:text-base font-medium">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/5">
                <User className="h-4 w-4 text-primary" />
                <span>By {post.authorName || "Pranshu Katiyar"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/5">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{post.createdAt ? format(new Date(post.createdAt), "MMMM d, yyyy") : "Recent"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/5">
                <Clock className="h-4 w-4 text-primary" />
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto -mt-12 sm:-mt-16 md:-mt-20 relative z-20">
          {/* Cover Image Container */}
          {post.coverImage && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-8 sm:mb-12 aspect-[16/8] bg-card border border-border/60 p-2 sm:p-4 md:p-6"
            >
              <img 
                src={post.coverImage || '/default-thumbnail.png'} 
                alt={post.title} 
                onError={(e) => {
                  e.currentTarget.src = '/default-thumbnail.png';
                }}
                className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
              />
            </motion.div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Sidebar / Social Share */}
            <div className="lg:w-20 flex-shrink-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-3 shadow-md">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em] text-center mb-3">
                  Share
                </p>
                <div className="flex flex-row lg:flex-col gap-2.5 items-center justify-center flex-wrap">
                  <button 
                    type="button" 
                    title="Share on X" 
                    aria-label="Share on X" 
                    onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)} 
                    className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                  >
                    <Twitter className="h-4 w-4" />
                  </button>
                  <button 
                    type="button" 
                    title="Share on LinkedIn" 
                    aria-label="Share on LinkedIn" 
                    onClick={() => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)} 
                    className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200 hover:scale-105"
                  >
                    <Linkedin className="h-4 w-4" />
                  </button>
                  <button 
                    type="button" 
                    title="Share on Facebook" 
                    aria-label="Share on Facebook" 
                    onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)} 
                    className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/10 transition-all duration-200 hover:scale-105"
                  >
                    <Facebook className="h-4 w-4" />
                  </button>
                  <button 
                    type="button" 
                    title="Share on WhatsApp" 
                    aria-label="Share on WhatsApp" 
                    onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${post.title}\n${shareUrl}`)}`)} 
                    className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-200 hover:scale-105"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                  </button>
                  <button 
                    type="button" 
                    title="Share on Telegram" 
                    aria-label="Share on Telegram" 
                    onClick={() => openShareWindow(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`)} 
                    className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:border-sky-500 hover:text-sky-500 hover:bg-sky-500/10 transition-all duration-200 hover:scale-105"
                  >
                    <FaTelegramPlane className="h-4 w-4" />
                  </button>
                  <button 
                    type="button" 
                    title="Copy article link" 
                    aria-label="Copy article link" 
                    onClick={copyArticleLink} 
                    className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-12 shadow-sm">
                
                {/* Summary displayed big, bold, with primary red underline */}
                {post.summary && (
                  <div className="mb-8 border-l-4 border-primary pl-4 py-1">
                    <p className="text-xl sm:text-2xl font-display font-bold text-foreground leading-relaxed underline decoration-primary decoration-2 underline-offset-4">
                      {post.summary}
                    </p>
                  </div>
                )}

                <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline prose-img:rounded-2xl prose-pre:shadow-lg prose-pre:bg-secondary">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Tags & Navigation Footer */}
                <div className="mt-12 sm:mt-16 pt-8 border-t border-border">
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground mr-1">Tags:</span>
                    <span className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-full text-xs font-medium transition-colors">
                      #sitecore
                    </span>
                    {post.category && (
                      <span className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-full text-xs font-medium transition-colors">
                        #{post.category.toLowerCase().replace(/ /g, '')}
                      </span>
                    )}
                    <span className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-full text-xs font-medium transition-colors">
                      #development
                    </span>
                  </div>

                  <Link href={`/blogs/${post.category?.toLowerCase().replace(/ /g, '-') || 'general'}`}>
                    <div className="inline-flex items-center gap-2 text-primary font-bold text-xs sm:text-sm hover:gap-3 transition-all cursor-pointer group">
                      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                      More from {post.category || "General"}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}