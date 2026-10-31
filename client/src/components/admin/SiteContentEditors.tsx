import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Field, TextInput, TextArea, ImageField, SectionCard, ListEditor } from "./AdminShared";

function useSection<T = any>(key: string) {
  const q = useQuery<T>({ queryKey: ["/api/site-content", key] });
  return q;
}

function SaveBar({ onSave, isPending }: { onSave: () => void; isPending: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-4 px-4 py-4 bg-background/90 backdrop-blur border-t border-border flex justify-end z-10">
      <Button onClick={onSave} disabled={isPending} className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-8">
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
      toast({ title: "Saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });
}

export function HomeEditor() {
  const { data, isLoading } = useSection<any>("home");
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(JSON.parse(JSON.stringify(data))); }, [data]);
  const save = useSaveSection("home");
  if (isLoading || !form) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  const set = (patch: any) => setForm({ ...form, ...patch });
  const setHero = (patch: any) => setForm({ ...form, hero: { ...form.hero, ...patch } });

  return (
    <div className="space-y-6">
      <SectionCard title="Hero section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title — line 1"><TextInput value={form.hero.titleLine1} onChange={(e) => setHero({ titleLine1: e.target.value })} /></Field>
          <Field label="Title — line 2"><TextInput value={form.hero.titleLine2} onChange={(e) => setHero({ titleLine2: e.target.value })} /></Field>
          <Field label="Highlighted word (italic, orange)"><TextInput value={form.hero.titleHighlight} onChange={(e) => setHero({ titleHighlight: e.target.value })} /></Field>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <Field label="Value (e.g. 27+)"><TextInput value={item.value} onChange={(e) => update({ value: e.target.value })} /></Field>
              <div className="flex gap-2 items-end">
                <Field label="Label" ><TextInput value={item.label} onChange={(e) => update({ label: e.target.value })} /></Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Eyebrow tag"><TextInput value={item.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} /></Field>
                <Field label="Link (href)"><TextInput value={item.href} onChange={(e) => update({ href: e.target.value })} /></Field>
                <Field label="Title"><TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label="Description"><TextInput value={item.desc} onChange={(e) => update({ desc: e.target.value })} /></Field>
              </div>
              <Button type="button" variant="outline" onClick={remove} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove banner</Button>
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Name"><TextInput value={item.name} onChange={(e) => update({ name: e.target.value })} /></Field>
                  <Field label="Role / Title"><TextInput value={item.role} onChange={(e) => update({ role: e.target.value })} /></Field>
                </div>
                <Field label="Quote"><TextArea rows={2} value={item.content} onChange={(e) => update({ content: e.target.value })} /></Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
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
              <div className="space-y-3">
                <Field label="Card title"><TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label="Description"><TextArea rows={2} value={item.desc} onChange={(e) => update({ desc: e.target.value })} /></Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
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
  if (isLoading || !form) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  const set = (patch: any) => setForm({ ...form, ...patch });

  return (
    <div className="space-y-6">
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
              <div className="space-y-3">
                <Field label="Title"><TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label="Description"><TextArea rows={2} value={item.desc} onChange={(e) => update({ desc: e.target.value })} /></Field>
                <Field label="Tags" hint="Comma-separated">
                  <TextInput value={(item.tags || []).join(", ")} onChange={(e) => update({ tags: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
                </Field>
                <Button type="button" variant="outline" onClick={remove} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
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
  if (isLoading || !form) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  const set = (patch: any) => setForm({ ...form, ...patch });

  return (
    <div className="space-y-6">
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
            <div className="space-y-3">
              <Field label="Question"><TextInput value={item.q} onChange={(e) => update({ q: e.target.value })} /></Field>
              <Field label="Answer"><TextArea rows={2} value={item.a} onChange={(e) => update({ a: e.target.value })} /></Field>
              <Button type="button" variant="outline" onClick={remove} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
            </div>
          )}
        />
      </SectionCard>

      <SaveBar onSave={() => save.mutate(form)} isPending={save.isPending} />
    </div>
  );
}
