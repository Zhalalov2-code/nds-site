import { useEffect, useState } from "react";
import netlifyIdentity from "netlify-identity-widget";
import Login from "./Login.jsx";
import ItemsPanel from "./ItemsPanel.jsx";
import { PART_FIELDS, PART_CATEGORIES, VEHICLE_FIELDS, VEHICLE_CATEGORIES } from "./fieldConfig.js";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [tab, setTab] = useState("parts");

  useEffect(() => {
    netlifyIdentity.on("init", (u) => setUser(u));
    netlifyIdentity.on("login", (u) => {
      setUser(u);
      netlifyIdentity.close();
    });
    netlifyIdentity.on("logout", () => setUser(null));
    netlifyIdentity.init();
    return () => {
      netlifyIdentity.off("init");
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
    };
  }, []);

  if (user === undefined) return null; // avoid a login-screen flash while Identity loads
  if (!user) return <Login />;

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1>NDS Nutzfahrzeuge — Admin</h1>
        <div className="who">
          {user.email}{" "}
          <button className="btn" onClick={() => netlifyIdentity.logout()}>
            Abmelden
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={"tab" + (tab === "parts" ? " active" : "")} onClick={() => setTab("parts")}>
          Ersatzteile
        </button>
        <button className={"tab" + (tab === "vehicles" ? " active" : "")} onClick={() => setTab("vehicles")}>
          Fahrzeuge
        </button>
      </div>

      {tab === "parts" ? (
        <ItemsPanel
          key="parts"
          resource="parts"
          title="Ersatzteile"
          fields={PART_FIELDS}
          categories={PART_CATEGORIES}
          renderPrice={(item) =>
            item.price == null ? "Preis auf Anfrage" : `${Number(item.price).toFixed(2)} € netto`
          }
        />
      ) : (
        <ItemsPanel
          key="vehicles"
          resource="vehicles"
          title="Fahrzeuge"
          fields={VEHICLE_FIELDS}
          categories={VEHICLE_CATEGORIES}
          renderPrice={(item) => item.price || "Preis auf Anfrage"}
        />
      )}
    </div>
  );
}
