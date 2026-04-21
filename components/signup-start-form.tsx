"use client";

import { useMemo, useState } from "react";

/**
 * Step 1 of sign-up. A client form so we can validate the .edu requirement
 * inline without a round-trip - "I'm a College student" + non-.edu email
 * is the single most common sign-up footgun, worth catching immediately.
 *
 * The server action (handleStart) still runs on submit. This form just
 * gatekeeps the submit button until the input is valid.
 */
export function SignupStartForm({
  action,
  next,
  defaultName = "",
  defaultEmail = "",
  defaultUserType = "general",
}: {
  action: (formData: FormData) => Promise<void> | void;
  next: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultUserType?: "student" | "general";
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [userType, setUserType] = useState<"student" | "general">(
    defaultUserType,
  );

  const emailError = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return null;
    // Only the student path has a hard rule
    if (userType === "student" && !/\.edu\s*$/.test(trimmed)) {
      return ".edu required - students sign up with their school email.";
    }
    // Basic shape check - not a fortress, just don't waste a round-trip
    if (trimmed && (!trimmed.includes("@") || !trimmed.includes(".")))
      return "That doesn't look like an email yet.";
    return null;
  }, [email, userType]);

  const nameOk = name.trim().length > 0;
  const emailOk = email.trim().length > 0 && !emailError;
  const canSubmit = nameOk && emailOk;

  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="next" value={next} />

      <Field
        name="name"
        type="text"
        label="Your name"
        placeholder="Alex Kim"
        autoComplete="name"
        value={name}
        onChange={setName}
        required
      />

      <Field
        name="email"
        type="email"
        label="Email"
        placeholder={userType === "student" ? "you@school.edu" : "you@example.com"}
        autoComplete="email"
        value={email}
        onChange={setEmail}
        required
        error={emailError}
      />

      <fieldset className="rounded-xl border border-[color:var(--color-border)] bg-white p-4">
        <legend className="eyebrow px-1">I&apos;m a</legend>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <RadioTile
            selected={userType === "student"}
            onSelect={() => setUserType("student")}
            label="College student"
            sub=".edu email required"
          />
          <RadioTile
            selected={userType === "general"}
            onSelect={() => setUserType("general")}
            label="Anyone else"
            sub="Any email works"
          />
        </div>
      </fieldset>

      {/* Hidden inputs forward state to the server action */}
      <input type="hidden" name="user_type" value={userType} />

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue →
      </button>
    </form>
  );
}

function Field({
  name,
  type,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  required,
  error,
}: {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={
          "mt-2 w-full rounded-lg border bg-white px-3.5 py-3 text-base text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent)] " +
          (error
            ? "border-[color:var(--color-red)] bg-[color:var(--color-red-bg)]/30"
            : "border-[color:var(--color-border)]")
        }
      />
      {error && (
        <span className="mt-1.5 block text-xs font-medium text-[color:var(--color-red)]">
          {error}
        </span>
      )}
    </label>
  );
}

function RadioTile({
  selected,
  onSelect,
  label,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={
        "flex items-center gap-3 rounded-lg border p-3.5 text-left transition " +
        (selected
          ? "border-[color:var(--color-accent)] bg-[color:var(--color-lavender)] ring-2 ring-[color:var(--color-accent)]/20"
          : "border-[color:var(--color-border)] bg-white hover:border-[color:var(--color-border-strong)]")
      }
    >
      <span
        aria-hidden
        className={
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition " +
          (selected
            ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]"
            : "border-[color:var(--color-border-strong)]")
        }
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[color:var(--color-text)]">
          {label}
        </span>
        <span className="block text-xs text-[color:var(--color-muted)]">{sub}</span>
      </span>
    </button>
  );
}
