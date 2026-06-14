import { ABILITIES, ABILITY_NAMES, type Ability } from "@/types";
import {
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  STANDARD_ARRAY,
  abilityModifier,
  formatModifier,
  pointBuyCost,
} from "@/engine/rules";
import { getClass, getRace, getSubrace } from "@/data";
import type { StepProps } from "./types";

export default function StepAbilities({ draft, update, derived }: StepProps) {
  const race = getRace(draft.raceId);
  const subrace = draft.subraceId ? getSubrace(draft.raceId, draft.subraceId) : undefined;

  const setBase = (ab: Ability, value: number) =>
    update({ baseAbilities: { ...draft.baseAbilities, [ab]: value } });
  const setAsi = (ab: Ability, value: number) =>
    update({ asiChoices: { ...draft.asiChoices, [ab]: Math.max(0, value) } });

  const pointsUsed = ABILITIES.reduce((s, ab) => s + pointBuyCost(draft.baseAbilities[ab]), 0);
  const pointsLeft = POINT_BUY_BUDGET - pointsUsed;

  // ASI slots earned across classes
  let asiSlots = 0;
  draft.classes.forEach((cl) => {
    const def = getClass(cl.classId);
    def?.features
      .filter((f) => f.name === "Ability Score Improvement" && (f.level ?? 99) <= cl.level)
      .forEach(() => (asiSlots += 1));
  });
  const asiBudget = asiSlots * 2;
  const asiUsed = ABILITIES.reduce((s, ab) => s + draft.asiChoices[ab], 0);

  const racialBonus = (ab: Ability) =>
    (race?.abilityScoreIncrease[ab] ?? 0) + (subrace?.abilityScoreIncrease[ab] ?? 0);

  return (
    <div>
      <div className="panel-title">Ability Scores</div>

      <div className="field-row" style={{ marginBottom: 18 }}>
        <div className="field" style={{ maxWidth: 240 }}>
          <label>Generation Method</label>
          <select
            value={draft.abilityMethod}
            onChange={(e) => update({ abilityMethod: e.target.value as any })}
          >
            <option value="pointbuy">Point Buy (27 points)</option>
            <option value="manual">Manual Entry</option>
          </select>
        </div>
        {draft.abilityMethod === "pointbuy" && (
          <div className="field" style={{ display: "flex", alignItems: "flex-end" }}>
            <div>
              <div className="muted" style={{ fontSize: 13 }}>Points Remaining</div>
              <div
                style={{
                  fontSize: 26,
                  fontFamily: "var(--font-display)",
                  color: pointsLeft < 0 ? "var(--accent)" : "var(--gold)",
                }}
              >
                {pointsLeft}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ marginLeft: 18, marginBottom: 6 }}
              onClick={() => {
                const next = { ...draft.baseAbilities };
                ABILITIES.forEach((ab, i) => (next[ab] = STANDARD_ARRAY[i]));
                update({ baseAbilities: next, abilityMethod: "manual" });
              }}
            >
              Fill Standard Array
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
        }}
      >
        {ABILITIES.map((ab) => {
          const base = draft.baseAbilities[ab];
          const total = derived?.abilityScores[ab] ?? base + racialBonus(ab) + draft.asiChoices[ab];
          const mod = abilityModifier(total);
          return (
            <div key={ab} className="card" style={{ background: "var(--bg-panel-2)", padding: 14 }}>
              <div className="row between">
                <strong style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
                  {ABILITY_NAMES[ab]}
                </strong>
                <span className="tag">{formatModifier(mod)}</span>
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontFamily: "var(--font-display)",
                  textAlign: "center",
                  margin: "6px 0",
                }}
              >
                {total}
              </div>
              {draft.abilityMethod === "pointbuy" ? (
                <div className="row between">
                  <button
                    className="btn btn-sm"
                    disabled={base <= POINT_BUY_MIN}
                    onClick={() => setBase(ab, base - 1)}
                  >
                    −
                  </button>
                  <span className="muted">base {base}</span>
                  <button
                    className="btn btn-sm"
                    disabled={base >= POINT_BUY_MAX || pointsLeft <= 0}
                    onClick={() => setBase(ab, base + 1)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={base}
                  onChange={(e) => setBase(ab, Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                />
              )}
              <div className="faint" style={{ fontSize: 11, marginTop: 6, textAlign: "center" }}>
                {racialBonus(ab) > 0 && `racial +${racialBonus(ab)} `}
                {draft.asiChoices[ab] > 0 && `· ASI +${draft.asiChoices[ab]}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ASI allocation */}
      {asiSlots > 0 && (
        <div className="card" style={{ marginTop: 18, background: "var(--bg-panel-2)" }}>
          <div className="row between">
            <h3 style={{ marginBottom: 2 }}>Ability Score Improvements</h3>
            <span className="tag">
              {asiUsed} / {asiBudget} points used
            </span>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
            You've earned {asiSlots} ASI{asiSlots > 1 ? "s" : ""} ({asiBudget} points). Distribute them
            below, or take feats in the next step instead (each feat replaces a +2).
          </p>
          <div className="field-row">
            {ABILITIES.map((ab) => (
              <div key={ab} className="field" style={{ minWidth: 110 }}>
                <label>{ABILITY_NAMES[ab]}</label>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => setAsi(ab, draft.asiChoices[ab] - 1)}>
                    −
                  </button>
                  <span style={{ minWidth: 22, textAlign: "center" }}>+{draft.asiChoices[ab]}</span>
                  <button
                    className="btn btn-sm"
                    disabled={asiUsed >= asiBudget}
                    onClick={() => setAsi(ab, draft.asiChoices[ab] + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
