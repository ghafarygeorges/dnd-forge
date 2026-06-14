import type { Ability, Character, Item } from "@/types";
import { getItem } from "@/data";
import { formatModifier } from "./rules";

export interface AttackInfo {
  name: string;
  attack: string; // e.g. "+7"
  damage: string; // e.g. "1d8 +4 slashing"
  properties?: string[];
}

/**
 * Compute the attack bonus and damage string for a compendium weapon, given
 * ability modifiers, proficiency bonus, and an optional magic bonus.
 */
export function weaponAttack(
  item: Item | undefined,
  mods: Record<Ability, number>,
  pb: number,
  magicBonus = 0,
): { attack: string; damage: string } {
  if (!item) return { attack: "", damage: "" };
  const props = (item.properties ?? []).join(" ").toLowerCase();
  const ranged = props.includes("ammunition");
  const finesse = props.includes("finesse");
  let abil: Ability = "str";
  if (ranged) abil = "dex";
  else if (finesse) abil = mods.dex >= mods.str ? "dex" : "str";
  const mod = mods[abil];
  const dmgMod = mod + magicBonus;
  return {
    attack: formatModifier(mod + pb + magicBonus),
    damage: `${item.damage ?? ""}${dmgMod !== 0 ? ` ${formatModifier(dmgMod)}` : ""} ${item.damageType ?? ""}`.trim(),
  };
}

/** Build the list of wielded-weapon attacks for a character. */
export function getAttacks(character: Character, mods: Record<Ability, number>, pb: number): AttackInfo[] {
  const list = character.wieldedWeapons ?? [];
  return list.map((w) => {
    if (w.itemId) {
      const item = getItem(w.itemId);
      const { attack, damage } = weaponAttack(item, mods, pb, w.magicBonus ?? 0);
      const bonusName = w.magicBonus ? ` +${w.magicBonus}` : "";
      return {
        name: `${item?.name ?? "Weapon"}${bonusName}`,
        attack,
        damage,
        properties: item?.properties,
      };
    }
    return {
      name: w.customName || "Custom Weapon",
      attack: w.customAttack || "",
      damage: w.customDamage || "",
    };
  });
}
