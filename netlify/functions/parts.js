const { createListHandler } = require("./_lib/crud-list");

function shapePart(data) {
  return {
    id: data.id,
    createdAt: data.createdAt,
    category: data.category || "",
    name: data.name || "",
    meta: data.meta || "",
    price: data.price === "" || data.price == null ? null : Number(data.price),
    image: data.image || null,
  };
}

exports.handler = createListHandler("ersatzteile", shapePart);
