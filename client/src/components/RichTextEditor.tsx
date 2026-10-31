import { useRef, useState, useEffect } from "react";
import { 
  Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, Undo, Redo, Upload, Loader2, Type, Pilcrow 
} from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const isUpdatingFromInside = useRef(false);

  // Sync value from parent only when not typing inside
  useEffect(() => {
    if (!ref.current) return;
    if (isUpdatingFromInside.current) {
      isUpdatingFromInside.current = false;
      return;
    }
    if (ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function handleInput() {
    if (!ref.current) return;
    isUpdatingFromInside.current = true;
    onChange(ref.current.innerHTML);
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  }

  function applyBlock(tag: string) {
    ref.current?.focus();
    document.execCommand("formatBlock", false, `<${tag}>`);
    handleInput();
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
      handleInput();
    } catch (e: any) {
      alert("Upload failed: " + (e?.message || "unknown"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const Btn = ({ onClick, title, children, testId: tid, className = "" }: { onClick: () => void; title: string; children: React.ReactNode; testId?: string; className?: string }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 font-medium ${className}`}
      data-testid={tid}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-col">
      {/* Toolbar with Manual Heading Buttons */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
        
        {/* Heading & Paragraph Control Buttons */}
        <div className="flex items-center gap-0.5 mr-1 pr-2 border-r border-slate-300 dark:border-slate-700">
          <Btn onClick={() => applyBlock("p")} title="Normal Paragraph">P</Btn>
          <Btn onClick={() => applyBlock("h1")} title="Heading 1">H1</Btn>
          <Btn onClick={() => applyBlock("h2")} title="Heading 2">H2</Btn>
          <Btn onClick={() => applyBlock("h3")} title="Heading 3">H3</Btn>
          <Btn onClick={() => applyBlock("h4")} title="Heading 4">H4</Btn>
        </div>

        <Btn onClick={() => exec("bold")} title="Bold" testId="rt-bold"><Bold className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("italic")} title="Italic" testId="rt-italic"><Italic className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("underline")} title="Underline" testId="rt-underline"><Underline className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        <Btn onClick={() => exec("insertUnorderedList")} title="Bulleted list" testId="rt-ul"><List className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="Numbered list" testId="rt-ol"><ListOrdered className="h-4 w-4" /></Btn>
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        <Btn onClick={() => { const u = prompt("Enter URL (https://...)"); if (u) exec("createLink", u); }} title="Insert link" testId="rt-link"><LinkIcon className="h-4 w-4" /></Btn>
        <Btn onClick={() => { const u = prompt("Enter image URL (https://...)"); if (u) exec("insertImage", u); }} title="Insert image by URL" testId="rt-image"><ImageIcon className="h-4 w-4" /></Btn>
        <Btn onClick={() => fileRef.current?.click()} title="Upload image from PC" testId="rt-upload">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4" />}
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
        <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        <Btn onClick={() => exec("undo")} title="Undo" testId="rt-undo"><Undo className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec("redo")} title="Redo" testId="rt-redo"><Redo className="h-4 w-4" /></Btn>

      </div>

      {/* Editable Content Box */}
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
          document.execCommand("insertHTML", false, text);
          handleInput();
        }}
        data-placeholder={placeholder}
        data-testid={testId}
        suppressContentEditableWarning
        className="rich-editor p-4 outline-none prose prose-slate max-w-none text-slate-800 dark:text-slate-100 dark:prose-invert flex-1 cursor-text"
        style={{ minHeight }}
      />
      <style>{`
        .rich-editor:empty:before { content: attr(data-placeholder); color: rgb(148 163 184 / 0.6); pointer-events: none; }
        .rich-editor h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
        .rich-editor h2 { font-size: 1.35rem; font-weight: 700; margin: 0.5rem 0; }
        .rich-editor h3 { font-size: 1.15rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor h4 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor p { margin: 0.35rem 0; line-height: 1.6; }
        .rich-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor blockquote { border-left: 3px solid var(--primary); padding-left: 1rem; margin: 0.5rem 0; font-style: italic; color: #64748b; }
        .rich-editor img { max-width: 100% !important; height: auto !important; border-radius: 0.75rem; margin: 0.5rem auto; display: block; }
      `}</style>
    </div>
  );
}