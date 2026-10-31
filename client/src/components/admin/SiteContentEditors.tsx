import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Save, Trash2, Bold, Italic, Underline, 
  Heading1, Heading2, Heading3, Link as LinkIcon, 
  Image as ImageIcon, List, ListOrdered, Quote, Code, 
  Undo, Redo, Pilcrow, Upload, Type 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Field, TextInput, TextArea, ImageField, SectionCard, ListEditor } from "./AdminShared";

function useSection<T = any>(key: string) {
  const q = useQuery<T>({ queryKey: ["/api/site-content", key] });
  return q;
}

function SaveBar({ onSave, isPending }: { onSave: () => void; isPending: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-4 px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-end z-10 shadow-lg">
      <Button onClick={onSave} disabled={isPending} className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-md">
        {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save changes
      </Button>
    </div>
  );
}

function useSaveSection(key: string) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiRequest("PUT", `/api/admin/site-content/${key}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content", key] });
      toast({ title: "Saved successfully", description: "Changes have been published." });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });
}

// 🎨 Rich Text Editor with Font Family Selector & Clean Light Theme UI
export function RichTextEditor({ value, onChange, placeholder, minHeight = 220 }: { value: string; onChange: (html: string) => void; placeholder?: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (value === lastEmitted.current) return;
    if (ref.current.innerHTML === value) return;
    ref.current.innerHTML = value || "";
    lastEmitted.current = value || "";
  }, [value]);

  function emit() {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function applyBlock(tag: string) {
    ref.current?.focus();
    document.execCommand("formatBlock", false, tag);
    emit();
  }

  function setFontFamily(font: string) {
    ref.current?.focus();
    document.execCommand("fontName", false, font);
    emit();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("ss_admin_token") || "";
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-token": token }, body: fd });
      if (!res.ok) throw new Error(await res.text() || "Upload failed");
      const { url } = await res.json();
      ref.current?.focus();
      document.execCommand("insertImage", false, url);
      emit();
    } catch (e: any) {
      alert("Upload failed: " + (e?.message || "unknown"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
        
        {/* Font Family Selector */}
        <div className="flex items-center gap-1 mr-1 pr-2 border-r border-slate-300 dark:border-slate-700">
          <Type className="h-4 w-4 text-slate-500" />
          <select 
            onChange={(e) => setFontFamily(e.target.value)}
            defaultValue=""
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
            title="Font Family"
          >
            <option value="" disabled>Font...</option>
            <option value="Inter">Inter</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="JetBrains Mono">Monospace</option>
          </select>
        </div>

        <Btn onClick={() => applyBlock("h1")} title="Heading 1"><Heading1 className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("h2")} title="Heading 2"><Heading2 className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("h3")} title="Heading 3"><Heading3 className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("p")} title="Paragraph"><Pilcrow className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => exec("bold")} title="Bold"><Bold className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("italic")} title="Italic"><Italic className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("underline")} title="Underline"><Underline className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => exec("insertUnorderedList")} title="Bulleted list"><List className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("blockquote")} title="Quote"><Quote className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("pre")} title="Code block"><Code className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => { const u = prompt("Enter Link URL:"); if (u) exec("createLink", u); }} title="Insert Link"><LinkIcon className="h-4 w-4" /></Btn>
        <Btn onClick={() => { const u = prompt("Enter Image URL:"); if (u) exec("insertImage", u); }} title="Insert Image by URL"><ImageIcon className="h-4 w-4" /></Btn>
        <Btn onClick={() => fileRef.current?.click()} title="Upload Image">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4" />}
        </Btn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => exec("undo")} title="Undo"><Undo className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("redo")} title="Redo"><Redo className="h-4 w-4" /></Btn>
      </div>

      {/* Editable Area */}
      <div
        ref={ref}
        contentEditable
        onInput={emit}
        onBlur={emit}
        className="rich-editor p-4 outline-none prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-100"
        style={{ minHeight }}
      />
      <style>{`
        .rich-editor h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
        .rich-editor h2 { font-size: 1.35rem; font-weight: 700; margin: 0.5rem 0; }
        .rich-editor h3 { font-size: 1.15rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor p { margin: 0.35rem 0; line-height: 1.6; }
        .rich-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor blockquote { border-left: 3px solid var(--primary); padding-left: 1rem; margin: 0.5rem 0; font-style: italic; color: #64748b; }
        .rich-editor img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5rem 0; }
      `}</style>
    </div>
  );
}

export function HomeEditor() {
  const { data, isLoading } = useSection<any>("home");
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(JSON.parse(JSON.stringify(data))); }, [data]);
  const save = useSaveSection("home");
  if (isLoading || !form) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const set = (patch: any) => setForm({ ...form, ...patch });
  const setHero = (patch: any) => setForm({ ...form, hero: { ...form.hero, ...patch } });

  return (
    <div className="space-y-6 pb-24">
      <SectionCard title="Hero section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title — line 1"><TextInput value={form.hero.titleLine1} onChange={(e) => setHero({ titleLine1: e.target.value })} /></Field>
          <Field label="Title — line 2"><TextInput value={form.hero.titleLine2} onChange={(e) => setHero({ titleLine2: e.target.value })} /></Field>
          <Field label="Highlighted word (orange)"><TextInput value={form.hero.titleHighlight} onChange={(e) => setHero({ titleHighlight: e.target.value })} /></Field>
          <div />
          <Field label="Subtitle" hint="Shown under the title"><TextArea rows={3} value={form.hero.subtitle} onChange={(e) => setHero({ subtitle: e.target.value })} /></Field>
          <div className="grid grid-cols-1 gap-3">
            <Field label="Primary button label"><TextInput value={form.hero.primaryCtaLabel} onChange={(e) => setHero({ primaryCtaLabel: e.target.value })} /></Field>
            <Field label="Primary button link"><TextInput value={form.hero.primaryCtaHref} onChange={(e) => setHero({ primaryCtaHref: e.target.value })} /></Field>
            <Field label="Secondary button label"><TextInput value={form.hero.secondaryCtaLabel} onChange={(e) => setHero({ secondaryCtaLabel: e.target.value })} /></Field>
            <Field label="Secondary button link"><TextInput value={form.hero.secondaryCtaHref} onChange={(e) => setHero({ secondaryCtaHref: e.target.value })} /></Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Stats banner">
        <ListEditor
          items={form.stats}
          onChange={(stats) => set({ stats })}
          newItem={() => ({ value: "", label: "" })}
          addLabel="Add stat"
          render={(item, update, remove) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <Field label="Value (e.g. 27+)"><TextInput value={item.value} onChange={(e) => update({ value: e.target.value })} /></Field>
              <div className="flex gap-2 items-end">
                <Field label="Label"><TextInput value={item.label} onChange={(e) => update({ label: e.target.value })} /></Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Featured Series banners">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Field label="Section title"><TextInput value={form.highlightSectionTitle} onChange={(e) => set({ highlightSectionTitle: e.target.value })} /></Field>
          <Field label="Section subtitle"><TextInput value={form.highlightSectionSubtitle} onChange={(e) => set({ highlightSectionSubtitle: e.target.value })} /></Field>
        </div>
        <ListEditor
          items={form.highlights}
          onChange={(highlights) => set({ highlights })}
          newItem={() => ({ eyebrow: "", title: "", desc: "", href: "" })}
          addLabel="Add banner"
          render={(item, update, remove) => (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Eyebrow tag"><TextInput value={item.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} /></Field>
                <Field label="Link (href)"><TextInput value={item.href} onChange={(e) => update({ href: e.target.value })} /></Field>
                <Field label="Title"><TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label="Description"><TextInput value={item.desc} onChange={(e) => update({ desc: e.target.value })} /></Field>
              </div>
              <Button type="button" variant="outline" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-1" /> Remove banner</Button>
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="Testimonials">
        <Field label="Section title"><TextInput value={form.testimonialsTitle} onChange={(e) => set({ testimonialsTitle: e.target.value })} /></Field>
        <div className="mt-4">
          <ListEditor
            items={form.testimonials}
            onChange={(testimonials) => set({ testimonials })}
            newItem={() => ({ name: "", role: "", content: "" })}
            addLabel="Add testimonial"
            render={(item, update, remove) => (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Name"><TextInput value={item.name} onChange={(e) => update({ name: e.target.value })} /></Field>
                  <Field label="Role / Title"><TextInput value={item.role} onChange={(e) => update({ role: e.target.value })} /></Field>
                </div>
                <Field label="Quote"><TextArea rows={2} value={item.content} onChange={(e) => update({ content: e.target.value })} /></Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
              </div>
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title='"Why we exist" section'>
        <div className="space-y-3">
          <Field label="Title"><TextInput value={form.whyTitle} onChange={(e) => set({ whyTitle: e.target.value })} /></Field>
          <Field label="Subtitle"><TextArea rows={3} value={form.whySubtitle} onChange={(e) => set({ whySubtitle: e.target.value })} /></Field>
        </div>
        <div className="mt-4">
          <ListEditor
            items={form.whyCards}
            onChange={(whyCards) => set({ whyCards })}
            newItem={() => ({ title: "", desc: "" })}
            addLabel="Add card"
            render={(item, update, remove) => (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <Field label="Card title"><TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label="Description"><TextArea rows={2} value={item.desc} onChange={(e) => update({ desc: e.target.value })} /></Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
              </div>
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Newsletter section">
        <Field label="Title"><TextInput value={form.newsletterTitle} onChange={(e) => set({ newsletterTitle: e.target.value })} /></Field>
        <div className="mt-3">
          <Field label="Subtitle"><TextArea rows={2} value={form.newsletterSubtitle} onChange={(e) => set({ newsletterSubtitle: e.target.value })} /></Field>
        </div>
      </SectionCard>

      <SaveBar onSave={() => save.mutate(form)} isPending={save.isPending} />
    </div>
  );
}

export function AboutEditor() {
  const { data, isLoading } = useSection<any>("about");
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(JSON.parse(JSON.stringify(data))); }, [data]);
  const save = useSaveSection("about");
  if (isLoading || !form) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const set = (patch: any) => setForm({ ...form, ...patch });

  return (
    <div className="space-y-6 pb-24">
      <SectionCard title="Hero">
        <div className="space-y-3">
          <Field label="Title"><TextInput value={form.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} /></Field>
          <Field label="Subtitle"><TextArea rows={3} value={form.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} /></Field>
          <Field label="Hero banner image"><ImageField value={form.heroImage} onChange={(v) => set({ heroImage: v })} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Author / Lead bio">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Name"><TextInput value={form.authorName} onChange={(e) => set({ authorName: e.target.value })} /></Field>
          <Field label="Role / Title"><TextInput value={form.authorRole} onChange={(e) => set({ authorRole: e.target.value })} /></Field>
        </div>
        <div className="mt-3">
          <Field label="Photo"><ImageField value={form.authorImage} onChange={(v) => set({ authorImage: v })} /></Field>
        </div>
        <div className="mt-3">
          <Field label="Bio"><TextArea rows={4} value={form.authorBio} onChange={(e) => set({ authorBio: e.target.value })} /></Field>
        </div>
        <div className="mt-3">
          <Field label="Skill bullets" hint="One per line">
            <TextArea rows={4} value={(form.authorSkills || []).join("\n")} onChange={(e) => set({ authorSkills: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Mission section">
        <Field label="Title"><TextInput value={form.missionTitle} onChange={(e) => set({ missionTitle: e.target.value })} /></Field>
        <div className="mt-3">
          <Field label="Paragraphs" hint="One paragraph per line">
            <TextArea rows={5} value={(form.missionParagraphs || []).join("\n")} onChange={(e) => set({ missionParagraphs: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title='"Share Your Knowledge" section'>
        <div className="space-y-3">
          <Field label="Title"><TextInput value={form.shareTitle} onChange={(e) => set({ shareTitle: e.target.value })} /></Field>
          <Field label="Subtitle"><TextArea rows={2} value={form.shareSubtitle} onChange={(e) => set({ shareSubtitle: e.target.value })} /></Field>
          <Field label="Submission email"><TextInput value={form.shareEmail} onChange={(e) => set({ shareEmail: e.target.value })} /></Field>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Contribution options</p>
          <ListEditor
            items={form.shareOptions}
            onChange={(shareOptions) => set({ shareOptions })}
            newItem={() => ({ title: "", desc: "", tags: [] as string[] })}
            addLabel="Add option"
            render={(item, update, remove) => (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <Field label="Title"><TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label="Description"><TextArea rows={2} value={item.desc} onChange={(e) => update({ desc: e.target.value })} /></Field>
                <Field label="Tags" hint="Comma-separated">
                  <TextInput value={(item.tags || []).join(", ")} onChange={(e) => update({ tags: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
                </Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
              </div>
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Bottom CTA banner">
        <Field label="Title"><TextInput value={form.ctaTitle} onChange={(e) => set({ ctaTitle: e.target.value })} /></Field>
        <div className="mt-3">
          <Field label="Subtitle"><TextArea rows={2} value={form.ctaSubtitle} onChange={(e) => set({ ctaSubtitle: e.target.value })} /></Field>
        </div>
      </SectionCard>

      <SaveBar onSave={() => save.mutate(form)} isPending={save.isPending} />
    </div>
  );
}

export function ContactEditor() {
  const { data, isLoading } = useSection<any>("contact");
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(JSON.parse(JSON.stringify(data))); }, [data]);
  const save = useSaveSection("contact");
  if (isLoading || !form) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const set = (patch: any) => setForm({ ...form, ...patch });

  return (
    <div className="space-y-6 pb-24">
      <SectionCard title="Hero">
        <Field label="Title"><TextInput value={form.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} /></Field>
        <div className="mt-3">
          <Field label="Subtitle"><TextArea rows={3} value={form.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Contact information">
        <div className="space-y-3">
          <Field label="Info section title"><TextInput value={form.infoTitle} onChange={(e) => set({ infoTitle: e.target.value })} /></Field>
          <Field label="Info section subtitle"><TextArea rows={2} value={form.infoSubtitle} onChange={(e) => set({ infoSubtitle: e.target.value })} /></Field>
          <Field label="Email"><TextInput value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
          <Field label="Twitter handle"><TextInput value={form.twitter} onChange={(e) => set({ twitter: e.target.value })} /></Field>
          <Field label="Location"><TextInput value={form.location} onChange={(e) => set({ location: e.target.value })} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="FAQ">
        <ListEditor
          items={form.faq}
          onChange={(faq) => set({ faq })}
          newItem={() => ({ q: "", a: "" })}
          addLabel="Add question"
          render={(item, update, remove) => (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <Field label="Question"><TextInput value={item.q} onChange={(e) => update({ q: e.target.value })} /></Field>
              <Field label="Answer"><TextArea rows={2} value={item.a} onChange={(e) => update({ a: e.target.value })} /></Field>
              <Button type="button" variant="outline" onClick={remove} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
            </div>
          )}
        />
      </SectionCard>

      <SaveBar onSave={() => save.mutate(form)} isPending={save.isPending} />
    </div>
  );
}