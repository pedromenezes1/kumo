import { createContext } from "react";
import type { KumoInputSize } from "../input/input";
import type { FieldProps } from "../field/field";

// Spacing model
//
// Each element type has a fixed outer padding. The container uses has-[] CSS
// to reduce the input's padding on sides that touch an addon.
//
//   Input outer:       px-3 (12px base) — full padding when at the edge
//   Input seam:        pl-2 / pr-2 (8px base) — applied by container has-[]
//   Addon outer:       px-2 (8px base) — on the container-edge side
//   Addon seam:        nothing — input owns the gap entirely
//
// has-[] rules on the container override [&_input]:pl-{seam} when a start
// addon is present, and [&_input]:pr-{seam} when an end addon is present.

export interface InputGroupSizeTokens {
  /** Full outer padding — matches standalone Input (e.g. px-3). */
  inputOuter: string;
  /** Outer padding for icon/text Addon at the container edge. */
  addonOuter: string;
  /** pl- for ghost measurement span (matches inputOuter left). */
  ghostPad: string;
  /** pr- for suffix when no end addon. */
  suffixPad: string;
  /** pr- for suffix when end addon present (reserves icon space). */
  suffixReserve: string;
  fontSize: string;
  /** Icon size in px. */
  iconSize: number;
}

export const INPUT_GROUP_SIZE: Record<KumoInputSize, InputGroupSizeTokens> = {
  xs: {
    inputOuter: "px-1.5",
    addonOuter: "px-1.5",
    ghostPad: "pl-1.5",
    suffixPad: "pr-1.5",
    suffixReserve: "pr-6",
    fontSize: "text-xs",
    iconSize: 10,
  },
  sm: {
    inputOuter: "px-2",
    addonOuter: "px-1.5",
    ghostPad: "pl-2",
    suffixPad: "pr-2",
    suffixReserve: "pr-7",
    fontSize: "text-xs",
    iconSize: 13,
  },
  base: {
    inputOuter: "px-3",
    addonOuter: "px-2",
    ghostPad: "pl-3",
    suffixPad: "pr-3",
    suffixReserve: "pr-9",
    fontSize: "text-base",
    iconSize: 18,
  },
  lg: {
    inputOuter: "px-4",
    addonOuter: "px-2.5",
    ghostPad: "pl-4",
    suffixPad: "pr-4",
    suffixReserve: "pr-11",
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
    "has-[[data-slot=input-group-button]]:[&_input]:pr-1",
  ].join(" "),
  sm: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1.5",
    "has-[[data-slot=input-group-button]]:[&_input]:pr-1.5",
  ].join(" "),
  base: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2",
    "has-[[data-slot=input-group-button]]:[&_input]:pr-2",
  ].join(" "),
  lg: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2.5",
    "has-[[data-slot=input-group-button]]:[&_input]:pr-2.5",
  ].join(" "),
};

export const MIN_INPUT_WIDTH = 1;

// Derive directional padding from a symmetric "px-N" token.
export function pl(px: string): string {
  return px.replace("px-", "pl-");
}
export function pr(px: string): string {
  return px.replace("px-", "pr-");
}

// Context

export interface InputGroupRootProps
  extends Partial<
    Pick<
      FieldProps,
      "label" | "description" | "error" | "required" | "labelTooltip"
    >
  > {
  className?: string;
  size?: KumoInputSize | undefined;
  disabled?: boolean;
  /** @internal */
  focusMode?: "container" | "individual";
}

export interface InputGroupContextValue
  extends Omit<
    InputGroupRootProps,
    "focusMode" | "label" | "description" | "required" | "labelTooltip"
  > {
  focusMode: "container" | "individual";
  inputId: string;
  hasStartAddon: boolean;
  hasEndAddon: boolean;
  hasSuffix: boolean;
  insideAddon: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  registerAddon: (align: "start" | "end") => void;
  unregisterAddon: (align: "start" | "end") => void;
  registerInline: () => void;
  unregisterInline: () => void;
  disabled: boolean;
  error?: FieldProps["error"];
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(
  null,
);
