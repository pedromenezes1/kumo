import { useCallback, useContext, useLayoutEffect } from "react";
import type { ChangeEvent } from "react";
import { cn } from "../../utils/cn";
import { Input as InputExternal, type InputProps } from "../input/input";
import { InputGroupContext, INPUT_GROUP_SIZE } from "./context";

/** Props for InputGroup.Input — omits Field props since InputGroup handles them. */
export type InputGroupInputProps = Omit<
  InputProps,
  "label" | "labelTooltip" | "description" | "error" | "size"
>;

/**
 * Text input that inherits size, disabled, and error state from InputGroup context.
 * Automatically sets `aria-invalid` when parent has an error.
 */
export function Input(props: InputGroupInputProps) {
  const context = useContext(InputGroupContext);

  const size = context?.size ?? "base";
  const tokens = INPUT_GROUP_SIZE[size];

  // Track input value in context so Suffix can measure it
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement> & {
        preventBaseUIHandler: () => void;
      },
    ) => {
      context?.setInputValue(e.target.value);
      props.onChange?.(e);
    },
    [context?.setInputValue, props.onChange],
  );

  // Sync controlled/default value into context before paint
  // so the Suffix ghost measurement is accurate on first render.
  useLayoutEffect(() => {
    if (props.value !== undefined) {
      context?.setInputValue(String(props.value));
    } else if (props.defaultValue !== undefined) {
      context?.setInputValue(String(props.defaultValue));
    }
  }, [props.value, props.defaultValue, context?.setInputValue]);

  // Auto-set aria-invalid when error is present in context
  const hasError = Boolean(context?.error);

  return (
    <InputExternal
      id={context?.inputId}
      size={context?.size}
      disabled={context?.disabled || props.disabled}
      aria-invalid={hasError || props["aria-invalid"]}
      {...props}
      onChange={handleChange}
      className={cn(
        "flex h-full min-w-0 items-center rounded-none border-0 font-sans",
        // Always use full outer padding — the container's has-[] rules reduce
        // pl/pr to inputSeam on sides that touch an addon.
        tokens.inputOuter,
        context?.hasSuffix
          ? cn(
              "bg-transparent! overflow-hidden transition-none",
              // In inline mode the suffix owns its side — drop that padding.
              "pr-0!",
            )
          : "grow bg-transparent",
        "ring-0! shadow-none focus:ring-0!",
        props.className,
      )}
    />
  );
}
Input.displayName = "InputGroup.Input";
