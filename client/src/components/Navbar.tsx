import { Link, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Menu, X, ChevronDown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCategories } from "@/lib/categories";

const CATEGORY_GROUPS = [
  { name: "Core (Traditional / Platform-based)", id: "Core" },
  { name: "Composable (SaaS / Headless / Modular)", id: "Composable" },
];

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileBlogsOpen, setMobileBlogsOpen] = useState(false);
  const { data: categories } = useCategories();

  const grouped = useMemo(() => {
    const g: Record<string, { name: string; slug: string }[]> = { Core: [], Composable: [] };
    (categories || []).forEach((c) => { (g[c.group] ||= []).push({ name: c.name, slug: c.slug }); });
    return g;
  }, [categories]);

  const isActive = (path: string) => location === path;
  const isBlogActive = location.startsWith("/blogs");

  function openNewsletter() {
    setMobileMenuOpen(false);
    if (window.location.pathname === "/") {
      window.location.hash = "newsletter";
      document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setLocation("/#newsletter");
  }

  const NavLink = ({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) => (
    <Link href={href}>
      <div
        className={cn(
          "text-sm font-medium transition-all duration-200 cursor-pointer px-3.5 py-1.5 rounded-md",
          active ? "text-red-500 bg-red-500/10 font-semibold" : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
        )}
      >
        {children}
      </div>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Sitecore<span className="text-red-500">Series</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            <NavLink href="/" active={isActive("/")}>Home</NavLink>

            {/* Dropdown Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-all duration-200 cursor-pointer px-3.5 py-1.5 rounded-md outline-none",
                  isBlogActive ? "text-red-500 bg-red-500/10 font-semibold" : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                )}
              >
                <span>Blogs & Articles</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", dropdownOpen && "rotate-180 text-red-500")} />
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 top-full pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="w-[38rem] max-h-[80vh] overflow-y-auto p-5 rounded-2xl border border-zinc-800 bg-[#121215] shadow-2xl shadow-black/80">
                    <div className="grid grid-cols-2 gap-8">
                      {CATEGORY_GROUPS.map((group) => (
                        <div key={group.id} className="space-y-3">
                          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider border-b border-zinc-800/80 pb-2 mb-2">
                            {group.name}
                          </div>
                          <div className="flex flex-col gap-1">
                            {(grouped[group.id] || []).map((cat) => (
                              <Link 
                                key={cat.slug} 
                                href={`/blogs/${cat.slug}`}
                                onClick={() => setDropdownOpen(false)}
                              >
                                <div className="cursor-pointer rounded-lg py-2 px-2.5 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                  <span className="font-medium text-sm block text-zinc-300">{cat.name}</span>
                                </div>
                              </Link>
                            ))}
                            {(!grouped[group.id] || grouped[group.id].length === 0) && (
                              <span className="text-xs text-zinc-600 italic px-2 py-1">No categories yet</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/podcasts" active={location.startsWith("/podcasts")}>Podcasts</NavLink>
            <NavLink href="/events" active={location.startsWith("/events")}>Events</NavLink>
            <NavLink href="/contact" active={isActive("/contact")}>Contact</NavLink>
            <NavLink href="/about" active={isActive("/about")}>About</NavLink>

            <div className="ml-3 pl-3 border-l border-zinc-800 h-6 flex items-center">
              <Button size="sm" onClick={openNewsletter} className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium px-4 shadow-md shadow-red-600/20 transition-all">
                <Flame className="h-4 w-4 mr-1.5 text-white" />
                Subscribe
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-300 hover:bg-zinc-800">
              {mobileMenuOpen ? <X className="h-6 w-6 text-red-500" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090b] animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 p-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}><div className="block px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer">Home</div></Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}><div className="block px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer">About Us</div></Link>
            <Link href="/podcasts" onClick={() => setMobileMenuOpen(false)}><div className="block px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer">Podcasts & Insights</div></Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)}><div className="block px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer">Events</div></Link>
            
            {/* Mobile Dropdown - stays collapsed until clicked */}
            <div className="px-3 py-2">
              <div 
                onClick={() => setMobileBlogsOpen(!mobileBlogsOpen)}
                className="flex items-center justify-between text-xs font-bold text-red-500 uppercase tracking-wider cursor-pointer hover:text-red-400 py-1"
              >
                <span>Blogs & Articles</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobileBlogsOpen && "rotate-180")} />
              </div>

              {mobileBlogsOpen && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-zinc-800 pl-3 max-h-60 overflow-y-auto animate-in fade-in duration-150">
                  {(categories || []).map((cat) => (
                    <Link key={cat.slug} href={`/blogs/${cat.slug}`} onClick={() => setMobileMenuOpen(false)}>
                      <div className="block py-1.5 text-sm font-medium text-zinc-400 hover:text-red-400 cursor-pointer">{cat.name}</div>
                    </Link>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <span className="text-xs text-zinc-600 italic py-1 block">No categories yet</span>
                  )}
                </div>
              )}
            </div>

            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}><div className="block px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg cursor-pointer">Contact Us</div></Link>
            
            <button type="button" onClick={openNewsletter} className="flex items-center justify-center gap-2 w-full mt-3 px-3 py-2.5 text-center text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md shadow-red-600/20 cursor-pointer">
              <Flame className="h-4 w-4" />
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}