import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, MapPin, ExternalLink, X, ArrowUpDown, Search } from "lucide-react";
import type { Event } from "@shared/schema";

export default function Events() {
  const { data: events, isLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  // Filtered & sorted events list
  const filteredEvents = (events || []).filter((e) => {
    const matchesQuery = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    return matchesQuery;
  }).sort((a, b) => {
    const timeA = new Date(a.startDate || a.createdAt || 0).getTime();
    const timeB = new Date(b.startDate || b.createdAt || 0).getTime();
    return sortOrder === "latest" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="min-h-screen pb-16 sm:pb-24">
      {/* Full-Width Header Banner */}
      <div className="w-full bg-secondary text-secondary-foreground py-12 sm:py-20 mb-8 sm:mb-12 shadow-xl relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-white tracking-tight break-words">
            Events & Webinars
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto break-words">
            Connect with the community at our upcoming webinars, workshops, and user groups.
          </p>
        </div>
      </div>

      {/* Expanded Container Width to support 4 items per row */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Controls Bar: Search & Sorting */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title or location..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-end pt-1 border-t border-border/60">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "latest" | "oldest")}
                  className="h-9 px-3 rounded-lg border border-border bg-background text-xs sm:text-sm font-medium text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                >
                  <option value="latest">Latest to Oldest</option>
                  <option value="oldest">Oldest to Latest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {!isLoading && events && (
            <div className="flex items-center justify-between px-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Showing <span className="font-bold text-foreground">{filteredEvents.length}</span> event listing{filteredEvents.length === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {/* Events Grid (4 per row on widescreen) */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Upcoming Events</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Check back soon for our schedule of upcoming webinars and community meetups.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                  data-testid={`card-event-${e.id}`}
                >
                  <div>
                    {e.image && (
                      <div className="overflow-hidden bg-muted aspect-[16/9] relative">
                        <img
                          src={e.image || '/default-thumbnail.png'}
                          alt={e.title}
                          onError={(event) => {
                            event.currentTarget.src = '/default-thumbnail.png';
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mb-2">
                        {e.startDate && (
                          <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
                            <Calendar className="h-3 w-3 text-primary shrink-0" /> {e.startDate}
                          </span>
                        )}
                      </div>

                      <h2
                        className="text-base sm:text-lg font-display font-bold mb-2 text-foreground tracking-tight line-clamp-2 group-hover:text-primary transition-colors"
                        data-testid={`text-event-title-${e.id}`}
                      >
                        {e.title}
                      </h2>

                      {e.location && (
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-3 truncate w-full">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{e.location}</span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {e.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-5 pt-0 mt-auto">
                    <button
                      onClick={() => setSelectedEvent(e)}
                      className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-xl transition-all text-center cursor-pointer truncate"
                    >
                      Details
                    </button>
                    {e.link ? (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm truncate"
                      >
                        Register <ExternalLink className="h-3 w-3" />
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

      {/* Details Popup Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border shadow-2xl p-6 sm:p-10 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 pr-12">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                Community Event
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3 leading-snug">
                {selectedEvent.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                {selectedEvent.startDate && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                    <Calendar className="h-4 w-4 text-primary" /> {selectedEvent.startDate}
                  </span>
                )}
                {selectedEvent.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> {selectedEvent.location}
                  </span>
                )}
              </div>
            </div>

            {selectedEvent.image && (
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/9] bg-muted">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="border-t border-border pt-6 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Event Overview & Details
              </h3>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed space-y-4 whitespace-pre-line"
              >
                {selectedEvent.description}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Register / Learn More <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}