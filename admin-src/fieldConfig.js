// Declarative field lists for the two resources — ItemForm renders one
// input per entry. Keeps parts/vehicles as data, not two near-identical
// hand-written forms.
export const PART_CATEGORIES = [
  "Motoren",
  "Kupplung",
  "Bremsen",
  "Kabine",
  "Achsen",
  "Elektrik",
  "Zubehör",
];

export const PART_FIELDS = [
  { key: "category", label: "Kategorie", type: "select", options: PART_CATEGORIES },
  { key: "name", label: "Name", type: "text", required: true },
  { key: "meta", label: "Zusatzinfo (optional)", type: "text" },
  { key: "price", label: "Preis in € netto (leer = auf Anfrage)", type: "number" },
];

export const VEHICLE_CATEGORIES = ["LKW", "PKW", "Omnibus", "Anhänger"];

export const VEHICLE_FIELDS = [
  { key: "category", label: "Kategorie", type: "select", options: VEHICLE_CATEGORIES },
  { key: "name", label: "Name", type: "text", required: true },
  { key: "meta", label: "Beschreibung (Bj., km, Ausstattung)", type: "text" },
  { key: "year", label: "Baujahr", type: "number" },
  { key: "km", label: "Laufleistung (km)", type: "number" },
  { key: "badge", label: "Badge-Text (optional)", type: "text" },
  {
    key: "badgeType",
    label: "Badge-Farbe",
    type: "select",
    options: ["", "new", "reserved"],
    optionLabels: { "": "—", new: "Neu (Akzentfarbe)", reserved: "Reserviert (grau)" },
  },
];
