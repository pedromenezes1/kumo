import { useRef, useState } from "react";
import { InputGroup, Loader } from "@cloudflare/kumo";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  XIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  QuestionIcon,
} from "@phosphor-icons/react";

/** Common props to disable browser features in demo inputs */
const demoInputProps = {
  autoComplete: "off" as const,
  autoCorrect: "off" as const,
  autoCapitalize: "off" as const,
  spellCheck: false,
};

/** Workers URL with inline suffix — validates on edit with spinner then success */
export function InputGroupHeroDemo() {
  return <WorkersSuffixInput defaultValue="kumo" />;
}

/** Icon addons in various positions: start-only, end-only, and both */
export function InputGroupIconsDemo() {
  return (
    <div className="flex w-xs flex-col gap-4">
      <InputGroup>
        <InputGroup.Addon>
          <LinkIcon />
        </InputGroup.Addon>
        <InputGroup.Input
          placeholder="Paste a link..."
          aria-label="Link"
          {...demoInputProps}
        />
      </InputGroup>
    </div>
  );
}

/** Text labels and descriptions with Label and Description sub-components */
export function InputGroupTextDemo() {
  return (
    <div className="flex w-xs flex-col gap-4">
      <InputGroup>
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input
          placeholder="username"
          aria-label="Username"
          className="keeper-ignore"
          {...demoInputProps}
        />
      </InputGroup>

      <InputGroup>
        <InputGroup.Input
          placeholder="email"
          aria-label="Email"
          className="keeper-ignore"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
      </InputGroup>

      <InputGroup>
        <InputGroup.Addon>/api/</InputGroup.Addon>
        <InputGroup.Input
          placeholder="endpoint"
          aria-label="API path"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">.json</InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

/** Button variations: password toggle and clear */
export function InputGroupButtonsDemo() {
  const [show, setShow] = useState(false);
  const [searchValue, setSearchValue] = useState("search");

  return (
    <div className="flex w-xs flex-col gap-4">
      <InputGroup>
        <InputGroup.Input
          type={show ? "text" : "password"}
          defaultValue="password"
          aria-label="Password"
          className="keeper-ignore"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end" className="pr-1">
          <InputGroup.Button
            size="sm"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup>
        <InputGroup.Input
          value={searchValue}
          placeholder="Search"
          aria-label="Search"
          onChange={(e) => setSearchValue(e.target.value)}
          {...demoInputProps}
        />
        {searchValue && (
          <InputGroup.Addon align="end" className="pr-1">
            <InputGroup.Button
              size="sm"
              aria-label="Delete search"
              onClick={() => setSearchValue("")}
            >
              <XIcon size={16} />
            </InputGroup.Button>
          </InputGroup.Addon>
        )}
      </InputGroup>
    </div>
  );
}

/** Search input with a tooltip button — mirrors the "Query language help" pattern */
export function InputGroupTooltipButtonDemo() {
  return (
    <InputGroup className="w-xs">
      <InputGroup.Addon>
        <MagnifyingGlassIcon />
      </InputGroup.Addon>
      <InputGroup.Input
        placeholder="Search with query language..."
        aria-label="Search"
        {...demoInputProps}
      />
      <InputGroup.Addon align="end" className="pr-1">
        <InputGroup.Button
          size="sm"
          tooltip="Query language help"
          onClick={() => {}}
        >
          <QuestionIcon size={16} />
        </InputGroup.Button>
      </InputGroup.Addon>
    </InputGroup>
  );
}

/** Search input with keyboard shortcut hint */
export function InputGroupKbdDemo() {
  return (
    <InputGroup className="w-xs">
      <InputGroup.Addon>
        <MagnifyingGlassIcon />
      </InputGroup.Addon>
      <InputGroup.Input
        placeholder="Search..."
        aria-label="Search"
        {...demoInputProps}
      />
      <InputGroup.Addon align="end">
        <kbd className="!bg-none !border-none">⌘K</kbd>
      </InputGroup.Addon>
    </InputGroup>
  );
}

/** Loading variation: spinner at end for domain validation */
export function InputGroupLoadingDemo() {
  return (
    <div className="flex w-xs flex-col gap-4">
      {/* Spinner at end */}
      <InputGroup>
        <InputGroup.Input
          defaultValue="kumo"
          aria-label="kumo"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <Loader />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

/** Inline suffix that follows typed text — shows spinner then success/error icon on edit */
export function InputGroupSuffixDemo() {
  return (
    <div className="flex w-xs flex-col gap-4">
      <WorkersSuffixInput defaultValue="kumo" resultState="success" />
      <WorkersSuffixInput defaultValue="kumo" resultState="error" />
    </div>
  );
}

/** Shared Workers suffix input with validation spinner and success icon */
export function WorkersSuffixInput({
  defaultValue,
  resultState = "success",
  showLabel = true,
}: {
  defaultValue: string;
  resultState?: "success" | "error";
  showLabel?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(resultState);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (next.length > 0) {
      setStatus("loading");
      timerRef.current = setTimeout(() => setStatus(resultState), 1500);
    } else {
      setStatus("idle");
    }
  };

  const errorState =
    status === "error"
      ? { message: "This subdomain is unavailable", match: true as const }
      : undefined;

  return (
    <InputGroup
      className="w-xs"
      label={showLabel ? "Subdomain" : undefined}
      error={errorState}
    >
      <InputGroup.Input
        aria-label="Subdomain"
        maxLength={24}
        value={value}
        onChange={handleChange}
        {...demoInputProps}
      />
      <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
      {status === "loading" && (
        <InputGroup.Addon align="end">
          <Loader />
        </InputGroup.Addon>
      )}
      {status === "success" && (
        <InputGroup.Addon align="end">
          <CheckCircleIcon weight="duotone" className="text-kumo-success" />
        </InputGroup.Addon>
      )}
      {status === "error" && (
        <InputGroup.Addon align="end">
          <XCircleIcon weight="duotone" className="text-kumo-danger" />
        </InputGroup.Addon>
      )}
    </InputGroup>
  );
}

/** All four sizes with a label */
export function InputGroupSizesDemo() {
  return (
    <div className="flex w-xs flex-col gap-4">
      <InputGroup size="xs" label="Extra Small">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Extra small input" {...demoInputProps} />
      </InputGroup>

      <InputGroup size="sm" label="Small">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Small input" {...demoInputProps} />
      </InputGroup>

      <InputGroup label="Base (default)">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Base input" {...demoInputProps} />
      </InputGroup>

      <InputGroup size="lg" label="Large">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Large input" {...demoInputProps} />
      </InputGroup>
    </div>
  );
}

/** Various input states including error, disabled, and with description */
export function InputGroupStatesDemo() {
  const [show, setShow] = useState(false);

  return (
    <div className="flex w-xs flex-col gap-4">
      <InputGroup
        label="Error State"
        error={{ message: "Please enter a valid email address", match: true }}
      >
        <InputGroup.Input
          type="email"
          defaultValue="invalid-email"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
      </InputGroup>

      <InputGroup label="Disabled" disabled>
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." {...demoInputProps} />
      </InputGroup>

      <InputGroup
        label="With Description"
        description="Must be at least 8 characters"
        labelTooltip="Your password is stored securely"
      >
        <InputGroup.Input
          type={show ? "text" : "password"}
          placeholder="Enter password"
          className="keeper-ignore"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            size="sm"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeSlashIcon size={14} /> : <EyeIcon size={14} />}
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}
