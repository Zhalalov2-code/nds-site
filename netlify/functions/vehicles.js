const { createListHandler } = require("./_lib/crud-list");

function shapeVehicle(data) {
  return {
    id: data.id,
    createdAt: data.createdAt,
    category: data.category || "",
    name: data.name || "",
    meta: data.meta || "",
    year: data.year === "" || data.year == null ? null : Number(data.year),
    km: data.km === "" || data.km == null ? null : Number(data.km),
    price: data.price || "Preis auf Anfrage",
    badge: data.badge || null,
    badgeType: data.badgeType || null, // "new" | "reserved" | null
    image: data.image || null,
  };
}

exports.handler = createListHandler("fahrzeuge", shapeVehicle);
