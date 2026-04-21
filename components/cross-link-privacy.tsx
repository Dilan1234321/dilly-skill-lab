"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Two privacy toggles that govern how Skill Lab and the Dilly career
 * profile talk to each other. Both persist via PATCH /profile on the
 * Dilly backend, keyed into profile_json.web_profile_settings so they
 * sync across every Dilly surface.
 *
 * Toggles default ON - the ecosystem is seamless out of the box. Users
 * who want to silo their profiles can turn either off.
 */
export function CrossLinkPrivacy({
  initialShowCareer,
  initialShowLearning,
}: {
  initialShowCareer: boolean;
  initialShowLearning: boolean;
}) {
  const [showCareer, setShowCareer] = useState(initialShowCareer);
  const [showLearning, setShowLearning] = useState(initialShowLearning);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function save(next: { showCareer: boolean; showLearning: boolean }) {
    setErr(null);
    const res = await fetch("/api/profile-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        skills_show_career: next.showCareer,
        skills_show_learning: next.showLearning,
      }),
    });
    if (!res.ok) {
      setErr("Couldn't save. Try again.");
      return false;
    }
    startTransition(() => router.refresh());
    return true;
  }

  async function onToggle(which: "career" | "learning", value: boolean) {
    // Optimistic UI
    if (which === "career") setShowCareer(value);
    else setShowLearning(value);

    const next = {
      showCareer: which === "career" ? value : showCareer,
      showLearning: which === "learning" ? value : showLearning,
    };
    const ok = await save(next);
    if (!ok) {
      // Revert
      if (which === "career") setShowCareer(!value);
      else setShowLearning(!value);
    }
  }

  return (
    <div className="space-y-3">
      <ToggleRow
        label="Show my career profile on Skill Lab"
        sub="Viewers of your Skill Lab profile see your goals + target role."
        checked={showCareer}
        onChange={(v) => onToggle("career", v)}
      />
      <ToggleRow
        label="Show my Skill Lab learning on my career profile"
        sub="Dilly recruiters and career-profile viewers see your verified receipts."
        checked={showLearning}
        onChange={(v) => onToggle("learning", v)}
      />
      {err && <div className="text-xs text-[color:var(--color-red)]">{err}</div>}
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-3.5 transition hover:border-[color:var(--color-border-strong)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 flex-shrink-0 accent-[color:var(--color-accent)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[color:var(--color-text)]">
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[color:var(--color-muted)]">
          {sub}
        </span>
      </span>
    </label>
  );
}
