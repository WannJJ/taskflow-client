# ADR-003: Zustand for Client State Management

## Status

Accepted

## Context

We needed state management for:

- Authentication state (user, tokens)
- UI state (sidebar open/closed, theme)
- Global flags (isLoading, error messages)

We explicitly did NOT need Zustand for:

- Server state (tasks, notes, projects) → handled by TanStack Query

## Decision

We chose **Zustand** over Redux, Context API, and Jotai.

## Consequences

### Positive

- **Minimal boilerplate**: Store defined in ~20 lines vs Redux's actions/reducers/store
- **No providers needed**: Unlike Context API, no wrapper component tree
- **TypeScript friendly**: Infer types automatically from store definition
- **Middleware**: `persist` middleware for localStorage, `devtools` for Redux DevTools
- **Small bundle**: ~1KB vs Redux Toolkit's ~15KB
- **Selectors**: Fine-grained subscriptions prevent unnecessary re-renders

### Negative

- **Less structured**: No enforced pattern (actions, reducers) — requires team discipline
- **Ecosystem**: Fewer plugins than Redux
- **Large stores**: Can become unwieldy if everything is dumped into one store

## Store Structure

```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}
```

## Rules

1. **One store per domain**: `auth-store.ts`, `ui-store.ts` — avoid monolithic store
2. **No server state in Zustand**: API data lives in TanStack Query cache
3. **Persist only safe data**: Never persist tokens in localStorage in production (use http-only cookies)

## Alternatives Considered

- **Redux Toolkit**: Industry standard, but overkill for our scope; too much boilerplate
- **Context API**: Built-in, but causes unnecessary re-renders; poor for high-frequency updates
- **Jotai / Recoil**: Atom-based, excellent for derived state, but Zustand is simpler for our use case
- **Valtio**: Proxy-based, mutable state — interesting but less familiar to hiring managers

## References

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand vs Redux](https://github.com/pmndrs/zustand#compare-with-redux)
