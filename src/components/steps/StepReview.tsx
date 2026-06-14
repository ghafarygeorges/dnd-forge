import { getBackground, getRace, getSubrace } from "@/data";
import { ABILITIES, ABILITY_NAMES } from "@/types";
import { formatModifier } from "@/engine/rules";
import type { StepProps } from "./types";

interface Props extends StepProps {
  onSave: () => void;
}

export default function StepReview({ draft, update, derived, onSave }: Props) {
  const race = getRace(draft.raceId);
  const subrace = draft.subraceId ? getSubrace(draft.raceId, draft.subraceId) : undefined;
  const background = getBackground(draft.backgroundId);

  return (
    <div>
      <div className="panel-title">Review</div>

      {!draft.name && (
        <div className="muted" style={{ color: "var(--accent)", marginBottom: 10 }}>
          ⚠ Your character has no name yet.
        </div>
      )}

      <div className="row wrap" style={{ gap: 10, marginBottom: 16 }}>
        <span className="tag">{race ? race.name : "No race"}{subrace ? ` (${subrace.name})` : ""}</span>
        <span className="tag">{background?.name ?? "No background"}</span>
        {derived?.classes.map((c) => (
          <span key={c.classId} className="tag tag-source">
            {c.className} {c.level}
            {c.subclassName ? ` — ${c.subclassName}` : ""}
          </span>
        ))}
        {derived && <span className="tag">Total Level {derived.totalLevel}</span>}
      </div>

      {derived && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {ABILITIES.map((ab) => (
            <div key={ab} className="card" style={{ background: "var(--bg-panel-2)", textAlign: "center", padding: 10 }}>
              <div className="faint" style={{ fontSize: 11 }}>{ABILITY_NAMES[ab].slice(0, 3).toUpperCase()}</div>
              <div style={{ fontSize: 24, fontFamily: "var(--font-display)" }}>{derived.abilityScores[ab]}</div>
              <div className="tag">{formatModifier(derived.abilityModifiers[ab])}</div>
            </div>
          ))}
        </div>
      )}

      {derived && (
        <div className="row wrap" style={{ gap: 10, marginBottom: 18 }}>
          <span className="tag">AC {derived.armorClass}</span>
          <span className="tag">HP {derived.maxHp}</span>
          <span className="tag">Speed {derived.speed} ft</span>
          <span className="tag">Initiative {formatModifier(derived.initiative)}</span>
          <span className="tag">Prof {formatModifier(derived.proficiencyBonus)}</span>
          <span className="tag">Passive Perception {derived.passivePerception}</span>
        </div>
      )}

      <div className="field">
        <label>Appearance</label>
        <textarea
          rows={2}
          value={draft.appearance ?? ""}
          onChange={(e) => update({ appearance: e.target.value })}
          placeholder="Looks, demeanor, distinguishing features…"
        />
      </div>
      <div className="field">
        <label>Backstory &amp; Notes</label>
        <textarea
          rows={4}
          value={draft.backstory ?? ""}
          onChange={(e) => update({ backstory: e.target.value })}
          placeholder="History, bonds, ideals, flaws…"
        />
      </div>

      {derived && derived.warnings.length > 0 && (
        <div className="muted" style={{ color: "var(--accent)" }}>
          {derived.warnings.map((w, i) => (
            <div key={i}>⚠ {w}</div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={onSave}>
        Save &amp; View Character Sheet
      </button>
    </div>
  );
}
