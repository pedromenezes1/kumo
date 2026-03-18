import {
  Children,
  cloneElement,
  useContext,
  useEffect,
  useMemo,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { InputGroupContext, INPUT_GROUP_SIZE, pl, pr } from "./context";
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
export function Addon({
  align = "start",
  className,
  children,
}: InputGroupAddonProps) {
  const context = useContext(InputGroupContext);

  const size = context?.size ?? "base";
  const tokens = INPUT_GROUP_SIZE[size];
  const hasInline = context?.hasSuffix;

  const registerAddon = context?.registerAddon;
  const unregisterAddon = context?.unregisterAddon;

  useEffect(() => {
    registerAddon?.(align);
    return () => unregisterAddon?.(align);
  }, [align, registerAddon, unregisterAddon]);

  const addonContext = useMemo(
    () => (context ? { ...context, insideAddon: true } : null),
    [context],
  );

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

  // In inline mode (Suffix present), addons overlay as absolute elements
  // since the grid layout is reserved for the input + suffix measurement.
  // In standard flex mode, addons are flow-based flex items.
  return (
    <InputGroupContext.Provider value={addonContext}>
      <div
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
          hasInline
            ? cn(
                "absolute top-0 bottom-0 z-10",
                align === "start" ? "left-0" : "right-0",
                tokens.addonOuter,
              )
            : align === "start"
              ? cn("-order-1", pl(tokens.addonOuter), "pr-0")
              : cn("order-1", "pl-0", pr(tokens.addonOuter)),
          className,
        )}
      >
        {sizedChildren}
      </div>
    </InputGroupContext.Provider>
  );
}
Addon.displayName = "InputGroup.Addon";
