import { Link, useNavigate } from "react-router-dom";
import { useCharacters } from "@/store/characters";
import { getClass, getRace } from "@/data";
import { deriveCharacter } from "@/engine/derive";
import type { Character } from "@/types";

function summary(c: Character): string {
  const race = getRace(c.raceId);
  const classes = c.classes
    .filter((cl) => cl.classId)
    .map((cl) => `${getClass(cl.classId)?.name ?? "?"} ${cl.level}`)
    .join(" / ");
  const parts = [race?.name, classes].filter(Boolean);
  return parts.join(" · ") || "Unfinished character";
}

export default function CharacterList() {
  const { characters, remove, duplicate } = useCharacters();
  const navigate = useNavigate();
  const sorted = [...characters].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div>
      <div className="row between wrap" style={{ marginBottom: 22, gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 2 }}>Your Party</h1>
          <div className="muted">D&amp;D 5e (2014) character vault · saved on this device</div>
        </div>
        <Link to="/create" className="btn btn-primary">
          + New Character
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 46, marginBottom: 10 }}>🛡️</div>
          <h2>No characters yet</h2>
          <p className="muted" style={{ maxWidth: 420, margin: "0 auto 18px" }}>
            Forge your first hero. Pick a race, class, abilities, background, spells, and gear —
            everything saves automatically to this browser.
          </p>
          <Link to="/create" className="btn btn-primary">
            Create a Character
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {sorted.map((c) => {
            let level = 0;
            try {
              level = deriveCharacter(c).totalLevel;
            } catch {
              level = c.classes.reduce((s, x) => s + x.level, 0);
            }
            return (
              <div key={c.id} className="card char-card" style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className="row between"
                  style={{ marginBottom: 6, alignItems: "flex-start" }}
                >
                  <h3 style={{ marginBottom: 0 }}>{c.name || "Unnamed"}</h3>
                  <span className="tag">Lv {level}</span>
                </div>
                <div className="muted" style={{ flex: 1, marginBottom: 14, fontSize: 13 }}>
                  {summary(c)}
                </div>
                <div className="row wrap" style={{ gap: 8 }}>
                  <Link to={`/sheet/${c.id}`} className="btn btn-sm btn-primary">
                    View Sheet
                  </Link>
                  <Link to={`/edit/${c.id}`} className="btn btn-sm">
                    Edit
                  </Link>
                  <button className="btn btn-sm" onClick={() => duplicate(c.id)}>
                    Copy
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ marginLeft: "auto", color: "var(--accent)" }}
                    onClick={() => {
                      if (confirm(`Delete ${c.name || "this character"}? This cannot be undone.`)) {
                        remove(c.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 28 }}>
        <button
          className="btn btn-sm btn-ghost faint"
          onClick={() => navigate("/create")}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
