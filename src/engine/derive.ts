import type {
  Ability,
  AbilityScores,
  Character,
  Feature,
  Skill,
} from "@/types";
import { ABILITIES } from "@/types";
import {
  abilityModifier,
  averageHpPerLevel,
  pactMagicForLevel,
  proficiencyBonus,
  spellSlotsForLevels,
} from "./rules";
import { SKILL_MAP } from "./skills";
import { getAttacks, type AttackInfo } from "./weapons";
import {
  getBackground,
  getClass,
  getFeat,
  getRace,
  getSubclass,
  getSubrace,
} from "@/data";

export interface DerivedSkill {
  key: Skill;
  name: string;
  ability: Ability;
  modifier: number;
  proficient: boolean;
  expertise: boolean;
}

export interface DerivedClass {
  classId: string;
  className: string;
  level: number;
  subclassName?: string;
  hitDie: number;
}

export interface SpellcastingInfo {
  ability: Ability;
  saveDC: number;
  attackBonus: number;
  spellSlots: number[]; // index 0 = 1st level
  pactSlots?: { slots: number; level: number };
}

export interface DerivedCharacter {
  totalLevel: number;
  proficiencyBonus: number;
  abilityScores: AbilityScores;
  abilityModifiers: Record<Ability, number>;
  savingThrows: Record<Ability, { modifier: number; proficient: boolean }>;
  skills: DerivedSkill[];
  passivePerception: number;
  initiative: number;
  armorClass: number;
  maxHp: number;
  hitDice: Record<number, number>; // hitDie size -> count
  speed: number;
  classes: DerivedClass[];
  features: Feature[];
  attacks: AttackInfo[];
  spellcasting?: SpellcastingInfo;
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
    savingThrows: Ability[];
  };
  warnings: string[];
}

/** Sum partial ability score maps onto a base. */
function addAbilities(
  base: AbilityScores,
  ...adds: (Partial<AbilityScores> | undefined)[]
): AbilityScores {
  const out: AbilityScores = { ...base };
  for (const add of adds) {
    if (!add) continue;
    for (const ab of ABILITIES) {
      if (add[ab]) out[ab] += add[ab]!;
    }
  }
  return out;
}

export function deriveCharacter(c: Character): DerivedCharacter {
  const warnings: string[] = [];
  const totalLevel = c.classes.reduce((s, cl) => s + cl.level, 0) || 1;
  const pb = proficiencyBonus(totalLevel);

  const race = getRace(c.raceId);
  const subrace = c.subraceId ? getSubrace(c.raceId, c.subraceId) : undefined;
  const background = getBackground(c.backgroundId);

  // ----- Ability scores -----
  let abilityScores = addAbilities(
    c.baseAbilities,
    race?.abilityScoreIncrease,
    subrace?.abilityScoreIncrease,
    c.asiChoices,
  );
  // Feats that grant ability increases
  for (const fid of c.featIds) {
    const feat = getFeat(fid);
    // ability increases from feats are stored in asiChoices to keep it simple
    void feat;
  }
  const abilityModifiers = ABILITIES.reduce((acc, ab) => {
    acc[ab] = abilityModifier(abilityScores[ab]);
    return acc;
  }, {} as Record<Ability, number>);

  // ----- Saving throws (from first class primarily; multiclass keeps each) -----
  const saveProficient = new Set<Ability>();
  c.classes.forEach((cl, idx) => {
    const def = getClass(cl.classId);
    if (!def) return;
    if (idx === 0) def.savingThrows.forEach((s) => saveProficient.add(s));
  });
  const savingThrows = ABILITIES.reduce((acc, ab) => {
    const prof = saveProficient.has(ab);
    acc[ab] = {
      proficient: prof,
      modifier: abilityModifiers[ab] + (prof ? pb : 0),
    };
    return acc;
  }, {} as Record<Ability, { modifier: number; proficient: boolean }>);

  // ----- Skills -----
  const profSet = new Set<Skill>(c.skillProficiencies);
  if (background) background.skillProficiencies.forEach((s) => profSet.add(s));
  c.classes.forEach((cl) => cl.chosenSkills?.forEach((s) => profSet.add(s)));
  const expSet = new Set<Skill>(c.expertise ?? []);

  const skills: DerivedSkill[] = (Object.keys(SKILL_MAP) as Skill[]).map((key) => {
    const def = SKILL_MAP[key];
    const proficient = profSet.has(key);
    const expertise = expSet.has(key);
    const mult = expertise ? 2 : proficient ? 1 : 0;
    return {
      key,
      name: def.name,
      ability: def.ability,
      proficient,
      expertise,
      modifier: abilityModifiers[def.ability] + pb * mult,
    };
  });

  const perception = skills.find((s) => s.key === "perception")!;
  const passivePerception = 10 + perception.modifier;

  // ----- Classes / features / hit dice -----
  const derivedClasses: DerivedClass[] = [];
  const features: Feature[] = [];
  const hitDice: Record<number, number> = {};
  const armor = new Set<string>();
  const weapons = new Set<string>();
  const tools = new Set<string>();
  const languages = new Set<string>(c.languages ?? []);

  // race contributions
  if (race) {
    race.languages.forEach((l) => languages.add(l));
    race.traits.forEach((t) => features.push({ ...t, source: race.source }));
  }
  if (subrace) {
    subrace.languages?.forEach((l) => languages.add(l));
    subrace.traits.forEach((t) => features.push(t));
  }
  if (background) {
    background.toolProficiencies?.forEach((t) => tools.add(t));
    features.push(background.feature);
  }

  let firstClass = true;
  for (const cl of c.classes) {
    const def = getClass(cl.classId);
    if (!def) {
      warnings.push(`Unknown class: ${cl.classId}`);
      continue;
    }
    hitDice[def.hitDie] = (hitDice[def.hitDie] ?? 0) + cl.level;
    const subclass = cl.subclassId ? getSubclass(cl.classId, cl.subclassId) : undefined;
    derivedClasses.push({
      classId: def.id,
      className: def.name,
      level: cl.level,
      subclassName: subclass?.name,
      hitDie: def.hitDie,
    });
    // proficiencies (multiclass grants a subset, but we keep it simple/inclusive)
    def.armorProficiencies.forEach((a) => armor.add(a));
    def.weaponProficiencies.forEach((w) => weapons.add(w));
    def.toolProficiencies?.forEach((t) => tools.add(t));
    // class features up to level
    def.features
      .filter((f) => (f.level ?? 1) <= cl.level)
      .forEach((f) => features.push({ ...f, source: def.source }));
    if (subclass) {
      subclass.features
        .filter((f) => (f.level ?? 1) <= cl.level)
        .forEach((f) => features.push({ ...f, source: subclass.source }));
    }
    firstClass = false;
  }
  void firstClass;

  // feats as features
  for (const fid of c.featIds) {
    const feat = getFeat(fid);
    if (feat) features.push({ name: feat.name, description: feat.description, source: feat.source });
  }

  // ----- HP -----
  let maxHp: number;
  if (c.maxHpOverride != null) {
    maxHp = c.maxHpOverride;
  } else {
    // first class hit die max at level 1, average thereafter
    const conMod = abilityModifiers.con;
    let hp = 0;
    let levelsCounted = 0;
    c.classes.forEach((cl, idx) => {
      const def = getClass(cl.classId);
      if (!def) return;
      for (let i = 0; i < cl.level; i++) {
        if (idx === 0 && i === 0) {
          hp += def.hitDie + conMod; // max at first level
        } else {
          hp += averageHpPerLevel(def.hitDie) + conMod;
        }
        levelsCounted++;
      }
    });
    if (levelsCounted === 0) hp = 8 + conMod;
    maxHp = Math.max(1, Math.floor(hp));
  }

  // ----- AC -----
  const dexMod = abilityModifiers.dex;
  let armorClass = 10 + dexMod; // unarmored
  const equippedArmor = c.equippedArmorId ? getItemArmor(c.equippedArmorId) : undefined;
  if (equippedArmor) {
    if (equippedArmor.addDex) {
      const dexBonus =
        equippedArmor.maxDexBonus != null
          ? Math.min(dexMod, equippedArmor.maxDexBonus)
          : dexMod;
      armorClass = (equippedArmor.armorClass ?? 10) + dexBonus;
    } else {
      armorClass = equippedArmor.armorClass ?? 10;
    }
  }
  if (c.hasShield) armorClass += 2;

  // ----- Speed -----
  const speed = subrace?.speed ?? race?.speed ?? 30;

  // ----- Spellcasting -----
  let spellcasting: SpellcastingInfo | undefined;
  const casterContribs = c.classes
    .map((cl) => {
      const def = getClass(cl.classId);
      if (!def) return null;
      // Subclass-granted casting (Eldritch Knight, Arcane Trickster) when the
      // base class itself isn't a caster.
      if (def.caster === "none" && cl.subclassId) {
        const sub = getSubclass(cl.classId, cl.subclassId);
        if (sub?.casting) {
          return { caster: sub.casting.caster, level: cl.level, ability: sub.casting.ability };
        }
      }
      return { caster: def.caster, level: cl.level, ability: def.spellAbility };
    })
    .filter(Boolean) as { caster: any; level: number; ability?: Ability }[];

  const realCasters = casterContribs.filter((c) => c.caster !== "none" && c.ability);
  if (realCasters.length > 0) {
    // pick highest-level caster's ability as the headline; pact handled separately
    const primary = [...realCasters].sort((a, b) => b.level - a.level)[0];
    const ability = primary.ability!;
    const slots = spellSlotsForLevels(
      casterContribs.map((c) => ({ caster: c.caster, level: c.level })),
    );
    const warlock = casterContribs.find((c) => c.caster === "pact");
    spellcasting = {
      ability,
      saveDC: 8 + pb + abilityModifiers[ability],
      attackBonus: pb + abilityModifiers[ability],
      spellSlots: slots,
      pactSlots: warlock ? pactMagicForLevel(warlock.level) : undefined,
    };
  }

  return {
    totalLevel,
    proficiencyBonus: pb,
    abilityScores,
    abilityModifiers,
    savingThrows,
    skills,
    passivePerception,
    initiative: dexMod,
    armorClass,
    maxHp,
    hitDice,
    speed,
    classes: derivedClasses,
    features,
    attacks: getAttacks(c, abilityModifiers, pb),
    spellcasting,
    proficiencies: {
      armor: [...armor],
      weapons: [...weapons],
      tools: [...tools],
      languages: [...languages],
      savingThrows: [...saveProficient],
    },
    warnings,
  };
}

// local import to avoid circular type issues
import { getItem } from "@/data";
function getItemArmor(id: string) {
  const item = getItem(id);
  if (item && (item.type === "armor" || item.type === "shield")) return item;
  return undefined;
}
