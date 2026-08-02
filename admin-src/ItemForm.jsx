import { useState } from "react";
import ImageDropzone from "./ImageDropzone.jsx";
import { api } from "./api.js";

function emptyValues(fields) {
  const v = {};
  fields.forEach((f) => {
    v[f.key] = f.type === "select" ? f.options[0] || "" : "";
  });
  return v;
}

export default function ItemForm({ resource, fields, initial, onSaved, onCancel }) {
  const [values, setValues] = useState(() => ({
    ...emptyValues(fields),
    ...(initial || {}),
  }));
  const [image, setImage] = useState(initial ? initial.image : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !String(values[f.key] || "").trim()) {
        setError(`"${f.label}" ist ein Pflichtfeld.`);
        return;
      }
    }
    setSaving(true);
    setError("");
    const payload = { ...values, image };
    try {
      if (initial && initial.id) {
        await api.update(resource, { ...payload, id: initial.id });
      } else {
        await api.create(resource, payload);
      }
      onSaved();
    } catch (e2) {
      setError("Speichern fehlgeschlagen: " + e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? "Bearbeiten" : "Neu anlegen"}</h2>
        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select value={values[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)}>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {(f.optionLabels && f.optionLabels[opt]) || opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <ImageDropzone value={image} onChange={setImage} />
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
