import type { Feature } from "@/types";
import { getClass, getSubclass } from "@/data";

export interface LevelGroup {
  level: number;
  features: Feature[];
}

/**
 * Returns the class + subclass features gained at each level, from 1 up to
 * maxLevel, grouped by the level at which they're gained.
 */
export function classFeaturesByLevel(
  classId: string,
  subclassId: string | undefined,
  maxLevel: number,
): LevelGroup[] {
  const def = getClass(classId);
  if (!def) return [];
  const sub = subclassId ? getSubclass(classId, subclassId) : undefined;
  const groups: Record<number, Feature[]> = {};

  const add = (f: Feature, fallbackSource: typeof def.source) => {
    const lvl = f.level ?? 1;
    if (lvl > maxLevel) return;
    (groups[lvl] ??= []).push({ ...f, source: f.source ?? fallbackSource });
  };

  def.features.forEach((f) => add(f, def.source));
  sub?.features.forEach((f) => add(f, sub.source));

  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b)
    .map((level) => ({ level, features: groups[level] }));
}
