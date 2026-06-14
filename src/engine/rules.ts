import type { Ability, CasterType } from "@/types";

/** Ability modifier from a score: floor((score - 10) / 2). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Proficiency bonus by total character level (1-20). */
export function proficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

// ---------- Point Buy ----------
// Standard 5e point buy: 27 points, scores 8-15.
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function pointBuyCost(score: number): number {
  return POINT_BUY_COST[score] ?? 0;
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// ---------- Spell slots ----------
// Full-caster slot table by spellcaster level (index = caster level, 1-20).
// Each entry is slots for spell levels 1..9.
const FULL_CASTER_SLOTS: number[][] = [
  [], // 0
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

// Warlock Pact Magic: [slotCount, slotLevel] by warlock level.
const PACT_MAGIC: { slots: number; level: number }[] = [
  { slots: 0, level: 0 }, // 0
  { slots: 1, level: 1 },
  { slots: 2, level: 1 },
  { slots: 2, level: 2 },
  { slots: 2, level: 2 },
  { slots: 2, level: 3 },
  { slots: 2, level: 3 },
  { slots: 2, level: 4 },
  { slots: 2, level: 4 },
  { slots: 2, level: 5 },
  { slots: 2, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
];

/**
 * Compute effective caster level for multiclassing.
 * Full casters add full level, half casters half (rounded down, but
 * half-caster level 1 contributes 0 except for paladin/ranger which start
 * spellcasting at level 2), third casters a third.
 */
export function spellSlotsForLevels(
  contributions: { caster: CasterType; level: number }[],
): number[] {
  let casterLevel = 0;
  let warlockLevel = 0;
  for (const c of contributions) {
    if (c.caster === "full") casterLevel += c.level;
    else if (c.caster === "half") casterLevel += Math.floor(c.level / 2);
    // Artificer rounds UP and gains a slot at level 1.
    else if (c.caster === "artificer") casterLevel += Math.ceil(c.level / 2);
    else if (c.caster === "third") casterLevel += Math.floor(c.level / 3);
    else if (c.caster === "pact") warlockLevel += c.level;
  }
  casterLevel = Math.min(casterLevel, 20);
  const slots = [...(FULL_CASTER_SLOTS[casterLevel] ?? [])];
  // Pad to length 9
  while (slots.length < 9) slots.push(0);
  return slots.slice(0, 9);
}

export function pactMagicForLevel(warlockLevel: number): { slots: number; level: number } {
  return PACT_MAGIC[Math.min(warlockLevel, 20)] ?? { slots: 0, level: 0 };
}

// ---------- HP ----------
/** Average HP gained per level after 1st (rounded up half of hit die + 1). */
export function averageHpPerLevel(hitDie: number): number {
  return hitDie / 2 + 1;
}

// ---------- Carrying / encumbrance ----------
export function carryingCapacity(strScore: number, sizeMultiplier = 1): number {
  return strScore * 15 * sizeMultiplier;
}

// ---------- XP / level thresholds ----------
export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
  120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

export const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
  "Unaligned",
];

export const SPELL_LEVEL_NAMES = [
  "Cantrip",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
];
