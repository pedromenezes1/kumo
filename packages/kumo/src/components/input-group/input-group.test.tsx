import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputGroup } from "./input-group";
import { INPUT_GROUP_SIZE } from "./context";
import type { KumoInputSize } from "../input/input";

describe("InputGroup", () => {
  describe("rendering", () => {
    it("renders input with addon", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>https://</InputGroup.Addon>
          <InputGroup.Input aria-label="URL" placeholder="example.com" />
        </InputGroup>,
      );
      expect(screen.getByText("https://")).toBeTruthy();
      expect(screen.getByPlaceholderText("example.com")).toBeTruthy();
    });

    it("renders input with button", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Search" placeholder="Search..." />
          <InputGroup.Addon align="end">
            <InputGroup.Button>Go</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Go" })).toBeTruthy();
    });

    it("renders input with suffix", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Subdomain" placeholder="my-worker" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </InputGroup>,
      );
      expect(screen.getByPlaceholderText("my-worker")).toBeTruthy();
      expect(screen.getByText(".workers.dev")).toBeTruthy();
    });

    it("renders all sub-components together", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>$</InputGroup.Addon>
          <InputGroup.Input aria-label="Amount" placeholder="0.00" />
          <InputGroup.Addon align="end">
            <InputGroup.Button>Pay</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(screen.getByText("$")).toBeTruthy();
      expect(screen.getByPlaceholderText("0.00")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Pay" })).toBeTruthy();
    });
  });

  describe("addon positioning", () => {
    it("places start addon before input in DOM order", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>Start</InputGroup.Addon>
          <InputGroup.Input aria-label="Test" />
        </InputGroup>,
      );
      const addon = screen.getByText("Start");
      const input = screen.getByRole("textbox");
      // Addon should come before input in document order
      expect(
        addon.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("places end addon after input in DOM order", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">End</InputGroup.Addon>
        </InputGroup>,
      );
      const addon = screen.getByText("End");
      const input = screen.getByRole("textbox");
      // Input should come before addon
      expect(
        input.compareDocumentPosition(addon) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("user interactions", () => {
    it("allows typing in input", async () => {
      const user = userEvent.setup();
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Name" />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await user.type(input, "hello");
      expect(input.value).toBe("hello");
    });

    it("calls onChange when typing", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Name" onChange={handleChange} />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "hi");
      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onClick when button is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Addon align="end">
            <InputGroup.Button onClick={handleClick}>Search</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Search" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick on compact button inside addon", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Password" />
          <InputGroup.Addon align="end">
            <InputGroup.Button onClick={handleClick} aria-label="Toggle">
              👁
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Toggle" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("focuses input when clicking on container", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>Label</InputGroup.Addon>
          <InputGroup.Input aria-label="Test" />
        </InputGroup>,
      );

      const group = container.firstElementChild as HTMLElement;
      await user.click(group);
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });
  });

  describe("disabled state", () => {
    it("disables input when group is disabled", () => {
      render(
        <InputGroup disabled>
          <InputGroup.Input aria-label="Test" />
        </InputGroup>,
      );
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <InputGroup disabled>
          <InputGroup.Input aria-label="Test" onChange={handleChange} />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("disables button when InputGroup is disabled", () => {
      render(
        <InputGroup disabled>
          <InputGroup.Input aria-label="Test input" />
          <InputGroup.Addon align="end">
            <InputGroup.Button>Submit</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      const button = screen.getByRole("button", {
        name: "Submit",
      }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });
  });

  describe("error handling", () => {
    it("sets aria-invalid on input when error is present", () => {
      render(
        <InputGroup error={{ message: "Invalid input", match: true }}>
          <InputGroup.Input aria-label="Test input" />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      expect(input.getAttribute("aria-invalid")).toBe("true");
    });

    it("does not set aria-invalid when no error is present", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test input" />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      expect(input.getAttribute("aria-invalid")).toBeFalsy();
    });
  });

  describe("size variants", () => {
    it("applies size to input", () => {
      const { rerender } = render(
        <InputGroup size="sm">
          <InputGroup.Input aria-label="Test" />
        </InputGroup>,
      );

      // Just verify it renders without error at different sizes
      expect(screen.getByRole("textbox")).toBeTruthy();

      rerender(
        <InputGroup size="lg">
          <InputGroup.Input aria-label="Test" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox")).toBeTruthy();
    });

    // Regression test: addon padding tokens must be static pl-/pr- strings
    // so Tailwind JIT can detect them. Dynamic "px-N".replace() broke xs/sm.
    it.each(["xs", "sm", "base", "lg"] as const)(
      "start addon has correct padding class for size %s",
      (size: KumoInputSize) => {
        render(
          <InputGroup size={size}>
            <InputGroup.Addon>Icon</InputGroup.Addon>
            <InputGroup.Input aria-label="Test" />
          </InputGroup>,
        );

        const addon = screen.getByText("Icon").closest("[data-slot]")!;
        const expectedClass = INPUT_GROUP_SIZE[size].addonOuterStart;
        expect(addon.className).toContain(expectedClass);
      },
    );

    it.each(["xs", "sm", "base", "lg"] as const)(
      "end addon has correct padding class for size %s",
      (size: KumoInputSize) => {
        render(
          <InputGroup size={size}>
            <InputGroup.Input aria-label="Test" />
            <InputGroup.Addon align="end">Icon</InputGroup.Addon>
          </InputGroup>,
        );

        const addon = screen.getByText("Icon").closest("[data-slot]")!;
        const expectedClass = INPUT_GROUP_SIZE[size].addonOuterEnd;
        expect(addon.className).toContain(expectedClass);
      },
    );

    // Ensure all addonOuter tokens are static directional classes
    // (not symmetric px- that would need runtime string replacement)
    it("all addon tokens use static pl-/pr- classes (not px-)", () => {
      for (const size of ["xs", "sm", "base", "lg"] as const) {
        const tokens = INPUT_GROUP_SIZE[size];
        expect(tokens.addonOuterStart).toMatch(/^pl-/);
        expect(tokens.addonOuterEnd).toMatch(/^pr-/);
      }
    });
  });

  describe("accessibility", () => {
    it("input has accessible name via aria-label", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Email address" />
        </InputGroup>,
      );
      expect(
        screen.getByRole("textbox", { name: "Email address" }),
      ).toBeTruthy();
    });

    it("button inside addon remains accessible", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Clear">×</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    });

    it("group has role='group'", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
        </InputGroup>,
      );
      expect(screen.getByRole("group")).toBeTruthy();
    });
  });

  describe("Button", () => {
    it("derives aria-label from tooltip string", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Addon align="end">
            <InputGroup.Button tooltip="Query language help">
              ?
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(
        screen.getByRole("button", { name: "Query language help" }),
      ).toBeTruthy();
    });

    it("prefers explicit aria-label over tooltip-derived label", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Addon align="end">
            <InputGroup.Button tooltip="Query language help" aria-label="Help">
              ?
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(screen.getByRole("button", { name: "Help" })).toBeTruthy();
    });
  });

  describe("Field integration", () => {
    it("renders label when label prop is provided", () => {
      render(
        <InputGroup label="Email address">
          <InputGroup.Input />
        </InputGroup>,
      );

      expect(screen.getByText("Email address")).toBeTruthy();
      // The input should be associated with the label
      expect(screen.getByLabelText("Email address")).toBeTruthy();
    });

    it("renders description when description prop is provided", () => {
      render(
        <InputGroup label="Email" description="We'll never share your email">
          <InputGroup.Input />
        </InputGroup>,
      );

      expect(screen.getByText("We'll never share your email")).toBeTruthy();
    });

    it("renders error message when error prop is provided with label", () => {
      render(
        <InputGroup
          label="Email"
          error={{ message: "Invalid email", match: true }}
        >
          <InputGroup.Input />
        </InputGroup>,
      );

      expect(screen.getByText("Invalid email")).toBeTruthy();
    });
  });
});
