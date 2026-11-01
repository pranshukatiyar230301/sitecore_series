import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Twitter, Linkedin, Mail, Copy, Check, ArrowUpRight, Flame, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  const [copied, setCopied] = useState(false);

  // Fetch footer content from your site content API
  const { data: footerData } = useQuery<any>({
    queryKey: ["/api/site-content/footer"],
    staleTime: 1000 * 60 * 5,
  });

  const email = footerData?.email || "pranshukatiyar230301@gmail.com";
  const description = footerData?.description || "Sharing knowledge, architecture guides, and tutorials for the Sitecore ecosystem. Mastering modern digital experience platforms one post at a time.";
  const badgeText = footerData?.badgeText || "Community-Led Platform";
  
  const exploreLinks = footerData?.exploreLinks || [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  const topicLinks = footerData?.topicLinks || [
    { label: "Content Hub", href: "/blogs/sitecore-content-hub" },
    { label: "Sitecore SXA", href: "/blogs/sitecore-sxa" },
    { label: "JSS / Headless Architecture", href: "/blogs/sitecore-jss" },
    { label: "XM / XP Cloud", href: "/blogs/sitecore-xm-xp" },
  ];

  const socials = [
    { icon: Twitter, href: footerData?.twitter || "https://twitter.com/sitecoreseries", label: "Twitter" },
    { icon: Linkedin, href: footerData?.linkedin || "https://linkedin.com/in/er-pranshu-katiyar-a77aa8197", label: "LinkedIn" },
    { icon: Facebook, href: footerData?.facebook || "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: footerData?.instagram || "https://instagram.com", label: "Instagram" },
    { icon: Mail, href: `mailto:${email}`, label: "Email" },
    { icon: Youtube, href: footerData?.youtube || "https://youtube.com", label: "YouTube" },
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative bg-black text-zinc-300 mt-auto border-t border-zinc-900 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-32 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Info (4 Cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/">
              <div className="inline-flex items-center gap-2.5 cursor-pointer group">
                <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">
                  Sitecore<span className="text-red-500">Series</span>
                </span>
              </div>
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              {description}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-red-400 font-medium">
              <Flame className="h-3.5 w-3.5 text-red-500" />
              <span>{badgeText}</span>
            </div>
          </div>

          {/* Quick Links (2 Cols) */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {exploreLinks.map((item: any) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="text-zinc-400 hover:text-red-400 transition-colors duration-200 cursor-pointer inline-flex items-center gap-1 group">
                      {item.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-red-400" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics (3 Cols) */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Topics
            </h3>
            <ul className="space-y-2.5 text-sm">
              {topicLinks.map((item: any) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="text-zinc-400 hover:text-red-400 transition-colors duration-200 cursor-pointer">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Direct Contact (3 Cols) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Connect
            </h3>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {socials.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-950/40 hover:border-red-600/50 flex items-center justify-center transition-all duration-200 shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Interactive Email Bar */}
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-red-500" /> Direct Reach out
              </span>
              <div className="flex items-center justify-between gap-2 text-xs bg-black p-2 rounded-lg border border-zinc-800">
                <span className="text-zinc-300 truncate font-mono text-[11px]" title={email}>
                  {email}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shrink-0 cursor-pointer"
                  title="Copy email address"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} SitecoreSeries. All rights reserved.</p>
          <p className="text-zinc-500 text-center sm:text-right">
            Independent community resource. Not affiliated with Sitecore Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}