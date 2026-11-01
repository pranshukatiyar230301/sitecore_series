import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { type Post } from "@shared/schema";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const plainText = (post.summary + " " + (post.content || "")).replace(/<[^>]*>/g, "");
  const wordCount = plainText.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (featured) {
    return (
      <Link href={`/post/${post.slug}`} className="group block" aria-label={`Read ${post.title}`}>
        <article className="relative grid grid-cols-1 md:grid-cols-2 gap-0 bg-[#0a0f1d] rounded-2xl overflow-hidden border border-slate-800 shadow-xl hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden bg-slate-900 flex items-center justify-center p-4">
            {post.coverImage ? (
              <img
                src={post.coverImage || '/default-thumbnail.png'}
                alt={post.title}
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = '/default-thumbnail.png';
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="text-slate-600 font-mono text-sm tracking-widest uppercase">Sitecore Series</div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0f1d] to-transparent pointer-events-none" />
          </div>

          <div className="flex flex-col justify-center p-7 md:p-9 lg:p-12 bg-[#0a0f1d]">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-5">
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-md font-semibold text-xs uppercase tracking-wider">
                Featured Guide
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400 mb-3">{post.category}</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white group-hover:text-indigo-300 transition-colors leading-tight">
              {post.title}
            </h2>

            <p className="text-slate-400 text-base mb-7 line-clamp-3 leading-relaxed">
              {plainText}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-7 border-t border-slate-800/80 pt-4">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                {post.authorName || "Pranshu Katiyar"}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                {readTime} min read
              </span>
            </div>

            <span className="inline-flex items-center gap-2 font-semibold text-white group-hover:text-indigo-400 transition-colors group-hover:gap-3 duration-300">
              Read the guide <ArrowRight className="h-4 w-4 text-indigo-400 transition-transform group-hover:translate-x-1" />
            </span>

          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/post/${post.slug}`} className="group block h-full" aria-label={`Read ${post.title}`}>
      <article className="flex flex-col bg-[#0a0f1d] rounded-xl overflow-hidden border border-slate-800 shadow-md hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 h-full">
        <div className="aspect-[16/10] overflow-hidden relative bg-slate-900 flex items-center justify-center">
          <span className="absolute top-3 left-3 z-10 bg-[#0a0f1d]/90 backdrop-blur text-slate-300 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border border-slate-800 shadow-sm">
            {post.category}
          </span>

          {post.coverImage ? (
            <img
              src={post.coverImage || '/default-thumbnail.png'}
              alt={post.title}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = '/default-thumbnail.png';
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-slate-600 font-mono text-xs tracking-widest uppercase">Sitecore Series</div>
          )}
        </div>

        <div className="flex flex-col flex-grow p-6 bg-[#0a0f1d]">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-indigo-400" />
              {format(new Date(post.createdAt), "MMM d, yyyy")}
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-indigo-400" />
              {readTime} min read
            </div>
          </div>

          <h3 className="text-lg font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>

          <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
            {plainText}
          </p>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <User className="h-3 w-3 text-indigo-400" />
              {post.authorName || "Pranshu Katiyar"}
            </span>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:underline">
              Read article <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>

          </div>
        </div>
      </article>
    </Link>
  );
}