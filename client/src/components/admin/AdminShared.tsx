import { useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition " +
        (props.className || "")
      }
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition resize-y " +
        (props.className || "")
      }
    />
  );
}

export function ImageUploadButton({ onUploaded, label = "Upload from PC" }: { onUploaded: (url: string) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const fd = new FormData();
            fd.append("file", file);
            const token = localStorage.getItem("ss_admin_token") || "";
            const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-token": token }, body: fd });
            if (!res.ok) throw new Error((await res.text()) || "Upload failed");
            const data = await res.json();
            onUploaded(data.url);
            toast({ title: "Image uploaded" });
          } catch (err: any) {
            toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
          } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl whitespace-nowrap"
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
        {label}
      </Button>
    </>
  );
}

export function ImageField({ value, onChange }: { value: string | null | undefined; onChange: (v: string | null) => void }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <TextInput
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="Paste an image URL or upload from your PC"
          className="flex-1"
        />
        <ImageUploadButton onUploaded={(url) => onChange(url)} />
      </div>
      {value && <img src={value} alt="" className="mt-2 h-24 w-auto rounded-lg border border-border object-cover" />}
    </>
  );
}

export function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-display font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ListEditor<T>({
  items, onChange, render, newItem, addLabel = "Add item",
}: {
  items: T[]; onChange: (next: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, remove: () => void, index: number) => React.ReactNode;
  newItem: () => T; addLabel?: string;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-xl p-4 bg-muted/20">
          {render(
            item,
            (patch) => onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x))),
            () => onChange(items.filter((_, idx) => idx !== i)),
            i
          )}
        </div>
      ))}
      <Button type="button" variant="outline" className="rounded-full" onClick={() => onChange([...items, newItem()])}>
        <Plus className="h-4 w-4 mr-2" /> {addLabel}
      </Button>
    </div>
  );
}
