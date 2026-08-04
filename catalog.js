// Renders the Ersatzteile/Fahrzeuge cards from the static data/parts.json
// and data/vehicles.json files instead of hardcoded HTML per item — adding
// a new part means adding one entry to that JSON, not copying a whole
// <article class="card"> block. One template per item type, reused for
// both the full catalog grids and the homepage teasers.
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatEuro(n) {
    if (n == null || n === "") return "Preis auf Anfrage";
    return (
      Number(n).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " € netto"
    );
  }

  function imgTag(image, alt) {
    if (!image) {
      return '<image-slot class="s53" shape="rect" placeholder="Foto folgt"></image-slot>';
    }
    return '<img class="s53" src="' + esc(image) + '" alt="' + esc(alt) + '">';
  }

  function partCard(p, opts) {
    opts = opts || {};
    var meta = p.meta
      ? '<p class="card-meta s55">' + esc(p.meta) + "</p>"
      : "";
    var cta = opts.withCta
      ? '<a href="index.html?anliegen=Ersatzteil-Anfrage&bezug=' +
      encodeURIComponent(p.name) +
      '#werkstatt" class="btn btn-secondary s57">Anfragen</a>'
      : "";
    return (
      '<article class="card s52" data-price="' +
      (p.price == null ? "" : p.price) +
      '" data-name="' +
      esc(p.name) +
      '">' +
      imgTag(p.image, p.name) +
      '<div class="s54">' +
      '<span class="card-kicker">' +
      esc(p.category) +
      "</span>" +
      '<h3 class="card-title s28">' +
      esc(p.name) +
      "</h3>" +
      meta +
      '<p class="s56">' +
      formatEuro(p.price) +
      "</p>" +
      cta +
      "</div>" +
      "</article>"
    );
  }

  function vehicleCard(v, opts) {
    opts = opts || {};
    var badge = v.badge
      ? '<span class="veh-badge' +
      (v.badgeType === "reserved" ? " veh-badge-reserved" : "") +
      '">' +
      esc(v.badge) +
      "</span>"
      : "";
    var media = badge
      ? '<div class="veh-media">' + imgTag(v.image, v.name) + badge + "</div>"
      : imgTag(v.image, v.name);
    var cta = opts.withCta
      ? '<a href="index.html?anliegen=Fahrzeugkauf%20oder%20-verkauf&bezug=' +
      encodeURIComponent(v.name) +
      '#werkstatt" class="btn btn-secondary s57">Anfragen</a>'
      : "";
    return (
      '<article class="card s52" data-year="' +
      (v.year || "") +
      '" data-km="' +
      (v.km || "") +
      '">' +
      media +
      '<div class="s54">' +
      '<span class="card-kicker">' +
      esc(v.category) +
      "</span>" +
      '<h3 class="card-title s28">' +
      esc(v.name) +
      "</h3>" +
      '<p class="card-meta s55">' +
      esc(v.meta) +
      "</p>" +
      '<p class="s56">' +
      esc(v.price || "Preis auf Anfrage") +
      "</p>" +
      cta +
      "</div>" +
      "</article>"
    );
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.json();
    });
  }

  function render(containerId, url, template, opts) {
    var el = document.getElementById(containerId);
    if (!el) return;
    fetchJson(url)
      .then(function (items) {
        if (opts && opts.limit) items = items.slice(0, opts.limit);
        el.innerHTML = items.map(function (item) {
          return template(item, opts);
        }).join("");
      })
      .catch(function (e) {
        console.error("[catalog]", e);
      });
  }

  // Full catalog page (ersatzteile.html): all items, with an "Anfragen" CTA
  // per card. The Fahrzeuge page/section is disabled for now (vehicleCard
  // and data/vehicles.json are kept so it's a two-line change to bring back).
  render("teile-grid", "data/parts.json", partCard, { withCta: true });

  // Homepage teaser: first 3 items, no CTA (the section itself has one
  // "Alle ansehen" button below the grid).
  render("teile-teaser-grid", "data/parts.json", partCard, { limit: 3 });
})();
