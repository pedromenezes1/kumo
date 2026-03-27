import {
  Children,
  cloneElement,
  forwardRef,
  useContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { InputGroupContext, INPUT_GROUP_SIZE } from "./context";
import { Button } from "./input-group-button";

export interface InputGroupAddonProps {
  /** Position relative to the input. @default "start" */
  align?: "start" | "end";
  /** Additional CSS classes. */
  className?: string;
  /** Addon content: icons, buttons, spinners, text. */
  children?: ReactNode;
}

/**
 * Container for icons, text, or compact buttons positioned at the start or end
 * of the input. Automatically sizes icon children to match the input size.
 */
export const Addon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = "start", className, children }, ref) => {
    const context = useContext(InputGroupContext);

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];

    // Inject size into direct icon children that don't already have one set.
    // Skips buttons (which have their own size handling) and non-element nodes.
    const sizedChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      const props = child.props as { size?: unknown };
      if (props.size !== undefined) return child;
      if (child.type === "button" || child.type === Button) return child;
      return cloneElement(child as ReactElement<{ size?: number }>, {
        size: tokens.iconSize,
      });
    });

    // Always use flex-based positioning. CSS order controls visual placement.
    return (
      <div
        ref={ref}
        data-slot={
          align === "start"
            ? "input-group-addon-start"
            : "input-group-addon-end"
        }
        className={cn(
          "pointer-events-none flex shrink-0 items-center gap-1.5",
          "text-kumo-subtle",
          tokens.fontSize,
          "*:pointer-events-auto",
          align === "start"
            ? cn("-order-1", tokens.addonOuterStart, "pr-0")
            : cn("order-1", "pl-0", tokens.addonOuterEnd),
          className,
        )}
      >
        {sizedChildren}
      </div>
    );
  },
);
Addon.displayName = "InputGroup.Addon";
