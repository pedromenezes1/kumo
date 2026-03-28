import { forwardRef, useContext } from "react";
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
export const Input = forwardRef<HTMLInputElement, InputGroupInputProps>(
  (props, ref) => {
    const context = useContext(InputGroupContext);

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];

    // Auto-set aria-invalid when error is present in context
    const hasError = Boolean(context?.error);

    return (
      <InputExternal
        ref={ref}
        size={context?.size}
        disabled={context?.disabled || props.disabled}
        aria-invalid={hasError || props["aria-invalid"]}
        {...props}
        className={cn(
          "flex h-full min-w-0 grow items-center rounded-none border-0 bg-transparent font-sans",
          // Always use full outer padding — the container's has-[] rules reduce
          // pl/pr to inputSeam on sides that touch an addon.
          tokens.inputOuter,
          "text-ellipsis",
          "ring-0! shadow-none outline-none focus:ring-0! focus:outline-none",
          props.className,
        )}
      />
    );
  },
);
Input.displayName = "InputGroup.Input";
