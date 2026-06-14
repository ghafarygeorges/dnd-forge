import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AbilityScores, Character } from "@/types";

const STORAGE_KEY = "dnd-forge-characters-v1";

export function emptyAbilities(value = 8): AbilityScores {
  return { str: value, dex: value, con: value, int: value, wis: value, cha: value };
}

export function newCharacter(): Character {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "",
    createdAt: now,
    updatedAt: now,
    raceId: "",
    backgroundId: "",
    classes: [{ classId: "", level: 1 }],
    baseAbilities: emptyAbilities(8),
    abilityMethod: "pointbuy",
    asiChoices: emptyAbilities(0),
    featIds: [],
    skillProficiencies: [],
    expertise: [],
    languages: [],
    preparedSpellIds: [],
    cantripIds: [],
    inventory: [],
  };
}

interface CharacterStore {
  characters: Character[];
  upsert: (c: Character) => void;
  remove: (id: string) => void;
  get: (id: string) => Character | undefined;
  duplicate: (id: string) => Character | undefined;
}

export const useCharacters = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],
      upsert: (c) =>
        set((state) => {
          const updated = { ...c, updatedAt: Date.now() };
          const idx = state.characters.findIndex((x) => x.id === c.id);
          if (idx === -1) return { characters: [...state.characters, updated] };
          const copy = [...state.characters];
          copy[idx] = updated;
          return { characters: copy };
        }),
      remove: (id) =>
        set((state) => ({ characters: state.characters.filter((c) => c.id !== id) })),
      get: (id) => get().characters.find((c) => c.id === id),
      duplicate: (id) => {
        const orig = get().characters.find((c) => c.id === id);
        if (!orig) return undefined;
        const copy: Character = {
          ...JSON.parse(JSON.stringify(orig)),
          id: crypto.randomUUID(),
          name: `${orig.name} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ characters: [...state.characters, copy] }));
        return copy;
      },
    }),
    { name: STORAGE_KEY },
  ),
);
