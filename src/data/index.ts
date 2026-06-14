import type { Background, ClassDef, Feat, Item, Race, Spell, Subclass, Subrace } from "@/types";
import { RACES } from "./races";
import { CLASSES } from "./classes";
import { BACKGROUNDS } from "./backgrounds";
import { FEATS } from "./feats";
import { SPELLS } from "./spells";
import { ITEMS } from "./items";

export { RACES, CLASSES, BACKGROUNDS, FEATS, SPELLS, ITEMS };

const raceMap = new Map(RACES.map((r) => [r.id, r]));
const classMap = new Map(CLASSES.map((c) => [c.id, c]));
const backgroundMap = new Map(BACKGROUNDS.map((b) => [b.id, b]));
const featMap = new Map(FEATS.map((f) => [f.id, f]));
const spellMap = new Map(SPELLS.map((s) => [s.id, s]));
const itemMap = new Map(ITEMS.map((i) => [i.id, i]));

export function getRace(id: string): Race | undefined {
  return raceMap.get(id);
}
export function getSubrace(raceId: string, subraceId: string): Subrace | undefined {
  return getRace(raceId)?.subraces?.find((s) => s.id === subraceId);
}
export function getClass(id: string): ClassDef | undefined {
  return classMap.get(id);
}
export function getSubclass(classId: string, subclassId: string): Subclass | undefined {
  return getClass(classId)?.subclasses.find((s) => s.id === subclassId);
}
export function getBackground(id: string): Background | undefined {
  return backgroundMap.get(id);
}
export function getFeat(id: string): Feat | undefined {
  return featMap.get(id);
}
export function getSpell(id: string): Spell | undefined {
  return spellMap.get(id);
}
export function getItem(id: string): Item | undefined {
  return itemMap.get(id);
}

export function spellsForClass(classId: string): Spell[] {
  return SPELLS.filter((s) => s.classes.includes(classId));
}
