import { useContext, type PropsWithChildren } from "react";
import { cn } from "../../utils/cn";
import { type ButtonProps, Button as ButtonExternal } from "../button/button";
import { InputGroupContext } from "./context";

export type InputGroupButtonProps = ButtonProps;

/**
 * Button that renders differently based on placement:
 * - Inside Addon: compact button for secondary actions (toggle, copy)
 * - Direct child: full-height flush button for primary actions (search, submit)
 */
export function Button({
  children,
  className,
  size,
  ...props
}: PropsWithChildren<InputGroupButtonProps>) {
  const context = useContext(InputGroupContext);

  const isInsideAddon = context?.insideAddon ?? false;

  if (isInsideAddon) {
    return (
      <ButtonExternal
        type="button"
        {...props}
        size={size ?? "sm"}
        className={cn("pointer-events-auto", className)}
      >
        {children}
      </ButtonExternal>
    );
  }

  const isIndividualFocus = context?.focusMode === "individual";

  return (
    <ButtonExternal
      type="button"
      {...props}
      data-slot="input-group-button"
      size={size ?? context?.size}
      className={cn(
        // Flush button: extend beyond container to cover its ring
        "relative z-10 -m-px h-[calc(100%+2px)]! rounded-none rounded-r-[inherit]",
        "disabled:bg-kumo-tint disabled:text-kumo-inactive!",
        isIndividualFocus &&
          "ring ring-kumo-ring first:rounded-l-[inherit] last:rounded-r-[inherit] focus:z-1 focus:outline",
        className,
      )}
    >
      {children}
    </ButtonExternal>
  );
}
Button.displayName = "InputGroup.Button";
