import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Critical Eagerly Loaded Page
import Home from "@/pages/Home";

// Code-Split Lazy Loaded Components for Fast Initial Bundle
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const BlogCategory = lazy(() => import("@/pages/BlogCategory"));
const PostDetail = lazy(() => import("@/pages/PostDetail"));
const Podcasts = lazy(() => import("@/pages/Podcasts"));
const Events = lazy(() => import("@/pages/Events"));
const SitecoreJobs = lazy(() => import("@/pages/SitecoreJobs"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading Fallback Spinner
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Legal Pages Components
function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold font-display text-red-500 mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-zinc-400 leading-relaxed text-sm">
        <p>Last updated: October 2026</p>
        <p>Welcome to SitecoreSeries. We respect your privacy and are committed to protecting your personal data when you visit our platform or subscribe to our insights.</p>
        <h2 className="text-lg font-semibold text-zinc-200 mt-4">1. Information We Collect</h2>
        <p>We may collect email addresses when you voluntarily subscribe to our newsletter or interact with our contact forms.</p>
        <h2 className="text-lg font-semibold text-zinc-200 mt-4">2. How We Use Your Information</h2>
        <p>Your information is used strictly to send newsletters, technical updates, and respond to inquiries.</p>
      </div>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold font-display text-red-500 mb-6">Terms of Service</h1>
      <div className="space-y-4 text-zinc-400 leading-relaxed text-sm">
        <p>Last updated: October 2026</p>
        <p>By accessing and using SitecoreSeries, you agree to comply with and be bound by the following terms and conditions.</p>
        <h2 className="text-lg font-semibold text-zinc-200 mt-4">1. Use License</h2>
        <p>Permission is granted to temporarily read articles, tutorials, and guides for personal, non-commercial use only.</p>
        <h2 className="text-lg font-semibold text-zinc-200 mt-4">2. Disclaimer</h2>
        <p>All materials and code snippets are provided on an 'as is' basis without warranties of any kind.</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function FloatingScrollTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-110 transition-all duration-200 cursor-pointer border border-white/20"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/blogs" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/blogs/:category" component={BlogCategory} />
            <Route path="/podcasts" component={Podcasts} />
            <Route path="/podcasts/:slug" component={Podcasts} />
            <Route path="/events" component={Events} />
            <Route path="/events/:slug" component={Events} />
            <Route path="/jobs" component={SitecoreJobs} />
            <Route path="/posts/:slug" component={PostDetail} />
            <Route path="/post/:slug" component={PostDetail} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin" component={AdminDashboard} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
      <FloatingScrollTop />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}