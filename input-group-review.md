# Code Review for PR #249: InputGroup Compound Component

## Summary

Great work on this compound component! The API design is clean and the Field integration is well thought out. I found one significant bug causing layout flicker, plus a few minor documentation issues.

---

## Bug: Layout flicker on initial render with Suffix

**Severity: Major**

**Files:**

- `packages/kumo/src/components/input-group/input-group-suffix.tsx:25`
- `packages/kumo/src/components/input-group/input-group-addon.tsx:42`
- `packages/kumo/src/components/input-group/input-group.tsx:170-195`
- `packages/kumo/src/components/input-group/input-group-input.tsx:23-44`

**Problem:** When an InputGroup contains a Suffix, there's a visible flash on page load where the input expands to full width, then snaps to fit its content. This happens because:

1. Suffix and Addon use `useEffect` to register themselves with context
2. The parent's measurement logic runs in `useLayoutEffect` but depends on `hasSuffix` state
3. Since `useEffect` runs after paint, the first frame renders without suffix detection

**Suggested fix:** The component already uses `:has()` selectors with `data-slot` attributes for addon padding adjustments. The same pattern can replace the JS measurement entirely using CSS `field-sizing: content`:

```tsx
// In input-group.tsx container className:
"has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
"has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full",
"has-[[data-slot=input-group-suffix]]:[&_input]:grow-0",
"has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
```

This eliminates:

- The ghost element measurement hack
- `registerInline`/`unregisterInline` context callbacks
- `hasSuffix` and `inputValue` state tracking
- The `useLayoutEffect` measurement logic in Root
- The `useEffect` registration in Suffix and Addon

Browser support for `field-sizing` is ~80% (Chrome 123+, Safari 26.2+). Firefox doesn't support it yet, but the fallback (input stays wider) is acceptable progressive enhancement - no flicker, just less precise sizing.

---

## Documentation Issues

**Severity: Minor**

1. **`packages/kumo-docs-astro/src/pages/components/input-group.astro:24`** - Incorrect `sourceFile` prop:

   ```diff
   - sourceFile="components/input"
   + sourceFile="components/input-group"
   ```

2. **`packages/kumo-docs-astro/src/pages/components/input-group.astro:48-49`** - Granular import path is wrong:
   ```diff
   - import { InputGroup } from "@cloudflare/kumo/components/input";
   + import { InputGroup } from "@cloudflare/kumo/components/input-group";
   ```

---

## Overall

**Minor Comments** - The core implementation is solid. The flicker bug should be addressed before merge since it's user-visible. The CSS-only approach would also simplify the codebase significantly by removing ~50 lines of measurement logic.

---

## Suggested Diff

Here's a working implementation of the CSS-only approach:

```diff
diff --git a/packages/kumo/src/components/input-group/input-group-addon.tsx b/packages/kumo/src/components/input-group/input-group-addon.tsx
index 27ee9c62..bd93cb1f 100644
--- a/packages/kumo/src/components/input-group/input-group-addon.tsx
+++ b/packages/kumo/src/components/input-group/input-group-addon.tsx
@@ -2,7 +2,6 @@ import {
   Children,
   cloneElement,
   useContext,
-  useEffect,
   useMemo,
   isValidElement,
   type ReactElement,
@@ -34,15 +33,6 @@ export function Addon({

   const size = context?.size ?? "base";
   const tokens = INPUT_GROUP_SIZE[size];
-  const hasInline = context?.hasSuffix;
-
-  const registerAddon = context?.registerAddon;
-  const unregisterAddon = context?.unregisterAddon;
-
-  useEffect(() => {
-    registerAddon?.(align);
-    return () => unregisterAddon?.(align);
-  }, [align, registerAddon, unregisterAddon]);

   const addonContext = useMemo(
     () => (context ? { ...context, insideAddon: true } : null),
@@ -61,9 +51,7 @@ export function Addon({
     });
   });

-  // In inline mode (Suffix present), addons overlay as absolute elements
-  // since the grid layout is reserved for the input + suffix measurement.
-  // In standard flex mode, addons are flow-based flex items.
+  // Always use flex-based positioning. CSS order controls visual placement.
   return (
     <InputGroupContext.Provider value={addonContext}>
       <div
@@ -77,15 +65,9 @@ export function Addon({
           "text-kumo-subtle",
           tokens.fontSize,
           "*:pointer-events-auto",
-          hasInline
-            ? cn(
-                "absolute top-0 bottom-0 z-10",
-                align === "start" ? "left-0" : "right-0",
-                tokens.addonOuter,
-              )
-            : align === "start"
-              ? cn("-order-1", pl(tokens.addonOuter), "pr-0")
-              : cn("order-1", "pl-0", pr(tokens.addonOuter)),
+          align === "start"
+            ? cn("-order-1", pl(tokens.addonOuter), "pr-0")
+            : cn("order-1", "pl-0", pr(tokens.addonOuter)),
           className,
         )}
       >
diff --git a/packages/kumo/src/components/input-group/input-group-input.tsx b/packages/kumo/src/components/input-group/input-group-input.tsx
index 3710f02e..34e7fb55 100644
--- a/packages/kumo/src/components/input-group/input-group-input.tsx
+++ b/packages/kumo/src/components/input-group/input-group-input.tsx
@@ -1,5 +1,4 @@
-import { useCallback, useContext, useLayoutEffect } from "react";
-import type { ChangeEvent } from "react";
+import { useContext } from "react";
 import { cn } from "../../utils/cn";
 import { Input as InputExternal, type InputProps } from "../input/input";
 import { InputGroupContext, INPUT_GROUP_SIZE } from "./context";
@@ -20,29 +19,6 @@ export function Input(props: InputGroupInputProps) {
   const size = context?.size ?? "base";
   const tokens = INPUT_GROUP_SIZE[size];

-  // Track input value in context so Suffix can measure it
-  const handleChange = useCallback(
-    (
-      e: ChangeEvent<HTMLInputElement> & {
-        preventBaseUIHandler: () => void;
-      },
-    ) => {
-      context?.setInputValue(e.target.value);
-      props.onChange?.(e);
-    },
-    [context?.setInputValue, props.onChange],
-  );
-
-  // Sync controlled/default value into context before paint
-  // so the Suffix ghost measurement is accurate on first render.
-  useLayoutEffect(() => {
-    if (props.value !== undefined) {
-      context?.setInputValue(String(props.value));
-    } else if (props.defaultValue !== undefined) {
-      context?.setInputValue(String(props.defaultValue));
-    }
-  }, [props.value, props.defaultValue, context?.setInputValue]);
-
   // Auto-set aria-invalid when error is present in context
   const hasError = Boolean(context?.error);

@@ -53,19 +29,13 @@ export function Input(props: InputGroupInputProps) {
       disabled={context?.disabled || props.disabled}
       aria-invalid={hasError || props["aria-invalid"]}
       {...props}
-      onChange={handleChange}
       className={cn(
-        "flex h-full min-w-0 items-center rounded-none border-0 font-sans",
+        "flex h-full min-w-0 grow items-center rounded-none border-0 bg-transparent font-sans",
         // Always use full outer padding — the container's has-[] rules reduce
         // pl/pr to inputSeam on sides that touch an addon.
         tokens.inputOuter,
-        context?.hasSuffix
-          ? cn(
-              "bg-transparent! overflow-hidden transition-none",
-              // In inline mode the suffix owns its side — drop that padding.
-              "pr-0!",
-            )
-          : "grow bg-transparent",
+        // Truncate with ellipsis when text overflows
+        "text-ellipsis",
         "ring-0! shadow-none focus:ring-0!",
         props.className,
       )}
diff --git a/packages/kumo/src/components/input-group/input-group-suffix.tsx b/packages/kumo/src/components/input-group/input-group-suffix.tsx
index 5c74ea30..879dfea2 100644
--- a/packages/kumo/src/components/input-group/input-group-suffix.tsx
+++ b/packages/kumo/src/components/input-group/input-group-suffix.tsx
@@ -1,4 +1,4 @@
-import { useContext, useEffect, type ReactNode } from "react";
+import { useContext, type ReactNode } from "react";
 import { cn } from "../../utils/cn";
 import { InputGroupContext, INPUT_GROUP_SIZE } from "./context";

@@ -11,7 +11,7 @@ export interface InputGroupSuffixProps {

 /**
  * Inline suffix that flows seamlessly next to the typed input value.
- * Input width adjusts automatically as the user types.
+ * Input width adjusts automatically via CSS field-sizing: content.
  */
 export function Suffix({ className, children }: InputGroupSuffixProps) {
   const context = useContext(InputGroupContext);
@@ -19,21 +19,13 @@ export function Suffix({ className, children }: InputGroupSuffixProps) {
   const size = context?.size ?? "base";
   const tokens = INPUT_GROUP_SIZE[size];

-  const registerInline = context?.registerInline;
-  const unregisterInline = context?.unregisterInline;
-
-  useEffect(() => {
-    registerInline?.();
-    return () => unregisterInline?.();
-  }, [registerInline, unregisterInline]);
-
   return (
     <div
       data-slot="input-group-suffix"
       className={cn(
-        "flex min-w-0 select-none items-center text-kumo-subtle",
+        "flex min-w-0 grow select-none items-center text-kumo-subtle",
         tokens.fontSize,
-        context?.hasEndAddon ? tokens.suffixReserve : tokens.suffixPad,
+        tokens.suffixPad,
         className,
       )}
     >
diff --git a/packages/kumo/src/components/input-group/input-group.tsx b/packages/kumo/src/components/input-group/input-group.tsx
index 32e74282..42ad5c83 100644
--- a/packages/kumo/src/components/input-group/input-group.tsx
+++ b/packages/kumo/src/components/input-group/input-group.tsx
@@ -196,16 +196,6 @@ const Root = forwardRef<HTMLDivElement, PropsWithChildren<InputGroupRootProps>>(

     const container = (
       <InputGroupContext.Provider value={contextValue}>
-        {/* Ghost element for suffix width measurement */}
-        {hasSuffix && (
-          <div className="pointer-events-none invisible absolute grid font-sans">
-            <span
-              ref={ghostRef}
-              className={cn("whitespace-pre", tokens.ghostPad, tokens.fontSize)}
-              aria-hidden="true"
-            />
-          </div>
-        )}
         <div
           ref={ref}
           role="group"
@@ -224,9 +214,12 @@ const Root = forwardRef<HTMLDivElement, PropsWithChildren<InputGroupRootProps>>(
                 ],
             inputVariants({ size }),
             "px-0",
-            hasSuffix
-              ? "grid grid-cols-[auto_1fr] items-center gap-0"
-              : "flex items-center gap-0",
+            "flex items-center gap-0",
+            // CSS-only input sizing when suffix present: shrink to content, strip right padding
+            "has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
+            "has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full",
+            "has-[[data-slot=input-group-suffix]]:[&_input]:grow-0",
+            "has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
             INPUT_GROUP_HAS_CLASSES[size],
             className,
           )}
```

Note: After applying this diff, the context can also be cleaned up to remove `hasSuffix`, `inputValue`, `setInputValue`, `registerInline`, `unregisterInline`, `registerAddon`, `unregisterAddon`, `hasStartAddon`, `hasEndAddon`, and the `ghostRef` in `input-group.tsx`.
