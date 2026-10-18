import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Award, Sparkles, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import authorImageAsset from "@assets/WhatsApp_Image_2025-12-24_at_11.29.01_PM_1767946045319.jpeg";

export default function About() {
  const { data: about, isLoading } = useQuery<any>({ queryKey: ["/api/site-content", "about"] });

  if (isLoading || !about) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header */}
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold mb-3 text-foreground tracking-tight break-words leading-tight">
            {about.heroTitle}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {about.heroSubtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero Banner Image */}
          {about.heroImage && (
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-10 sm:mb-14 aspect-[16/9] sm:aspect-[21/9] relative">
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <img src={about.heroImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Author Card */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-8 lg:p-10 mb-10 sm:mb-14 shadow-xl group">
            {/* Background Ambient Glows */}
            <div className="absolute -top-24 -right-24 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-br from-amber-400/20 to-primary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-tr from-blue-500/15 to-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-10">
              {/* Author Portrait Image */}
              {(about.authorImage || authorImageAsset) && (
                <div className="flex-shrink-0 relative">
                  <div className="absolute -inset-1.5 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary via-amber-400 to-emerald-400 opacity-80 blur-sm group-hover:opacity-100 transition duration-500" />
                  <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-card border-2 border-white/80 dark:border-zinc-800">
                    <img
                      src={about.authorImage || authorImageAsset}
                      alt={about.authorName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              )}

              {/* Author Details Section */}
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center w-full">
                {/* Role Badge - CENTERED ON BOTH LINES WHEN WRAPPED */}
                {about.authorRole && (
                  <div className="flex justify-center w-full mb-2">
                    <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/15 via-amber-500/15 to-emerald-500/15 text-primary border border-primary/30 text-[11px] xs:text-xs sm:text-sm font-bold tracking-wide shadow-xs max-w-full text-center">
                      <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                      <span className="text-center break-words leading-tight">
                        {about.authorRole}
                      </span>
                    </div>
                  </div>
                )}

                {/* Author Name - CENTERED */}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-white mb-3 break-words leading-snug text-center w-full">
                  {about.authorName}
                </h2>

                {/* Bio Text - LEFT ALIGNED */}
                {about.authorBio && (
                  <p className="text-xs sm:text-sm lg:text-base text-slate-700 dark:text-zinc-300 leading-relaxed mb-4 font-medium break-words text-left w-full max-w-xl">
                    {about.authorBio}
                  </p>
                )}

                {/* Skills Grid - LEFT ALIGNED */}
                {about.authorSkills?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-left w-full pt-1">
                    {about.authorSkills.map((s: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-primary/20 shadow-xs hover:border-primary hover:bg-primary/5 transition-all duration-300 min-w-0"
                      >
                        <div className="p-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 break-words whitespace-normal leading-tight">
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mission Section */}
          {about.missionParagraphs?.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-8 lg:p-10 mb-10 sm:mb-14 shadow-xl group">
              <div className="absolute -top-32 -left-32 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-br from-blue-500/15 via-primary/20 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-tl from-amber-400/20 via-emerald-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto min-w-0">
                {about.missionTitle && (
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight mb-3 sm:mb-4 text-center text-slate-950 dark:text-white break-words leading-snug">
                    {about.missionTitle}
                  </h2>
                )}

                <div className="space-y-3">
                  {about.missionParagraphs.map((p: string, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-md border border-primary/15 shadow-xs hover:border-primary/30 transition-colors min-w-0"
                    >
                      <p className="text-xs sm:text-sm lg:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium break-words">
                        {p}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contribute Section */}
          <section className="relative mb-10 sm:mb-14">
            <div className="text-center mb-6 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold mb-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0" /> Contribute
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-bold mb-2 break-words leading-tight">
                {about.shareTitle}
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto break-words">
                {about.shareSubtitle}
              </p>
            </div>

            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 p-5 sm:p-8 lg:p-10 shadow-2xl shadow-primary/5">
              <div className="absolute -top-24 -right-24 w-60 sm:w-80 h-60 sm:h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {(about.shareOptions || []).map((opt: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 min-w-0"
                  >
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      Option {i + 1}
                    </div>
                    <h3 className="text-base sm:text-lg font-display font-bold mb-1 break-words">{opt.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm mb-3 break-words">{opt.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(opt.tags || []).map((t: string, j: number) => (
                        <span key={j} className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium break-words">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {about.shareEmail && (
                <div className="relative z-10 bg-secondary text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-base mb-0.5">Ready to submit?</h4>
                      <p className="text-xs sm:text-sm text-white/70 font-mono break-all">{about.shareEmail}</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${about.shareEmail}?subject=SitecoreSeries Blog Submission`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs sm:text-sm rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/40 hover:scale-105 whitespace-nowrap"
                  >
                    Submit via Email <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Footer Call-to-Action Card */}
          <div className="text-center bg-secondary text-secondary-foreground rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-bold mb-2.5 text-white relative z-10 break-words leading-tight">
              {about.ctaTitle}
            </h2>
            <p className="text-secondary-foreground/80 text-xs sm:text-base mb-5 max-w-2xl mx-auto relative z-10 break-words">
              {about.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <Link href="/">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold text-xs sm:text-sm rounded-full hover:bg-primary/90 shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                  Read the Blog
                </button>
              </Link>
              <Link href="/contact">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-white/20 text-white font-bold text-xs sm:text-sm rounded-full hover:bg-white/10 transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}