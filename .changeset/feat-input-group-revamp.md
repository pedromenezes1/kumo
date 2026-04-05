---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

Add `InputGroup` compound component for composing decorated inputs

Compound structure: `InputGroup`, `InputGroup.Input`, `InputGroup.Addon`, `InputGroup.Suffix`, `InputGroup.Button`.

- **Field integration** — pass `label`, `description`, `error`, `required`, and `labelTooltip` directly to `InputGroup`; it wraps content in `Field` automatically
- **Smart container element** — renders as `<label>` for native click-to-focus when standalone; switches to `<div>` when `label` is provided to avoid nested `<label>` elements (Field already provides one)
- **Size variants** (`xs`, `sm`, `base`, `lg`) propagate to all sub-components via context, including icon sizing in addons
- **Context-driven state** — `disabled` and `error` flow through context so sub-components react automatically (e.g. `InputGroup.Input` sets `aria-invalid` from parent error)
- **`InputGroup.Addon`** — positions icons, text, or buttons at `align="start"` (default) or `align="end"` of the input
- **`InputGroup.Suffix`** — inline text suffix (e.g. `.workers.dev`) that flows next to the typed value via CSS `field-sizing: content`
- **`InputGroup.Button`** — ghost button for secondary actions; supports `tooltip` prop that wraps in `Tooltip` and auto-derives `aria-label` from string values
- **Dev-mode warnings** — sub-components log a console warning when rendered outside `<InputGroup>`

```tsx
<InputGroup
  label="Domain"
  size="base"
  error={{ message: "Already taken", match: true }}
>
  <InputGroup.Input placeholder="my-worker" />
  <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
</InputGroup>
```
