# Project Conventions

This file defines naming and folder-organization conventions used in this repository.

## Folder structure

- `src/pages` → route-level screens
- `src/components` → reusable UI and domain components
  - `src/components/ui` → low-level design-system components
  - `src/components/admin` → admin-only shared components
- `src/hooks` → reusable React hooks
- `src/integrations` → external service clients (e.g. Supabase)
- `supabase/functions` → Edge Functions
  - `supabase/functions/_shared` → shared utilities/config for Edge Functions

> `supabase/` is the official Supabase CLI directory convention and should not be renamed.

## Naming conventions

- **React components**: PascalCase file names (e.g. `CheckoutModal.tsx`)
- **Hooks**: camelCase file names starting with `use` (e.g. `useBooks.ts`, `useToast.ts`, `useMobile.tsx`)
- **Utility files**: lower camel/single-purpose names (e.g. `utils.ts`, `config.ts`)
- **Edge Function entrypoints**: `index.ts` under function folders (Supabase convention)
- **Supabase function folders**: kebab-case names (e.g. `initiate-payment`, `payment-webhook`)

## Import conventions

- Prefer path alias imports from `@/` for app code.
- Keep imports grouped by:
  1. external libs,
  2. internal aliases,
  3. relative imports.

## Environment/config conventions

- Edge Functions should read environment variables via shared helpers in `supabase/functions/_shared/config.ts`.
- Do not duplicate environment variable lookup logic across multiple function entrypoints.
