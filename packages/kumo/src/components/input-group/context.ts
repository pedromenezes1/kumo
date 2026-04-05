import { createContext, useContext, type HTMLAttributes } from "react";
import type { KumoInputSize } from "../input/input";
import type { FieldProps } from "../field/field";

// Spacing model
//
// Each element type has a fixed outer padding. The container uses has-[] CSS
// to reduce the input's padding on sides that touch an addon.
//
//   Input outer:       px-3 (12px base) — full padding when at the edge
//   Input seam:        pl-2 / pr-2 (8px base) — applied by container has-[]
//   Addon outer:       pl-2 / pr-2 (8px base) — on the container-edge side
//   Addon seam:        nothing — input owns the gap entirely
//
// has-[] rules on the container override [&_input]:pl-{seam} when a start
// addon is present, and [&_input]:pr-{seam} when an end addon is present.

export interface InputGroupSizeTokens {
  /** Full outer padding — matches standalone Input (e.g. px-3). */
  inputOuter: string;
  /**
   * Directional outer padding for Addon at the container edge.
   *
   * These MUST be static pl-/pr- strings (not derived at runtime via
   * `"px-N".replace(…)`) so Tailwind JIT can detect them during its
   * source-file scan. Dynamic string construction produces class names
   * that never appear as literals, so Tailwind never generates the CSS.
   */
  addonOuterStart: string;
  addonOuterEnd: string;
  /** pr- for suffix when no end addon. */
  suffixPad: string;
  fontSize: string;
  /** Icon size in px. */
  iconSize: number;
}

export const INPUT_GROUP_SIZE: Record<KumoInputSize, InputGroupSizeTokens> = {
  xs: {
    inputOuter: "px-1.5",
    addonOuterStart: "pl-1.5",
    addonOuterEnd: "pr-1.5",
    suffixPad: "pr-1.5",
    fontSize: "text-xs",
    iconSize: 10,
  },
  sm: {
    inputOuter: "px-2",
    addonOuterStart: "pl-1.5",
    addonOuterEnd: "pr-1.5",
    suffixPad: "pr-2",
    fontSize: "text-xs",
    iconSize: 13,
  },
  base: {
    inputOuter: "px-3",
    addonOuterStart: "pl-2",
    addonOuterEnd: "pr-2",
    suffixPad: "pr-3",
    fontSize: "text-base",
    iconSize: 18,
  },
  lg: {
    inputOuter: "px-4",
    addonOuterStart: "pl-2.5",
    addonOuterEnd: "pr-2.5",
    suffixPad: "pr-4",
    fontSize: "text-base",
    iconSize: 20,
  },
};

// Build the has-[] container classes that reduce input padding when addons
// are present. These are static strings so Tailwind JIT can detect them.
export const INPUT_GROUP_HAS_CLASSES: Record<KumoInputSize, string> = {
  xs: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1",
  ].join(" "),
  sm: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1.5",
  ].join(" "),
  base: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2",
  ].join(" "),
  lg: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2.5",
  ].join(" "),
};

// Context

export interface InputGroupRootProps
  extends HTMLAttributes<HTMLElement>,
    Partial<
      Pick<
        FieldProps,
        "label" | "description" | "error" | "required" | "labelTooltip"
      >
    > {
  size?: KumoInputSize | undefined;
  disabled?: boolean;
  /** @internal */
  focusMode?: "container" | "individual";
}

export interface InputGroupContextValue {
  size?: KumoInputSize;
  focusMode: "container" | "individual";
  disabled: boolean;
  error?: FieldProps["error"];
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(
  null,
);

/**
 * Reads InputGroupContext and warns in development when the context is null
 * (i.e. when a sub-component is rendered outside of `<InputGroup>`).
 */
export function useInputGroupContext(componentName: string) {
  const context = useContext(InputGroupContext);
  if (process.env.NODE_ENV !== "production" && !context) {
    console.warn(
      `<InputGroup.${componentName}> must be used within <InputGroup>. Falling back to default values.`,
    );
  }
  return context;
}
