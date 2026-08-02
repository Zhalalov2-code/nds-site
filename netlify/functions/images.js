const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");
const { requireUser } = require("./_lib/auth");

const STORE = "images";

exports.handler = async (event, context) => {
  if (event.httpMethod === "GET") {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) return { statusCode: 400, body: "Missing key" };
    const store = getStore(STORE);
    const blob = await store.get(key, { type: "arrayBuffer" });
    if (!blob) return { statusCode: 404, body: "Not found" };
    const meta = await store.getMetadata(key);
    return {
      statusCode: 200,
      headers: {
        "Content-Type":
          (meta && meta.metadata && meta.metadata.contentType) ||
          "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: Buffer.from(blob).toString("base64"),
      isBase64Encoded: true,
    };
  }

  if (event.httpMethod === "POST") {
    try {
      requireUser(context);
    } catch (e) {
      return { statusCode: e.statusCode || 401, body: "Unauthorized" };
    }
    const { filename, dataBase64, contentType } = JSON.parse(event.body || "{}");
    if (!dataBase64) return { statusCode: 400, body: "Missing dataBase64" };
    const ext = (filename && filename.split(".").pop()) || "jpg";
    const key = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(dataBase64, "base64");
    const store = getStore(STORE);
    await store.set(key, buffer, {
      metadata: { contentType: contentType || "image/jpeg" },
    });
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `/api/images?key=${encodeURIComponent(key)}` }),
    };
  }

  return { statusCode: 405, body: "Method not allowed" };
};
