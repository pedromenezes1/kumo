import { forwardRef, type PropsWithChildren, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { type ButtonProps, Button as ButtonExternal } from "../button/button";
import { Tooltip, type KumoTooltipSide } from "../tooltip/tooltip";
import { useInputGroupContext } from "./context";

export type InputGroupButtonProps = Omit<ButtonProps, "variant" | "shape"> & {
  /**
   * When provided, wraps the button in a `Tooltip` showing this content on hover.
   * Automatically sets `aria-label` from a string value when no `aria-label` is set.
   *
   * @example
   * ```tsx
   * <InputGroup.Addon align="end">
   *   <InputGroup.Button tooltip="Query language help" aria-label="Query language help">
   *     <QuestionIcon size={16} />
   *   </InputGroup.Button>
   * </InputGroup.Addon>
   * ```
   */
  tooltip?: ReactNode;
  /**
   * Preferred side for the tooltip popup.
   * @default "bottom"
   */
  tooltipSide?: KumoTooltipSide;
};

/**
 * Button for secondary actions rendered inside `InputGroup.Addon`
 * (toggle, copy, help).
 *
 * Pass a `tooltip` prop to show a tooltip on hover.
 */
export const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<InputGroupButtonProps>
>(
  (
    {
      children,
      className,
      size,
      disabled,
      tooltip,
      tooltipSide = "bottom",
      ...props
    },
    ref,
  ) => {
    const context = useInputGroupContext("Button");
    const isDisabled = disabled ?? context?.disabled;

    // Derive aria-label from tooltip string when the button has no explicit label.
    // Icon-only buttons require an aria-label for a11y.
    const tooltipAriaLabel =
      typeof tooltip === "string" && !props["aria-label"] ? tooltip : undefined;

    const btn = (
      <ButtonExternal
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={tooltipAriaLabel}
        {...props}
        variant="ghost"
        size={size ?? "sm"}
        className={cn("pointer-events-auto", className)}
      >
        {children}
      </ButtonExternal>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip} side={tooltipSide} asChild>
          {btn}
        </Tooltip>
      );
    }

    return btn;
  },
);
Button.displayName = "InputGroup.Button";
