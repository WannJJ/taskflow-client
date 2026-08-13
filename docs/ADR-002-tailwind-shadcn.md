# ADR-002: Tailwind CSS + shadcn/ui

## Status

Accepted

## Context

We needed a styling solution that is:

- Fast to develop with
- Consistent across the application
- Customizable without fighting the framework
- Accessible out of the box

## Decision

We chose **Tailwind CSS** for styling + **shadcn/ui** for base components.

## Consequences

### Positive

- **Utility-first**: No context switching between HTML and CSS files
- **Design system**: CSS variables in `globals.css` define the entire theme
- **Dark mode**: `next-themes` + Tailwind `dark:` modifier = instant theme switching
- **shadcn/ui components**: Copy-paste components (not a dependency) — fully customizable
- **Zero runtime**: Tailwind compiles to static CSS at build time
- **Responsive**: Mobile-first breakpoints (`sm:`, `md:`, `lg:`) are intuitive

### Negative

- **HTML verbosity**: `className="flex items-center justify-between px-4 py-2"` can be long
- **Learning curve**: Memorizing utility names takes time
- **Bundle size**: Without PurgeCSS/Tailwind v3 JIT, unused styles could bloat CSS (mitigated by JIT)
- **shadcn/ui maintenance**: Components are copied into your codebase — you own updates

## Component Architecture

```

components/
├── ui/ → shadcn/ui base components (Button, Input, Dialog...)
├── layout/ → App-specific layout (Sidebar, Navbar)
├── kanban/ → Domain-specific (Board, Column, TaskCard)
└── notes/ → Domain-specific (NoteEditor, NoteList)

```

## Theme Tokens (globals.css)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
```

## Alternatives Considered

- **CSS Modules**: Good scoping, but lacks utility speed and design tokens
- **Styled Components / Emotion**: Runtime CSS-in-JS conflicts with Server Components
- **Chakra UI**: Good component library, but less customizable than shadcn/ui
- **MUI (Material UI)**: Heavy bundle, opinionated design, harder to customize
- **Bootstrap**: Outdated for modern React apps

## References

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Tailwind CSS: The Good, the Bad, and the Ugly](https://www.smashingmagazine.com/2022/09/tailwind-css-good-bad-ugly/)
