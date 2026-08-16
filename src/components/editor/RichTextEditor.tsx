"use client";

import { cn } from "@/lib/utils";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toolbar } from "./Toolbar";

interface RichTextEditorProps {
  /** Nội dung khởi tạo: JSON string hoặc chuỗi rỗng */
  initialContent?: string;
  /** Callback khi content thay đổi (nhận JSON string) */
  onChange?: (jsonString: string) => void;
  /** ClassName tùy chỉnh */
  className?: string;
  /** Có đang ở chế độ read-only không */
  editable?: boolean;
}

/**
 * RichTextEditor — Component lõi sử dụng TipTap.
 *
 * 🧠 Cách hoạt động:
 * 1. useEditor() tạo instance TipTap với các extensions.
 * 2. EditorContent render ra div contentEditable thực tế.
 * 3. Khi user gõ phím, onUpdate chạy → gọi onChange prop về parent.
 * 4. initialContent được parse từ JSON string → object rồi set vào editor.
 *
 * ⚠️ Lưu ý QUAN TRỌNG:
 * - Không dùng useState cho content bên trong component này.
 * - TipTap quản lý state nội bộ qua ProseMirror. Mình chỉ "lấy ra" qua onUpdate.
 * - initialContent chỉ set 1 lần khi mount. Để cập nhật từ bên ngoài (chuyển note),
 *   bạn cần dùng key={noteId} ở component cha để force re-mount.
 */
export function RichTextEditor({
  initialContent = "",
  onChange,
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Tắt heading mặc định của StarterKit để tự config
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: "Bắt đầu viết ghi chú...",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none",
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
    ],

    // Parse initialContent từ JSON string
    content: initialContent ? tryParseJson(initialContent) : "",

    editable,

    // Mỗi lần nội dung thay đổi → emit JSON string lên parent
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON();
        onChange(JSON.stringify(json));
      }
    },

    // Tắt autofocus để không bị nhảy cursor khi chuyển note
    autofocus: false,
  });

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      {editable && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}

/**
 * Helper an toàn để parse JSON từ DB.
 * Nếu lỗi (vd: content cũ là HTML hoặc chuỗi thường), trả về chuỗi đó.
 */
function tryParseJson(str: string): object | string {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
