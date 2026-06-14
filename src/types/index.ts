// ============================================================
// Core D&D 5e (2014) type definitions for DnD Forge
// ============================================================

export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

export const ABILITY_NAMES: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export type AbilityScores = Record<Ability, number>;

export type Skill =
  | "acrobatics"
  | "animalHandling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleightOfHand"
  | "stealth"
  | "survival";

export interface SkillDef {
  key: Skill;
  name: string;
  ability: Ability;
}

export type Size = "Tiny" | "Small" | "Medium" | "Large";

export type SourceBook = "PHB" | "DMG" | "TCE" | "XGE" | "EGW" | "WBtW" | "ERLW" | "Custom";

export const SOURCE_NAMES: Record<SourceBook, string> = {
  PHB: "Player's Handbook",
  DMG: "Dungeon Master's Guide",
  TCE: "Tasha's Cauldron of Everything",
  XGE: "Xanathar's Guide to Everything",
  EGW: "Explorer's Guide to Wildemount (Exandria)",
  WBtW: "The Wild Beyond the Witchlight",
  ERLW: "Eberron: Rising from the Last War",
  Custom: "Homebrew / Custom",
};

// A generic, displayable rules feature/trait.
export interface Feature {
  name: string;
  description: string;
  /** Level at which the feature is gained (for class features). */
  level?: number;
  source?: SourceBook;
}

// ---------- Races ----------
export interface Subrace {
  id: string;
  name: string;
  abilityScoreIncrease: Partial<AbilityScores>;
  traits: Feature[];
  speed?: number;
  size?: Size;
  /** Extra languages, proficiencies granted */
  languages?: string[];
}

export interface Race {
  id: string;
  name: string;
  source: SourceBook;
  size: Size;
  speed: number;
  abilityScoreIncrease: Partial<AbilityScores>;
  traits: Feature[];
  languages: string[];
  /** True if this race has subraces that must be chosen. */
  subraces?: Subrace[];
  darkvision?: number;
}

// ---------- Backgrounds ----------
export interface Background {
  id: string;
  name: string;
  source: SourceBook;
  skillProficiencies: Skill[];
  toolProficiencies?: string[];
  languages?: number; // number of free languages
  equipment: string[];
  feature: Feature;
}

// ---------- Feats ----------
export interface Feat {
  id: string;
  name: string;
  source: SourceBook;
  prerequisite?: string;
  description: string;
  /** Ability score increase granted (half-feats). */
  abilityScoreIncrease?: { choices: Ability[]; amount: number };
}

// ---------- Spells ----------
export type SpellSchool =
  | "Abjuration"
  | "Conjuration"
  | "Divination"
  | "Enchantment"
  | "Evocation"
  | "Illusion"
  | "Necromancy"
  | "Transmutation";

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: string; // e.g. "V, S, M (a pinch of sand)"
  duration: string;
  concentration?: boolean;
  ritual?: boolean;
  description: string;
  higherLevels?: string;
  classes: string[]; // class ids that can learn it
  source: SourceBook;
}

// ---------- Classes ----------
export type CasterType = "full" | "half" | "third" | "pact" | "artificer" | "none";

export interface Subclass {
  id: string;
  name: string;
  source: SourceBook;
  /** Features keyed by the class level they're gained. */
  features: Feature[];
  /** Subclasses that add spells to the known/prepared list. */
  spellcasting?: boolean;
  /**
   * Spellcasting granted by the subclass itself (e.g. Eldritch Knight, Arcane
   * Trickster). When set, the character casts as this caster type using the
   * given ability and draws from the named class's spell list.
   */
  casting?: { caster: CasterType; ability: Ability; spellList: string };
}

export interface ClassDef {
  id: string;
  name: string;
  source: SourceBook;
  hitDie: number; // e.g. 8, 10, 12
  primaryAbility: Ability[];
  savingThrows: Ability[];
  /** Number of skill choices and the list to pick from. */
  skillChoices: number;
  skillList: Skill[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  /** Level at which the subclass is chosen. */
  subclassLevel: number;
  subclassLabel: string; // e.g. "Archetype", "Divine Domain"
  subclasses: Subclass[];
  features: Feature[]; // base class features by level
  caster: CasterType;
  spellAbility?: Ability;
  /** For known-spell casters (sorcerer, bard, etc.) cantrips/spells known by level. */
  cantripsKnown?: number[];
  spellsKnown?: number[];
  /** True for prepared casters (cleric, druid, wizard, paladin). */
  preparesSpells?: boolean;
  startingEquipment: string[];
}

// ---------- Items / Equipment ----------
export type ItemType = "weapon" | "armor" | "shield" | "gear" | "tool" | "potion" | "wondrous";

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  source: SourceBook;
  description?: string;
  weight?: number;
  cost?: string;
  // weapon
  damage?: string;
  damageType?: string;
  properties?: string[];
  // armor
  armorClass?: number;
  addDex?: boolean;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
}

// ---------- Character (the saved entity) ----------
export interface CharacterClassChoice {
  classId: string;
  level: number;
  subclassId?: string;
  /** Skills chosen from this class at level 1. */
  chosenSkills?: Skill[];
}

export interface InventoryItem {
  itemId?: string; // reference to Item by id
  customName?: string; // for ad-hoc items
  quantity: number;
  equipped?: boolean;
}

export interface WieldedWeapon {
  itemId?: string; // compendium weapon
  magicBonus?: number; // +1/+2/+3 added to attack & damage (compendium)
  customName?: string; // custom weapon name
  customAttack?: string; // e.g. "+7" (custom, manual)
  customDamage?: string; // e.g. "1d8+3 slashing" (custom, manual)
}

export interface Character {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  // identity
  raceId: string;
  subraceId?: string;
  backgroundId: string;
  alignment?: string;

  // classes (supports multiclassing)
  classes: CharacterClassChoice[];

  // ability scores (base, before racial/ASI/feat bonuses)
  baseAbilities: AbilityScores;
  abilityMethod: "pointbuy" | "manual" | "array";

  // chosen during creation/leveling
  asiChoices: AbilityScores; // cumulative ability score increases from ASIs
  featIds: string[];
  skillProficiencies: Skill[]; // from background + extras
  expertise?: Skill[];
  languages: string[];

  // spells
  preparedSpellIds: string[]; // known + prepared spell ids
  cantripIds: string[];

  // hit points
  maxHpOverride?: number;
  currentHp?: number;
  tempHp?: number;
  rolledHp?: number[]; // per-level rolled values (optional)

  // equipment
  inventory: InventoryItem[];
  wieldedWeapons?: WieldedWeapon[];
  equippedArmorId?: string;
  hasShield?: boolean;

  // flavor
  notes?: string;
  appearance?: string;
  backstory?: string;
}
