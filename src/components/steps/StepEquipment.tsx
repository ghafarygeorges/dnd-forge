import { useState } from "react";
import { ITEMS, getItem } from "@/data";
import { weaponAttack } from "@/engine/weapons";
import type { InventoryItem, WieldedWeapon } from "@/types";
import type { StepProps } from "./types";

export default function StepEquipment({ draft, update, derived }: StepProps) {
  const [pick, setPick] = useState("");
  const [customName, setCustomName] = useState("");
  const [wpnPick, setWpnPick] = useState("");
  const [wpnBonus, setWpnBonus] = useState(0);
  const [cwName, setCwName] = useState("");
  const [cwAtk, setCwAtk] = useState("");
  const [cwDmg, setCwDmg] = useState("");

  const armors = ITEMS.filter((i) => i.type === "armor");
  const weaponItems = ITEMS.filter((i) => i.type === "weapon");
  const addable = ITEMS.filter((i) => i.type !== "armor" && i.type !== "shield");

  const setInventory = (inventory: InventoryItem[]) => update({ inventory });

  const wielded = draft.wieldedWeapons ?? [];
  const setWielded = (w: WieldedWeapon[]) => update({ wieldedWeapons: w });
  const addWieldedCompendium = () => {
    if (!wpnPick) return;
    setWielded([...wielded, { itemId: wpnPick, magicBonus: wpnBonus || undefined }]);
    setWpnPick("");
    setWpnBonus(0);
  };
  const addWieldedCustom = () => {
    if (!cwName.trim()) return;
    setWielded([
      ...wielded,
      { customName: cwName.trim(), customAttack: cwAtk.trim(), customDamage: cwDmg.trim() },
    ]);
    setCwName("");
    setCwAtk("");
    setCwDmg("");
  };
  const removeWielded = (idx: number) => setWielded(wielded.filter((_, i) => i !== idx));

  const addItem = () => {
    if (!pick) return;
    const existing = draft.inventory.find((i) => i.itemId === pick);
    if (existing) {
      setInventory(
        draft.inventory.map((i) => (i.itemId === pick ? { ...i, quantity: i.quantity + 1 } : i)),
      );
    } else {
      setInventory([...draft.inventory, { itemId: pick, quantity: 1 }]);
    }
  };
  const addCustom = () => {
    if (!customName.trim()) return;
    setInventory([...draft.inventory, { customName: customName.trim(), quantity: 1 }]);
    setCustomName("");
  };
  const changeQty = (idx: number, delta: number) => {
    const copy = [...draft.inventory];
    copy[idx] = { ...copy[idx], quantity: Math.max(0, copy[idx].quantity + delta) };
    setInventory(copy.filter((i) => i.quantity > 0));
  };

  return (
    <div>
      <div className="panel-title">Armor &amp; Defense</div>
      <div className="field-row">
        <div className="field">
          <label>Equipped Armor</label>
          <select
            value={draft.equippedArmorId ?? ""}
            onChange={(e) => update({ equippedArmorId: e.target.value || undefined })}
          >
            <option value="">None (unarmored)</option>
            {armors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (AC {a.armorClass}
                {a.addDex ? " + Dex" : ""}
                {a.maxDexBonus != null ? ` max ${a.maxDexBonus}` : ""})
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ display: "flex", alignItems: "flex-end" }}>
          <label className="row" style={{ cursor: "pointer", marginBottom: 9 }}>
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={!!draft.hasShield}
              onChange={(e) => update({ hasShield: e.target.checked })}
            />
            <span>Carrying a Shield (+2 AC)</span>
          </label>
        </div>
      </div>

      <div className="scroll-divider" />

      <div className="panel-title">Wielded Weapons &amp; Attacks</div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        Weapons you wield. Attack &amp; damage are computed from your ability modifiers and
        proficiency (add a magic bonus if applicable), or enter a custom weapon manually.
      </p>

      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Add a compendium weapon</label>
          <select value={wpnPick} onChange={(e) => setWpnPick(e.target.value)}>
            <option value="">— Select a weapon —</option>
            {weaponItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.damage} {i.damageType})
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 90 }}>
          <label>Magic</label>
          <select value={wpnBonus} onChange={(e) => setWpnBonus(Number(e.target.value))}>
            <option value={0}>+0</option>
            <option value={1}>+1</option>
            <option value={2}>+2</option>
            <option value={3}>+3</option>
          </select>
        </div>
        <button className="btn" style={{ marginBottom: 16 }} onClick={addWieldedCompendium}>
          Add
        </button>
      </div>

      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Custom weapon name</label>
          <input type="text" placeholder="e.g. Flametongue" value={cwName} onChange={(e) => setCwName(e.target.value)} />
        </div>
        <div className="field" style={{ minWidth: 90 }}>
          <label>Attack</label>
          <input type="text" placeholder="+7" value={cwAtk} onChange={(e) => setCwAtk(e.target.value)} />
        </div>
        <div className="field" style={{ minWidth: 130 }}>
          <label>Damage</label>
          <input type="text" placeholder="1d8+3 fire" value={cwDmg} onChange={(e) => setCwDmg(e.target.value)} />
        </div>
        <button className="btn" style={{ marginBottom: 16 }} onClick={addWieldedCustom}>
          Add
        </button>
      </div>

      {wielded.length > 0 && (
        <div className="stack" style={{ marginBottom: 4 }}>
          {wielded.map((w, idx) => {
            let name: string;
            let atk: string;
            let dmg: string;
            if (w.itemId) {
              const item = getItem(w.itemId);
              const calc = weaponAttack(item, derived?.abilityModifiers ?? ({} as any), derived?.proficiencyBonus ?? 2, w.magicBonus ?? 0);
              name = `${item?.name ?? "Weapon"}${w.magicBonus ? ` +${w.magicBonus}` : ""}`;
              atk = calc.attack;
              dmg = calc.damage;
            } else {
              name = w.customName ?? "Custom";
              atk = w.customAttack ?? "";
              dmg = w.customDamage ?? "";
            }
            return (
              <div
                key={idx}
                className="row between"
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div>
                  <strong>{name}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {" "}
                    — {atk || "—"} to hit · {dmg || "—"}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: "var(--danger)" }}
                  onClick={() => removeWielded(idx)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="scroll-divider" />

      <div className="panel-title">Inventory</div>
      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Add from compendium</label>
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">— Select an item —</option>
            {addable.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
                {i.damage ? ` (${i.damage} ${i.damageType})` : ""}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" style={{ marginBottom: 16 }} onClick={addItem}>
          Add
        </button>
      </div>

      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Or add a custom item</label>
          <input
            type="text"
            placeholder="e.g. Mysterious amulet"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
        </div>
        <button className="btn" style={{ marginBottom: 16 }} onClick={addCustom}>
          Add
        </button>
      </div>

      {draft.inventory.length === 0 ? (
        <p className="muted">No items yet.</p>
      ) : (
        <div className="stack">
          {draft.inventory.map((inv, idx) => {
            const item = inv.itemId ? getItem(inv.itemId) : undefined;
            const name = item?.name ?? inv.customName ?? "Item";
            return (
              <div
                key={idx}
                className="row between"
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div>
                  <strong>{name}</strong>
                  {item?.damage && (
                    <span className="muted" style={{ fontSize: 13 }}>
                      {" "}
                      — {item.damage} {item.damageType}
                    </span>
                  )}
                  {item?.properties?.length ? (
                    <div className="faint" style={{ fontSize: 11 }}>
                      {item.properties.join(", ")}
                    </div>
                  ) : null}
                </div>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => changeQty(idx, -1)}>
                    −
                  </button>
                  <span style={{ minWidth: 22, textAlign: "center" }}>{inv.quantity}</span>
                  <button className="btn btn-sm" onClick={() => changeQty(idx, 1)}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
