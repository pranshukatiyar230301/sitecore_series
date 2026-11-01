import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Event, Podcast, Category } from "@shared/schema";
import { Field, TextInput, TextArea, ImageField } from "./AdminShared";
import { slugify } from "@/lib/categories";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl border border-border flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="text-xl font-display font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">{children}</div>
      </div>
    </div>
  );
}

// ============ EVENTS ============
export function EventsManager() {
  const { toast } = useToast();
  const { data: events, isLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const [editing, setEditing] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);
  const del = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/events/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); toast({ title: "Event deleted" }); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-muted-foreground">{events?.length ?? 0} event(s)</p>
        <Button onClick={() => setCreating(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white"><Plus className="h-4 w-4 mr-2" /> New Event</Button>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary inline" /></div> : (
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Location</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(events || []).map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">{e.title}</td>
                <td className="px-6 py-4 hidden md:table-cell text-sm">{e.startDate}</td>
                <td className="px-6 py-4 hidden md:table-cell text-sm">{e.location}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${e.published ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {e.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing(e)} className="mr-2"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${e.title}"?`)) del.mutate(e.id); }} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">No events yet. Click "New Event" to add one.</td></tr>
            )}
          </tbody>
        </table>
        )}
      </div>
      {(creating || editing) && (
        <EventForm initial={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function EventForm({ initial, onClose }: { initial: Event | null; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    startDate: initial?.startDate ?? "",
    location: initial?.location ?? "",
    link: initial?.link ?? "",
    image: initial?.image ?? "",
    published: initial?.published ?? true,
  });
  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, link: form.link || null, image: form.image || null };
      if (isEdit) await apiRequest("PATCH", `/api/admin/events/${initial!.id}`, payload);
      else await apiRequest("POST", "/api/admin/events", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: isEdit ? "Event updated" : "Event created" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });

  return (
    <Modal title={isEdit ? "Edit Event" : "New Event"} onClose={onClose}>
      <Field label="Title" required><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
      <Field label="Description" required><TextArea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Date / time" required hint="Select the event date and time"><TextInput type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></Field>
        <Field label="Location" required hint="e.g. Online (Zoom), Mumbai, etc."><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Field>
      </div>
      <Field label="Registration / event link" hint="Optional"><TextInput value={form.link ?? ""} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." /></Field>
      <Field label="Cover image"><ImageField value={form.image} onChange={(v) => setForm({ ...form, image: v ?? "" })} /></Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        Published (visible to visitors)
      </label>
      <div className="flex gap-2 justify-end pt-3 border-t border-border sticky bottom-0 bg-background">
        <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-primary hover:bg-primary/90 text-white">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
        </Button>
      </div>
    </Modal>
  );
}

// ============ PODCASTS ============
export function PodcastsManager() {
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<Podcast[]>({ queryKey: ["/api/podcasts"] });
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [creating, setCreating] = useState(false);
  const del = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/podcasts/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] }); toast({ title: "Podcast deleted" }); },
  });
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-muted-foreground">{items?.length ?? 0} episode(s)</p>
        <Button onClick={() => setCreating(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white"><Plus className="h-4 w-4 mr-2" /> New Podcast / Insight</Button>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary inline" /></div> : (
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Host</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">{p.title}</td>
                <td className="px-6 py-4 hidden md:table-cell text-sm">{p.host || "—"}</td>
                <td className="px-6 py-4 hidden md:table-cell text-sm">{p.episodeDate || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.published ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>{p.published ? "Published" : "Draft"}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)} className="mr-2"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">No podcasts/insights yet.</td></tr>
            )}
          </tbody>
        </table>
        )}
      </div>
      {(creating || editing) && <PodcastForm initial={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
    </div>
  );
}

function PodcastForm({ initial, onClose }: { initial: Podcast | null; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    host: initial?.host ?? "",
    episodeDate: initial?.episodeDate ?? "",
    episodeUrl: initial?.episodeUrl ?? "",
    image: initial?.image ?? "",
    published: initial?.published ?? true,
  });
  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, host: form.host || null, episodeDate: form.episodeDate || null, episodeUrl: form.episodeUrl || null, image: form.image || null };
      if (isEdit) await apiRequest("PATCH", `/api/admin/podcasts/${initial!.id}`, payload);
      else await apiRequest("POST", "/api/admin/podcasts", payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] }); toast({ title: isEdit ? "Podcast updated" : "Podcast created" }); onClose(); },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });
  return (
    <Modal title={isEdit ? "Edit Podcast / Insight" : "New Podcast / Insight"} onClose={onClose}>
      <Field label="Title" required><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
      <Field label="Description" required><TextArea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Host"><TextInput value={form.host ?? ""} onChange={(e) => setForm({ ...form, host: e.target.value })} /></Field>
        <Field label="Episode date" hint="e.g. April 18, 2026"><TextInput value={form.episodeDate ?? ""} onChange={(e) => setForm({ ...form, episodeDate: e.target.value })} /></Field>
      </div>
      <Field label="Listen / watch link" hint="YouTube, Spotify, Apple Podcasts, etc."><TextInput value={form.episodeUrl ?? ""} onChange={(e) => setForm({ ...form, episodeUrl: e.target.value })} placeholder="https://..." /></Field>
      <Field label="Cover image"><ImageField value={form.image} onChange={(v) => setForm({ ...form, image: v ?? "" })} /></Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published (visible to visitors)
      </label>
      <div className="flex gap-2 justify-end pt-3 border-t border-border sticky bottom-0 bg-background">
        <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-primary hover:bg-primary/90 text-white">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
        </Button>
      </div>
    </Modal>
  );
}

// ============ CATEGORIES ============
export function CategoriesManager() {
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const del = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Category deleted" }); },
  });
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-muted-foreground">{items?.length ?? 0} categories</p>
        <Button onClick={() => setCreating(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white"><Plus className="h-4 w-4 mr-2" /> New Category</Button>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary inline" /></div> : (
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Group</th>
              <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((c: any) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">
                  <div>{c.name}</div>
                  {c.tagline && <div className="text-xs text-primary font-normal">{c.tagline}</div>}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{c.slug}</td>
                <td className="px-6 py-4"><span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{c.group}</span></td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)} className="mr-2"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${c.name}"? Posts in this category will keep the name.`)) del.mutate(c.id); }} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {(creating || editing) && <CategoryForm initial={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
    </div>
  );
}

function CategoryForm({ initial, onClose }: { initial: Category | null; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = !!initial;
  const initialAny = initial as any;

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    group: initial?.group ?? "Core",
    sortOrder: initial?.sortOrder ?? 99,
    tagline: initialAny?.tagline ?? "",
    description: initialAny?.description ?? "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { 
        ...form, 
        slug: form.slug || slugify(form.name),
        tagline: form.tagline || null,
        description: form.description || null,
      };
      if (isEdit) await apiRequest("PATCH", `/api/admin/categories/${initial!.id}`, payload);
      else await apiRequest("POST", "/api/admin/categories", payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: isEdit ? "Category updated" : "Category created" }); onClose(); },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });

  return (
    <Modal title={isEdit ? "Edit Category" : "New Category"} onClose={onClose}>
      <Field label="Name" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
      <Field label="URL slug" hint="Leave blank to auto-generate"><TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.name)} /></Field>
      <Field label="Group" required>
        <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background">
          <option value="Core">Core (Traditional / Platform-based)</option>
          <option value="Composable">Composable (SaaS / Headless / Modular)</option>
        </select>
      </Field>
      <Field label="Tagline" hint="Short subtitle shown on category hero banner"><TextInput value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. SaaS Content Platform" /></Field>
      <Field label="Description" hint="Detailed description shown on category hero banner"><TextArea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explain what this category covers..." /></Field>
      <Field label="Sort order" hint="Lower = appears first"><TextInput type="number" value={String(form.sortOrder)} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value || "0", 10) })} /></Field>
      <div className="flex gap-2 justify-end pt-3 border-t border-border sticky bottom-0 bg-background">
        <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-primary hover:bg-primary/90 text-white">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
        </Button>
      </div>
    </Modal>
  );
}

// ============ CONTACT SUBMISSIONS ============
export function ContactSubmissionsViewer() {
  const { data, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/contact-submissions"] });
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-5">{data?.length ?? 0} submission(s) — emails are also sent to your inbox once SendGrid is connected.</p>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border overflow-hidden">
        {isLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary inline" /></div> : (
          <div className="divide-y divide-border">
            {(data || []).map((s: any) => (
              <div key={s.id} className="p-5">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <div>
                    <span className="font-bold">{s.name}</span>
                    <span className="text-muted-foreground text-sm ml-3">{s.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground/80">{s.message}</p>
              </div>
            ))}
            {(!data || data.length === 0) && <div className="p-12 text-center text-muted-foreground">No submissions yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}