# UI Coding Standards

## Component Library

**ONLY shadcn/ui components may be used for UI in this project.**

- Install components via `npx shadcn@latest add <component>`
- ABSOLUTELY NO custom UI components should be created
- Do not build your own buttons, cards, inputs, modals, tables, badges, or any other UI primitives
- If a shadcn component does not exist for a use case, find the closest shadcn equivalent and compose from it

## Date Formatting

All dates must be formatted using **date-fns**. Raw JavaScript `Date` methods (`toLocaleDateString`, `toLocaleTimeString`, etc.) must not be used for display.

### Format

Dates displayed to the user must use ordinal day + abbreviated month + full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2026
```

### Implementation

```ts
import { format } from 'date-fns'

format(date, "do MMM yyyy")
// e.g. "1st Sep 2025", "23rd Jan 2026"
```

Install date-fns if not already present:

```bash
npm install date-fns
```

## Tailwind CSS

- Tailwind utility classes are allowed for layout and spacing only (margins, padding, flex, grid, sizing)
- Do not use Tailwind to style interactive elements (buttons, inputs, selects) — use shadcn components for those
- All theme tokens (colors, radius, fonts) are defined in `src/app/globals.css` under `@theme inline { ... }` — do not hardcode color values
