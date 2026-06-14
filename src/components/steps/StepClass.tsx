import { CLASSES, getClass } from "@/data";
import { SOURCE_NAMES } from "@/types";
import type { CharacterClassChoice } from "@/types";
import type { StepProps } from "./types";
import ClassProgression from "@/components/ClassProgression";

export default function StepClass({ draft, update }: StepProps) {
  const setClasses = (classes: CharacterClassChoice[]) => update({ classes });

  const updateClass = (idx: number, patch: Partial<CharacterClassChoice>) => {
    const copy = [...draft.classes];
    copy[idx] = { ...copy[idx], ...patch };
    setClasses(copy);
  };

  const addClass = () => setClasses([...draft.classes, { classId: "", level: 1 }]);
  const removeClass = (idx: number) =>
    setClasses(draft.classes.filter((_, i) => i !== idx));

  const totalLevel = draft.classes.reduce((s, c) => s + c.level, 0);

  return (
    <div>
      <div className="row between">
        <div className="panel-title" style={{ border: "none", margin: 0 }}>
          Class &amp; Level
        </div>
        <span className="tag">Total Level {totalLevel}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        Set your class and level. Add a second class to multiclass. Raise the level here whenever
        your character levels up.
      </p>

      <div className="stack">
        {draft.classes.map((cl, idx) => {
          const def = getClass(cl.classId);
          const subclasses = def?.subclasses ?? [];
          const showSubclass = def && cl.level >= def.subclassLevel;
          return (
            <div key={idx} className="card" style={{ background: "var(--bg-panel-2)" }}>
              <div className="field-row" style={{ alignItems: "flex-end" }}>
                <div className="field" style={{ flex: 2 }}>
                  <label>{idx === 0 ? "Class" : `Class ${idx + 1}`}</label>
                  <select
                    value={cl.classId}
                    onChange={(e) => updateClass(idx, { classId: e.target.value, subclassId: undefined })}
                  >
                    <option value="">— Select —</option>
                    {CLASSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ flex: 1, minWidth: 90 }}>
                  <label>Level</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cl.level}
                    onChange={(e) =>
                      updateClass(idx, {
                        level: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                      })
                    }
                  />
                </div>
                {draft.classes.length > 1 && (
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ color: "var(--accent)", marginBottom: 16 }}
                    onClick={() => removeClass(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>

              {showSubclass && (
                <div className="field">
                  <label>
                    {def!.subclassLabel} (chosen at level {def!.subclassLevel})
                  </label>
                  <select
                    value={cl.subclassId ?? ""}
                    onChange={(e) => updateClass(idx, { subclassId: e.target.value || undefined })}
                  >
                    <option value="">— Select —</option>
                    {subclasses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.source})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {def && (
                <div className="muted" style={{ fontSize: 12.5 }}>
                  d{def.hitDie} Hit Die · Saves: {def.savingThrows.map((s) => s.toUpperCase()).join(", ")} ·{" "}
                  {def.caster !== "none" ? `${def.caster} caster` : "non-caster"} ·{" "}
                  <span className="tag-source">{SOURCE_NAMES[def.source]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={addClass}>
        + Add Multiclass
      </button>

      {draft.classes.some((c) => c.classId) && (
        <>
          <div className="scroll-divider" />
          <ClassProgression classes={draft.classes} />
        </>
      )}
    </div>
  );
}
