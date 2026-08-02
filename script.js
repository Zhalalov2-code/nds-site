(function () {
  // TODO: Web3Forms-Zugriffsschlüssel eintragen, bevor die Website live geht.
  // So bekommt man einen: auf https://web3forms.com/ mit der Empfänger-Mail
  // (z. B. nds@nds-nutzfahrzeuge.de) anmelden, kostenlosen Access Key
  // erzeugen und hier einsetzen. Ohne Schlüssel zeigen alle Formulare nur
  // einen Hinweis an und senden nichts.
  var KEY = "YOUR_WEB3FORMS_ACCESS_KEY";
  var ENDPOINT = "https://api.web3forms.com/submit";
  function val(id) {
    var e = document.getElementById(id);
    return e ? String(e.value || "").trim() : "";
  }

  // Shared sender for every form on the site (Werkstatt-Termin, Ankauf,
  // Newsletter) — one Web3Forms key, one place to wire up.
  function sendLead(payload, onSuccess) {
    if (!KEY || KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
      alert(
        "E-Mail-Versand ist noch nicht konfiguriert.\nBitte den Web3Forms Access Key im Quelltext eintragen.",
      );
      return;
    }
    payload.access_key = KEY;
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (!d || !d.success) {
          console.error("[Web3Forms]", d);
          return;
        }
        if (onSuccess) onSuccess();
      })
      .catch(function (e) {
        console.error("[Web3Forms]", e);
      });
  }

  // Fixed nav appears once the hero is scrolled past.
  var nav = document.getElementById("site-nav");
  var menu = document.getElementById("mobile-menu");
  var burger = nav ? nav.querySelector('button[aria-label="Menü"]') : null;
  function closeMenu() {
    if (menu) menu.style.display = "none";
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  function onScroll() {
    if (!nav) return;
    var hero = document.getElementById("hero");
    var limit = hero
      ? hero.offsetTop + hero.offsetHeight - 120
      : innerHeight * 0.75;
    var shown = scrollY > limit;
    nav.style.transform = shown ? "translateY(0)" : "translateY(-100%)";
    nav.style.opacity = shown ? "1" : "0";
    nav.style.pointerEvents = shown ? "auto" : "none";
    if (!shown) closeMenu();
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Burger toggles the mobile menu.
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.style.display === "none" || !menu.style.display
        ? ((menu.style.display = "block"),
          burger.setAttribute("aria-expanded", "true"))
        : closeMenu();
    });
    [].forEach.call(menu.querySelectorAll("a"), function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  // Category filter — shared by the Fahrzeuge- and Ersatzteile-Kataloge:
  // each page has at most one tag/card grid, so this runs generically. The
  // tag buttons are static HTML, but the cards are fetched and inserted by
  // catalog.js after this script runs — so cards are re-queried on every
  // click rather than captured once, which would just see an empty grid.
  var tabs = [].slice.call(document.querySelectorAll(".tag"));
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var label = t.textContent.trim();
      tabs.forEach(function (x) {
        x.classList.remove("tag-accent");
        x.classList.add("tag-outline");
      });
      t.classList.add("tag-accent");
      t.classList.remove("tag-outline");
      var cards = [].slice.call(document.querySelectorAll("article.card"));
      cards.forEach(function (c) {
        var k = c.querySelector(".card-kicker");
        var cat = k ? k.textContent.trim() : "";
        c.style.display = label === "Alle" || cat === label ? "" : "none";
      });
    });
  });

  // Contact form: validate, send via Web3Forms, show confirmation.
  var sendBtn = document.getElementById("btn-send");
  var fields = document.getElementById("form-fields");
  var sentView = document.getElementById("form-sent");
  var resetBtn = document.getElementById("btn-reset");
  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      var name = val("f-name"),
        tel = val("f-tel");
      var consent = fields
        ? fields.querySelector('input[type="checkbox"]')
        : null;
      var miss = [];
      if (!name) miss.push("Name");
      if (!tel) miss.push("Telefon");
      if (consent && !consent.checked) miss.push("Datenschutz-Zustimmung");
      if (miss.length) {
        alert("Bitte ausfüllen: " + miss.join(", "));
        return;
      }
      var mail = val("f-mail");
      var payload = {
        subject: "Neue Anfrage über nds-nutzfahrzeuge.de",
        from_name: "NDS Nutzfahrzeuge Website",
        Name: name,
        Firma: val("f-firma"),
        Telefon: tel,
        "E-Mail": mail,
        Fahrzeug: val("f-fzg"),
        Anliegen: val("f-anliegen"),
        Wunschtermin: val("f-datum"),
        Nachricht: val("f-text"),
      };
      if (mail) payload.replyto = mail;
      sendLead(payload, function () {
        if (fields) fields.style.display = "none";
        if (sentView) sentView.style.display = "flex";
      });
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (sentView) sentView.style.display = "none";
      if (fields) fields.style.display = "flex";
    });
  }

  // Cross-page "Anfragen"-Links (von fahrzeuge.html / ersatzteile.html) tragen
  // ?anliegen=…&bezug=… — damit ist das Werkstatt-Formular nach dem Sprung
  // schon vorausgefüllt, statt dass der Kunde alles nochmal eintippt.
  var urlParams = new URLSearchParams(location.search);
  var anliegenParam = urlParams.get("anliegen");
  var bezugParam = urlParams.get("bezug");
  if (anliegenParam) {
    var anliegenSel = document.getElementById("f-anliegen");
    if (anliegenSel) anliegenSel.value = anliegenParam;
  }
  if (bezugParam) {
    var bezugField = document.getElementById("f-text");
    if (bezugField && !bezugField.value)
      bezugField.value = "Anfrage zu: " + bezugParam;
  }

  // Newsletter: single email field, own subject line.
  var newsBtn = document.getElementById("btn-newsletter");
  if (newsBtn) {
    newsBtn.addEventListener("click", function () {
      var mail = val("n-mail");
      if (!mail) {
        alert("Bitte E-Mail-Adresse eingeben.");
        return;
      }
      sendLead(
        {
          subject: "Neue Newsletter-Anmeldung — nds-nutzfahrzeuge.de",
          from_name: "NDS Nutzfahrzeuge Website — Newsletter",
          "E-Mail": mail,
          replyto: mail,
        },
        function () {
          var f = document.getElementById("newsletter-fields");
          var s = document.getElementById("newsletter-sent");
          if (f) f.style.display = "none";
          if (s) s.style.display = "block";
        },
      );
    });
  }

  // Sortierung: sortiert die Karten eines Grids um, ohne den aktiven
  // Kategorie-Filter zu verändern. Ein Grid pro Seite (Fahrzeuge oder
  // Ersatzteile), daher dieselbe Funktion für beide.
  function wireSort(selectId, gridId, modes) {
    var sel = document.getElementById(selectId);
    var grid = document.getElementById(gridId);
    if (!sel || !grid) return;
    sel.addEventListener("change", function () {
      var cmp = modes[sel.value];
      if (!cmp) return;
      var items = [].slice.call(grid.querySelectorAll("article.card"));
      items.sort(cmp);
      items.forEach(function (el) {
        grid.appendChild(el);
      });
    });
  }
  wireSort("veh-sort", "veh-grid", {
    "year-desc": function (a, b) {
      return (b.dataset.year || 0) - (a.dataset.year || 0);
    },
    "year-asc": function (a, b) {
      return (a.dataset.year || 0) - (b.dataset.year || 0);
    },
    "km-asc": function (a, b) {
      return (a.dataset.km || 0) - (b.dataset.km || 0);
    },
  });
  wireSort("teile-sort", "teile-grid", {
    "price-asc": function (a, b) {
      return (a.dataset.price || 0) - (b.dataset.price || 0);
    },
    "price-desc": function (a, b) {
      return (b.dataset.price || 0) - (a.dataset.price || 0);
    },
    "name-asc": function (a, b) {
      return String(a.dataset.name || "").localeCompare(
        String(b.dataset.name || ""),
      );
    },
  });

  // Hero video: muted, half speed, plays once.
  var v = document.querySelector("#hero video");
  if (v) {
    v.muted = true;
    v.playsInline = true;
    v.loop = false;
    v.playbackRate = 0.5;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
    v.addEventListener("ended", function () {
      v.pause();
    });
  }
})();
