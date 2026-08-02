import netlifyIdentity from "netlify-identity-widget";

function authHeaders() {
  const user = netlifyIdentity.currentUser();
  const token = user && user.token && user.token.access_token;
  return token ? { Authorization: "Bearer " + token } : {};
}

async function request(path, options) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options && options.headers),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${options && options.method ? options.method : "GET"} ${path} -> ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: (resource) => request(`/api/${resource}`),
  create: (resource, data) =>
    request(`/api/${resource}`, { method: "POST", body: JSON.stringify(data) }),
  update: (resource, data) =>
    request(`/api/${resource}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (resource, id) =>
    request(`/api/${resource}?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file) {
  const dataBase64 = await fileToBase64(file);
  const { url } = await request("/api/images", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "image/jpeg",
      dataBase64,
    }),
  });
  return url;
}
