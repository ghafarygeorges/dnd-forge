import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCharacters } from "@/store/characters";
import { deriveCharacter } from "@/engine/derive";
import { getBackground, getFeat, getItem, getRace, getSpell, getSubrace } from "@/data";
import { ABILITIES, ABILITY_NAMES, SOURCE_NAMES } from "@/types";
import { SPELL_LEVEL_NAMES, formatModifier } from "@/engine/rules";
import type { Feature, Spell } from "@/types";
import ClassProgression from "@/components/ClassProgression";
import { downloadFilledSheet } from "@/engine/pdfExport";

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card" style={{ background: "var(--bg-panel-2)", textAlign: "center", padding: "12px 8px" }}>
      <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  );
}

function SpellRow({ spell }: { spell: Spell }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-panel-2)",
        marginBottom: 6,
      }}
    >
      <div
        className="row between"
        style={{ padding: "9px 12px", cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="row" style={{ gap: 8 }}>
          <strong>{spell.name}</strong>
          {spell.concentration && <span className="tag" style={{ fontSize: 10 }}>Conc.</span>}
          {spell.ritual && <span className="tag" style={{ fontSize: 10 }}>Ritual</span>}
        </div>
        <span className="faint" style={{ fontSize: 12 }}>
          {spell.school} · {spell.source}
        </span>
      </div>
      {open && (
        <div style={{ padding: "0 12px 12px", fontSize: 13 }}>
          <div className="muted" style={{ marginBottom: 6 }}>
            <strong>Casting Time:</strong> {spell.castingTime} · <strong>Range:</strong> {spell.range} ·{" "}
            <strong>Components:</strong> {spell.components} · <strong>Duration:</strong> {spell.duration}
          </div>
          <div>{spell.description}</div>
          {spell.higherLevels && (
            <div className="muted" style={{ marginTop: 6 }}>
              <strong>At Higher Levels:</strong> {spell.higherLevels}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CharacterSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get } = useCharacters();
  const character = id ? get(id) : undefined;
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!character) return;
    setExporting(true);
    try {
      await downloadFilledSheet(character);
    } catch (e) {
      alert("Could not generate the PDF: " + (e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  if (!character) {
    return (
      <div className="card">
        <h2>Character not found</h2>
        <Link to="/" className="btn">
          ← Back to list
        </Link>
      </div>
    );
  }

  const d = deriveCharacter(character);
  const race = getRace(character.raceId);
  const subrace = character.subraceId ? getSubrace(character.raceId, character.subraceId) : undefined;
  const background = getBackground(character.backgroundId);

  // Non-class features (race, subrace, background, feats) shown separately
  // from the level-by-level class progression.
  const traitFeatures: Feature[] = [];
  if (race) race.traits.forEach((t) => traitFeatures.push({ ...t, source: race.source }));
  if (subrace) subrace.traits.forEach((t) => traitFeatures.push({ ...t, source: race?.source }));
  if (background) traitFeatures.push(background.feature);
  character.featIds.forEach((id) => {
    const f = getFeat(id);
    if (f) traitFeatures.push({ name: f.name, description: f.description, source: f.source });
  });

  const cantrips = character.cantripIds.map(getSpell).filter(Boolean) as Spell[];
  const spells = character.preparedSpellIds.map(getSpell).filter(Boolean) as Spell[];
  const spellsByLevel: Record<number, Spell[]> = {};
  spells.forEach((s) => (spellsByLevel[s.level] ??= []).push(s));

  return (
    <div>
      {/* Header */}
      <div className="row between wrap" style={{ marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 2 }}>{character.name || "Unnamed Character"}</h1>
          <div className="muted">
            {race?.name}
            {subrace ? ` (${subrace.name})` : ""} ·{" "}
            {d.classes.map((c) => `${c.className} ${c.level}`).join(" / ")}
            {background ? ` · ${background.name}` : ""}
            {character.alignment ? ` · ${character.alignment}` : ""}
          </div>
        </div>
        <div className="row wrap">
          <button className="btn btn-primary" disabled={exporting} onClick={handleExport}>
            {exporting ? "Generating…" : "⬇ Export PDF"}
          </button>
          <Link to={`/edit/${character.id}`} className="btn">
            Edit / Level Up
          </Link>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            Done
          </button>
        </div>
      </div>

      {/* Core stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatBox label="Armor Class" value={d.armorClass} />
        <StatBox label="Max HP" value={d.maxHp} />
        <StatBox label="Speed" value={`${d.speed} ft`} />
        <StatBox label="Initiative" value={formatModifier(d.initiative)} />
        <StatBox label="Prof. Bonus" value={formatModifier(d.proficiencyBonus)} />
        <StatBox label="Passive Perc." value={d.passivePerception} />
      </div>

      <div className="sheet-grid">
        {/* LEFT COLUMN */}
        <div className="stack" style={{ gap: 18 }}>
          {/* Abilities */}
          <div className="card">
            <div className="panel-title">Ability Scores</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {ABILITIES.map((ab) => (
                <div
                  key={ab}
                  style={{
                    textAlign: "center",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 4px",
                    background: "var(--bg-panel-2)",
                  }}
                >
                  <div className="faint" style={{ fontSize: 10, textTransform: "uppercase" }}>
                    {ABILITY_NAMES[ab].slice(0, 3)}
                  </div>
                  <div style={{ fontSize: 22, fontFamily: "var(--font-display)" }}>
                    {formatModifier(d.abilityModifiers[ab])}
                  </div>
                  <div className="faint" style={{ fontSize: 12 }}>{d.abilityScores[ab]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Saving throws */}
          <div className="card">
            <div className="panel-title">Saving Throws</div>
            <div className="stack" style={{ gap: 4 }}>
              {ABILITIES.map((ab) => {
                const st = d.savingThrows[ab];
                return (
                  <div key={ab} className="row between" style={{ fontSize: 14 }}>
                    <span className="row" style={{ gap: 8 }}>
                      <span className={`dot ${st.proficient ? "on" : ""}`} />
                      {ABILITY_NAMES[ab]}
                    </span>
                    <strong>{formatModifier(st.modifier)}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div className="panel-title">Skills</div>
            <div className="stack" style={{ gap: 4 }}>
              {d.skills.map((s) => (
                <div key={s.key} className="row between" style={{ fontSize: 14 }}>
                  <span className="row" style={{ gap: 8 }}>
                    <span className={`dot ${s.expertise ? "expert" : s.proficient ? "on" : ""}`} />
                    {s.name}{" "}
                    <span className="faint" style={{ fontSize: 11 }}>
                      ({s.ability})
                    </span>
                  </span>
                  <strong>{formatModifier(s.modifier)}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Proficiencies */}
          <div className="card">
            <div className="panel-title">Proficiencies &amp; Languages</div>
            <ProfBlock label="Armor" items={d.proficiencies.armor} />
            <ProfBlock label="Weapons" items={d.proficiencies.weapons} />
            <ProfBlock label="Tools" items={d.proficiencies.tools} />
            <ProfBlock label="Languages" items={d.proficiencies.languages} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="stack" style={{ gap: 18 }}>
          {/* Attacks */}
          {d.attacks.length > 0 && (
            <div className="card">
              <div className="panel-title">Attacks</div>
              <div className="stack" style={{ gap: 4 }}>
                <div className="row between faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <span>Weapon</span>
                  <span className="row" style={{ gap: 24 }}>
                    <span>Atk</span>
                    <span>Damage</span>
                  </span>
                </div>
                {d.attacks.map((atk, i) => (
                  <div key={i} className="row between" style={{ fontSize: 14 }}>
                    <span>{atk.name}</span>
                    <span className="row" style={{ gap: 16 }}>
                      <strong style={{ minWidth: 34, textAlign: "right" }}>{atk.attack || "—"}</strong>
                      <span className="muted" style={{ minWidth: 110, textAlign: "right" }}>
                        {atk.damage || "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Spellcasting */}
          {d.spellcasting && (
            <div className="card">
              <div className="panel-title">Spellcasting</div>
              <div className="row wrap" style={{ gap: 10, marginBottom: 12 }}>
                <span className="tag">Ability: {ABILITY_NAMES[d.spellcasting.ability]}</span>
                <span className="tag">Save DC {d.spellcasting.saveDC}</span>
                <span className="tag">Attack {formatModifier(d.spellcasting.attackBonus)}</span>
              </div>
              {/* slots */}
              <div className="row wrap" style={{ gap: 6, marginBottom: 14 }}>
                {d.spellcasting.spellSlots.map((n, i) =>
                  n > 0 ? (
                    <span key={i} className="tag tag-source">
                      {SPELL_LEVEL_NAMES[i + 1]}: {n}
                    </span>
                  ) : null,
                )}
                {d.spellcasting.pactSlots && d.spellcasting.pactSlots.slots > 0 && (
                  <span className="tag tag-source">
                    Pact: {d.spellcasting.pactSlots.slots} × {SPELL_LEVEL_NAMES[d.spellcasting.pactSlots.level]}
                  </span>
                )}
              </div>

              {cantrips.length > 0 && (
                <>
                  <h4 style={{ margin: "8px 0 6px", color: "var(--text-dim)" }}>Cantrips</h4>
                  {cantrips.map((s) => (
                    <SpellRow key={s.id} spell={s} />
                  ))}
                </>
              )}
              {Object.keys(spellsByLevel)
                .map(Number)
                .sort((a, b) => a - b)
                .map((lvl) => (
                  <div key={lvl}>
                    <h4 style={{ margin: "10px 0 6px", color: "var(--text-dim)" }}>
                      {SPELL_LEVEL_NAMES[lvl]} Level
                    </h4>
                    {spellsByLevel[lvl].map((s) => (
                      <SpellRow key={s.id} spell={s} />
                    ))}
                  </div>
                ))}
              {cantrips.length === 0 && spells.length === 0 && (
                <p className="muted">No spells selected. Edit the character to add some.</p>
              )}
            </div>
          )}

          {/* Class Features by Level */}
          <div className="card">
            <ClassProgression classes={character.classes} />
          </div>

          {/* Racial Traits, Background & Feats */}
          <div className="card">
            <div className="panel-title">Traits &amp; Feats</div>
            <div className="stack" style={{ gap: 12 }}>
              {traitFeatures.map((f, i) => (
                <div key={i}>
                  <div className="row between">
                    <strong style={{ color: "var(--accent-2)" }}>{f.name}</strong>
                    {f.source && <span className="tag" style={{ fontSize: 10 }}>{f.source}</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{f.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="card">
            <div className="panel-title">Equipment</div>
            {character.equippedArmorId && (
              <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
                Wearing: <strong>{getItem(character.equippedArmorId)?.name}</strong>
                {character.hasShield ? " + Shield" : ""}
              </div>
            )}
            {character.inventory.length === 0 ? (
              <p className="muted">No items.</p>
            ) : (
              <div className="stack" style={{ gap: 5 }}>
                {character.inventory.map((inv, i) => {
                  const item = inv.itemId ? getItem(inv.itemId) : undefined;
                  return (
                    <div key={i} className="row between" style={{ fontSize: 14 }}>
                      <span>
                        {item?.name ?? inv.customName}
                        {item?.damage && (
                          <span className="faint" style={{ fontSize: 12 }}>
                            {" "}
                            — {item.damage} {item.damageType}
                          </span>
                        )}
                      </span>
                      <span className="muted">×{inv.quantity}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Backstory */}
          {(character.appearance || character.backstory) && (
            <div className="card">
              <div className="panel-title">Character</div>
              {character.appearance && (
                <p style={{ marginTop: 0 }}>
                  <strong className="muted">Appearance. </strong>
                  {character.appearance}
                </p>
              )}
              {character.backstory && (
                <p style={{ whiteSpace: "pre-wrap" }}>
                  <strong className="muted">Backstory. </strong>
                  {character.backstory}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {d.warnings.length > 0 && (
        <div className="card" style={{ marginTop: 18, borderColor: "var(--accent)" }}>
          {d.warnings.map((w, i) => (
            <div key={i} className="muted">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}
      <div className="faint" style={{ fontSize: 11, marginTop: 24, textAlign: "center" }}>
        Source content drawn from {Object.values(SOURCE_NAMES).slice(0, 7).join(", ")}. D&amp;D 5e (2014) rules.
      </div>
    </div>
  );
}

function ProfBlock({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontSize: 13 }}>{items.join(", ")}</div>
    </div>
  );
}
