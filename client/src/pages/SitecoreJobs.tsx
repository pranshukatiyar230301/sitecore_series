import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, Briefcase, MapPin, Building, ExternalLink, Calendar, X, 
  Search, ArrowUpDown, Filter 
} from "lucide-react";
import { format } from "date-fns";
import type { Job } from "@shared/schema";

export default function SitecoreJobs() {
  const { data: jobs, isLoading } = useQuery<Job[]>({ queryKey: ["/api/jobs"] });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  // Computed filtered and sorted jobs list
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    return jobs
      .filter((job) => {
        const matchesQuery = 
          job.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          job.companyName.toLowerCase().includes(searchQuery.toLowerCase().trim());

        const matchesType = 
          selectedJobType === "all" || 
          job.jobType.toLowerCase().replace("-", "") === selectedJobType.toLowerCase().replace("-", "");

        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "latest" ? timeB - timeA : timeA - timeB;
      });
  }, [jobs, searchQuery, selectedJobType, sortOrder]);

  return (
    <div className="min-h-screen pb-16 sm:pb-24 overflow-x-hidden">
      {/* Full-Width Header Banner */}
      <div className="w-full bg-secondary text-secondary-foreground py-12 sm:py-20 mb-8 sm:mb-12 shadow-xl relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-white tracking-tight break-words">
            Sitecore Career Opportunities
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto break-words">
            Explore the Latest Global Career Opportunities in the Sitecore Ecosystem, From Developers and Architects to Technical Leads, Managers, Directors, and Administrators. Discover Roles Across Experience Levels, Locations, and Organizations.
          </p>
        </div>
      </div>

      {/* Expanded Container Width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Controls Bar: Search, Type Filter & Sort in a Single Row */}
          <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 shadow-sm">
            <div className="flex flex-row items-center gap-2 w-full">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title..."
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

              {/* Type Dropdown */}
              <div className="flex items-center gap-1 shrink-0 bg-background border border-border rounded-xl px-2.5 h-9 sm:h-11">
                <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-sm font-medium text-foreground outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-Time</option>
                  <option value="contract">Contract</option>
                  <option value="part-time">Part-Time</option>
                </select>
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
          {!isLoading && jobs && (
            <div className="flex items-center justify-between px-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Showing <span className="font-bold text-foreground">{filteredJobs.length}</span> active listing{filteredJobs.length === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {/* Job Listings Grid (4 per row on widescreen) */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredJobs || filteredJobs.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">No Matching Job Openings</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Try resetting your title search or filter criteria to view available Sitecore positions.
              </p>
              {(searchQuery || selectedJobType !== "all") && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedJobType("all"); }}
                  className="mt-4 px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl hover:bg-primary/25 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 break-words"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                        {job.jobType}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" /> {format(new Date(job.createdAt), "MMM d")}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-display font-bold text-foreground line-clamp-2 break-words">
                      {job.title}
                    </h2>

                    <div className="space-y-1 text-xs text-muted-foreground pt-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 font-semibold text-foreground truncate w-full">
                        <Building className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{job.companyName}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 truncate w-full">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{job.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 mt-auto">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-xl transition-all text-center cursor-pointer truncate"
                    >
                      Details
                    </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm truncate"
                    >
                      Apply <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Popup Modal with structured sections */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border shadow-2xl p-4 sm:p-8 md:p-10 relative box-border">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 pr-10 min-w-0">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                {selectedJob.jobType}
              </span>
              <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-3 leading-snug break-words whitespace-normal">
                {selectedJob.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground truncate max-w-full">
                  <Building className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">{selectedJob.companyName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 truncate max-w-full">
                  <MapPin className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">{selectedJob.location}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0" /> Posted {format(new Date(selectedJob.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-8 w-full min-w-0 overflow-x-hidden space-y-6">
              
              {/* Key Result Responsibilities */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  Key Result Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                  <li>Delivers software products and components for ISA provides technology expertise and contributes to technology stack, design, development, deployment and automated testing.</li>
                  <li>In collaboration with product team, project managers, and IT solutions managers, assists in translating business needs into technical implementations in line with the architectural principles laid down for ISA products.</li>
                  <li>Assists in testing and implementation of technical solutions reviews technical documentation, user guides, training manuals, and system specifications ensuring quality, compliance, and completeness.</li>
                  <li>Assists in reviewing giving feedback on specifications and information of the architectural design provided by product team.</li>
                  <li>Co identifies the technical tools and languages needed for the design execution in line with the adopted technical and quality standards.</li>
                  <li>Ensures the User Interfaces used for the product are in line with requirements and rightly implemented.</li>
                </ul>
              </div>

              {/* Key Result Responsibilities-Continued */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  Key Result Responsibilities - Continued
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                  <li>Assists in identifying and implementing best practices, new trends, and emerging technologies that bring best value to ISA clients partners with cross functional teams to explore ways and means to adopt such technologies.</li>
                  <li>Assists in Implementing agreed remedies and preventative measures in compliance with the architecture.</li>
                  <li>Assists ISA teams to meet agreed service levels provides needed status reports to specialists, users, and managers as requested.</li>
                  <li>Acts proactively to ensure continuous knowledge sharing within ISA to empower other team members.</li>
                  <li>Maintains effective working relationships with a variety of stakeholders, including project managers, product, operations, governance and enterprise development teams.</li>
                  <li>Participates and influences thinking and decision making with respect to technology to the best of ISA.</li>
                  <li>Performs any other additional responsibilities as directed by the line manager.</li>
                </ul>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  Qualifications (Academic, Training, Languages)
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                  <li>Bachelor's degree in IT Engineering, Computer Science, Information Technology or equivalent.</li>
                  <li>Fluent in English Language.</li>
                </ul>
              </div>

              {/* Work Experience */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  Work Experience
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                  <li>3+ years of development experience, including experience with Sitecore. Travel, airline, or e-commerce platform experience is preferred.</li>
                  <li>Strong proficiency in .NET, C#, and ASP.NET MVC development.</li>
                  <li>Hands-on experience with Sitecore, including SXA, templates, renderings, and content modelling.</li>
                  <li>Experience working with SQL databases and Git-based version control workflows.</li>
                  <li>Knowledge of Headless Sitecore architecture, including Sitecore JavaScript Services (JSS).</li>
                  <li>Sitecore certification is preferred.</li>
                  <li>Experience with Microsoft Azure cloud services and development environments.</li>
                </ul>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-xl transition-all cursor-pointer order-2 sm:order-1"
              >
                Close
              </button>
              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 order-1 sm:order-2"
              >
                Apply for this position <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}