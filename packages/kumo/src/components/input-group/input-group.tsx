import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { cn } from "../../utils/cn";
import { inputVariants } from "../input/input";
import { Field } from "../field/field";
import {
  InputGroupContext,
  INPUT_GROUP_SIZE,
  INPUT_GROUP_HAS_CLASSES,
  MIN_INPUT_WIDTH,
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

    const [addons, setAddons] = useState<{
      start: number;
      end: number;
    }>({ start: 0, end: 0 });
    const [hasSuffix, setHasSuffix] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const registerAddon = useCallback((align: "start" | "end") => {
      setAddons((prev) => ({ ...prev, [align]: prev[align] + 1 }));
    }, []);

    const unregisterAddon = useCallback((align: "start" | "end") => {
      setAddons((prev) => ({
        ...prev,
        [align]: Math.max(0, prev[align] - 1),
      }));
    }, []);

    const registerInline = useCallback(() => setHasSuffix(true), []);
    const unregisterInline = useCallback(() => setHasSuffix(false), []);

    const contextValue = useMemo(
      () => ({
        size,
        focusMode,
        inputId,
        disabled,
        error,
        hasStartAddon: addons.start > 0,
        hasEndAddon: addons.end > 0,
        hasSuffix,
        insideAddon: false,
        inputValue,
        setInputValue,
        registerAddon,
        unregisterAddon,
        registerInline,
        unregisterInline,
      }),
      [
        size,
        focusMode,
        inputId,
        disabled,
        error,
        addons.start,
        addons.end,
        hasSuffix,
        inputValue,
        registerAddon,
        unregisterAddon,
        registerInline,
        unregisterInline,
      ],
    );

    const tokens = INPUT_GROUP_SIZE[size];
    const ghostRef = useRef<HTMLSpanElement>(null);

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

    // Measure ghost and update input width when suffix is present.
    useLayoutEffect(() => {
      if (!hasSuffix) return;
      if (!inputId || !ghostRef.current) return;

      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (!input) return;

      // Copy letter-spacing from the actual input so the ghost measurement
      // matches exactly.
      ghostRef.current.style.letterSpacing =
        window.getComputedStyle(input).letterSpacing;

      const value = inputValue !== "" ? inputValue : input.value;

      if (value) {
        ghostRef.current.textContent = value;
        const measuredWidth = ghostRef.current.offsetWidth + 1;
        const width = Math.max(measuredWidth, MIN_INPUT_WIDTH);
        input.style.width = `${width}px`;
        input.style.maxWidth = "100%";
      } else {
        input.style.width = `${MIN_INPUT_WIDTH}px`;
        input.style.maxWidth = "";
      }
    }, [inputId, inputValue, hasSuffix]);

    const container = (
      <InputGroupContext.Provider value={contextValue}>
        {/* Ghost element for suffix width measurement */}
        {hasSuffix && (
          <div className="pointer-events-none invisible absolute grid font-sans">
            <span
              ref={ghostRef}
              className={cn("whitespace-pre", tokens.ghostPad, tokens.fontSize)}
              aria-hidden="true"
            />
          </div>
        )}
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
            hasSuffix
              ? "grid grid-cols-[auto_1fr] items-center gap-0"
              : "flex items-center gap-0",
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
