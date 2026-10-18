import { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Quote, Code, Undo, Redo, Pilcrow, Upload, Loader2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  testId?: string;
};

export function RichTextEditor({ value, onChange, placeholder, minHeight = 180, testId }: Props) {
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

  function addLink() {
    const url = prompt("Enter URL (https://...)");
    if (!url) return;
    exec("createLink", url);
  }

  function addImage() {
    const url = prompt("Enter image URL (https://...)");
    if (!url) return;
    exec("insertImage", url);
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

  const Btn = ({ onClick, title, children, testId: tid }: { onClick: () => void; title: string; children: React.ReactNode; testId?: string }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
      data-testid={tid}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0a0f1d] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-800 bg-[#070b14] px-2 py-1.5">
        <Btn onClick={() => applyBlock("h1")} title="Heading 1" testId="rt-h1"><Heading1 className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("h2")} title="Heading 2" testId="rt-h2"><Heading2 className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("h3")} title="Heading 3" testId="rt-h3"><Heading3 className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("p")} title="Paragraph" testId="rt-p"><Pilcrow className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => exec("bold")} title="Bold" testId="rt-bold"><Bold className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("italic")} title="Italic" testId="rt-italic"><Italic className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("underline")} title="Underline" testId="rt-underline"><Underline className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => exec("insertUnorderedList")} title="Bulleted list" testId="rt-ul"><List className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="Numbered list" testId="rt-ol"><ListOrdered className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("blockquote")} title="Quote" testId="rt-quote"><Quote className="h-4 w-4" /></Btn>
        <Btn onClick={() => applyBlock("pre")} title="Code block" testId="rt-code"><Code className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={addLink} title="Insert link" testId="rt-link"><LinkIcon className="h-4 w-4" /></Btn>
        <Btn onClick={addImage} title="Insert image by URL" testId="rt-image"><ImageIcon className="h-4 w-4" /></Btn>
        <Btn onClick={() => fileRef.current?.click()} title="Upload image from PC" testId="rt-upload">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <Upload className="h-4 w-4" />}
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
          }}
        />
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <Btn onClick={() => exec("undo")} title="Undo" testId="rt-undo"><Undo className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("redo")} title="Redo" testId="rt-redo"><Redo className="h-4 w-4" /></Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
          document.execCommand("insertHTML", false, text);
          emit();
        }}
        data-placeholder={placeholder}
        data-testid={testId}
        suppressContentEditableWarning
        className="rich-editor px-4 py-3 outline-none prose prose-sm max-w-none text-slate-200 dark:prose-invert"
        style={{ minHeight }}
      />
      <style>{`
        .rich-editor:empty:before { content: attr(data-placeholder); color: rgb(148 163 184 / 0.5); pointer-events: none; }
        .rich-editor h1 { font-size: 1.875rem; font-weight: 700; margin: 0.5rem 0; color: #fff; }
        .rich-editor h2 { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; color: #fff; }
        .rich-editor h3 { font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; color: #fff; }
        .rich-editor p { margin: 0.25rem 0; color: #cbd5e1; }
        .rich-editor a { color: #818cf8; text-decoration: underline; }
        .rich-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; color: #cbd5e1; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; color: #cbd5e1; }
        .rich-editor blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; color: #94a3b8; margin: 0.5rem 0; font-style: italic; }
        .rich-editor pre { background: #070b14; border: 1px solid #1e293b; padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.875rem; overflow-x: auto; color: #a5b4fc; }
        .rich-editor img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5rem 0; border: 1px solid #1e293b; }
      `}</style>
    </div>
  );
}