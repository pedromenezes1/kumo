import { forwardRef, useMemo, type PropsWithChildren } from "react";
import { cn } from "../../utils/cn";
import { inputVariants } from "../input/input";
import { Field } from "../field/field";
import {
  InputGroupContext,
  INPUT_GROUP_HAS_CLASSES,
  type InputGroupRootProps,
} from "./context";
import { Input } from "./input-group-input";
import { Button } from "./input-group-button";
import { Addon } from "./input-group-addon";
import { Suffix } from "./input-group-suffix";

export { type InputGroupRootProps } from "./context";
export { type InputGroupInputProps } from "./input-group-input";
export { type InputGroupButtonProps } from "./input-group-button";
export { type InputGroupAddonProps } from "./input-group-addon";
export { type InputGroupSuffixProps } from "./input-group-suffix";

export const KUMO_INPUT_GROUP_VARIANTS = {
  size: {
    xs: {
      classes: "h-6 text-xs",
      description: "Extra small size.",
    },
    sm: {
      classes: "h-7 text-xs",
      description: "Small size.",
    },
    base: {
      classes: "h-9 text-base",
      description: "Default size.",
    },
    lg: {
      classes: "h-11 text-base",
      description: "Large size.",
    },
  },
  /** @internal */
  focusMode: {
    container: {
      classes: "focus-within:ring-kumo-ring",
      description:
        "The entire container shows a single focus ring when any child is focused.",
    },
    individual: {
      classes: "isolate overflow-visible",
      description:
        "Each interactive element shows its own focus indicator independently.",
    },
  },
} as const;

export const KUMO_INPUT_GROUP_DEFAULT_VARIANTS = {
  size: "base",
  focusMode: "container",
} as const;

/**
 * Compound input component for building inputs with icons, addons, inline
 * suffixes, and action buttons. Accepts Field props and wraps content in
 * Field when label is provided.
 *
 * The container element is **conditional** to avoid nested `<label>` elements:
 * - When `label` is provided, the container renders as a `<div>` because Field
 *   already provides a `<label>` with `htmlFor` that handles click-to-focus.
 * - When `label` is absent (standalone usage), the container renders as a
 *   native `<label>` so clicking anywhere focuses the wrapped input — no
 *   imperative JS needed.
 *
 * @note Do not wrap InputGroup inside an external Field without using the `label` prop —
 * this creates invalid nested `<label>` elements. Use InputGroup's own `label` prop instead.
 *
 * @example
 * ```tsx
 * <InputGroup label="Email" error={{ message: "Invalid", match: true }}>
 *   <InputGroup.Addon><EnvelopeIcon /></InputGroup.Addon>
 *   <InputGroup.Input placeholder="you@example.com" />
 * </InputGroup>
 * ```
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroup.Input placeholder="my-worker" />
 *   <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
 * </InputGroup>
 * ```
 */
const Root = forwardRef<HTMLElement, PropsWithChildren<InputGroupRootProps>>(
  (
    {
      size = "base",
      children,
      className,
      disabled = false,
      focusMode = "container",
      label,
      description,
      error,
      required,
      labelTooltip,
      ...rest
    },
    forwardedRef,
  ) => {
    const contextValue = useMemo(
      () => ({
        size,
        focusMode,
        disabled,
        error,
      }),
      [size, focusMode, disabled, error],
    );

    // When label is provided, Field already renders a <label> with htmlFor
    // that handles click-to-focus. Using <div> avoids nested <label> elements
    // (invalid HTML with undefined assistive technology behavior).
    // When standalone (no label), a native <label> preserves click-to-focus.
    const containerClassName = cn(
      "relative w-full cursor-text",
      // inputVariants provides base ring-kumo-line; must come before state overrides
      inputVariants({ size }),
      "shadow-xs",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      focusMode === "individual"
        ? "isolate overflow-visible"
        : [
            "overflow-hidden",
            // Focus state must come AFTER inputVariants to override ring-kumo-line
            "focus-within:ring-kumo-ring",
            // The CSS in kumo-binding.css handles the native outline
          ],
      // Error state must also come after inputVariants
      "has-[input[aria-invalid=true]]:ring-kumo-danger",
      "px-0",
      "flex items-center gap-0",
      "has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
      "has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full",
      "has-[[data-slot=input-group-suffix]]:[&_input]:grow-0",
      "has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
      INPUT_GROUP_HAS_CLASSES[size],
      className,
    );

    const dataProps = {
      "data-slot": "input-group" as const,
      "data-focus-mode": focusMode,
      "data-disabled": disabled ? ("" as const) : undefined,
    };

    const container = (
      <InputGroupContext.Provider value={contextValue}>
        {label ? (
          <div
            ref={forwardedRef as React.Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {children}
          </div>
        ) : (
          <label
            ref={forwardedRef as React.Ref<HTMLLabelElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {children}
          </label>
        )}
      </InputGroupContext.Provider>
    );

    if (label) {
      return (
        <Field
          label={label}
          description={description}
          error={error}
          required={required}
          labelTooltip={labelTooltip}
        >
          {container}
        </Field>
      );
    }

    return container;
  },
);
Root.displayName = "InputGroup";

export const InputGroup = Object.assign(Root, {
  Input,
  Button,
  Addon,
  Suffix,
});
