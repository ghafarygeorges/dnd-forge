import type { Item } from "@/types";

export const ITEMS: Item[] = [
  // ---------- Light Armor ----------
  { id: "padded", name: "Padded Armor", type: "armor", source: "PHB", armorClass: 11, addDex: true, cost: "5 gp", weight: 8, stealthDisadvantage: true },
  { id: "leather", name: "Leather Armor", type: "armor", source: "PHB", armorClass: 11, addDex: true, cost: "10 gp", weight: 10 },
  { id: "studded-leather", name: "Studded Leather", type: "armor", source: "PHB", armorClass: 12, addDex: true, cost: "45 gp", weight: 13 },
  // ---------- Medium Armor ----------
  { id: "hide", name: "Hide Armor", type: "armor", source: "PHB", armorClass: 12, addDex: true, maxDexBonus: 2, cost: "10 gp", weight: 12 },
  { id: "chain-shirt", name: "Chain Shirt", type: "armor", source: "PHB", armorClass: 13, addDex: true, maxDexBonus: 2, cost: "50 gp", weight: 20 },
  { id: "scale-mail", name: "Scale Mail", type: "armor", source: "PHB", armorClass: 14, addDex: true, maxDexBonus: 2, cost: "50 gp", weight: 45, stealthDisadvantage: true },
  { id: "breastplate", name: "Breastplate", type: "armor", source: "PHB", armorClass: 14, addDex: true, maxDexBonus: 2, cost: "400 gp", weight: 20 },
  { id: "half-plate", name: "Half Plate", type: "armor", source: "PHB", armorClass: 15, addDex: true, maxDexBonus: 2, cost: "750 gp", weight: 40, stealthDisadvantage: true },
  // ---------- Heavy Armor ----------
  { id: "ring-mail", name: "Ring Mail", type: "armor", source: "PHB", armorClass: 14, addDex: false, cost: "30 gp", weight: 40, stealthDisadvantage: true },
  { id: "chain-mail", name: "Chain Mail", type: "armor", source: "PHB", armorClass: 16, addDex: false, strengthRequirement: 13, cost: "75 gp", weight: 55, stealthDisadvantage: true },
  { id: "splint", name: "Splint Armor", type: "armor", source: "PHB", armorClass: 17, addDex: false, strengthRequirement: 15, cost: "200 gp", weight: 60, stealthDisadvantage: true },
  { id: "plate", name: "Plate Armor", type: "armor", source: "PHB", armorClass: 18, addDex: false, strengthRequirement: 15, cost: "1500 gp", weight: 65, stealthDisadvantage: true },
  // ---------- Shield ----------
  { id: "shield", name: "Shield", type: "shield", source: "PHB", armorClass: 2, cost: "10 gp", weight: 6, description: "A shield increases your AC by 2." },

  // ---------- Simple Melee Weapons ----------
  { id: "club", name: "Club", type: "weapon", source: "PHB", damage: "1d4", damageType: "bludgeoning", properties: ["Light"], cost: "1 sp", weight: 2 },
  { id: "dagger", name: "Dagger", type: "weapon", source: "PHB", damage: "1d4", damageType: "piercing", properties: ["Finesse", "Light", "Thrown (20/60)"], cost: "2 gp", weight: 1 },
  { id: "handaxe", name: "Handaxe", type: "weapon", source: "PHB", damage: "1d6", damageType: "slashing", properties: ["Light", "Thrown (20/60)"], cost: "5 gp", weight: 2 },
  { id: "javelin", name: "Javelin", type: "weapon", source: "PHB", damage: "1d6", damageType: "piercing", properties: ["Thrown (30/120)"], cost: "5 sp", weight: 2 },
  { id: "mace", name: "Mace", type: "weapon", source: "PHB", damage: "1d6", damageType: "bludgeoning", cost: "5 gp", weight: 4 },
  { id: "quarterstaff", name: "Quarterstaff", type: "weapon", source: "PHB", damage: "1d6", damageType: "bludgeoning", properties: ["Versatile (1d8)"], cost: "2 sp", weight: 4 },
  { id: "spear", name: "Spear", type: "weapon", source: "PHB", damage: "1d6", damageType: "piercing", properties: ["Thrown (20/60)", "Versatile (1d8)"], cost: "1 gp", weight: 3 },
  { id: "light-crossbow", name: "Light Crossbow", type: "weapon", source: "PHB", damage: "1d8", damageType: "piercing", properties: ["Ammunition (80/320)", "Loading", "Two-handed"], cost: "25 gp", weight: 5 },
  { id: "shortbow", name: "Shortbow", type: "weapon", source: "PHB", damage: "1d6", damageType: "piercing", properties: ["Ammunition (80/320)", "Two-handed"], cost: "25 gp", weight: 2 },
  { id: "sling", name: "Sling", type: "weapon", source: "PHB", damage: "1d4", damageType: "bludgeoning", properties: ["Ammunition (30/120)"], cost: "1 sp", weight: 0 },

  // ---------- Martial Melee Weapons ----------
  { id: "battleaxe", name: "Battleaxe", type: "weapon", source: "PHB", damage: "1d8", damageType: "slashing", properties: ["Versatile (1d10)"], cost: "10 gp", weight: 4 },
  { id: "greataxe", name: "Greataxe", type: "weapon", source: "PHB", damage: "1d12", damageType: "slashing", properties: ["Heavy", "Two-handed"], cost: "30 gp", weight: 7 },
  { id: "greatsword", name: "Greatsword", type: "weapon", source: "PHB", damage: "2d6", damageType: "slashing", properties: ["Heavy", "Two-handed"], cost: "50 gp", weight: 6 },
  { id: "longsword", name: "Longsword", type: "weapon", source: "PHB", damage: "1d8", damageType: "slashing", properties: ["Versatile (1d10)"], cost: "15 gp", weight: 3 },
  { id: "rapier", name: "Rapier", type: "weapon", source: "PHB", damage: "1d8", damageType: "piercing", properties: ["Finesse"], cost: "25 gp", weight: 2 },
  { id: "scimitar", name: "Scimitar", type: "weapon", source: "PHB", damage: "1d6", damageType: "slashing", properties: ["Finesse", "Light"], cost: "25 gp", weight: 3 },
  { id: "shortsword", name: "Shortsword", type: "weapon", source: "PHB", damage: "1d6", damageType: "piercing", properties: ["Finesse", "Light"], cost: "10 gp", weight: 2 },
  { id: "maul", name: "Maul", type: "weapon", source: "PHB", damage: "2d6", damageType: "bludgeoning", properties: ["Heavy", "Two-handed"], cost: "10 gp", weight: 10 },
  { id: "warhammer", name: "Warhammer", type: "weapon", source: "PHB", damage: "1d8", damageType: "bludgeoning", properties: ["Versatile (1d10)"], cost: "15 gp", weight: 2 },
  { id: "glaive", name: "Glaive", type: "weapon", source: "PHB", damage: "1d10", damageType: "slashing", properties: ["Heavy", "Reach", "Two-handed"], cost: "20 gp", weight: 6 },
  { id: "halberd", name: "Halberd", type: "weapon", source: "PHB", damage: "1d10", damageType: "slashing", properties: ["Heavy", "Reach", "Two-handed"], cost: "20 gp", weight: 6 },
  { id: "longbow", name: "Longbow", type: "weapon", source: "PHB", damage: "1d8", damageType: "piercing", properties: ["Ammunition (150/600)", "Heavy", "Two-handed"], cost: "50 gp", weight: 2 },
  { id: "hand-crossbow", name: "Hand Crossbow", type: "weapon", source: "PHB", damage: "1d6", damageType: "piercing", properties: ["Ammunition (30/120)", "Light", "Loading"], cost: "75 gp", weight: 3 },
  { id: "heavy-crossbow", name: "Heavy Crossbow", type: "weapon", source: "PHB", damage: "1d10", damageType: "piercing", properties: ["Ammunition (100/400)", "Heavy", "Loading", "Two-handed"], cost: "50 gp", weight: 18 },

  // ---------- Adventuring Gear ----------
  { id: "backpack", name: "Backpack", type: "gear", source: "PHB", cost: "2 gp", weight: 5 },
  { id: "bedroll", name: "Bedroll", type: "gear", source: "PHB", cost: "1 gp", weight: 7 },
  { id: "rations", name: "Rations (1 day)", type: "gear", source: "PHB", cost: "5 sp", weight: 2 },
  { id: "rope-hempen", name: "Rope, Hempen (50 ft)", type: "gear", source: "PHB", cost: "1 gp", weight: 10 },
  { id: "torch", name: "Torch", type: "gear", source: "PHB", cost: "1 cp", weight: 1 },
  { id: "waterskin", name: "Waterskin", type: "gear", source: "PHB", cost: "2 sp", weight: 5 },
  { id: "tinderbox", name: "Tinderbox", type: "gear", source: "PHB", cost: "5 sp", weight: 1 },
  { id: "healers-kit", name: "Healer's Kit", type: "gear", source: "PHB", cost: "5 gp", weight: 3, description: "Has ten uses. As an action, stabilize a creature at 0 HP without a Medicine check." },
  { id: "thieves-tools", name: "Thieves' Tools", type: "tool", source: "PHB", cost: "25 gp", weight: 1 },
  { id: "holy-symbol", name: "Holy Symbol", type: "gear", source: "PHB", cost: "5 gp", weight: 1 },
  { id: "arcane-focus", name: "Arcane Focus", type: "gear", source: "PHB", cost: "10 gp", weight: 1 },
  { id: "spellbook", name: "Spellbook", type: "gear", source: "PHB", cost: "50 gp", weight: 3 },
  { id: "component-pouch", name: "Component Pouch", type: "gear", source: "PHB", cost: "25 gp", weight: 2 },

  // ---------- Potions ----------
  { id: "potion-healing", name: "Potion of Healing", type: "potion", source: "DMG", cost: "50 gp", weight: 0.5, description: "You regain 2d4 + 2 hit points when you drink this potion." },
];
