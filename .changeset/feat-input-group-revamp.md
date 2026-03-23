---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

feat(InputGroup): new compound component with Addon, Suffix, and Button support

New `InputGroup` compound component for building inputs with icons, addons, inline suffixes, and action buttons.

## Features

- Field Integration — InputGroup accepts `label`, `description`, `error`, `required`, and `labelTooltip` props directly; automatically wraps in Field when label is provided
- Addons — Place icons before the input using `align="start"`
- Compact Button — Icon button inside an Addon for secondary actions (i.e. clear, toggle visibility, tooltip)
- Inline Suffix — Text that flows seamlessly next to the typed value (e.g., `.workers.dev`); input width adjusts automatically as user types
- Size Variants — `xs`, `sm`, `base`, `lg` sizes cascade to all children via context
- Error State — Error flows through context; `InputGroup.Input` auto-sets `aria-invalid="true"` when error is present
- Disabled State — `disabled` prop disables all interactive children

## Sub-components

| Component           | Description                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `InputGroup`        | Root container; provides context and accepts Field props                                  |
| `InputGroup.Input`  | Styled input; inherits `size`, `disabled`, `error` from context                           |
| `InputGroup.Addon`  | Container for icons, text, or compact buttons; `align="start"` (default) or `align="end"` |
| `InputGroup.Button` | Full-height button (direct child) or compact button (inside Addon)                        |
| `InputGroup.Suffix` | Inline text suffix with automatic width measurement                                       |

## Usage

```tsx
// With Field props
<InputGroup
  label="Email"
  description="We'll never share your email"
  error={{ message: "Invalid email", match: "typeMismatch" }}
  labelTooltip="Used for account recovery"
>
  <InputGroup.Input type="email" />
  <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
</InputGroup>

// Inline suffix
<InputGroup>
  <InputGroup.Input placeholder="my-worker" />
  <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
</InputGroup>

// With action button
<InputGroup>
  <InputGroup.Addon><MagnifyingGlassIcon /></InputGroup.Addon>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Button variant="primary">Search</InputGroup.Button>
</InputGroup>
```
