import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCharacters, newCharacter } from "@/store/characters";
import type { Character } from "@/types";
import { deriveCharacter } from "@/engine/derive";
import StepBasics from "@/components/steps/StepBasics";
import StepClass from "@/components/steps/StepClass";
import StepAbilities from "@/components/steps/StepAbilities";
import StepSkills from "@/components/steps/StepSkills";
import StepSpells from "@/components/steps/StepSpells";
import StepEquipment from "@/components/steps/StepEquipment";
import StepReview from "@/components/steps/StepReview";

const STEPS = [
  { id: "basics", label: "Identity" },
  { id: "class", label: "Class & Level" },
  { id: "abilities", label: "Abilities" },
  { id: "skills", label: "Skills & Feats" },
  { id: "spells", label: "Spells" },
  { id: "equipment", label: "Equipment" },
  { id: "review", label: "Review" },
];

export default function CreateCharacter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, upsert } = useCharacters();

  const [draft, setDraft] = useState<Character>(() => {
    if (id) {
      const existing = get(id);
      if (existing) return JSON.parse(JSON.stringify(existing));
    }
    return newCharacter();
  });
  const [step, setStep] = useState(0);

  const update = (patch: Partial<Character>) => setDraft((d) => ({ ...d, ...patch }));

  const derived = useMemo(() => {
    try {
      return deriveCharacter(draft);
    } catch {
      return null;
    }
  }, [draft]);

  const isCaster = derived?.spellcasting != null || draft.classes.some((c) => c.classId);

  const save = () => {
    upsert(draft);
    navigate(`/sheet/${draft.id}`);
  };

  const stepProps = { draft, update, derived };

  return (
    <div>
      <div className="row between wrap" style={{ marginBottom: 18, gap: 10 }}>
        <h1 style={{ marginBottom: 0 }}>{id ? "Edit Character" : "Create Character"}</h1>
        <button className="btn" onClick={save} disabled={!draft.raceId || !draft.classes[0]?.classId}>
          Save &amp; View Sheet
        </button>
      </div>

      {/* Step nav */}
      <div className="row wrap" style={{ gap: 8, marginBottom: 22 }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`btn btn-sm ${i === step ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStep(i)}
          >
            <span className="faint" style={{ marginRight: 6 }}>
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card">
        {STEPS[step].id === "basics" && <StepBasics {...stepProps} />}
        {STEPS[step].id === "class" && <StepClass {...stepProps} />}
        {STEPS[step].id === "abilities" && <StepAbilities {...stepProps} />}
        {STEPS[step].id === "skills" && <StepSkills {...stepProps} />}
        {STEPS[step].id === "spells" &&
          (isCaster ? (
            <StepSpells {...stepProps} />
          ) : (
            <div className="muted">This character has no spellcasting class. Skip ahead to Equipment.</div>
          ))}
        {STEPS[step].id === "equipment" && <StepEquipment {...stepProps} />}
        {STEPS[step].id === "review" && <StepReview {...stepProps} onSave={save} />}
      </div>

      <div className="row between" style={{ marginTop: 18 }}>
        <button
          className="btn"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={save}>
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
