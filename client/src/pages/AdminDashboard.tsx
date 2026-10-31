import { useEffect, useState, useMemo, memo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isAdminLoggedIn, clearAdminToken } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Loader2, Plus, Pencil, Trash2, LogOut, ShieldCheck, X, Filter, Send,
  EyeOff, CheckCircle2, FileEdit, FileText, Tag, Calendar, Mic, Home as HomeIcon, Info, Mail, Inbox,
} from "lucide-react";
import type { Post, InsertPost, Category } from "@shared/schema";
import { api } from "@shared/routes";
import { useCategories, slugify } from "@/lib/categories";
import { RichTextEditor } from "@/components/RichTextEditor";
import { HomeEditor, AboutEditor, ContactEditor } from "@/components/admin/SiteContentEditors";
import { EventsManager, PodcastsManager, CategoriesManager, ContactSubmissionsViewer } from "@/components/admin/ListManagers";
import { Field, ImageField } from "@/components/admin/AdminShared";

type SectionId = "posts" | "categories" | "events" | "podcasts" | "home" | "about" | "contact" | "submissions";

const SECTIONS: { id: SectionId; label: string; icon: any }[] = [
  { id: "posts", label: "Blogs & Articles", icon: FileText },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "events", label: "Events", icon: Calendar },
  { id: "podcasts", label: "Podcasts & Insights", icon: Mic },
  { id: "home", label: "Home page content", icon: HomeIcon },
  { id: "about", label: "About Us content", icon: Info },
  { id: "contact", label: "Contact Us content", icon: Mail },
  { id: "submissions", label: "Contact submissions", icon: Inbox },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<SectionId>("posts");

  useEffect(() => {
    if (!isAdminLoggedIn()) setLocation("/admin/login");
  }, [setLocation]);

  function logout() {
    clearAdminToken();
    setLocation("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      {/* Header Banner */}
      <div className="bg-secondary text-secondary-foreground py-8 sm:py-10 shadow-lg border-b border-border/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-secondary-foreground/70">Manage every section of SitecoreSeries.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout} 
            className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white transition-all text-xs sm:text-sm" 
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 sm:gap-8">
          {/* Navigation Sidebar */}
          <aside className="bg-card rounded-3xl border border-border/80 p-2 sm:p-3 shadow-xs h-fit lg:sticky lg:top-6 z-10">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar pb-1 lg:pb-0">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  data-testid={`nav-admin-${s.id}`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    section === s.id 
                      ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold" 
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <s.icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Work Area */}
          <main className="min-w-0">
            {section === "posts" && <PostsManager />}
            {section === "categories" && <CategoriesManager />}
            {section === "events" && <EventsManager />}
            {section === "podcasts" && <PodcastsManager />}
            {section === "home" && <HomeEditor />}
            {section === "about" && <AboutEditor />}
            {section === "contact" && <ContactEditor />}
            {section === "submissions" && <ContactSubmissionsViewer />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ============== POSTS MANAGER ==============
const ALL = "__all__";
const EMPTY: InsertPost = { title: "", slug: "", content: "", summary: "", category: "", authorName: "Pranshu Katiyar", coverImage: null, published: false };

function PostsManager() {
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>(ALL);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: posts, isLoading } = useQuery<Post[]>({ queryKey: [api.posts.list.path] });

  const distinctCats = useMemo(() => {
    const set = new Set<string>();
    posts?.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (filterCategory === ALL) return posts;
    return posts.filter((p) => p.category === filterCategory);
  }, [posts, filterCategory]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/posts/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [api.posts.list.path] }); toast({ title: "Post deleted" }); },
    onError: (e: any) => toast({ title: "Delete failed", description: e?.message, variant: "destructive" }),
  });

  const publishToggle = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => apiRequest("PATCH", `/api/admin/posts/${id}`, { published }),
    onSuccess: (_d, vars) => { queryClient.invalidateQueries({ queryKey: [api.posts.list.path] }); toast({ title: vars.published ? "Post published" : "Post unpublished" }); },
    onError: (e: any) => toast({ title: "Action failed", description: e?.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      {/* Controls Container */}
      <div className="bg-card rounded-3xl border border-border/80 p-4 mb-6 flex items-center gap-3 flex-wrap shadow-xs">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-foreground">Filter by category:</span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-1.5 rounded-full border border-border bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          data-testid="select-filter-category"
        >
          <option value={ALL}>All categories ({posts?.length || 0})</option>
          {distinctCats.map((c) => (<option key={c} value={c}>{c} ({posts?.filter((p) => p.category === c).length})</option>))}
        </select>
        <Button onClick={() => setCreating(true)} className="ml-auto rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm text-xs sm:text-sm font-bold px-4" data-testid="button-create-post">
          <Plus className="h-4 w-4 mr-1.5" /> New Post
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-3xl border border-border/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/80">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-xs sm:text-sm text-foreground break-words max-w-xs sm:max-w-md" data-testid={`text-post-title-${post.id}`}>{post.title}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">{post.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> Published</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20"><FileEdit className="h-3 w-3" /> Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      {post.published ? (
                        <Button size="sm" variant="outline" onClick={() => publishToggle.mutate({ id: post.id, published: false })} disabled={publishToggle.isPending} title="Unpublish" className="rounded-xl">
                          <EyeOff className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => publishToggle.mutate({ id: post.id, published: true })} disabled={publishToggle.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">
                          <Send className="h-3.5 w-3.5 mr-1" /> Publish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setEditing(post)} data-testid={`button-edit-${post.id}`} className="rounded-xl"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${post.title}"?`)) deleteMutation.mutate(post.id); }} className="text-destructive hover:bg-destructive/10 rounded-xl" data-testid={`button-delete-${post.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-muted-foreground text-sm">No posts found in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) && (
        <PostFormModal initial={editing || EMPTY} isEdit={!!editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

// Memoized Content Editor
const MemoizedContentEditor = memo(({ value, onChange }: { value: string; onChange: (html: string) => void }) => (
  <RichTextEditor value={value} onChange={onChange} placeholder="Write your full article here..." minHeight={360} testId="rich-post-content" />
));

function PostFormModal({ initial, isEdit, onClose }: { initial: Post | InsertPost; isEdit: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { data: cats } = useCategories();
  const [form, setForm] = useState<InsertPost>({
    title: initial.title,
    slug: initial.slug,
    content: initial.content,
    summary: initial.summary,
    category: initial.category,
    authorName: initial.authorName ?? "Pranshu Katiyar",
    coverImage: initial.coverImage ?? null,
    published: (initial as any).published ?? false,
  });

  const mutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const payload: InsertPost = {
        ...form,
        slug: isEdit && form.slug ? form.slug : slugify(form.title) || `post-${Date.now()}`,
        coverImage: form.coverImage && (form.coverImage as string).trim() ? form.coverImage : null,
        published: publish,
      };
      if (isEdit) await apiRequest("PATCH", `/api/admin/posts/${(initial as Post).id}`, payload);
      else await apiRequest("POST", `/api/admin/posts`, payload);
      return publish;
    },
    onSuccess: (published) => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      toast({ title: isEdit ? (published ? "Post saved & published" : "Draft saved") : (published ? "Post published" : "Draft created") });
      onClose();
    },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message || "Unknown error", variant: "destructive" }),
  });

  function update<K extends keyof InsertPost>(key: K, value: InsertPost[K]) { setForm((f) => ({ ...f, [key]: value })); }
  const groups = useMemo(() => {
    const g: Record<string, Category[]> = {};
    (cats || []).forEach((c) => { (g[c.group] ||= []).push(c); });
    return g;
  }, [cats]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      <div className="bg-card rounded-none sm:rounded-2xl w-full max-w-4xl h-full sm:h-[90vh] shadow-2xl border border-border flex flex-col overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0 bg-card">
          <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">{isEdit ? "Edit Post" : "Create New Post"}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={(e) => e.preventDefault()} className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <Field label="Title" required>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} required placeholder="My amazing Sitecore article" className="input-base" data-testid="input-post-title" />
            {!isEdit && form.title && (
              <p className="text-xs text-muted-foreground mt-1.5">URL slug: <code className="bg-muted px-1.5 py-0.5 rounded text-primary">{slugify(form.title)}</code></p>
            )}
          </Field>

          <Field label="Category" required>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} required className="input-base cursor-pointer" data-testid="select-post-category">
              <option value="">— Select a category —</option>
              {Object.entries(groups).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Author name" required>
            <input value={form.authorName ?? ""} onChange={(e) => update("authorName", e.target.value)} required placeholder="Pranshu Katiyar" className="input-base" data-testid="input-post-author-name" />
          </Field>

          <Field label="Cover image">
            <ImageField value={form.coverImage} onChange={(v) => update("coverImage", v)} />
          </Field>

          {/* Multiline Textarea for Summary (Big, Bold, Red Underline) */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Summary <span className="text-destructive">*</span></h3>
            <textarea
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="Short summary that appears in post cards..."
              rows={3}
              required
              className="input-base summary-highlight resize-y"
              data-testid="input-post-summary"
            />
          </div>

          <Field label="Content" required>
            <MemoizedContentEditor value={form.content} onChange={(html) => update("content", html)} />
          </Field>
        </form>

        {/* Footer - Fixed at bottom so buttons are always visible */}
        <div className="flex flex-wrap gap-3 justify-end p-4 sm:p-5 border-t border-border bg-card shadow-lg shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full text-xs sm:text-sm cursor-pointer">Cancel</Button>
          <Button type="button" variant="outline" disabled={mutation.isPending}
            onClick={() => { if (!validate(form, toast)) return; mutation.mutate(false); }}
            className="rounded-full font-bold px-5 text-xs sm:text-sm cursor-pointer" data-testid="button-save-draft">
            <FileEdit className="h-4 w-4 mr-1.5" /> Save as Draft
          </Button>
          <Button type="button" disabled={mutation.isPending}
            onClick={() => { if (!validate(form, toast)) return; mutation.mutate(true); }}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 text-xs sm:text-sm shadow-md shadow-emerald-600/20 cursor-pointer"
            data-testid="button-publish-post">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1.5" /> {isEdit && (initial as any).published ? "Save & Keep Published" : "Publish Now"}</>}
          </Button>
        </div>
      </div>
      <style>{`
        .input-base { width: 100%; padding: 0.625rem 1rem; border-radius: 0.75rem; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); outline: none; transition: all 0.15s; font-size: 0.875rem; color: hsl(var(--foreground)); } 
        .input-base:focus { border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15); }
        
        /* Big, bold summary text with primary red underline */
        .summary-highlight {
          font-size: 1.15rem !important;
          font-weight: 700 !important;
          text-decoration: underline !important;
          text-decoration-color: hsl(var(--primary)) !important;
          text-underline-offset: 4px !important;
        }
      `}</style>
    </div>
  );
}

function validate(form: InsertPost, toast: (opts: any) => void): boolean {
  if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return false; }
  if (!form.category.trim()) { toast({ title: "Category is required", variant: "destructive" }); return false; }
  if (!form.summary.trim()) { toast({ title: "Summary is required", variant: "destructive" }); return false; }
  if (!form.content || !form.content.replace(/<[^>]*>/g, "").trim()) { toast({ title: "Content is required", variant: "destructive" }); return false; }
  return true;
}