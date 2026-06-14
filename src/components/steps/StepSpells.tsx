import { useMemo, useState } from "react";
import { SPELLS, getClass, getSubclass } from "@/data";
import { SPELL_LEVEL_NAMES, abilityModifier } from "@/engine/rules";
import type { Ability, Spell } from "@/types";
import type { StepProps } from "./types";

interface CasterSource {
  classId: string;
  level: number;
  ability?: Ability;
  listId: string; // spell list to draw from (class id)
  isSubclass: boolean;
  cantripsKnown?: number[];
  spellsKnown?: number[];
  preparesSpells?: boolean;
  caster: string;
}

export default function StepSpells({ draft, update, derived }: StepProps) {
  const [search, setSearch] = useState("");

  // Caster sources: a class that casts, or a subclass that grants casting (EK/AT).
  const casterSources: CasterSource[] = draft.classes
    .map((cl) => {
      const def = getClass(cl.classId);
      if (!def) return null;
      if (def.caster !== "none") {
        return {
          classId: def.id,
          level: cl.level,
          ability: def.spellAbility,
          listId: def.id,
          isSubclass: false,
          cantripsKnown: def.cantripsKnown,
          spellsKnown: def.spellsKnown,
          preparesSpells: def.preparesSpells,
          caster: def.caster,
        };
      }
      if (cl.subclassId) {
        const sub = getSubclass(cl.classId, cl.subclassId);
        if (sub?.casting) {
          return {
            classId: def.id,
            level: cl.level,
            ability: sub.casting.ability,
            listId: sub.casting.spellList,
            isSubclass: true,
            caster: sub.casting.caster,
          };
        }
      }
      return null;
    })
    .filter(Boolean) as CasterSource[];

  const spellListIds = [...new Set(casterSources.map((s) => s.listId))];

  // Highest spell level available
  const maxSlotLevel = useMemo(() => {
    if (!derived?.spellcasting) return 0;
    let max = 0;
    derived.spellcasting.spellSlots.forEach((n, i) => {
      if (n > 0) max = i + 1;
    });
    if (derived.spellcasting.pactSlots) max = Math.max(max, derived.spellcasting.pactSlots.level);
    return max;
  }, [derived]);

  const available = useMemo(() => {
    return SPELLS.filter(
      (s) =>
        s.classes.some((c) => spellListIds.includes(c)) &&
        (s.level === 0 || s.level <= maxSlotLevel) &&
        (search === "" || s.name.toLowerCase().includes(search.toLowerCase())),
    );
  }, [spellListIds.join(","), maxSlotLevel, search]);

  const byLevel = useMemo(() => {
    const map: Record<number, Spell[]> = {};
    available.forEach((s) => {
      (map[s.level] ??= []).push(s);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [available]);

  const toggleCantrip = (id: string) => {
    const has = draft.cantripIds.includes(id);
    update({ cantripIds: has ? draft.cantripIds.filter((x) => x !== id) : [...draft.cantripIds, id] });
  };
  const toggleSpell = (id: string) => {
    const has = draft.preparedSpellIds.includes(id);
    update({
      preparedSpellIds: has
        ? draft.preparedSpellIds.filter((x) => x !== id)
        : [...draft.preparedSpellIds, id],
    });
  };

  // Recommended counts (hint only) from the highest-level caster source.
  const primary = [...casterSources].sort((a, b) => b.level - a.level)[0];
  let cantripHint = 0;
  let spellHint = 0;
  let knownLabel = "Spells known";
  if (primary && !primary.isSubclass) {
    cantripHint = primary.cantripsKnown?.[primary.level] ?? 0;
    if (primary.preparesSpells && primary.ability) {
      const effLevel =
        primary.caster === "half" || primary.caster === "artificer"
          ? Math.floor(primary.level / 2)
          : primary.level;
      spellHint = Math.max(1, abilityModifier(derived?.abilityScores[primary.ability] ?? 10) + effLevel);
      knownLabel = "Prepared";
    } else {
      spellHint = primary.spellsKnown?.[primary.level] ?? 0;
    }
  }

  const levels = Object.keys(byLevel)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div>
      <div className="panel-title">Spells</div>
      {derived?.spellcasting ? (
        <div className="row wrap" style={{ gap: 10, marginBottom: 12 }}>
          <span className="tag">Spell Save DC {derived.spellcasting.saveDC}</span>
          <span className="tag">Attack +{derived.spellcasting.attackBonus}</span>
          {cantripHint > 0 && (
            <span className="tag">
              Cantrips known: {draft.cantripIds.length}/{cantripHint}
            </span>
          )}
          {spellHint > 0 ? (
            <span className="tag">
              {knownLabel}: {draft.preparedSpellIds.length}/{spellHint}
            </span>
          ) : (
            <span className="tag">Spells chosen: {draft.preparedSpellIds.length}</span>
          )}
        </div>
      ) : (
        <p className="muted">This character has no spellcasting. Choose a caster class or a casting subclass (e.g. Eldritch Knight).</p>
      )}

      {primary?.isSubclass && (
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
          As an {getSubclass(primary.classId, draft.classes.find((c) => c.classId === primary.classId)?.subclassId ?? "")?.name ?? "subclass caster"},
          you learn a limited number of {getClass(primary.listId)?.name} spells (mostly from select schools). Pick the ones your character knows.
        </p>
      )}

      <div className="field" style={{ maxWidth: 300 }}>
        <input
          type="text"
          placeholder="Search spells…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {casterSources.length === 0 && <p className="muted">No spellcasting class selected.</p>}

      {levels.map((lvl) => (
        <div key={lvl} style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 8 }}>
            {SPELL_LEVEL_NAMES[lvl]}
            {lvl > 0 ? " Level" : "s"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 8,
            }}
          >
            {byLevel[lvl].map((spell) => {
              const isCantrip = spell.level === 0;
              const checked = isCantrip
                ? draft.cantripIds.includes(spell.id)
                : draft.preparedSpellIds.includes(spell.id);
              return (
                <label
                  key={spell.id}
                  title={spell.description}
                  style={{
                    padding: "9px 11px",
                    border: `1px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)",
                    background: checked ? "var(--bg-elevated)" : "var(--bg-panel-2)",
                    cursor: "pointer",
                    margin: 0,
                  }}
                >
                  <div className="row" style={{ gap: 8 }}>
                    <input
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={checked}
                      onChange={() => (isCantrip ? toggleCantrip(spell.id) : toggleSpell(spell.id))}
                    />
                    <span>{spell.name}</span>
                    {spell.concentration && (
                      <span className="tag" style={{ marginLeft: "auto", fontSize: 10 }}>
                        C
                      </span>
                    )}
                  </div>
                  <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>
                    {spell.school} · {spell.castingTime}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
