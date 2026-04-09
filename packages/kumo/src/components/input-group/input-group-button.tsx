import React, {
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { type ButtonProps, Button as ButtonExternal } from "../button/button";
import { Tooltip, type KumoTooltipSide } from "../tooltip/tooltip";
import type { KumoInputSize } from "../input/input";
import { INPUT_GROUP_SIZE, useInputGroupContext } from "./context";

/**
 * In container mode, buttons render "one size down" so they stay visually
 * subordinate to the input.  In individual mode the size passes through
 * unchanged (pagination / toolbar buttons should match the input height).
 */
const COMPACT_BUTTON_SIZE: Record<KumoInputSize, KumoInputSize> = {
  xs: "xs",
  sm: "xs",
  base: "sm",
  lg: "base",
};

export type InputGroupButtonProps = ButtonProps & {
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
 * In `focusMode="container"` (default), renders as a compact ghost button
 * subordinate to the input. In `focusMode="individual"`, renders as a full
 * standalone button with its own focus ring, matching toolbar/pagination usage.
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
      variant,
      size,
      disabled,
      tooltip,
      tooltipSide = "bottom",
      icon,
      ...props
    }: PropsWithChildren<InputGroupButtonProps>,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    const context = useInputGroupContext("Button");
    const isDisabled = disabled ?? context?.disabled;
    const isIndividual = context?.focusMode === "individual";

    // Derive aria-label from tooltip string when the button has no explicit label.
    // Icon-only buttons require an aria-label for a11y.
    const tooltipAriaLabel =
      typeof tooltip === "string" && !props["aria-label"] ? tooltip : undefined;

    // Pre-render the icon with the context-derived size so it matches the
    // Addon icon sizing (e.g. 18px at "base"). Without this, Button's
    // internal renderIconNode renders `<Icon />` with no size prop,
    // falling back to CSS font-size (~14px).
    const contextIconSize = context
      ? INPUT_GROUP_SIZE[context.size ?? "base"].iconSize
      : undefined;

    const sizedIcon =
      icon &&
      contextIconSize &&
      (typeof icon === "function" ||
        (typeof icon === "object" &&
          icon !== null &&
          !React.isValidElement(icon)))
        ? React.createElement(icon as React.ComponentType<{ size?: number }>, {
            size: contextIconSize,
          })
        : icon;

    const btn = (
      <ButtonExternal
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={tooltipAriaLabel}
        {...props}
        icon={sizedIcon}
        variant={variant ?? "ghost"}
        size={
          size ??
          (isIndividual
            ? (context?.size ?? "sm")
            : (COMPACT_BUTTON_SIZE[context?.size ?? "base"] ?? "sm"))
        }
        className={cn(
          "pointer-events-auto",
          isIndividual && [
            "relative h-full! rounded-none ring ring-kumo-line",
            "first:rounded-l-[inherit] last:rounded-r-[inherit]",
            "focus:z-1 focus:outline",
            "disabled:bg-kumo-overlay disabled:text-kumo-inactive!",
          ],
          className,
        )}
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
