import { CLASSES, FEATS, getBackground, getClass } from "@/data";
import { SKILL_MAP } from "@/engine/skills";
import { SOURCE_NAMES, type Skill } from "@/types";
import type { StepProps } from "./types";

export default function StepSkills({ draft, update }: StepProps) {
  const firstClass = getClass(draft.classes[0]?.classId);
  const background = getBackground(draft.backgroundId);
  const bgSkills = new Set(background?.skillProficiencies ?? []);

  const chosen = draft.classes[0]?.chosenSkills ?? [];
  const maxChoices = firstClass?.skillChoices ?? 0;

  const toggleClassSkill = (skill: Skill) => {
    const set = new Set(chosen);
    if (set.has(skill)) set.delete(skill);
    else if (set.size < maxChoices) set.add(skill);
    const copy = [...draft.classes];
    copy[0] = { ...copy[0], chosenSkills: [...set] };
    update({ classes: copy });
  };

  const toggleFeat = (id: string) => {
    const has = draft.featIds.includes(id);
    update({ featIds: has ? draft.featIds.filter((f) => f !== id) : [...draft.featIds, id] });
  };

  return (
    <div>
      <div className="panel-title">Skill Proficiencies</div>

      {background && bgSkills.size > 0 && (
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
          From <strong>{background.name}</strong> background:{" "}
          {[...bgSkills].map((s) => SKILL_MAP[s].name).join(", ")} (granted automatically).
        </p>
      )}

      {firstClass ? (
        <>
          <div className="row between" style={{ marginBottom: 8 }}>
            <strong>
              Choose {maxChoices} skill{maxChoices !== 1 ? "s" : ""} from {firstClass.name}
            </strong>
            <span className="tag">
              {chosen.length} / {maxChoices}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 8,
            }}
          >
            {firstClass.skillList.map((skill) => {
              const isBg = bgSkills.has(skill);
              const isChosen = chosen.includes(skill);
              return (
                <label
                  key={skill}
                  className="row"
                  style={{
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    background: isChosen ? "var(--bg-elevated)" : "var(--bg-panel-2)",
                    opacity: isBg ? 0.55 : 1,
                    cursor: isBg ? "not-allowed" : "pointer",
                    margin: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: "auto" }}
                    checked={isChosen || isBg}
                    disabled={isBg || (!isChosen && chosen.length >= maxChoices)}
                    onChange={() => toggleClassSkill(skill)}
                  />
                  <span>
                    {SKILL_MAP[skill].name}
                    <span className="faint" style={{ fontSize: 11 }}>
                      {" "}
                      ({SKILL_MAP[skill].ability})
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </>
      ) : (
        <p className="muted">Choose a class first to pick class skills.</p>
      )}

      <div className="scroll-divider" />

      <div className="panel-title">Feats</div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        Add any feats your character has taken (typically in place of an Ability Score Improvement, or
        from Variant Human / Custom Lineage at level 1).
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 8,
          maxHeight: 360,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {FEATS.map((feat) => {
          const checked = draft.featIds.includes(feat.id);
          return (
            <label
              key={feat.id}
              style={{
                padding: "9px 11px",
                border: `1px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                background: checked ? "var(--bg-elevated)" : "var(--bg-panel-2)",
                cursor: "pointer",
                margin: 0,
              }}
              title={feat.description}
            >
              <div className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={checked}
                  onChange={() => toggleFeat(feat.id)}
                />
                <span style={{ color: "var(--text)" }}>{feat.name}</span>
                <span className="tag tag-source" style={{ marginLeft: "auto" }}>
                  {feat.source}
                </span>
              </div>
              {feat.prerequisite && (
                <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
                  Requires: {feat.prerequisite}
                </div>
              )}
            </label>
          );
        })}
      </div>
      <div className="faint" style={{ fontSize: 11, marginTop: 8 }}>
        Sources include {Object.values(SOURCE_NAMES).slice(0, 4).join(", ")} and more. Half-feats'
        ability bonuses can be added in the Abilities step.
      </div>
      {/* keep CLASSES referenced for potential future multiclass skill UI */}
      <span style={{ display: "none" }}>{CLASSES.length}</span>
    </div>
  );
}
