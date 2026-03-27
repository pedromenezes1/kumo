---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

Add `InputGroup` compound component for building decorated inputs

- Compose inputs with icons, text addons, inline suffixes, and ghost buttons via `InputGroup.Addon`, `.Suffix`, and `.Button`
- Built-in Field integration — pass `label`, `description`, `error`, and `labelTooltip` directly
- Size variants (`xs`, `sm`, `base`, `lg`) cascade to all children via context
- `InputGroup.Button` supports a `tooltip` prop that auto-derives `aria-label`
- Error and disabled states flow through context to all sub-components

```tsx
<InputGroup label="Search" size="base">
  <InputGroup.Addon>
    <MagnifyingGlassIcon />
  </InputGroup.Addon>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Addon align="end">
    <InputGroup.Button tooltip="Clear">
      <XCircleIcon />
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup>
```
