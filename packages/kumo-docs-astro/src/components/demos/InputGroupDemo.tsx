import { useRef, useState } from "react";
import { InputGroup, Loader } from "@cloudflare/kumo";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  TagIcon,
  AirplaneTakeoffIcon,
  InfoIcon,
  SpinnerIcon,
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
          <LinkIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input
          placeholder="Paste a link..."
          aria-label="Link"
          {...demoInputProps}
        />
      </InputGroup>

      <InputGroup>
        <InputGroup.Input
          placeholder="Add a tag..."
          aria-label="Tag"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <TagIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup>
        <InputGroup.Addon>
          <AirplaneTakeoffIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input
          placeholder="IATA airport code (e.g. GRU, AMS)"
          aria-label="IATA airport code"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <InfoIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
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
          {...demoInputProps}
        />
      </InputGroup>

      <InputGroup>
        <InputGroup.Input
          placeholder="email"
          aria-label="Email"
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

/** Button variations: password toggle, inset button, and flush button */
export function InputGroupButtonsDemo() {
  const [show, setShow] = useState(false);

  return (
    <div className="flex w-xs flex-col gap-4">
      <InputGroup>
        <InputGroup.Input
          type={show ? "text" : "password"}
          defaultValue="password"
          aria-label="Password"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            variant="ghost"
            size="sm"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeSlashIcon size={14} /> : <EyeIcon size={14} />}
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup>
        <InputGroup.Input
          placeholder="Filter by name..."
          aria-label="Filter"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button variant="secondary">Apply</InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup>
        <InputGroup.Input
          placeholder="example.com"
          aria-label="Domain"
          {...demoInputProps}
        />
        <InputGroup.Button variant="primary">Submit</InputGroup.Button>
      </InputGroup>
    </div>
  );
}

/** Search input with keyboard shortcut hint */
export function InputGroupKbdDemo() {
  return (
    <InputGroup className="w-xs">
      <InputGroup.Addon>
        <MagnifyingGlassIcon className="text-kumo-subtle" />
      </InputGroup.Addon>
      <InputGroup.Input
        placeholder="Search..."
        aria-label="Search"
        {...demoInputProps}
      />
      <InputGroup.Addon align="end">
        <kbd className="rounded border border-kumo-line bg-kumo-recessed px-1.5 py-0.5 text-xs text-kumo-subtle">
          ⌘K
        </kbd>
      </InputGroup.Addon>
    </InputGroup>
  );
}

/** Loading variations: spinner at end, spinner at start, text + spinner at end */
export function InputGroupLoadingDemo() {
  return (
    <div className="flex w-xs flex-col gap-4">
      {/* Spinner at end */}
      <InputGroup>
        <InputGroup.Input
          placeholder="Searching..."
          aria-label="Searching"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <Loader />
        </InputGroup.Addon>
      </InputGroup>

      {/* Spinner at start */}
      <InputGroup>
        <InputGroup.Addon>
          <SpinnerIcon className="animate-spin" />
        </InputGroup.Addon>
        <InputGroup.Input
          placeholder="Thinking..."
          aria-label="Thinking"
          {...demoInputProps}
        />
      </InputGroup>

      {/* Text + spinner at end */}
      <InputGroup>
        <InputGroup.Input
          placeholder="Saving changes..."
          aria-label="Saving changes"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <span>Saving...</span>
          <Loader />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

/** Inline suffix that follows typed text — shows spinner then success icon on edit */
export function InputGroupSuffixDemo() {
  return <WorkersSuffixInput defaultValue="kumo" />;
}

/** Shared Workers suffix input with validation spinner and success icon */
function WorkersSuffixInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "loading" | "valid">("valid");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (next.length > 0) {
      setStatus("loading");
      timerRef.current = setTimeout(() => setStatus("valid"), 1500);
    } else {
      setStatus("idle");
    }
  };

  return (
    <InputGroup className="w-xs">
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
      {status === "valid" && (
        <InputGroup.Addon align="end">
          <CheckCircleIcon weight="duotone" className="text-kumo-brand" />
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
          <MagnifyingGlassIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Extra small input" {...demoInputProps} />
      </InputGroup>

      <InputGroup size="sm" label="Small">
        <InputGroup.Addon>
          <MagnifyingGlassIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Small input" {...demoInputProps} />
      </InputGroup>

      <InputGroup label="Base (default)">
        <InputGroup.Addon>
          <MagnifyingGlassIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Base input" {...demoInputProps} />
      </InputGroup>

      <InputGroup size="lg" label="Large">
        <InputGroup.Addon>
          <MagnifyingGlassIcon className="text-kumo-subtle" />
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
          <MagnifyingGlassIcon className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." {...demoInputProps} />
        <InputGroup.Button variant="primary">Search</InputGroup.Button>
      </InputGroup>

      <InputGroup
        label="With Description"
        description="Must be at least 8 characters"
        labelTooltip="Your password is stored securely"
      >
        <InputGroup.Input
          type={show ? "text" : "password"}
          placeholder="Enter password"
          {...demoInputProps}
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            variant="ghost"
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
