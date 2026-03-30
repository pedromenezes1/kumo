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
 * Uses a native `<label>` element so clicking anywhere in the container
 * focuses the wrapped input — no imperative JS needed.
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
const Root = forwardRef<
  HTMLLabelElement,
  PropsWithChildren<InputGroupRootProps>
>(
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

    const container = (
      <InputGroupContext.Provider value={contextValue}>
        <label
          ref={forwardedRef}
          data-slot="input-group"
          data-focus-mode={focusMode}
          data-disabled={disabled ? "" : undefined}
          className={cn(
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
          )}
          {...rest}
        >
          {children}
        </label>
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
