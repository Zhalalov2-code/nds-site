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

  // Fixed nav is always visible; it's see-through over the hero and turns
  // solid once the hero is scrolled past (see .nav-solid in styles.css).
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
    if (!hero) {
      // Pages without a hero (e.g. ersatzteile.html) never go transparent.
      nav.classList.add("nav-solid");
      return;
    }
    var solid = scrollY > hero.offsetTop + hero.offsetHeight - 120;
    nav.classList.toggle("nav-solid", solid);
    if (!solid) closeMenu();
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

  // Bilder-Karussell über "Über uns": Pfeile, Punkte, automatischer Wechsel
  // (pausiert bei Hover/Fokus, damit man in Ruhe schauen kann).
  var carouselTrack = document.getElementById("carousel-track");
  if (carouselTrack) {
    var carouselSlides = [].slice.call(carouselTrack.children);
    var carouselDotsEl = document.getElementById("carousel-dots");
    var carouselDots = carouselDotsEl
      ? [].slice.call(carouselDotsEl.children)
      : [];
    var carouselCurrent = 0;
    var carouselTimer = null;

    function carouselGoTo(index) {
      carouselCurrent = (index + carouselSlides.length) % carouselSlides.length;
      carouselTrack.style.transform = "translateX(-" + carouselCurrent * 100 + "%)";
      carouselDots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === carouselCurrent);
      });
    }
    function carouselStop() {
      if (carouselTimer) clearInterval(carouselTimer);
    }
    function carouselStart() {
      carouselStop();
      carouselTimer = setInterval(function () {
        carouselGoTo(carouselCurrent + 1);
      }, 5000);
    }

    var carouselPrev = document.getElementById("carousel-prev");
    var carouselNext = document.getElementById("carousel-next");
    if (carouselPrev) {
      carouselPrev.addEventListener("click", function () {
        carouselGoTo(carouselCurrent - 1);
        carouselStart();
      });
    }
    if (carouselNext) {
      carouselNext.addEventListener("click", function () {
        carouselGoTo(carouselCurrent + 1);
        carouselStart();
      });
    }
    carouselDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        carouselGoTo(i);
        carouselStart();
      });
    });
    var carouselEl = document.getElementById("hero-carousel");
    if (carouselEl) {
      carouselEl.addEventListener("mouseenter", carouselStop);
      carouselEl.addEventListener("mouseleave", carouselStart);
      carouselEl.addEventListener("focusin", carouselStop);
      carouselEl.addEventListener("focusout", carouselStart);
    }
    carouselGoTo(0);
    carouselStart();
  }

  // Kontakt-FAB und Cookie-Tab lassen sich am Rand nach oben/unten ziehen;
  // die Position wird pro Browser in localStorage gemerkt. Beim Kontakt-FAB
  // zieht man am Griff (nicht an den Anruf-/Mail-Links selbst), beim
  // Cookie-Tab reicht ein Zug auf den Tab — ein echter Klick öffnet weiter
  // das Panel, unterschieden über eine kleine Bewegungs-Schwelle.
  function makeVerticalDraggable(el, handle, storageKey, keepTransform) {
    if (!el || !handle) return { wasDragged: function () { return false; } };
    var dragging = false;
    var moved = false;
    var startY = 0;
    var startTop = 0;

    function clampTop(top) {
      var max = innerHeight - el.offsetHeight - 8;
      return Math.max(8, Math.min(max, top));
    }
    function applyTop(top) {
      el.style.top = clampTop(top) + "px";
      el.style.transform = keepTransform || "none";
    }
    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = false;
      startY = e.clientY;
      startTop = el.getBoundingClientRect().top;
      if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      if (Math.abs(dy) > 4) moved = true;
      if (moved) {
        e.preventDefault();
        applyTop(startTop + dy);
      }
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        try {
          localStorage.setItem(storageKey, el.style.top);
        } catch (e) {}
      }
    }
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    addEventListener("resize", function () {
      if (el.style.top) applyTop(parseFloat(el.style.top));
    });

    var savedTop = null;
    try {
      savedTop = localStorage.getItem(storageKey);
    } catch (e) {}
    if (savedTop) applyTop(parseFloat(savedTop));

    return {
      wasDragged: function () {
        var m = moved;
        moved = false;
        return m;
      },
    };
  }
  makeVerticalDraggable(
    document.getElementById("contact-fab"),
    document.getElementById("fab-drag-handle"),
    "nds_fab_pos_top",
    "none",
  );
  var cookieTabDrag = null; // wired up below, once cookieTab is looked up

  // Cookie-Hinweis: listet den einen echten Drittanbieterdienst der Website
  // (Google Maps im Anfahrt-Bereich) auf. Die Karte wird erst geladen, wenn
  // zugestimmt wurde — vorher steht nur ein Platzhalter mit Direkt-Zustimmung.
  var COOKIE_MAPS_KEY = "nds_cookie_maps_consent"; // "1" | "0"
  var cookieTab = document.getElementById("cookie-tab");
  var cookiePanel = document.getElementById("cookie-panel");
  var mapsToggle = document.getElementById("cookie-maps-toggle");
  var mapsToggleState = document.getElementById("cookie-switch-state");
  var saveBtn = document.getElementById("cookie-save");
  var acceptAllBtn = document.getElementById("cookie-accept-all");
  var resetBtn2 = document.getElementById("cookie-reset");
  var mapsFrame = document.querySelector("iframe[data-src]");
  var mapsOverlay = document.getElementById("maps-overlay");
  var mapsLoadBtn = document.getElementById("maps-load-btn");

  function openCookiePanel() {
    if (cookiePanel) cookiePanel.hidden = false;
  }
  function closeCookiePanel() {
    if (cookiePanel) cookiePanel.hidden = true;
  }
  function updateToggleLabel() {
    if (mapsToggleState && mapsToggle) {
      mapsToggleState.textContent = mapsToggle.checked ? "An" : "Aus";
    }
  }
  function loadMaps() {
    if (mapsFrame && mapsFrame.dataset.src && !mapsFrame.src) {
      mapsFrame.src = mapsFrame.dataset.src;
    }
    if (mapsOverlay) mapsOverlay.hidden = true;
  }
  function applyConsent(consent) {
    try {
      localStorage.setItem(COOKIE_MAPS_KEY, consent ? "1" : "0");
    } catch (e) {}
    if (mapsToggle) mapsToggle.checked = consent;
    updateToggleLabel();
    if (consent) loadMaps();
  }

  cookieTabDrag = makeVerticalDraggable(
    cookieTab,
    cookieTab,
    "nds_cookie_tab_pos_top",
    "rotate(180deg)",
  );
  if (cookieTab) {
    cookieTab.addEventListener("click", function () {
      if (cookieTabDrag.wasDragged()) return;
      openCookiePanel();
    });
  }
  if (mapsToggle) mapsToggle.addEventListener("change", updateToggleLabel);
  if (mapsLoadBtn) {
    mapsLoadBtn.addEventListener("click", function () {
      applyConsent(true);
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      applyConsent(!!(mapsToggle && mapsToggle.checked));
      closeCookiePanel();
    });
  }
  if (acceptAllBtn) {
    acceptAllBtn.addEventListener("click", function () {
      applyConsent(true);
      closeCookiePanel();
    });
  }
  if (resetBtn2) {
    resetBtn2.addEventListener("click", function () {
      try {
        localStorage.removeItem(COOKIE_MAPS_KEY);
      } catch (e) {}
      if (mapsToggle) mapsToggle.checked = false;
      updateToggleLabel();
      if (mapsFrame) mapsFrame.removeAttribute("src");
      if (mapsOverlay) mapsOverlay.hidden = false;
      openCookiePanel();
    });
  }
  if (cookiePanel) {
    cookiePanel.addEventListener("click", function (e) {
      if (e.target === cookiePanel) closeCookiePanel();
    });
  }

  var storedMapsConsent = null;
  try {
    storedMapsConsent = localStorage.getItem(COOKIE_MAPS_KEY);
  } catch (e) {}
  if (storedMapsConsent === "1") {
    applyConsent(true);
  } else if (storedMapsConsent === "0") {
    // User already made a choice (declined) — respect it, don't nag again.
    updateToggleLabel();
  } else {
    // No decision yet — ask once.
    openCookiePanel();
  }
})();
