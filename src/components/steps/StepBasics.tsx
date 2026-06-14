import { RACES, BACKGROUNDS, getRace } from "@/data";
import { ALIGNMENTS } from "@/engine/rules";
import { SOURCE_NAMES } from "@/types";
import type { StepProps } from "./types";

export default function StepBasics({ draft, update }: StepProps) {
  const race = getRace(draft.raceId);
  const subraces = race?.subraces ?? [];
  const background = BACKGROUNDS.find((b) => b.id === draft.backgroundId);

  return (
    <div>
      <div className="panel-title">Identity</div>
      <div className="field">
        <label>Character Name</label>
        <input
          type="text"
          value={draft.name}
          placeholder="e.g. Vex'ahlia"
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Race</label>
          <select
            value={draft.raceId}
            onChange={(e) => update({ raceId: e.target.value, subraceId: undefined })}
          >
            <option value="">— Select a race —</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.source})
              </option>
            ))}
          </select>
        </div>
        {subraces.length > 0 && (
          <div className="field">
            <label>Subrace</label>
            <select
              value={draft.subraceId ?? ""}
              onChange={(e) => update({ subraceId: e.target.value || undefined })}
            >
              <option value="">— Select a subrace —</option>
              {subraces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label>Background</label>
          <select
            value={draft.backgroundId}
            onChange={(e) => update({ backgroundId: e.target.value })}
          >
            <option value="">— Select a background —</option>
            {BACKGROUNDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Alignment</label>
          <select value={draft.alignment ?? ""} onChange={(e) => update({ alignment: e.target.value })}>
            <option value="">— Optional —</option>
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {race && (
        <div className="card" style={{ background: "var(--bg-panel-2)", marginTop: 8 }}>
          <div className="row between">
            <h3 style={{ marginBottom: 4 }}>{race.name}</h3>
            <span className="tag tag-source">{SOURCE_NAMES[race.source]}</span>
          </div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            Size {race.size} · Speed {race.speed} ft
            {race.darkvision ? ` · Darkvision ${race.darkvision} ft` : ""}
          </div>
          <div className="stack">
            {[...race.traits, ...(draft.subraceId ? subraces.find((s) => s.id === draft.subraceId)?.traits ?? [] : [])].map(
              (t, i) => (
                <div key={i}>
                  <strong style={{ color: "var(--accent-2)" }}>{t.name}.</strong>{" "}
                  <span className="muted">{t.description}</span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {background && (
        <div className="card" style={{ background: "var(--bg-panel-2)", marginTop: 12 }}>
          <h3 style={{ marginBottom: 4 }}>{background.name}</h3>
          <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            Skill Proficiencies: {background.skillProficiencies.join(", ")}
            {background.toolProficiencies?.length
              ? ` · Tools: ${background.toolProficiencies.join(", ")}`
              : ""}
          </div>
          <div>
            <strong style={{ color: "var(--accent-2)" }}>{background.feature.name}.</strong>{" "}
            <span className="muted">{background.feature.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
