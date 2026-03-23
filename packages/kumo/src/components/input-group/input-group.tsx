import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type PropsWithChildren,
} from "react";
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

export const KUMO_INPUT_GROUP_VARIANTS = {} as const;

export const KUMO_INPUT_GROUP_DEFAULT_VARIANTS = {} as const;

/**
 * Compound input component for building inputs with icons, addons, inline
 * suffixes, and action buttons. Accepts Field props and wraps content in
 * Field when label is provided.
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
const Root = forwardRef<HTMLDivElement, PropsWithChildren<InputGroupRootProps>>(
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
    },
    forwardedRef,
  ) => {
    const inputId = useId();
    const localRef = useRef<HTMLDivElement>(null);

    // Merge forwarded ref with local ref
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const contextValue = useMemo(
      () => ({
        size,
        focusMode,
        inputId,
        disabled,
        error,
      }),
      [size, focusMode, inputId, disabled, error],
    );

    // Focus input when clicking empty space in the container.
    // Attached via useEffect to keep the JSX clean for a11y linters.
    useEffect(() => {
      const el = localRef.current;
      if (!el) return;

      const handleMouseDown = (e: MouseEvent) => {
        if (disabled) return;
        if (
          (e.target as HTMLElement).closest(
            "button, input, textarea, select, a",
          )
        )
          return;
        setTimeout(() => document.getElementById(inputId)?.focus(), 0);
      };

      el.addEventListener("mousedown", handleMouseDown);
      return () => el.removeEventListener("mousedown", handleMouseDown);
    }, [disabled, inputId]);

    const container = (
      <InputGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          data-slot="input-group"
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
        >
          {children}
        </div>
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
