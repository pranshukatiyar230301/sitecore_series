import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Save, LayoutTemplate } from "lucide-react";
import { Field } from "@/components/admin/AdminShared";

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
  });

  useEffect(() => {
    if (data) {
      setForm({
        description: data.description || "",
        badgeText: data.badgeText || "",
        email: data.email || "",
        twitter: data.twitter || "",
        linkedin: data.linkedin || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        youtube: data.youtube || "",
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
          <p className="text-xs text-muted-foreground">Manage brand description, email, and social media links displayed in the footer.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-6">
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