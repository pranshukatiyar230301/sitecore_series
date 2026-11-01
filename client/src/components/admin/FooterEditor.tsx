import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Save, LayoutTemplate, Plus, Trash2 } from "lucide-react";
import { Field } from "@/components/admin/AdminShared";

type FooterLink = { label: string; href: string };

const DEFAULT_EXPLORE: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const DEFAULT_TOPICS: FooterLink[] = [
  { label: "Content Hub", href: "/blogs/sitecore-content-hub" },
  { label: "Sitecore SXA", href: "/blogs/sitecore-sxa" },
  { label: "JSS / Headless Architecture", href: "/blogs/sitecore-jss" },
  { label: "XM / XP Cloud", href: "/blogs/sitecore-xm-xp" },
];

export function FooterEditor() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<any>({ queryKey: ["/api/site-content/footer"] });

  const [form, setForm] = useState({
    description: "",
    badgeText: "",
    email: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    youtube: "",
    exploreLinks: DEFAULT_EXPLORE,
    topicLinks: DEFAULT_TOPICS,
  });

  useEffect(() => {
    if (data) {
      setForm({
        description: data.description ?? "Sharing knowledge, architecture guides, and tutorials for the Sitecore ecosystem. Mastering modern digital experience platforms one post at a time.",
        badgeText: data.badgeText ?? "Community-Led Platform",
        email: data.email ?? "pranshukatiyar230301@gmail.com",
        twitter: data.twitter ?? "https://twitter.com/sitecoreseries",
        linkedin: data.linkedin ?? "https://linkedin.com/in/er-pranshu-katiyar-a77aa8197",
        facebook: data.facebook ?? "https://facebook.com",
        instagram: data.instagram ?? "https://instagram.com",
        youtube: data.youtube ?? "https://youtube.com",
        exploreLinks: data.exploreLinks && data.exploreLinks.length > 0 ? data.exploreLinks : DEFAULT_EXPLORE,
        topicLinks: data.topicLinks && data.topicLinks.length > 0 ? data.topicLinks : DEFAULT_TOPICS,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (updated: typeof form) => {
      await apiRequest("PUT", "/api/site-content/footer", updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content/footer"] });
      toast({ title: "Footer content updated successfully!" });
    },
    onError: (e: any) => {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    },
  });

  // Dynamic Link Helpers
  function handleLinkChange(listName: "exploreLinks" | "topicLinks", index: number, field: "label" | "href", val: string) {
    const updated = [...form[listName]];
    updated[index][field] = val;
    setForm({ ...form, [listName]: updated });
  }

  function addLink(listName: "exploreLinks" | "topicLinks") {
    setForm({
      ...form,
      [listName]: [...form[listName], { label: "", href: "" }],
    });
  }

  function removeLink(listName: "exploreLinks" | "topicLinks", index: number) {
    const updated = form[listName].filter((_, i) => i !== index);
    setForm({ ...form, [listName]: updated });
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <LayoutTemplate className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Footer Customizer</h2>
          <p className="text-xs text-muted-foreground">Manage brand description, navigation links, email, and social media URLs.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-6">
        {/* General Info */}
        <Field label="Brand / Bio Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-base resize-y"
            placeholder="Sharing knowledge, architecture guides..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Badge Text">
            <input
              type="text"
              value={form.badgeText}
              onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
              className="input-base"
              placeholder="Community-Led Platform"
            />
          </Field>

          <Field label="Contact Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-base"
              placeholder="your-email@gmail.com"
            />
          </Field>
        </div>

        {/* Dynamic Explore Links Section */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Explore Links</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => addLink("exploreLinks")} className="rounded-full text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Explore Link
            </Button>
          </div>
          <div className="space-y-2">
            {form.exploreLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Link Label (e.g. About Us)"
                  value={link.label}
                  onChange={(e) => handleLinkChange("exploreLinks", idx, "label", e.target.value)}
                  className="input-base flex-1"
                />
                <input
                  type="text"
                  placeholder="URL Path (e.g. /about)"
                  value={link.href}
                  onChange={(e) => handleLinkChange("exploreLinks", idx, "href", e.target.value)}
                  className="input-base flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => removeLink("exploreLinks", idx)} className="text-destructive hover:bg-destructive/10 rounded-xl">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Topics Links Section */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Topics Links</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => addLink("topicLinks")} className="rounded-full text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Topic Link
            </Button>
          </div>
          <div className="space-y-2">
            {form.topicLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Topic Label (e.g. Content Hub)"
                  value={link.label}
                  onChange={(e) => handleLinkChange("topicLinks", idx, "label", e.target.value)}
                  className="input-base flex-1"
                />
                <input
                  type="text"
                  placeholder="URL Path (e.g. /blogs/sitecore-content-hub)"
                  value={link.href}
                  onChange={(e) => handleLinkChange("topicLinks", idx, "href", e.target.value)}
                  className="input-base flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => removeLink("topicLinks", idx)} className="text-destructive hover:bg-destructive/10 rounded-xl">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border">Social Media Links</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Twitter / X URL">
            <input
              type="url"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              className="input-base"
              placeholder="https://twitter.com/..."
            />
          </Field>

          <Field label="LinkedIn URL">
            <input
              type="url"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="input-base"
              placeholder="https://linkedin.com/in/..."
            />
          </Field>

          <Field label="Facebook URL">
            <input
              type="url"
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              className="input-base"
              placeholder="https://facebook.com/..."
            />
          </Field>

          <Field label="Instagram URL">
            <input
              type="url"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="input-base"
              placeholder="https://instagram.com/..."
            />
          </Field>

          <Field label="YouTube URL">
            <input
              type="url"
              value={form.youtube}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              className="input-base"
              placeholder="https://youtube.com/..."
            />
          </Field>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="submit" disabled={mutation.isPending} className="rounded-full px-6 font-bold cursor-pointer">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Footer Settings
          </Button>
        </div>
      </form>
    </div>
  );
}