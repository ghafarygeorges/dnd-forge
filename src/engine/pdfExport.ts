import { PDFBool, PDFDocument, PDFName, StandardFonts, TextAlignment } from "pdf-lib";
import type { Ability, Character, Skill } from "@/types";
import { ABILITIES, ABILITY_NAMES } from "@/types";
import { deriveCharacter } from "./derive";
import { classFeaturesByLevel } from "./progression";
import { formatModifier, SPELL_LEVEL_NAMES } from "./rules";
import { SKILLS } from "./skills";
import { getBackground, getFeat, getItem, getRace, getSpell, getSubrace } from "@/data";
import sheetTemplateUrl from "@/assets/5e-character-sheet.pdf?url";

// Fields whose value should be horizontally centered (numeric stat boxes).
const CENTERED_FIELDS = new Set<string>([
  "STR", "DEX", "CON", "INT", "WIS", "CHA",
  "STRmod", "DEXmod ", "CONmod", "INTmod", "WISmod", "CHamod",
  "ST Strength", "ST Dexterity", "ST Constitution", "ST Intelligence", "ST Wisdom", "ST Charisma",
  "AC", "Initiative", "Speed", "HPMax", "HPCurrent", "HPTemp", "HDTotal",
  "ProfBonus", "Passive", "Inspiration",
  "Wpn1 AtkBonus", "Wpn2 AtkBonus ", "Wpn3 AtkBonus  ",
  "SpellSaveDC  2", "SpellAtkBonus 2",
]);

// ---- Field-name maps (verified against 5e-character-sheet.pdf) ----
const ABILITY_SCORE_FIELD: Record<Ability, string> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};
const ABILITY_MOD_FIELD: Record<Ability, string> = {
  str: "STRmod", dex: "DEXmod ", con: "CONmod", int: "INTmod", wis: "WISmod", cha: "CHamod",
};
const SAVE_FIELD: Record<Ability, string> = {
  str: "ST Strength", dex: "ST Dexterity", con: "ST Constitution",
  int: "ST Intelligence", wis: "ST Wisdom", cha: "ST Charisma",
};
const SAVE_CHECK: Record<Ability, string> = {
  str: "Check Box 11", dex: "Check Box 18", con: "Check Box 19",
  int: "Check Box 20", wis: "Check Box 21", cha: "Check Box 22",
};
const SKILL_FIELD: Record<Skill, string> = {
  acrobatics: "Acrobatics", animalHandling: "Animal", arcana: "Arcana", athletics: "Athletics",
  deception: "Deception ", history: "History ", insight: "Insight", intimidation: "Intimidation",
  investigation: "Investigation ", medicine: "Medicine", nature: "Nature", perception: "Perception ",
  performance: "Performance", persuasion: "Persuasion", religion: "Religion",
  sleightOfHand: "SleightofHand", stealth: "Stealth ", survival: "Survival",
};
const SKILL_CHECK: Record<Skill, string> = {
  acrobatics: "Check Box 23", animalHandling: "Check Box 24", arcana: "Check Box 25",
  athletics: "Check Box 26", deception: "Check Box 27", history: "Check Box 28",
  insight: "Check Box 29", intimidation: "Check Box 30", investigation: "Check Box 31",
  medicine: "Check Box 32", nature: "Check Box 33", perception: "Check Box 34",
  performance: "Check Box 35", persuasion: "Check Box 36", religion: "Check Box 37",
  sleightOfHand: "Check Box 38", stealth: "Check Box 39", survival: "Check Box 40",
};
// Spell name fields grouped by level (visual order, top-to-bottom).
const SPELL_FIELDS: Record<string, string[]> = {
  cantrips: ["Spells 1014", "Spells 1016", "Spells 1017", "Spells 1018", "Spells 1019", "Spells 1020", "Spells 1021", "Spells 1022"],
  "1": ["Spells 1015", "Spells 1023", "Spells 1024", "Spells 1025", "Spells 1026", "Spells 1027", "Spells 1028", "Spells 1029", "Spells 1030", "Spells 1031", "Spells 1032", "Spells 1033"],
  "2": ["Spells 1046", "Spells 1034", "Spells 1035", "Spells 1036", "Spells 1037", "Spells 1038", "Spells 1039", "Spells 1040", "Spells 1041", "Spells 1042", "Spells 1043", "Spells 1044", "Spells 1045"],
  "3": ["Spells 1048", "Spells 1047", "Spells 1049", "Spells 1050", "Spells 1051", "Spells 1052", "Spells 1053", "Spells 1054", "Spells 1055", "Spells 1056", "Spells 1057", "Spells 1058", "Spells 1059"],
  "4": ["Spells 1061", "Spells 1060", "Spells 1062", "Spells 1063", "Spells 1064", "Spells 1065", "Spells 1066", "Spells 1067", "Spells 1068", "Spells 1069", "Spells 1070", "Spells 1071", "Spells 1072"],
  "5": ["Spells 1074", "Spells 1073", "Spells 1075", "Spells 1076", "Spells 1077", "Spells 1078", "Spells 1079", "Spells 1080", "Spells 1081"],
  "6": ["Spells 1083", "Spells 1082", "Spells 1084", "Spells 1085", "Spells 1086", "Spells 1087", "Spells 1088", "Spells 1089", "Spells 1090"],
  "7": ["Spells 1092", "Spells 1091", "Spells 1093", "Spells 1094", "Spells 1095", "Spells 1096", "Spells 1097", "Spells 1098", "Spells 1099"],
  "8": ["Spells 10101", "Spells 10100", "Spells 10102", "Spells 10103", "Spells 10104", "Spells 10105", "Spells 10106"],
  "9": ["Spells 10108", "Spells 10107", "Spells 10109", "Spells 101010", "Spells 101011", "Spells 101012", "Spells 101013"],
};
const SLOT_TOTAL: Record<number, string> = {
  1: "SlotsTotal 19", 2: "SlotsTotal 20", 3: "SlotsTotal 21", 4: "SlotsTotal 22", 5: "SlotsTotal 23",
  6: "SlotsTotal 24", 7: "SlotsTotal 25", 8: "SlotsTotal 26", 9: "SlotsTotal 27",
};
const SLOT_REMAINING: Record<number, string> = {
  1: "SlotsRemaining 19", 2: "SlotsRemaining 20", 3: "SlotsRemaining 21", 4: "SlotsRemaining 22", 5: "SlotsRemaining 23",
  6: "SlotsRemaining 24", 7: "SlotsRemaining 25", 8: "SlotsRemaining 26", 9: "SlotsRemaining 27",
};

/** Build the filled PDF bytes for a character. */
export async function buildFilledSheet(character: Character): Promise<Uint8Array> {
  const d = deriveCharacter(character);
  const templateBytes = await fetch(sheetTemplateUrl).then((r) => {
    if (!r.ok) throw new Error(`Could not load PDF template (${r.status})`);
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(templateBytes);
  const form = pdf.getForm();

  // The template's default appearance is "/Helv 0 Tf" (auto-size), inherited by
  // every field, which renders text huge/inconsistent. We give each field its
  // own default appearance at an explicit size so the baked appearance streams
  // use that size (setFontSize can't be used — fields have no own /DA and it
  // throws). Appearances are regenerated once at the end with embedded Helvetica.
  const setText = (name: string, value: string | number | undefined, size = 10) => {
    try {
      const f = form.getTextField(name);
      f.acroField.setDefaultAppearance(`/Helv ${size} Tf 0 g`);
      f.setText(value == null ? "" : String(value));
      if (CENTERED_FIELDS.has(name)) f.setAlignment(TextAlignment.Center);
    } catch {
      /* field missing — ignore */
    }
  };
  const check = (name: string) => {
    try {
      form.getCheckBox(name).check();
    } catch {
      /* ignore */
    }
  };

  // ---- Identity ----
  const race = getRace(character.raceId);
  const subrace = character.subraceId ? getSubrace(character.raceId, character.subraceId) : undefined;
  const background = getBackground(character.backgroundId);
  const raceName = race ? `${race.name}${subrace ? ` (${subrace.name})` : ""}` : "";
  const classLine = d.classes
    .map((c) => `${c.className} ${c.level}${c.subclassName ? ` (${c.subclassName})` : ""}`)
    .join(" / ");

  setText("CharacterName", character.name, 16);
  setText("CharacterName 2", character.name, 14);
  setText("ClassLevel", classLine, 10);
  setText("Background", background?.name, 10);
  setText("Race ", raceName, 10);
  setText("Alignment", character.alignment, 10);

  // ---- Abilities, saves, skills ----
  for (const ab of ABILITIES) {
    setText(ABILITY_SCORE_FIELD[ab], d.abilityScores[ab], 14);
    setText(ABILITY_MOD_FIELD[ab], formatModifier(d.abilityModifiers[ab]), 11);
    setText(SAVE_FIELD[ab], formatModifier(d.savingThrows[ab].modifier), 10);
    if (d.savingThrows[ab].proficient) check(SAVE_CHECK[ab]);
  }
  for (const s of d.skills) {
    setText(SKILL_FIELD[s.key], formatModifier(s.modifier), 10);
    if (s.proficient || s.expertise) check(SKILL_CHECK[s.key]);
  }
  setText("Passive", d.passivePerception, 11);
  setText("ProfBonus", formatModifier(d.proficiencyBonus), 11);

  // ---- Combat ----
  setText("AC", d.armorClass, 14);
  setText("Initiative", formatModifier(d.initiative), 12);
  setText("Speed", `${d.speed} ft`, 11);
  setText("HPMax", d.maxHp, 12);
  setText("HPCurrent", character.currentHp ?? d.maxHp, 14);
  if (character.tempHp) setText("HPTemp", character.tempHp, 12);
  const hd = Object.entries(d.hitDice)
    .map(([die, count]) => `${count}d${die}`)
    .join(" / ");
  setText("HDTotal", hd, 11);

  // ---- Wielded weapons / attacks (first three) ----
  const wpnFields = [
    { n: "Wpn Name", a: "Wpn1 AtkBonus", dm: "Wpn1 Damage" },
    { n: "Wpn Name 2", a: "Wpn2 AtkBonus ", dm: "Wpn2 Damage " },
    { n: "Wpn Name 3", a: "Wpn3 AtkBonus  ", dm: "Wpn3 Damage " },
  ];
  d.attacks.slice(0, 3).forEach((atk, i) => {
    setText(wpnFields[i].n, atk.name, 9);
    setText(wpnFields[i].a, atk.attack, 10);
    setText(wpnFields[i].dm, atk.damage, 8);
  });

  // ---- Attacks & spellcasting note (page 1 box) ----
  const atkNote: string[] = [];
  if (d.spellcasting) {
    atkNote.push(
      `Spellcasting (${ABILITY_NAMES[d.spellcasting.ability]}): Save DC ${d.spellcasting.saveDC}, Attack ${formatModifier(d.spellcasting.attackBonus)}`,
    );
  }
  setText("AttacksSpellcasting", atkNote.join("\n"), 9);

  // ---- Proficiencies & languages ----
  const profLines: string[] = [];
  if (d.proficiencies.armor.length) profLines.push(`Armor: ${d.proficiencies.armor.join(", ")}`);
  if (d.proficiencies.weapons.length) profLines.push(`Weapons: ${d.proficiencies.weapons.join(", ")}`);
  if (d.proficiencies.tools.length) profLines.push(`Tools: ${d.proficiencies.tools.join(", ")}`);
  if (d.proficiencies.languages.length) profLines.push(`Languages: ${d.proficiencies.languages.join(", ")}`);
  setText("ProficienciesLang", profLines.join("\n"), 8);

  // ---- Equipment ----
  const equipLines: string[] = [];
  if (character.equippedArmorId) {
    equipLines.push(`${getItem(character.equippedArmorId)?.name ?? ""}${character.hasShield ? " + Shield" : ""} (worn)`);
  }
  character.inventory.forEach((inv) => {
    const name = inv.itemId ? getItem(inv.itemId)?.name : inv.customName;
    if (name) equipLines.push(`${name}${inv.quantity > 1 ? ` x${inv.quantity}` : ""}`);
  });
  setText("Equipment", equipLines.join("\n"), 8);

  // ---- Features & Traits ----
  const featLines: string[] = [];
  if (race) race.traits.forEach((t) => featLines.push(`• ${t.name}`));
  if (subrace) subrace.traits.forEach((t) => featLines.push(`• ${t.name}`));
  if (background) featLines.push(`• ${background.feature.name} (${background.name})`);
  character.featIds.forEach((id) => {
    const f = getFeat(id);
    if (f) featLines.push(`• Feat: ${f.name}`);
  });
  character.classes
    .filter((c) => c.classId)
    .forEach((cl) => {
      classFeaturesByLevel(cl.classId, cl.subclassId, cl.level).forEach((g) => {
        featLines.push(`Lv${g.level}: ${g.features.map((f) => f.name).join(", ")}`);
      });
    });
  setText("Features and Traits", featLines.join("\n"), 8);

  // ---- Page 2: backstory ----
  setText("Backstory", character.backstory, 9);
  setText("Feat+Traits", character.appearance, 9);

  // ---- Spell page ----
  if (d.spellcasting) {
    const primary = d.classes.slice().sort((a, b) => b.level - a.level)[0];
    setText("Spellcasting Class 2", primary?.className, 10);
    setText("SpellcastingAbility 2", ABILITY_NAMES[d.spellcasting.ability], 9);
    setText("SpellSaveDC  2", d.spellcasting.saveDC, 11);
    setText("SpellAtkBonus 2", formatModifier(d.spellcasting.attackBonus), 11);

    // Slots per level
    d.spellcasting.spellSlots.forEach((n, i) => {
      const lvl = i + 1;
      if (n > 0) {
        setText(SLOT_TOTAL[lvl], n, 10);
        setText(SLOT_REMAINING[lvl], n, 10);
      }
    });

    // Cantrips
    const cantrips = character.cantripIds.map(getSpell).filter(Boolean);
    cantrips.forEach((s, i) => {
      if (SPELL_FIELDS.cantrips[i]) setText(SPELL_FIELDS.cantrips[i], s!.name, 9);
    });

    // Leveled spells grouped by level
    const byLevel: Record<number, string[]> = {};
    character.preparedSpellIds.forEach((id) => {
      const s = getSpell(id);
      if (s && s.level > 0) (byLevel[s.level] ??= []).push(s.name);
    });
    Object.entries(byLevel).forEach(([lvl, names]) => {
      const fields = SPELL_FIELDS[lvl];
      if (!fields) return;
      names.forEach((nm, i) => {
        if (fields[i]) setText(fields[i], nm, 9);
      });
    });
  }
  void SKILLS;
  void SPELL_LEVEL_NAMES;

  // Regenerate all field appearance streams using embedded Helvetica at the
  // per-field sizes we baked into each /DA, and ensure NeedAppearances is off
  // so viewers render our appearances as-is.
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(helv);
  form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.False);

  return pdf.save();
}

/** Build and trigger a browser download of the filled sheet. */
export async function downloadFilledSheet(character: Character): Promise<void> {
  const bytes = await buildFilledSheet(character);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = (character.name || "character").replace(/[^a-z0-9-_ ]/gi, "").trim() || "character";
  a.download = `${safe} - 5e sheet.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
