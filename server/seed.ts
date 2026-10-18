import { storage } from "./storage";

const DEFAULT_CATEGORIES = [
  { name: "Sitecore XP", slug: "sitecore-xp", group: "Core" },
  { name: "Sitecore XM", slug: "sitecore-xm", group: "Core" },
  { name: "Sitecore XDB", slug: "sitecore-xdb", group: "Core" },
  { name: "Sitecore XConnect", slug: "sitecore-xconnect", group: "Core" },
  { name: "Sitecore Analytics", slug: "sitecore-analytics", group: "Core" },
  { name: "Sitecore Marketing Automation", slug: "sitecore-marketing-automation", group: "Core" },
  { name: "Sitecore Email Experience Manager (EXM)", slug: "sitecore-exm", group: "Core" },
  { name: "Sitecore Forms", slug: "sitecore-forms", group: "Core" },
  { name: "Sitecore Path Analyzer", slug: "sitecore-path-analyzer", group: "Core" },
  { name: "Sitecore Identity Server", slug: "sitecore-identity-server", group: "Core" },
  { name: "Sitecore Horizon", slug: "sitecore-horizon", group: "Core" },
  { name: "Sitecore Commerce (XC)", slug: "sitecore-commerce-xc", group: "Core" },
  { name: "Sitecore SXA", slug: "sitecore-sxa", group: "Core" },
  { name: "Sitecore PowerShell Extensions (SPE)", slug: "sitecore-spe", group: "Core" },
  { name: "Sitecore XM Cloud", slug: "sitecore-xm-cloud", group: "Composable" },
  { name: "Sitecore Experience Edge", slug: "sitecore-experience-edge", group: "Composable" },
  { name: "Sitecore Headless Services", slug: "sitecore-headless-services", group: "Composable" },
  { name: "Sitecore JSS", slug: "sitecore-jss", group: "Composable" },
  { name: "Sitecore OrderCloud", slug: "sitecore-ordercloud", group: "Composable" },
  { name: "Sitecore Content Hub", slug: "sitecore-content-hub", group: "Composable" },
  { name: "Sitecore CDP", slug: "sitecore-cdp", group: "Composable" },
  { name: "Sitecore Personalize", slug: "sitecore-personalize", group: "Composable" },
  { name: "Sitecore Discover", slug: "sitecore-discover", group: "Composable" },
  { name: "Sitecore Search", slug: "sitecore-search", group: "Composable" },
  { name: "Sitecore Send", slug: "sitecore-send", group: "Composable" },
  { name: "Sitecore Connect", slug: "sitecore-connect", group: "Composable" },
  { name: "Sitecore Stream", slug: "sitecore-stream", group: "Composable" },
];

const DEFAULT_HOME = {
  hero: {
    eyebrow: "",
    titleLine1: "Building the future",
    titleLine2: "with",
    titleHighlight: "Sitecore",
    subtitle: "Master XM Cloud, Content Hub, and modern architecture patterns. Technical excellence for the composable DXP era.",
    primaryCtaLabel: "Explore Content",
    primaryCtaHref: "/",           // ✅ Updated from "/blogs" to "/"
    secondaryCtaLabel: "View Tutorials",
    secondaryCtaHref: "#whats-hot", // ✅ Updated from "/blogs" to smooth scroll target
  },
  stats: [
    { value: "27+", label: "Sitecore Categories" },
    { value: "500+", label: "Developers Reading" },
    { value: "100%", label: "Code-First Tutorials" },
    { value: "24/7", label: "Always Available" },
  ],
  highlightSectionTitle: "What's hot right now",
  highlightSectionSubtitle: "Curated Sitecore content series our community is reading this week.",
  highlights: [
    { eyebrow: "New Series", title: "XM Cloud Migrations", desc: "Step-by-step guide for moving from XM 10.x to XM Cloud without losing your sanity.", href: "/" },
    { eyebrow: "Hot Topic", title: "Composable DXP Patterns", desc: "Architectures, anti-patterns, and the integrations that make composable actually work.", href: "/" },
    { eyebrow: "Community Favorite", title: "JSS + Next.js Deep Dives", desc: "Personalization, layout service mastery, and production-ready frontends with JSS.", href: "/" },
  ],
  testimonialsTitle: "What developers say",
  testimonials: [
    { name: "Alex Thompson", role: "Sitecore MVP", content: "The most comprehensive resource for Sitecore developers I've found in years. Truly exceptional content." },
    { name: "Sarah Chen", role: "Senior Architect", content: "SitecoreSeries helped our team bridge the gap between XP and XM Cloud seamlessly. A must-read." },
    { name: "Marco Rossi", role: "Lead Developer", content: "The tutorials on Content Hub are second to none. Saved us weeks of trial and error." },
    { name: "Priya Sharma", role: "Sitecore Technical Lead", content: "Finally — a Sitecore blog that explains the why behind every architectural decision. Bookmarked forever." },
    { name: "James O'Connor", role: "DXP Consultant", content: "I send every new hire the JSS tutorial series. It's the fastest onboarding tool we've ever had." },
    { name: "Yuki Tanaka", role: "Frontend Engineer", content: "The Headless Services walkthroughs are gold. Concrete code samples, no fluff, just what you need." },
  ],
  whyTitle: "From developers, for developers.",
  whySubtitle: "Every article ships from real production code. No theoretical fluff, no copy-pasted documentation — just battle-tested patterns from people who actually deploy Sitecore.",
  whyCards: [
    { title: "Code-first content", desc: "Every concept paired with working samples you can clone, run, and ship." },
    { title: "27 categories deep", desc: "From classic XP and SXA to XM Cloud, CDP, Personalize, and the entire composable stack." },
    { title: "Built with the community", desc: "Guest contributors, reader-driven topics, and a roadmap shaped by what you actually need." },
  ],
  newsletterTitle: "Stay in the loop",
  newsletterSubtitle: "Get the latest Sitecore tips, tutorials, and architectural patterns delivered straight to your inbox. No spam, ever.",
};

const DEFAULT_ABOUT = {
  heroTitle: "About SitecoreSeries",
  heroSubtitle: "Your definitive resource for everything Sitecore. From technical deep dives to architectural best practices, we help you master the platform.",
  heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072",
  authorName: "Pranshu Katiyar",
  authorRole: "Lead Author & Developer",
  authorBio: "A result-oriented software development professional with 3.5 years of experience, specializing in Sitecore SXA, Sitecore Headless & JSS, Sitecore XM Cloud, Sitecore OrderCloud, and Sitecore Helix Architecture.",
  authorImage: "",
  authorSkills: [
    "Next.js, ASP.NET & C#",
    "Sitecore Content Migration",
    "MySQL, SQL Server",
    "Automation Testing (TestSigma)",
  ],
  missionTitle: "Our Mission",
  missionParagraphs: [
    "Sitecore is a powerful, complex beast. Documentation can only take you so far. We created SitecoreSeries to bridge the gap between theory and real-world application.",
    "We believe in code-first examples, honest reviews of new features, and practical solutions to the errors that keep you up at night.",
  ],
  shareTitle: "Share Your Sitecore Knowledge",
  shareSubtitle: "Have a tip, deep-dive tutorial, or a unique solution? Join our growing community of contributors.",
  shareOptions: [
    { title: "Guest Contributor", desc: "Provide your content and we publish it with full credit to you. Build your presence in the Sitecore community.", tags: ["Full byline", "Author profile"] },
    { title: "Paid Submission", desc: "Prefer compensation? We pay for high-quality articles. Paid pieces become SitecoreSeries property and publish under our authorship.", tags: ["Get paid", "Quick turnaround"] },
  ],
  shareEmail: "pranshukatiyar230301@gmail.com",
  ctaTitle: "Ready to level up your Sitecore skills?",
  ctaSubtitle: "Join thousands of other developers who read our newsletter every week.",
};

const DEFAULT_CONTACT = {
  heroTitle: "Get in Touch",
  heroSubtitle: "Have a question about Sitecore? Want to suggest a topic? Or just want to say hi? We'd love to hear from you.",
  infoTitle: "Contact Information",
  infoSubtitle: "SitecoreSeries is run by a community of passionate developers. While we don't have a physical office, we're always available online.",
  email: "pranshukatiyar230301@gmail.com",
  twitter: "@sitecoreseries",
  location: "Global (Remote)",
  faq: [
    { q: "Do you accept guest posts?", a: "Yes! We love community contributions. Send us your pitch." },
    { q: "Can I hire you for consulting?", a: "Our authors are often available for freelance work. Contact us for details." },
  ],
};

const SAMPLE_POSTS = [
  { title: "Getting Started with Sitecore Content Hub", slug: "getting-started-content-hub", category: "Sitecore Content Hub", summary: "An introduction to the capabilities of Sitecore Content Hub for DAM and CMP.", content: "Sitecore Content Hub is a unified platform...", coverImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80", published: true },
  { title: "SXA Best Practices for 2024", slug: "sxa-best-practices-2024", category: "Sitecore SXA", summary: "Learn how to optimize your Sitecore Experience Accelerator implementation.", content: "SXA speeds up production...", coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80", published: true },
  { title: "Building Headless with Sitecore JSS", slug: "building-headless-jss", category: "Sitecore JSS", summary: "A deep dive into building React applications with Sitecore JSS.", content: "JSS allows front-end developers...", coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80", published: true },
  { title: "Upgrading to Sitecore XM Cloud", slug: "upgrading-sitecore-xm-cloud", category: "Sitecore XM", summary: "What you need to know before migrating to the cloud.", content: "XM Cloud is the future...", coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", published: true },
];

export async function runSeed() {
  const cats = await storage.listCategories();
  if (cats.length === 0) {
    let i = 0;
    for (const c of DEFAULT_CATEGORIES) {
      await storage.createCategory({ ...c, sortOrder: i++ });
    }
  }
  
  // Force update or seed site content
  await storage.setSiteContent("home", DEFAULT_HOME);
  if (await storage.getSiteContent("about") === undefined) await storage.setSiteContent("about", DEFAULT_ABOUT);
  if (await storage.getSiteContent("contact") === undefined) await storage.setSiteContent("contact", DEFAULT_CONTACT);

  const existingPosts = await storage.getPosts(undefined, { includeUnpublished: true });
  if (existingPosts.length === 0) {
    for (const p of SAMPLE_POSTS) await storage.createPost(p as any);
  }
}