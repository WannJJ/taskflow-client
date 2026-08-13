# ADR-001: Next.js 14 with App Router

## Status

Accepted

## Context

We needed a React framework that provides:

- Server-Side Rendering (SSR) for SEO and initial load performance
- API routes for serverless backend functions (if needed)
- File-based routing
- Image optimization
- Easy deployment to Vercel

## Decision

We chose **Next.js 14** with the **App Router** over Pages Router, Remix, and Vite + SSR.

## Consequences

### Positive

- **Server Components**: Reduced JavaScript bundle by rendering non-interactive parts on the server
- **Streaming**: Progressive rendering with Suspense boundaries
- **Nested Layouts**: `(auth)` and `(dashboard)` route groups with different layouts
- **Parallel Routes & Intercepting Routes**: Advanced patterns for modals and detail views
- **Vercel integration**: Zero-config deployment with edge caching
- **Industry trend**: App Router is the future of Next.js; demonstrates modern React knowledge

### Negative

- **Learning curve**: Server vs Client Component boundaries can confuse beginners
- **Caching complexity**: Default caching behavior requires explicit `revalidate` or `no-store`
- **Third-party compatibility**: Some libraries still assume client-side only (require `"use client"`)
- **Build time**: Slower than Vite for development (improving with Turbopack)

## App Router vs Pages Router

| Feature           | App Router                  | Pages Router         |
| ----------------- | --------------------------- | -------------------- |
| Server Components | Native                      | No                   |
| Streaming         | Built-in                    | Limited              |
| Layout nesting    | Route groups                | `_app.js` only       |
| Data fetching     | Server Components / `fetch` | `getServerSideProps` |
| API Routes        | Route Handlers              | Pages API            |

## Key Patterns Used

- **Server Components** for data fetching and static content
- **Client Components** for interactive UI (forms, drag-drop, stateful widgets)
- **Route Groups** `(auth)` and `(dashboard)` for layout isolation
- **Loading UI** with `loading.tsx` for Suspense boundaries

## Alternatives Considered

- **Remix**: Excellent data loading patterns, but smaller ecosystem and deployment options
- **Vite + React Router**: Fast dev, but requires manual SSR setup
- **Astro**: Great for content sites, but less suited for heavy SPA interactions (Kanban board)
- **Nuxt 3**: Vue ecosystem, not our target stack

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
