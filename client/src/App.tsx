import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import BlogCategory from "@/pages/BlogCategory";
import PostDetail from "@/pages/PostDetail";
import Podcasts from "@/pages/Podcasts";
import Events from "@/pages/Events";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

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

// Ensure scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/blogs" component={Home} /> {/* ✅ Fixed 404 for /blogs */}
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/blogs/:category" component={BlogCategory} />
          <Route path="/podcasts" component={Podcasts} />
          <Route path="/podcasts/:slug" component={Podcasts} />
          <Route path="/events" component={Events} />
          <Route path="/events/:slug" component={Events} />
          <Route path="/posts/:slug" component={PostDetail} />
          <Route path="/post/:slug" component={PostDetail} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;