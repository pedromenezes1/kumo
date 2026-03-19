import { forwardRef, useContext, type PropsWithChildren } from "react";
import { cn } from "../../utils/cn";
import { type ButtonProps, Button as ButtonExternal } from "../button/button";
import { InputGroupContext } from "./context";

export type InputGroupButtonProps = ButtonProps;

/**
 * Button that renders differently based on placement:
 * - Inside Addon: compact button for secondary actions (toggle, copy)
 * - Direct child: full-height flush button rendered inside the container
 */
export const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<InputGroupButtonProps>
>(({ children, className, size, disabled, ...props }, ref) => {
  const context = useContext(InputGroupContext);
  const isInsideAddon = context?.insideAddon ?? false;
  const isDisabled = disabled ?? context?.disabled;

  if (isInsideAddon) {
    return (
      <ButtonExternal
        ref={ref}
        type="button"
        disabled={isDisabled}
        {...props}
        size={size ?? "sm"}
        className={cn("pointer-events-auto", className)}
      >
        {children}
      </ButtonExternal>
    );
  }

  // Flush button: rendered inside the container
  return (
    <ButtonExternal
      ref={ref}
      type="button"
      disabled={isDisabled}
      {...props}
      data-slot="input-group-button"
      size={size ?? context?.size}
      className={cn("h-full self-stretch rounded-none ring-0", className)}
    >
      {children}
    </ButtonExternal>
  );
});
Button.displayName = "InputGroup.Button";
