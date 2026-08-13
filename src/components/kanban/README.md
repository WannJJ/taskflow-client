# Kanban Board

## Kanban là gì?

Kanban (看板) là phương pháp quản lý công việc trực quan bằng bảng (board)
gồm nhiều cột (column), mỗi cột đại diện cho một trạng thái công việc.
Task di chuyển từ trái sang phải khi hoàn thành.

Trong TaskFlow, chúng ta dùng Kanban để:

- Trực quan hóa tiến độ công việc (Backlog → Todo → In Progress → Done)
- Kéo thả (drag & drop) để thay đổi trạng thái nhanh chóng
- Sắp xếp thứ tự ưu tiên trong từng cột

## Tại sao chọn Kanban thay vì List view?

| Tiêu chí               | Kanban              | List                 |
| ---------------------- | ------------------- | -------------------- |
| Trực quan trạng thái   | ✅ Rất tốt          | ❌ Cần đọc từng dòng |
| Kéo thả đổi trạng thái | ✅ Hỗ trợ           | ❌ Không             |
| Quản lý nhiều task     | ✅ Dễ overview      | ⚠️ Cần scroll nhiều  |
| Mobile                 | ⚠️ Cần scroll ngang | ✅ Tốt hơn           |

→ Dùng Kanban làm view mặc định, List là view phụ.

## Cấu trúc folder

```

kanban/
├── kanban-board.tsx # Component chính: quản lý DndContext, sensors, drag events
├── kanban-column.tsx # Mỗi cột (Backlog, Todo...): droppable area
└── kanban-task-card.tsx # Card từng task: sortable, hiển thị thông tin

```

## Cách dùng

```tsx
// Trong page Tasks:
import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function TasksPage() {
  return <KanbanBoard />;
}
```

## Dependencies

- `@dnd-kit/core` — Drag & Drop context, sensors
- `@dnd-kit/sortable` — Sortable list trong mỗi cột
- `@dnd-kit/utilities` — CSS transforms

## Design Decisions

1. **Optimistic Update:** UI cập nhật ngay khi kéo thả, API gọi ngầm sau.
   Nếu fail, TanStack Query tự refetch và UI snap về vị trí cũ.
2. **Position field:** Mỗi task có `position` (number) để sắp xếp trong cột.
   Backend xử lý reorder bằng cách tăng position các task liên quan.

3. **Drag Overlay:** Dùng `<DragOverlay>` để hiển thị task "nổi" khi kéo,
   tránh layout shift và trông mượt mà hơn.
