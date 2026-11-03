import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Mic, Play, User, Calendar, X, Search, ArrowUpDown } from "lucide-react";
import type { Podcast } from "@shared/schema";

export default function Podcasts() {
  const { data: items, isLoading } = useQuery<Podcast[]>({ queryKey: ["/api/podcasts"] });
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  // Filtered & sorted podcasts list
  const filteredPodcasts = (items || []).filter((p) => {
    const matchesQuery = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.host && p.host.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    return matchesQuery;
  }).sort((a, b) => {
    const timeA = new Date(a.episodeDate || a.createdAt || 0).getTime();
    const timeB = new Date(b.episodeDate || b.createdAt || 0).getTime();
    return sortOrder === "latest" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="min-h-screen pb-16 sm:pb-24 overflow-x-hidden">
      {/* Full-Width Header Banner */}
      <div className="w-full bg-secondary text-secondary-foreground py-12 sm:py-20 mb-8 sm:mb-12 shadow-xl relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-white tracking-tight break-words">
            Podcasts & Insights
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto break-words">
            Deep dives into technical excellence and Sitecore architectural patterns.
          </p>
        </div>
      </div>

      {/* Expanded Container Width to support 4 items per row */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Controls Bar: Search & Sort in a Single Row */}
          <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 shadow-sm">
            <div className="flex flex-row items-center gap-2 w-full">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search episodes..."
                  className="w-full h-9 sm:h-11 pl-9 pr-7 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all truncate"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 shrink-0 bg-background border border-border rounded-xl px-2.5 h-9 sm:h-11">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "latest" | "oldest")}
                  className="bg-transparent text-[11px] sm:text-sm font-medium text-foreground outline-none cursor-pointer"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {!isLoading && items && (
            <div className="flex items-center justify-between px-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Showing <span className="font-bold text-foreground">{filteredPodcasts.length}</span> episode{filteredPodcasts.length === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {/* Podcasts Grid (4 per row on widescreen) */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredPodcasts || filteredPodcasts.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Content Coming Soon</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                We're currently preparing some amazing insights and podcast episodes for you. Stay tuned!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPodcasts.map((p) => (
                <div
                  key={p.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group break-words"
                  data-testid={`card-podcast-${p.id}`}
                >
                  <div>
                    <div className="overflow-hidden bg-slate-900 aspect-[16/9] relative flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/favicon1.svg';
                            e.currentTarget.className = "w-16 h-16 object-contain p-2 opacity-90 transition-transform duration-500";
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-2 p-4">
                          <img src="/favicon1.svg" alt="Sitecore Series" className="w-12 h-12 object-contain opacity-90" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mb-2">
                        {p.episodeDate && (
                          <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
                            <Calendar className="h-3 w-3 text-primary shrink-0" /> {p.episodeDate}
                          </span>
                        )}
                      </div>

                      <h2
                        className="text-base sm:text-lg font-display font-bold mb-2 text-foreground tracking-tight line-clamp-2 group-hover:text-primary transition-colors break-words"
                        data-testid={`text-podcast-title-${p.id}`}
                      >
                        {p.title}
                      </h2>

                      {p.host && (
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-3 truncate w-full">
                          <User className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">Host: {p.host}</span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-5 pt-0 mt-auto">
                    <button
                      onClick={() => setSelectedPodcast(p)}
                      className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-xl transition-all text-center cursor-pointer truncate"
                    >
                      Details
                    </button>
                    {p.episodeUrl ? (
                      <a
                        href={p.episodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm truncate"
                      >
                        Listen <Play className="h-3 w-3 fill-current shrink-0" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full px-3 py-2 bg-muted/50 text-muted-foreground text-xs font-medium rounded-xl text-center cursor-not-allowed truncate"
                      >
                        Soon
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Popup Modal with strict non-cropping word wrapping */}
      {selectedPodcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border shadow-2xl p-4 sm:p-8 md:p-10 relative box-border">
            <button
              onClick={() => setSelectedPodcast(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 pr-10 min-w-0">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                Podcast Episode
              </span>
              <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-3 leading-snug break-words whitespace-normal">
                {selectedPodcast.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                {selectedPodcast.host && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground truncate max-w-full">
                    <User className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">{selectedPodcast.host}</span>
                  </span>
                )}
                {selectedPodcast.episodeDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" /> {selectedPodcast.episodeDate}
                  </span>
                )}
              </div>
            </div>

            {selectedPodcast.image && (
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/9] bg-slate-900 flex items-center justify-center">
                <img src={selectedPodcast.image} alt={selectedPodcast.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="border-t border-border pt-6 mb-8 w-full min-w-0 overflow-x-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Episode Overview & Show Notes
              </h3>
              <div 
                className="w-full max-w-full box-border text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3 break-words whitespace-pre-line"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {selectedPodcast.description}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedPodcast(null)}
                className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-xl transition-all cursor-pointer order-2 sm:order-1"
              >
                Close
              </button>
              {selectedPodcast.episodeUrl && (
                <a
                  href={selectedPodcast.episodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 order-1 sm:order-2"
                >
                  <Play className="h-4 w-4 fill-current shrink-0" /> Listen / Watch Episode
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}