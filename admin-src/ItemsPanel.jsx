import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import ItemForm from "./ItemForm.jsx";

export default function ItemsPanel({ resource, title, fields, categories, renderPrice }) {
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // item being edited, or {} for new, or null = closed
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  function reload() {
    setError("");
    api
      .list(resource)
      .then((data) => setItems(data.slice().sort((a, b) => b.createdAt - a.createdAt)))
      .catch((e) => setError("Laden fehlgeschlagen: " + e.message));
  }

  useEffect(reload, [resource]);

  const visible = useMemo(() => {
    if (!items) return [];
    return items.filter((it) => {
      if (categoryFilter && it.category !== categoryFilter) return false;
      if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, categoryFilter]);

  async function handleDelete(item) {
    if (!window.confirm(`"${item.name}" wirklich löschen?`)) return;
    try {
      await api.remove(resource, item.id);
      reload();
    } catch (e) {
      setError("Löschen fehlgeschlagen: " + e.message);
    }
  }

  return (
    <div>
      <div className="panel-toolbar">
        <input
          type="text"
          placeholder={`${title} durchsuchen…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 6, minWidth: 200 }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 6 }}
        >
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Neu
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {items === null ? (
        <p className="empty-state">Lädt…</p>
      ) : visible.length === 0 ? (
        <p className="empty-state">Keine Einträge.</p>
      ) : (
        <div className="item-grid">
          {visible.map((item) => (
            <div className="item-card" key={item.id}>
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="no-image">Kein Foto</div>
              )}
              <div className="item-card-body">
                <span className="item-kicker">{item.category}</span>
                <span className="item-name">{item.name}</span>
                <span className="item-price">{renderPrice(item)}</span>
                <div className="item-actions">
                  <button className="btn" onClick={() => setEditing(item)}>
                    Bearbeiten
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(item)}>
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ItemForm
          resource={resource}
          fields={fields}
          initial={editing.id ? editing : null}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
