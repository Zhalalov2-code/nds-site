const { getStore } = require("@netlify/blobs");
const { requireUser } = require("./auth");

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Builds a Netlify Function handler for a single JSON array (key "items")
// in the given Blobs store: GET is public, POST/PUT/DELETE require a
// logged-in Netlify Identity user. Shared by parts.js and vehicles.js so
// each of those stays a short list of field names, not a copy of this
// request-handling logic.
function createListHandler(storeName, shapeItem) {
  return async (event, context) => {
    if (event.httpMethod === "GET") {
      const store = getStore(storeName);
      const items = (await store.get("items", { type: "json" })) || [];
      return json(200, items);
    }

    // Auth is checked before any Blobs access: a bad/missing token must
    // fail with a clean 401, not a 500 from touching storage first.
    try {
      requireUser(context);
    } catch (e) {
      return json(e.statusCode || 401, { error: "Unauthorized" });
    }

    const store = getStore(storeName);
    const items = (await store.get("items", { type: "json" })) || [];

    if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body || "{}");
      const item = shapeItem({ ...data, id: data.id || genId(), createdAt: Date.now() });
      items.push(item);
      await store.setJSON("items", items);
      return json(201, item);
    }

    if (event.httpMethod === "PUT") {
      const data = JSON.parse(event.body || "{}");
      const idx = items.findIndex((i) => i.id === data.id);
      if (idx === -1) return json(404, { error: "Not found" });
      items[idx] = shapeItem({ ...items[idx], ...data });
      await store.setJSON("items", items);
      return json(200, items[idx]);
    }

    if (event.httpMethod === "DELETE") {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      const next = items.filter((i) => i.id !== id);
      await store.setJSON("items", next);
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed" });
  };
}

module.exports = { createListHandler, json };
