import { getClass } from "@/data";
import { classFeaturesByLevel } from "@/engine/progression";
import type { CharacterClassChoice } from "@/types";

interface Props {
  classes: CharacterClassChoice[];
  /** Hide the section title (when embedded under another heading). */
  hideTitle?: boolean;
}

/**
 * Shows the features/abilities a character gains at each class level, grouped
 * by level. Used in the creation wizard and on the character sheet.
 */
export default function ClassProgression({ classes, hideTitle }: Props) {
  const real = classes.filter((c) => c.classId);
  if (real.length === 0) return null;
  const multiclass = real.length > 1;

  return (
    <div>
      {!hideTitle && <div className="panel-title">Class Features by Level</div>}
      {real.map((cl, idx) => {
        const def = getClass(cl.classId);
        if (!def) return null;
        const groups = classFeaturesByLevel(cl.classId, cl.subclassId, cl.level);
        return (
          <div key={idx} style={{ marginBottom: multiclass ? 18 : 0 }}>
            {multiclass && (
              <h4 style={{ marginBottom: 8, color: "var(--text-dim)" }}>
                {def.name} {cl.level}
              </h4>
            )}
            <div className="stack" style={{ gap: 10 }}>
              {groups.map((g) => (
                <div key={g.level} className="level-row">
                  <div className="level-badge">Lv {g.level}</div>
                  <div className="stack" style={{ gap: 7 }}>
                    {g.features.map((f, i) => (
                      <div key={i}>
                        <strong style={{ color: "var(--accent-2)" }}>{f.name}.</strong>{" "}
                        <span className="muted" style={{ fontSize: 13.5 }}>
                          {f.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
