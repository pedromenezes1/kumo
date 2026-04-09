import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Input as InputExternal, type InputProps } from "../input/input";
import { useInputGroupContext, INPUT_GROUP_SIZE } from "./context";

/** Props for InputGroup.Input — omits Field props since InputGroup handles them. */
export type InputGroupInputProps = Omit<
  InputProps,
  "label" | "labelTooltip" | "description" | "error" | "size" | "disabled"
>;

/**
 * Text input that inherits size, disabled, and error state from InputGroup context.
 * Automatically sets `aria-invalid` when parent has an error.
 */
export const Input = forwardRef<HTMLInputElement, InputGroupInputProps>(
  (props, ref) => {
    const context = useInputGroupContext("Input");

    // Warn when props that belong on <InputGroup> are passed directly
    if (process.env.NODE_ENV !== "production" && context) {
      if ((props as any).size !== undefined) {
        console.warn(
          "InputGroup.Input: Set `size` on <InputGroup> instead of <InputGroup.Input>.",
        );
      }
      if ((props as any).disabled !== undefined) {
        console.warn(
          "InputGroup.Input: Set `disabled` on <InputGroup> instead of <InputGroup.Input>.",
        );
      }
      if ((props as any).label !== undefined) {
        console.warn(
          "InputGroup.Input: Use the `label` prop on <InputGroup> instead of <InputGroup.Input>.",
        );
      }
      if ((props as any).description !== undefined) {
        console.warn(
          "InputGroup.Input: Use <InputGroup.Suffix> instead of passing `description` to <InputGroup.Input>.",
        );
      }
    }

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];
    const isIndividual = context?.focusMode === "individual";

    // Auto-set aria-invalid when error is present in context
    const hasError = Boolean(context?.error);

    // Use explicit id if provided, otherwise fall back to context id
    // (links the input to the invisible label overlay for click-to-focus).
    const inputId = props.id ?? context?.inputId;

    return (
      <InputExternal
        ref={ref}
        size={context?.size}
        disabled={context?.disabled || (props as any).disabled}
        aria-invalid={hasError || props["aria-invalid"]}
        {...props}
        id={inputId}
        className={cn(
          "flex h-full min-w-0 grow items-center rounded-none border-0 bg-transparent font-sans",
          // Always use full outer padding — the container's has-[] rules reduce
          // pl/pr to inputSeam on sides that touch an addon.
          tokens.inputOuter,
          "text-ellipsis",
          isIndividual
            ? "relative z-[1] ring ring-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] focus:z-1 focus:outline"
            : // Container mode: kill all focus indicators — the container handles them
              // z-[1] lifts the input above the invisible label overlay so cursor/selection work
              "relative z-[1] ring-0! shadow-none outline-none focus:ring-0! focus:outline-none",
          props.className,
        )}
      />
    );
  },
);
Input.displayName = "InputGroup.Input";
