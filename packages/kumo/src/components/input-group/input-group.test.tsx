import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputGroup } from "./input-group";
import { INPUT_GROUP_SIZE } from "./context";
import type { KumoInputSize } from "../input/input";

const MockIcon = (props: { size?: number }) => (
  <svg data-testid="mock-icon" data-size={props.size ?? "none"} />
);

describe("InputGroup", () => {
  describe("rendering", () => {
    it("renders input with addon", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Paste a link..." aria-label="Link" />
        </InputGroup>,
      );
      expect(screen.getByTestId("icon")).toBeTruthy();
      expect(screen.getByPlaceholderText("Paste a link...")).toBeTruthy();
    });

    it("renders input with button", () => {
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              aria-label="Show password"
              onClick={() => {}}
            >
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(
        screen.getByRole("button", { name: "Show password" }),
      ).toBeTruthy();
    });

    it("renders input with suffix", () => {
      render(
        <InputGroup label="Subdomain">
          <InputGroup.Input aria-label="Subdomain" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </InputGroup>,
      );
      expect(screen.getByRole("textbox")).toBeTruthy();
      expect(screen.getByText(".workers.dev")).toBeTruthy();
    });

    it("renders all sub-components together", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>/api/</InputGroup.Addon>
          <InputGroup.Input placeholder="endpoint" aria-label="API path" />
          <InputGroup.Addon align="end">.json</InputGroup.Addon>
        </InputGroup>,
      );
      expect(screen.getByText("/api/")).toBeTruthy();
      expect(screen.getByPlaceholderText("endpoint")).toBeTruthy();
      expect(screen.getByText(".json")).toBeTruthy();
    });
  });

  describe("addon positioning", () => {
    it("places start addon before input in DOM order", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );
      const addon = screen.getByText("@");
      const input = screen.getByRole("textbox");
      // Addon should come before input in document order
      expect(
        addon.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("places end addon after input in DOM order", () => {
      render(
        <InputGroup>
          <InputGroup.Input placeholder="email" aria-label="Email" />
          <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
        </InputGroup>,
      );
      const addon = screen.getByText("@example.com");
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
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
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
          <InputGroup.Input
            value=""
            placeholder="Search"
            aria-label="Search"
            onChange={handleChange}
          />
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
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              aria-label="Show password"
              onClick={handleClick}
            >
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Show password" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick on compact button inside addon", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input
            value="query"
            placeholder="Search"
            aria-label="Search"
            onChange={() => {}}
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              aria-label="Delete search"
              onClick={handleClick}
            >
              <svg data-testid="x-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Delete search" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("focuses input when clicking on container", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );

      const group = container.firstElementChild as HTMLElement;
      await user.click(group);
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    it("focuses input when clicking on div container (label prop)", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InputGroup label="Subdomain">
          <InputGroup.Input placeholder="my-worker" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </InputGroup>,
      );

      // The invisible label overlay inside the container delegates focus
      // to the input via native htmlFor. We click it directly because
      // happy-dom doesn't simulate CSS pointer-events-none on the suffix.
      const overlay = container.querySelector(
        "label[aria-hidden='true']",
      ) as HTMLElement;
      await user.click(overlay);
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    it("does not redirect focus to input when clicking a button", async () => {
      const user = userEvent.setup();
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              aria-label="Show password"
              onClick={() => {}}
            >
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      const button = screen.getByRole("button", { name: "Show password" });
      await user.click(button);
      expect(document.activeElement).toBe(button);
    });
  });

  describe("disabled state", () => {
    it("disables input when group is disabled", () => {
      render(
        <InputGroup label="Disabled" disabled>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup>,
      );
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <InputGroup label="Disabled" disabled>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." onChange={handleChange} />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("does not allow focus via click when disabled", () => {
      const { container } = render(
        <InputGroup label="Disabled" disabled>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup>,
      );

      const label = container.querySelector("[data-slot='input-group']");
      expect(label?.getAttribute("data-disabled")).toBe("");
      expect(label?.className).toContain("pointer-events-none");
    });
  });

  describe("error handling", () => {
    it("sets aria-invalid on input when error is present", () => {
      render(
        <InputGroup
          label="Error State"
          error={{ message: "Please enter a valid email address", match: true }}
        >
          <InputGroup.Input type="email" defaultValue="invalid-email" />
          <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      expect(input.getAttribute("aria-invalid")).toBe("true");
    });

    it("does not set aria-invalid when no error is present", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      expect(input.getAttribute("aria-invalid")).toBeFalsy();
    });
  });

  describe("size variants", () => {
    it("applies size to input", () => {
      const { rerender } = render(
        <InputGroup size="sm" label="Small">
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Small input" />
        </InputGroup>,
      );

      // Just verify it renders without error at different sizes
      expect(screen.getByRole("textbox")).toBeTruthy();

      rerender(
        <InputGroup size="lg" label="Large">
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Large input" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox")).toBeTruthy();
    });

    // Regression test: addon padding tokens must be static pl-/pr- strings
    // so Tailwind JIT can detect them. Dynamic "px-N".replace() broke xs/sm.
    it.each(["xs", "sm", "base", "lg"] as const)(
      "start addon has correct padding class for size %s",
      (size: KumoInputSize) => {
        const labels: Record<KumoInputSize, string> = {
          xs: "Extra Small",
          sm: "Small",
          base: "Base (default)",
          lg: "Large",
        };
        render(
          <InputGroup size={size} label={labels[size]}>
            <InputGroup.Addon>
              <svg data-testid="icon" />
            </InputGroup.Addon>
            <InputGroup.Input placeholder={`${labels[size]} input`} />
          </InputGroup>,
        );

        const addon = screen.getByTestId("icon").closest("[data-slot]")!;
        const expectedClass = INPUT_GROUP_SIZE[size].addonOuterStart;
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
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox", { name: "Username" })).toBeTruthy();
    });

    it("button inside addon remains accessible", () => {
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              aria-label="Show password"
              onClick={() => {}}
            >
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(
        screen.getByRole("button", { name: "Show password" }),
      ).toBeTruthy();
    });

    it("container is a <label> element when no label prop is provided", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );
      const label = container.querySelector("label[data-slot='input-group']");
      expect(label).toBeTruthy();
    });

    it("container is a <div> element when label prop is provided", () => {
      const { container } = render(
        <InputGroup label="Username">
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" />
        </InputGroup>,
      );
      const div = container.querySelector("div[data-slot='input-group']");
      expect(div).toBeTruthy();
      // Should NOT be a <label>
      const label = container.querySelector("label[data-slot='input-group']");
      expect(label).toBeFalsy();
    });

    it("does not produce nested labels when label prop is provided", () => {
      const { container } = render(
        <InputGroup label="Email">
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="you@example.com" />
        </InputGroup>,
      );
      // Field renders its own <label> for the field label text.
      // The container should be a <div>, not a <label>, so there are
      // no nested <label> elements (which is invalid HTML).
      const nestedLabels = container.querySelectorAll("label label");
      expect(nestedLabels.length).toBe(0);
    });
  });

  describe("Button", () => {
    it("derives aria-label from tooltip string", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>
            <svg data-testid="search-icon" />
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder="Search with query language..."
            aria-label="Search"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button size="sm" tooltip="Query language help">
              <svg data-testid="question-icon" />
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
          <InputGroup.Addon>
            <svg data-testid="search-icon" />
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder="Search with query language..."
            aria-label="Search"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              tooltip="Query language help"
              aria-label="Help"
            >
              <svg data-testid="question-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(screen.getByRole("button", { name: "Help" })).toBeTruthy();
    });

    it("renders icon component with context-derived size", () => {
      render(
        <InputGroup size="base">
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button icon={MockIcon} aria-label="Help" />
          </InputGroup.Addon>
        </InputGroup>,
      );

      const icon = screen.getByTestId("mock-icon");
      expect(icon.getAttribute("data-size")).toBe(
        String(INPUT_GROUP_SIZE.base.iconSize),
      );
    });

    it.each(["xs", "sm", "base", "lg"] as const)(
      "passes correct icon size for InputGroup size %s",
      (groupSize: KumoInputSize) => {
        render(
          <InputGroup size={groupSize}>
            <InputGroup.Input aria-label="Test" />
            <InputGroup.Addon align="end">
              <InputGroup.Button icon={MockIcon} aria-label="Help" />
            </InputGroup.Addon>
          </InputGroup>,
        );

        const icon = screen.getByTestId("mock-icon");
        expect(icon.getAttribute("data-size")).toBe(
          String(INPUT_GROUP_SIZE[groupSize].iconSize),
        );
      },
    );

    it("passes icon through unchanged when already a React element", () => {
      render(
        <InputGroup size="base">
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              icon={<svg data-testid="element-icon" data-size={42} />}
              aria-label="Help"
            />
          </InputGroup.Addon>
        </InputGroup>,
      );

      const icon = screen.getByTestId("element-icon");
      // Element should pass through with its original size, not the context size
      expect(icon.getAttribute("data-size")).toBe("42");
    });

    it("does not inject icon size outside InputGroup context", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<InputGroup.Button icon={MockIcon} aria-label="Help" />);

      const icon = screen.getByTestId("mock-icon");
      // Outside context, icon should render without a size prop
      expect(icon.getAttribute("data-size")).toBe("none");

      warnSpy.mockRestore();
    });
  });

  describe("context misuse warnings", () => {
    it("warns in development when sub-component used outside InputGroup", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<InputGroup.Input aria-label="Orphan" />);

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "<InputGroup.Input> must be used within <InputGroup>. Falling back to default values.",
      );

      warnSpy.mockRestore();
    });
  });

  describe("dev-mode warnings for misplaced props", () => {
    it("warns when InputGroup.Input receives size directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          {/* @ts-expect-error — size is omitted from InputGroupInputProps but can be passed at runtime */}
          <InputGroup.Input size="sm" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Set `size` on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Input receives disabled directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input disabled aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Set `disabled` on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Input receives label directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          {/* @ts-expect-error — label is omitted from InputGroupInputProps but can be passed at runtime */}
          <InputGroup.Input label="Email" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Use the `label` prop on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Input receives description directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          {/* @ts-expect-error — description is omitted from InputGroupInputProps but can be passed at runtime */}
          <InputGroup.Input description="Help text" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Use <InputGroup.Suffix> instead of passing `description` to <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn for misplaced props when Input is used standalone (no context)", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<InputGroup.Input disabled aria-label="Standalone" />);

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      // Should warn about being outside InputGroup, but NOT about disabled being misplaced
      expect(calls).not.toContain(
        "InputGroup.Input: Set `disabled` on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn when no misplaced props are present", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input placeholder="Normal usage" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      const misplacedWarnings = calls.filter((msg: string) =>
        msg.startsWith("InputGroup.Input:"),
      );
      expect(misplacedWarnings).toHaveLength(0);

      warnSpy.mockRestore();
    });
  });

  describe("stratus backward compatibility", () => {
    it("supports legacy search bar pattern with Label", () => {
      render(
        <InputGroup className="bg-kumo-base flex-1">
          <InputGroup.Label>
            <svg data-testid="search-icon" />
          </InputGroup.Label>
          <InputGroup.Input placeholder="Search..." aria-label="Search" />
        </InputGroup>,
      );
      expect(screen.getByTestId("search-icon")).toBeTruthy();
      expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
    });

    it("supports legacy Description pattern for domain suffix", () => {
      render(
        <InputGroup>
          <InputGroup.Input placeholder="subdomain" aria-label="Subdomain" />
          <InputGroup.Description>.example.com</InputGroup.Description>
        </InputGroup>,
      );
      expect(screen.getByText(".example.com")).toBeTruthy();
    });

    it("allows Button variant override", () => {
      const onClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Value" />
          <InputGroup.Button variant="secondary" onClick={onClick}>
            Action
          </InputGroup.Button>
        </InputGroup>,
      );
      fireEvent.click(screen.getByText("Action"));
      expect(onClick).toHaveBeenCalled();
    });

    it("supports pagination pattern with focusMode individual", () => {
      render(
        <InputGroup focusMode="individual">
          <InputGroup.Button variant="secondary" aria-label="Previous">
            Prev
          </InputGroup.Button>
          <InputGroup.Input style={{ width: 50 }} aria-label="Page" />
          <InputGroup.Button variant="secondary" aria-label="Next">
            Next
          </InputGroup.Button>
        </InputGroup>,
      );
      expect(screen.getByLabelText("Previous")).toBeTruthy();
      expect(screen.getByLabelText("Page")).toBeTruthy();
      expect(screen.getByLabelText("Next")).toBeTruthy();
    });

    it("forwards ref on InputGroup.Input", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <InputGroup>
          <InputGroup.Input ref={ref} aria-label="Search" />
        </InputGroup>,
      );
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("allows explicit id on InputGroup.Input", () => {
      render(
        <InputGroup>
          <InputGroup.Input id="my-custom-id" aria-label="Custom" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox").id).toBe("my-custom-id");
    });

    it("renders Button as direct child without Addon wrapper", () => {
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Value" />
          <InputGroup.Button aria-label="Toggle">Toggle</InputGroup.Button>
        </InputGroup>,
      );
      expect(screen.getByLabelText("Toggle")).toBeTruthy();
    });
  });

  describe("Field integration", () => {
    it("renders label when label prop is provided", () => {
      render(
        <InputGroup size="sm" label="Small">
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Small input" />
        </InputGroup>,
      );

      expect(screen.getByText("Small")).toBeTruthy();
      // The input should be associated with the label
      expect(screen.getByLabelText("Small")).toBeTruthy();
    });

    it("renders description when description prop is provided", () => {
      render(
        <InputGroup
          label="With Description"
          description="Must be at least 8 characters"
          labelTooltip="Your password is stored securely"
        >
          <InputGroup.Input type="password" placeholder="Enter password" />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              size="sm"
              aria-label="Show password"
              onClick={() => {}}
            >
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(screen.getByText("Must be at least 8 characters")).toBeTruthy();
    });

    it("renders error message when error prop is provided with label", () => {
      render(
        <InputGroup
          label="Error State"
          error={{
            message: "Please enter a valid email address",
            match: true,
          }}
        >
          <InputGroup.Input type="email" defaultValue="invalid-email" />
          <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
        </InputGroup>,
      );

      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeTruthy();
    });
  });
});
