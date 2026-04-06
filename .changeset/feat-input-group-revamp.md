---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

Add `InputGroup` compound component for composing decorated inputs

Compound structure: `InputGroup`, `InputGroup.Input`, `InputGroup.Addon`, `InputGroup.Suffix`, `InputGroup.Button`.

- Field integration — pass `label`, `description`, `error`, `required`, and `labelTooltip` directly to `InputGroup`
- Size variants (`xs`, `sm`, `base`, `lg`) propagate to all sub-components via context, including icon sizing in addons
- `InputGroup.Addon` — positions icons, text, or buttons at `align="start"` (default) or `align="end"` of the input
- `InputGroup.Suffix` — inline text suffix (e.g. `.workers.dev`)
- `InputGroup.Button` — ghost button for secondary actions with tooltip support

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
