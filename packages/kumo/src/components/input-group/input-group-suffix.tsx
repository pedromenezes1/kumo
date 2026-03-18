import { useContext, useEffect, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { InputGroupContext, INPUT_GROUP_SIZE } from "./context";

export interface InputGroupSuffixProps {
  /** Additional CSS classes. */
  className?: string;
  /** Suffix content (e.g., ".workers.dev"). */
  children?: ReactNode;
}

/**
 * Inline suffix that flows seamlessly next to the typed input value.
 * Input width adjusts automatically as the user types.
 */
export function Suffix({ className, children }: InputGroupSuffixProps) {
  const context = useContext(InputGroupContext);

  const size = context?.size ?? "base";
  const tokens = INPUT_GROUP_SIZE[size];

  const registerInline = context?.registerInline;
  const unregisterInline = context?.unregisterInline;

  useEffect(() => {
    registerInline?.();
    return () => unregisterInline?.();
  }, [registerInline, unregisterInline]);

  return (
    <div
      data-slot="input-group-suffix"
      className={cn(
        "flex min-w-0 select-none items-center text-kumo-subtle",
        tokens.fontSize,
        context?.hasEndAddon ? tokens.suffixReserve : tokens.suffixPad,
        className,
      )}
    >
      <span className="truncate">{children}</span>
    </div>
  );
}
Suffix.displayName = "InputGroup.Suffix";
