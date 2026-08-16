# 📖 `/components/editor` — Tài liệu kỹ thuật

> **Mục đích:** Giải thích kiến trúc, lý thuyết và cách triển khai hệ thống soạn thảo văn bản phong phú (Rich Text Editor) trong TaskFlow.
> **Stack:** TipTap v2 (dựa trên ProseMirror) + React + Tailwind CSS

---

## Mục lục

1. [TipTap là gì?](#1-tiptap-là-gì)
2. [ProseMirror — "Động cơ" bên trong](#2-prosemirror--động-cơ-bên-trong)
3. [RichTextEditor Component](#3-richtexteditor-component)
4. [Toolbar Component](#4-toolbar-component)
5. [Các khái niệm & lý thuyết đã áp dụng](#5-các-khái-niệm--lý-thuyết-đã-áp-dụng)
   - 5.1. Document Model (JSON Tree)
   - 5.2. Uncontrolled Component Pattern
   - 5.3. Debounce Auto-save
   - 5.4. Force Re-mount qua `key` prop
   - 5.5. Content Serialization
6. [Lưu ý quan trọng khi phát triển](#6-lưu-ý-quan-trọng-khi-phát-triển)
7. [Tài liệu tham khảo](#7-tài-liệu-tham-khảo)

---

## 1. TipTap là gì?

**TipTap** là một **Headless Rich Text Editor Framework** cho JavaScript/TypeScript.

- **Headless** nghĩa là: TipTap chỉ cung cấp "logic" (xử lý nội dung, commands, state), còn **giao diện (UI) do bạn tự viết**. Không bị ép dùng UI có sẵn như CKEditor hay TinyMCE.
- **Dựa trên ProseMirror**: TipTap không tự viết engine editor từ đầu. Nó xây dựng trên nền [ProseMirror](https://prosemirror.net/) — một thư viện editor mạnh mẽ của Marijn Haverbeke (tác giả CodeMirror).
- **Extension-based**: Mọi tính năng (Bold, Italic, Heading, List...) đều là **Extension**. Bạn chỉ import những gì cần, giúp bundle size nhỏ gọn.

### Tại sao chọn TipTap thay vì Draft.js, Slate, hoặc textarea thuần?

| Tiêu chí              | TipTap                | Draft.js                   | Slate            | Textarea    |
| --------------------- | --------------------- | -------------------------- | ---------------- | ----------- |
| Dễ tích hợp React     | ✅ Có `@tiptap/react` | ✅ Facebook viết cho React | ✅               | ✅          |
| TypeScript support    | ✅ Xuất sắc           | ⚠️ Cần @types              | ✅               | ✅          |
| Extension ecosystem   | ✅ Rất phong phú      | ⚠️ Hạn chế                 | ⚠️ Tự viết nhiều | ❌ Không có |
| Collaborative editing | ✅ Hỗ trợ Yjs         | ⚠️ Phức tạp                | ⚠️ Phức tạp      | ❌          |
| Bundle size           | ✅ Nhỏ (tree-shake)   | ⚠️ Lớn                     | ⚠️ Trung bình    | ✅ Nhỏ nhất |
| Maintenance           | ✅ Active             | ❌ Facebook đã archive     | ✅               | ✅          |

> **Quyết định:** TipTap là lựa chọn tốt nhất cho project portfolio vì dễ cấu hình, dễ customize UI, và có tài liệu rõ ràng.

---

## 2. ProseMirror — "Động cơ" bên trong

ProseMirror là nền tảng xử lý văn bản mà TipTap dựng lên. Hiểu ProseMirror giúp bạn debug và tùy biến editor dễ hơn.

### 2.1. Document Model — Cây JSON (Node Tree)

ProseMirror biểu diễn nội dung dưới dạng **JSON Tree** thay vì HTML string. Ví dụ:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Tiêu đề bài viết" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Đây là đoạn văn bản " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "in đậm" },
        { "type": "text", "text": " và đây là kết thúc." }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Mục 1" }]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Mục 2" }]
            }
          ]
        }
      ]
    }
  ]
}
```

**Tại sao dùng JSON thay vì HTML?**

1. **Structured & Type-safe**: Mỗi node có `type` xác định. Dễ validate schema.
2. **Platform-agnostic**: Cùng 1 JSON có thể render ra HTML, Markdown, PDF, hoặc Mobile Native.
3. **Collaborative-ready**: Operational Transformation (OT) hoặc CRDTs hoạt động tốt trên tree.
4. **No XSS**: Không lưu raw HTML → tránh script injection. Khi render, ProseMirror tự tạo DOM an toàn.

### 2.2. Editor State (Immutable)

ProseMirror state là **immutable**. Mỗi lần user gõ 1 phím, ProseMirror tạo ra **state mới** thay vì sửa state cũ. Điều này giúp:

- Dễ dàng **undo/redo** (lưu lịch sử state).
- **Collaborative editing** (soạn thảo cùng lúc) hoạt động chính xác.
- React re-render đúng cách (state thay đổi → UI cập nhật).

---

## 3. RichTextEditor Component

### Vị trí: `components/editor/RichTextEditor.tsx`

### Chức năng

- Khởi tạo TipTap editor instance qua `useEditor()` hook.
- Render `EditorContent` — div `contenteditable` thực tế.
- Nhận `initialContent` từ DB (JSON string) và parse thành ProseMirror document.
- Emit nội dung mới lên parent qua `onChange` callback.

### Cách áp dụng lý thuyết trong code

#### A. Khởi tạo Editor với Extensions

```tsx
const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2] } }),
    Placeholder.configure({ placeholder: "Bắt đầu viết..." }),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
  ],
  content: initialContent ? tryParseJson(initialContent) : "",
  onUpdate: ({ editor }) => {
    if (onChange) {
      onChange(JSON.stringify(editor.getJSON()));
    }
  },
});
```

**Giải thích:**

- `StarterKit`: Gói extension cơ bản (Bold, Italic, Heading, List, Blockquote, Code, History...).
- `Placeholder`: Hiển thị text gợi ý khi editor trống. Dùng CSS pseudo-element (`::before`) để render.
- `TextAlign`: Mở rộng thêm căn lề trái/phải/giữa. Cần `configure({ types: [...] })` để chỉ định node nào được phép align.
- `Highlight`: Bôi nền màu (giống highlighter bút dạ quang).

#### B. Content Serialization

```tsx
function tryParseJson(str: string): object | string {
  try {
    return JSON.parse(str);
  } catch {
    return str; // Fallback: nếu là HTML hoặc plain text
  }
}
```

**Lý thuyết áp dụng:**

- DB lưu `content` dạng `TEXT` (string).
- Khi load: `JSON.parse()` chuyển string → object tree → ProseMirror hiểu được.
- Khi save: `JSON.stringify(editor.getJSON())` chuyển tree → string → lưu DB.
- **Fallback**: Nếu DB có dữ liệu cũ (HTML hoặc plain text), ProseMirror vẫn parse được nhờ built-in parser.

#### C. EditorContent — Rendering

```tsx
<EditorContent
  editor={editor}
  className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px]"
/>
```

- `prose prose-sm`: Dùng [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) plugin để style nội dung editor (headings, lists, blockquotes... có margin/padding đẹp).
- `dark:prose-invert`: Tự động đảo màu text trong dark mode.
- `max-w-none`: Bỏ giới hạn max-width mặc định của prose (thường là 65ch).

---

## 4. Toolbar Component

### Vị trí: `components/editor/Toolbar.tsx`

### Chức năng

- Hiển thị các nút định dạng (Bold, Italic, Heading, List...).
- Highlight nút đang active (dựa trên `editor.isActive("bold")`).
- Gọi `editor.chain().focus().toggleBold().run()` để thực thi command.

### Lý thuyết: Command Chain

TipTap sử dụng pattern **Fluent API / Method Chaining**:

```tsx
editor.chain().focus().toggleBold().run();
//     ^         ^          ^           ^
//     |         |          |           └─ Thực thi command
//     |         |          └─ Toggle trạng thái bold
//     |         └─ Đưa focus vào editor (quan trọng!)
//     └─ Bắt đầu chain
```

**Tại sao cần `.focus()`?**

- Khi user click nút Bold trên Toolbar, focus đang ở trên button, không phải editor.
- Nếu không `.focus()`, command sẽ không biết áp dụng vào đâu.
- `.focus()` đưa cursor trở lại editor trước khi chạy command.

### Active State

```tsx
isActive={editor.isActive("heading", { level: 1 })}
```

- `editor.isActive("bold")`: Kiểm tra vùng text đang được chọn (hoặc vị trí cursor) có đang bật bold không.
- `editor.isActive("heading", { level: 1 })`: Kiểm tra có đang ở Heading 1 không.
- Dùng để highlight nút toolbar tương ứng.

---

## 5. Các khái niệm & lý thuyết đã áp dụng

### 5.1. Document Model (JSON Tree)

**Lý thuyết:** ProseMirror biểu diễn document dưới dạng cây JSON có cấu trúc chặt chẽ.

**Áp dụng trong code:**

- `editor.getJSON()` trả về object tree.
- `JSON.stringify()` chuyển thành string để lưu DB.
- `JSON.parse()` chuyển ngược lại khi load.

```
User gõ → ProseMirror tạo state mới → editor.getJSON() → JSON.stringify()
     ↑                                                        ↓
     └──────── JSON.parse() ←── DB lưu TEXT ←──────────────┘
```

### 5.2. Uncontrolled Component Pattern

**Lý thuyết:** Trong React, "controlled component" là component mà state nằm ở parent và truyền xuống qua props. "Uncontrolled" là component tự quản lý state nội bộ.

**Áp dụng trong code:**

- TipTap editor là **uncontrolled** — nó tự quản lý nội dung bên trong ProseMirror instance.
- Bạn không dùng `useState` cho content bên trong `RichTextEditor`.
- Thay vào đó, bạn "lắng nghe" thay đổi qua `onUpdate` và "gợi ý" nội dung ban đầu qua `initialContent`.

```tsx
// ❌ SAI — Đừng làm thế này:
const [content, setContent] = useState("");
<EditorContent value={content} onChange={setContent} />; // TipTap không hoạt động như textarea

// ✅ ĐÚNG — TipTap quản lý state nội bộ:
const editor = useEditor({
  content: initialContent,
  onUpdate: ({ editor }) => {
    onChange(JSON.stringify(editor.getJSON()));
  },
});
```

**Tại sao không controlled?**

- ProseMirror cần quản lý cursor position, selection, marks... rất phức tạp.
- Nếu ép thành controlled (dùng useState cho content), mỗi lần gõ 1 phím sẽ re-render toàn bộ component → **mất focus, mất cursor position**.

### 5.3. Debounce Auto-save

**Lý thuyết:** Debounce là kỹ thuật "trì hoãn" thực thi function cho đến khi user ngừng tương tác trong 1 khoảng thời gian nhất định.

**Áp dụng trong code (ở `notes/page.tsx`):**

```tsx
const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const triggerAutoSave = useCallback(
  (newTitle: string, newContent: string) => {
    setIsDirty(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current); // Hủy timeout cũ
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateNote.mutate({
        id: selectedNoteId,
        title: newTitle,
        content: newContent,
      });
      setIsDirty(false);
    }, 1500); // Đợi 1.5 giây sau lần gõ cuối
  },
  [selectedNoteId, updateNote],
);
```

**Visualize:**

```
User gõ:    a---b---c---d---e-------[dừng 1.5s]-------→ GỌI API
                       ↑
              Mỗi phím clear timeout cũ + set timeout mới
```

**Tại sao dùng `useRef` thay vì `useState` cho timeoutId?**

- `useState` gây re-render khi thay đổi. Timeout ID không cần hiển thị trên UI → dùng `useRef` để tránh re-render không cần thiết.

### 5.4. Force Re-mount qua `key` prop

**Lý thuyết:** Trong React, khi `key` của component thay đổi, React sẽ **unmount component cũ** và **mount component mới** thay vì update.

**Áp dụng trong code:**

```tsx
<RichTextEditor
  key={selectedNoteId} // ⬅️ KEY QUAN TRỌNG
  initialContent={content}
  onChange={handleContentChange}
/>
```

**Vấn đề nếu không có `key`:**

- User chọn Note A → editor load content A.
- User chọn Note B → `initialContent` prop đổi thành content B.
- Nhưng TipTap editor instance vẫn giữ state cũ (content A) vì `useEditor` chỉ chạy 1 lần khi mount.
- Kết quả: Editor vẫn hiển thị Note A dù đã chọn Note B.

**Giải pháp:** Đổi `key={selectedNoteId}` → React tạo editor instance mới → load đúng content.

```
Note A (id=1)  →  key="1"  →  Editor instance #1  →  Content A
Note B (id=2)  →  key="2"  →  Editor instance #2  →  Content B  (instance #1 bị hủy)
Note A (id=1)  →  key="1"  →  Editor instance #3  →  Content A  (instance mới)
```

> ⚠️ **Trade-off:** Mỗi lần đổi note sẽ tạo instance mới → có thể chậm nếu note rất dài. Trong thực tế production, người ta dùng `editor.commands.setContent()` thay vì re-mount. Nhưng với portfolio và data size trung bình, `key` prop là cách đơn giản và đáng tin cậy nhất.

### 5.5. Content Serialization (JSON vs HTML)

**Lý thuyết:** Serialization là quá trình chuyển đổi dữ liệu từ dạng này sang dạng khác để lưu trữ hoặc truyền tải.

**Các format TipTap hỗ trợ:**

| Format       | Method             | Khi nào dùng                |
| ------------ | ------------------ | --------------------------- |
| **JSON**     | `editor.getJSON()` | ✅ Lưu DB (khuyến nghị)     |
| **HTML**     | `editor.getHTML()` | Render ra email, export PDF |
| **Text**     | `editor.getText()` | Full-text search, preview   |
| **Markdown** | Extension riêng    | Export sang GitHub, blog    |

**Áp dụng trong code:**

- Lưu DB: `JSON.stringify(editor.getJSON())` → cột `content` kiểu `TEXT`.
- Load từ DB: `JSON.parse(content)` → truyền vào `useEditor({ content: ... })`.
- Preview trong list: Không parse JSON để hiển thị. Thay vào đó hiển thị "Đã có nội dung" hoặc dùng `editor.getText()` nếu cần preview thực.

---

## 6. Lưu ý quan trọng khi phát triển

### 6.1. XSS Prevention

- **Không bao giờ** dùng `dangerouslySetInnerHTML` với content từ TipTap nếu bạn không sanitize.
- May mắn là TipTap tự xử lý: khi dùng `EditorContent`, ProseMirror tạo DOM node an toàn từ JSON tree.
- Nếu bạn cần render read-only preview bên ngoài editor, hãy dùng `@tiptap/html` hoặc sanitize bằng DOMPurify.

### 6.2. Performance

- Tránh re-render `Toolbar` không cần thiết. Hiện tại Toolbar nhận `editor` prop và gọi `editor.isActive()` mỗi lần render — điều này ổn vì TipTap đã optimize.
- Nếu note rất dài (>10,000 nodes), cân nhắc dùng `useEditor` với `editable: false` cho preview.

### 6.3. Collaborative Editing (Tương lai)

- Nếu muốn thêm tính năng "nhiều user cùng sửa 1 note", bạn cần:
  1. Tích hợp [Yjs](https://docs.yjs.dev/) (CRDT library).
  2. Dùng `@tiptap/extension-collaboration` và `@tiptap/extension-collaboration-cursor`.
  3. Backend cần WebSocket (Socket.io hoặc y-websocket) để đồng bộ.
- Đây là feature nâng cao (Tier 2 trong roadmap), không cần làm ngay.

### 6.4. Mobile

- Toolbar hiện tại dùng `flex-wrap` để xuống dòng trên màn hình nhỏ.
- `contenteditable` trên mobile có thể bị lỗi keyboard. Nếu gặp vấn đề, thêm:
  ```tsx
  <EditorContent editor={editor} className="min-h-[300px] touch-manipulation" />
  ```

---

## 7. Tài liệu tham khảo

- [TipTap Documentation](https://tiptap.dev/docs)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [ProseMirror Reference Manual](https://prosemirror.net/docs/ref/)
- [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)
- [Yjs — CRDT for collaborative editing](https://docs.yjs.dev/)
- [React `key` prop — React Docs](https://react.dev/learn/rendering-lists#why-does-react-need-keys)

---

> **Viết bởi:** TaskFlow Team
> **Cập nhật:** Phase 4 — Notes Management
> **Stack:** TipTap v2 + ProseMirror + React 18 + TypeScript
