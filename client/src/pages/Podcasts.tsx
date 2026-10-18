import { useQuery } from "@tanstack/react-query";
import { Loader2, Mic, Play, User, Calendar } from "lucide-react";
import type { Podcast } from "@shared/schema";

export default function Podcasts() {
  const { data: items, isLoading } = useQuery<Podcast[]>({ queryKey: ["/api/podcasts"] });

  return (
    <div className="min-h-screen pt-6 sm:pt-12 pb-16 sm:pb-24">
      {/* Header Banner */}
      <div className="bg-secondary text-secondary-foreground py-12 sm:py-20 mb-10 sm:mb-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-xl relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-white tracking-tight break-words">
            Podcasts & Insights
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto break-words">
            Deep dives into technical excellence and Sitecore architectural patterns.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-6 bg-card rounded-3xl border border-border shadow-sm max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Content Coming Soon</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                We're currently preparing some amazing insights and podcast episodes for you. Stay tuned!
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {items.map((p) => (
                <article
                  key={p.id}
                  className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 group"
                  data-testid={`card-podcast-${p.id}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
                    {p.image && (
                      <div className="overflow-hidden bg-muted relative min-h-[200px] md:min-h-full">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full max-h-72 md:max-h-none object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <h2
                          className="text-xl sm:text-2xl font-display font-bold mb-3 text-foreground tracking-tight break-words group-hover:text-primary transition-colors"
                          data-testid={`text-podcast-title-${p.id}`}
                        >
                          {p.title}
                        </h2>

                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                          {p.host && (
                            <span className="inline-flex items-center gap-1.5 font-medium bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
                              <User className="h-3.5 w-3.5 text-primary shrink-0" /> {p.host}
                            </span>
                          )}
                          {p.episodeDate && (
                            <span className="inline-flex items-center gap-1.5 font-medium bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
                              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" /> {p.episodeDate}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed mb-6 break-words">
                          {p.description}
                        </p>
                      </div>

                      {p.episodeUrl && (
                        <div>
                          <a
                            href={p.episodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Play className="h-4 w-4 fill-current shrink-0" /> Listen / Watch
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}