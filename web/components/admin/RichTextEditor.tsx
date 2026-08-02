"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { fileUrl } from "@/lib/file-url";

interface Props {
  name: string;
  defaultValue?: string;
}

export default function RichTextEditor({ name, defaultValue = "" }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage.configure({ HTMLAttributes: { class: "rounded-md" } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
  });

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("subfolder", "artikel");

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Unggah gambar gagal.");
      return;
    }
    const url = fileUrl(data.key);
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  function handleLink() {
    if (!editor) return;
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Alamat tautan (URL):", current ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="rounded-lg border border-granit/30 overflow-hidden bg-white">
      <input type="hidden" name={name} value={html} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-granit/20 bg-kapur/60">
        <Btn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")}>
          <span className="underline">U</span>
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")}>
          <s>S</s>
        </Btn>

        <div className="w-px h-4 bg-granit/40 mx-1" />

        <Btn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
          H2
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>
          H3
        </Btn>

        <div className="w-px h-4 bg-granit/40 mx-1" />

        <Btn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
          ≡ List
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
          1. List
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")}>
          &ldquo;
        </Btn>

        <div className="w-px h-4 bg-granit/40 mx-1" />

        <Btn onClick={handleLink} active={editor?.isActive("link")} title="Sisipkan tautan">
          🔗
        </Btn>
        <Btn onClick={() => fileInputRef.current?.click()} title="Sisipkan gambar">
          {uploading ? "…" : "🖼"}
        </Btn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImagePick}
          className="hidden"
          disabled={uploading}
        />

        <div className="w-px h-4 bg-granit/40 mx-1" />

        <Btn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
          ↩
        </Btn>
        <Btn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
          ↪
        </Btn>
      </div>

      {error && <p className="px-3 pt-2 text-xs text-beras-merah">{error}</p>}

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active ? "bg-arang text-kapur" : "text-arang hover:bg-granit/25"
      }`}
    >
      {children}
    </button>
  );
}
