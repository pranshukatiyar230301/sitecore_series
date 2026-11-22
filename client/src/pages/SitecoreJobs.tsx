import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, Briefcase, MapPin, Building, ExternalLink, Calendar, X,
  Search, ArrowUpDown, Filter
} from "lucide-react";
import { format } from "date-fns";
import type { Job } from "@shared/schema";

interface ParsedSection {
  heading: string | null;
  items: string[];
  paragraphs: string[];
}

const KNOWN_HEADINGS = [
  "about the job",
  "about the role",
  "about the company",
  "job overview",
  "overview",
  "role overview",
  "summary",
  "job summary",
  "job details",
  "key result responsibilities",
  "key result responsibilities - continued",
  "key result responsibilities-continued",
  "key responsibilities",
  "responsibilities",
  "duties and responsibilities",
  "what you will do",
  "what you'll do",
  "qualifications",
  "qualifications (academic, training, languages)",
  "required qualifications",
  "requirements",
  "job requirements",
  "work experience",
  "experience",
  "required skills",
  "skills",
  "technical skills",
  "nice to have",
  "preferred qualifications",
  "benefits",
  "what we offer",
];

function isKeyValueMetadata(line: string): boolean {
  return /^[A-Za-z][A-Za-z\s/()-]{0,30}\s*:\s*\S+/.test(line.trim());
}

function isLikelyHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || isKeyValueMetadata(trimmed)) return false;

  const cleaned = trimmed.replace(/^[-•*▪▸►–—]+\s*/, "").replace(/:\s*$/, "").trim();
  if (!cleaned || cleaned.length > 85) return false;

  const lower = cleaned.toLowerCase();
  if (KNOWN_HEADINGS.includes(lower) || KNOWN_HEADINGS.some((h) => lower.startsWith(`${h} (`))) {
    return true;
  }

  const startsWithBullet = /^[-•*▪▸►–—•·]\s+/.test(trimmed);
  const endsWithSentencePunct = /[.!?;,]$/.test(cleaned);
  const wordCount = cleaned.split(/\s+/).length;

  if (!startsWithBullet && !endsWithSentencePunct && wordCount >= 1 && wordCount <= 5) {
    const words = cleaned.split(/\s+/);
    const capitalizedCount = words.filter((w) => /^[A-Z]/.test(w)).length;
    if (capitalizedCount / words.length >= 0.8) {
      return true;
    }
  }

  return false;
}

function parseJobDescription(rawDescription: string): ParsedSection[] {
  if (!rawDescription) return [];

  let lines: string[] = [];

  if (typeof window !== "undefined" && /<[a-z][\s\S]*>/i.test(rawDescription)) {
    const container = document.createElement("div");
    container.innerHTML = rawDescription;

    container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
      const text = (el.textContent || "").trim();
      el.textContent = text ? `\n__HEADING__${text}\n` : "\n";
    });

    container.querySelectorAll("li").forEach((el) => {
      const text = (el.textContent || "").trim();
      el.textContent = text ? `\n__BULLET__${text}\n` : "\n";
    });

    container.querySelectorAll("p, div, br, tr").forEach((el) => {
      if (el.tagName === "BR") {
        el.replaceWith("\n");
      } else {
        el.append("\n");
      }
    });

    lines = (container.textContent || "")
      .replace(/\u00a0/g, " ")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  } else {
    lines = rawDescription
      .replace(/\u00a0/g, " ")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  const sections: ParsedSection[] = [];
  let current: ParsedSection = { heading: null, items: [], paragraphs: [] };
  let lastTarget: "item" | "paragraph" | null = null;

  const pushCurrentIfValid = () => {
    const cleanHeading = current.heading?.trim() || null;
    const cleanItems = current.items.map((i) => i.trim()).filter(Boolean);
    const cleanParagraphs = current.paragraphs.map((p) => p.trim()).filter(Boolean);

    // Only keep a section if it actually has content (items or paragraphs)
    if (cleanItems.length > 0 || cleanParagraphs.length > 0) {
      sections.push({
        heading: cleanHeading,
        items: cleanItems,
        paragraphs: cleanParagraphs,
      });
    }
  };

  for (const rawLine of lines) {
    // 1. Explicit HTML heading
    if (rawLine.startsWith("__HEADING__")) {
      const headingText = rawLine.replace(/^__HEADING__/, "").replace(/:\s*$/, "").trim();
      if (!headingText || isKeyValueMetadata(headingText)) {
        if (headingText) {
          current.items.push(headingText);
          lastTarget = "item";
        }
        continue;
      }
      pushCurrentIfValid();
      current = { heading: headingText, items: [], paragraphs: [] };
      lastTarget = null;
      continue;
    }

    // 2. Detected plain-text heading
    if (isLikelyHeading(rawLine)) {
      const headingText = rawLine.replace(/^[-•*▪▸►–—]+\s*/, "").replace(/:\s*$/, "").trim();
      if (!headingText) continue;
      pushCurrentIfValid();
      current = { heading: headingText, items: [], paragraphs: [] };
      lastTarget = null;
      continue;
    }

    // 3. Explicit bullet point (__BULLET__ or -, *, •, 1.)
    const explicitHtmlBullet = rawLine.startsWith("__BULLET__");
    const textBulletMatch = rawLine.match(/^(?:[-•*▪▸►–—•·]|\d+[.)])\s+(.*)$/);

    if (explicitHtmlBullet || textBulletMatch) {
      const pointText = explicitHtmlBullet
        ? rawLine.replace(/^__BULLET__/, "").trim()
        : (textBulletMatch?.[1] || "").trim();

      if (pointText) {
        current.items.push(pointText);
        lastTarget = "item";
      }
      continue;
    }

    // 4. Key-Value lines like "Location: Chennai" stay clean points/lines, never merged into previous text
    if (isKeyValueMetadata(rawLine)) {
      current.items.push(rawLine);
      lastTarget = "item";
      continue;
    }

    // 5. Merge wrapped continuation lines into the previous bullet or paragraph
    const startsWithLowercase = /^[a-z(]/.test(rawLine);
    const prevItem = current.items[current.items.length - 1];
    const prevPara = current.paragraphs[current.paragraphs.length - 1];
    const prevText = lastTarget === "item" ? prevItem : lastTarget === "paragraph" ? prevPara : null;
    const prevIsKeyValue = prevText ? isKeyValueMetadata(prevText) : false;
    const prevIncomplete = prevText ? !/[.!?]$/.test(prevText.trim()) : false;

    if (prevText && !prevIsKeyValue && (startsWithLowercase || prevIncomplete)) {
      if (lastTarget === "item" && current.items.length > 0) {
        current.items[current.items.length - 1] = `${prevItem} ${rawLine}`;
      } else if (lastTarget === "paragraph" && current.paragraphs.length > 0) {
        current.paragraphs[current.paragraphs.length - 1] = `${prevPara} ${rawLine}`;
      }
      continue;
    }

    // 6. Start a new point or paragraph
    const sectionKey = (current.heading || "").toLowerCase();
    const isListSection =
      sectionKey.includes("responsibilit") ||
      sectionKey.includes("qualification") ||
      sectionKey.includes("experience") ||
      sectionKey.includes("skill") ||
      sectionKey.includes("requirement") ||
      sectionKey.includes("benefit");

    if (isListSection) {
      current.items.push(rawLine);
      lastTarget = "item";
    } else {
      current.paragraphs.push(rawLine);
      lastTarget = "paragraph";
    }
  }

  pushCurrentIfValid();
  return sections;
}

export default function SitecoreJobs() {
  const { data: jobs, isLoading } = useQuery<Job[]>({ queryKey: ["/api/jobs"] });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const parsedSections = useMemo(() => {
    if (!selectedJob?.description) return [];
    return parseJobDescription(selectedJob.description);
  }, [selectedJob]);

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
                  <option value="latest">Latest Jobs</option>
                  <option value="oldest">Oldest Jobs</option>
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

      {/* Details Popup Modal - click outside backdrop to close */}
      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border shadow-2xl p-4 sm:p-8 md:p-10 relative box-border cursor-default"
          >
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

            <div className="border-t border-border pt-6 mb-8 w-full min-w-0 overflow-x-hidden">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
                Job Description & Requirements
              </p>

              {parsedSections.length > 0 ? (
                <div className="space-y-6 w-full min-w-0">
                  {parsedSections.map((section, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-muted/35 border border-border/70 p-4 sm:p-5 space-y-3 w-full min-w-0"
                    >
                      {section.heading && section.heading.trim().length > 0 && (
                        <h3 className="text-base sm:text-lg font-display font-bold text-foreground pb-2 border-b border-border/60 flex items-center gap-2 break-words">
                          <span className="w-1.5 h-5 rounded-full bg-primary shrink-0" />
                          <span>{section.heading.trim()}</span>
                        </h3>
                      )}

                      {section.paragraphs.map((para, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed break-words"
                          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                        >
                          {para}
                        </p>
                      ))}

                      {section.items.length > 0 && (
                        <ul className="space-y-2.5 pt-1">
                          {section.items.map((item, iIdx) => (
                            <li
                              key={iIdx}
                              className="flex items-start gap-2.5 text-sm sm:text-[15px] text-foreground/90 leading-relaxed break-words"
                              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                            >
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span className="min-w-0 flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                  No description available for this position.
                </p>
              )}
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