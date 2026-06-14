import type { Character } from "@/types";
import type { DerivedCharacter } from "@/engine/derive";

export interface StepProps {
  draft: Character;
  update: (patch: Partial<Character>) => void;
  derived: DerivedCharacter | null;
}
