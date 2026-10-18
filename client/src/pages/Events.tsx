import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, MapPin, ExternalLink } from "lucide-react";
import type { Event } from "@shared/schema";

export default function Events() {
  const { data: events, isLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  return (
    <div className="min-h-screen pt-6 sm:pt-12 pb-16 sm:pb-24">
      {/* Header Banner */}
      <div className="bg-secondary text-secondary-foreground py-12 sm:py-20 mb-10 sm:mb-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-xl relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-white tracking-tight break-words">
            Events
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto break-words">
            Connect with the community at our upcoming webinars, workshops, and user groups.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-6 bg-card rounded-3xl border border-border shadow-sm max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Upcoming Events</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto break-words">
                Check back soon for our schedule of upcoming webinars and community meetups.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {events.map((e) => (
                <article
                  key={e.id}
                  className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  data-testid={`card-event-${e.id}`}
                >
                  <div>
                    {e.image && (
                      <div className="overflow-hidden bg-muted aspect-[16/9] relative">
                        <img
                          src={e.image}
                          alt={e.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 sm:p-6 lg:p-8">
                      <h2
                        className="text-lg sm:text-xl font-display font-bold mb-3 text-foreground tracking-tight break-words group-hover:text-primary transition-colors"
                        data-testid={`text-event-title-${e.id}`}
                      >
                        {e.title}
                      </h2>

                      <div className="flex flex-wrap gap-2.5 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
                        {e.startDate && (
                          <span className="inline-flex items-center gap-1.5 font-medium bg-muted/60 px-2.5 py-1 rounded-full border border-border/50 break-words">
                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" /> {e.startDate}
                          </span>
                        )}
                        {e.location && (
                          <span className="inline-flex items-center gap-1.5 font-medium bg-muted/60 px-2.5 py-1 rounded-full border border-border/50 break-words">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {e.location}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words mb-4">
                        {e.description}
                      </p>
                    </div>
                  </div>

                  {e.link && (
                    <div className="px-5 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8 pt-0">
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-bold text-xs sm:text-sm hover:gap-3 transition-all duration-200 group/link"
                      >
                        <span>Register / Learn more</span>
                        <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}