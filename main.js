(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  function onScroll(fn) {
    var t = false;
    window.addEventListener("scroll", function () { if (!t) { t = true; requestAnimationFrame(function () { t = false; fn(); }); } }, { passive: true });
    window.addEventListener("resize", fn);
    fn();
  }
  function madridNow() {
    try { return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" })); }
    catch (e) { return new Date(); }
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function eur(n) { return (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €"; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DAYS_S = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  var MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  /* 1. Nav + menú ------------------------------------------------ */
  function initNav() {
    var nav = $("[data-nav]");
    if (nav) onScroll(function () { nav.classList.toggle("is-scrolled", scrollY > 40); });
    var b = $(".burger"), m = $("#menu");
    if (!b || !m) return;
    function set(open) {
      b.setAttribute("aria-expanded", String(open));
      b.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      m.classList.toggle("is-open", open);
      m.setAttribute("aria-hidden", String(!open));
      document.documentElement.classList.toggle("menu-open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
    }
    b.addEventListener("click", function () { set(b.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  }

  /* 2. Saludo según la hora en la Garrotxa ---------------------- */
  function initGreeting() {
    var el = $("[data-greeting]");
    if (!el) return;
    var h = madridNow().getHours(), txt, icon;
    if (h >= 6 && h < 12) { txt = "Buenos días desde la Garrotxa"; icon = "sun"; }
    else if (h >= 12 && h < 20) { txt = "Buenas tardes desde la Garrotxa"; icon = "sun"; }
    else { txt = "Buenas noches desde la Garrotxa"; icon = "moon"; }
    var paths = {
      sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/>',
      moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'
    };
    $("svg", el).innerHTML = paths[icon];
    $("b", el).textContent = txt;
  }

  /* 3. Firma: la ventana que se abre con el scroll -------------- */
  function initWindow() {
    var sec = $("[data-window]");
    if (!sec) return;
    var sticky = $(".window-sticky", sec);
    onScroll(function () {
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / (total * 0.8)));
      var e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // ease in-out
      var mobile = innerWidth < 720;
      var wx = (mobile ? 16 : 36) * (1 - e), wy = (mobile ? 26 : 25) * (1 - e) + (mobile ? 4 : 3) * (1 - e);
      sticky.style.setProperty("--wx", wx.toFixed(2) + "%");
      sticky.style.setProperty("--wy", wy.toFixed(2) + "%");
      sticky.style.setProperty("--wr", (Math.max(0, 1 - e * 1.4) * 400).toFixed(0) + "px");
      sticky.style.setProperty("--ws", (1.25 - .25 * e).toFixed(4));
      sticky.style.setProperty("--wt", Math.max(0, (p - .72) / .28).toFixed(3));
    });
  }

  /* 4. Reveals --------------------------------------------------- */
  function initReveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-revealed"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed"); });
    }, 6000);
  }

  /* 5. Barra de reserva de la portada -> reservar.html ---------- */
  function initBookbar() {
    var f = $("[data-bookbar]");
    if (!f) return;
    var tIn = f.elements.entrada, tOut = f.elements.salida;
    var today = madridNow(); today.setHours(0, 0, 0, 0);
    tIn.min = iso(today);
    tIn.addEventListener("change", function () {
      if (!tIn.value) return;
      var min = addDays(parse(tIn.value), 1);
      tOut.min = iso(min);
      if (!tOut.value || parse(tOut.value) <= parse(tIn.value)) tOut.value = iso(addDays(parse(tIn.value), 2));
    });
  }

  /* 6. Reserva: calendario de rango, huéspedes, habitación ------- */
  function initBooking() {
    var root = $("[data-booking]");
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";
    var rooms = data.rooms || [];
    var today = madridNow(); today.setHours(0, 0, 0, 0);
    var maxDate = addDays(today, 365);
    var S = { ci: null, co: null, adults: 2, kids: 0, room: null, view: new Date(today.getFullYear(), today.getMonth(), 1) };
    var months = $(".months", root), sel = $("[data-sel]", root);
    var prevB = $("[data-prev]", root), nextB = $("[data-next]", root);
    var sum = $("[data-summary]"), err = $(".b-err"), go = $("[data-go]");

    // Fechas desde la URL (barra de la portada)
    var q = new URLSearchParams(location.search);
    if (q.get("entrada") && q.get("salida")) {
      var a = parse(q.get("entrada")), b = parse(q.get("salida"));
      if (a >= today && b > a) { S.ci = a; S.co = b; S.view = new Date(a.getFullYear(), a.getMonth(), 1); }
    }
    if (+q.get("adultos")) S.adults = Math.min(4, Math.max(1, +q.get("adultos")));
    if (q.get("habitacion")) S.room = q.get("habitacion");

    function closed(d) { return (data.closedMonths || []).indexOf(d.getMonth()) > -1; }
    // Noches "completas" simuladas: el hotel entero lleno (~8 % de los días, estables)
    function fullNight(d) { return hash("full" + iso(d)) % 100 < 8 && d.getDay() >= 5; }
    function nightOk(d) { return d >= today && d <= maxDate && !closed(d) && !fullNight(d); }
    function roomFree(room, ci, co) {
      for (var d = new Date(ci); d < co; d = addDays(d, 1)) {
        if (hash(room.id + iso(d)) % 100 < 100 / (room.units + 2)) return false; // más unidades, más fácil que quede
      }
      return true;
    }
    function nights() { return S.ci && S.co ? Math.round((S.co - S.ci) / 864e5) : 0; }
    function includesWeekend() {
      for (var d = new Date(S.ci); d < S.co; d = addDays(d, 1)) if (d.getDay() === 5 || d.getDay() === 6) return true;
      return false;
    }

    function renderMonths() {
      var html = "";
      for (var k = 0; k < 2; k++) {
        var m0 = new Date(S.view.getFullYear(), S.view.getMonth() + k, 1);
        var y = m0.getFullYear(), m = m0.getMonth();
        html += '<div class="month"><h3>' + MONTHS[m] + " " + y + '</h3><div class="grid7" role="grid">';
        ["L", "M", "X", "J", "V", "S", "D"].forEach(function (d) { html += '<span class="dow" aria-hidden="true">' + d + "</span>"; });
        var lead = (m0.getDay() + 6) % 7;
        for (var i = 0; i < lead; i++) html += "<span></span>";
        var dim = new Date(y, m + 1, 0).getDate();
        for (var dd = 1; dd <= dim; dd++) {
          var d = new Date(y, m, dd), t = d.getTime();
          var isStart = S.ci && t === S.ci.getTime(), isEnd = S.co && t === S.co.getTime();
          var inR = S.ci && S.co && d > S.ci && d < S.co;
          // se puede elegir como salida aunque esa noche esté llena
          var choosingOut = S.ci && !S.co;
          var ok = choosingOut ? (d > S.ci && d <= maxDate && rangeClear(S.ci, d)) : nightOk(d);
          var cls = (isStart ? " is-start" : "") + (isEnd ? " is-end" : "") + (inR ? " in-range" : "") + (t === today.getTime() ? " today" : "");
          var price = !closed(d) && d >= today && !fullNight(d) ? (d.getDay() === 5 || d.getDay() === 6 ? "·" : "") : "";
          var label = DAYS[d.getDay()] + " " + dd + " de " + MONTHS[m] + (ok ? "" : closed(d) ? ", cerrado" : fullNight(d) ? ", completo" : ", no disponible");
          html += '<button type="button" class="' + cls.trim() + '" data-d="' + iso(d) + '" aria-label="' + label + '" aria-pressed="' + (!!(isStart || isEnd)) + '"' + (ok ? "" : " disabled") + "><span>" + dd + "</span>" + (price ? "<small>" + price + "</small>" : "") + "</button>";
        }
        html += "</div></div>";
      }
      months.innerHTML = html;
      prevB.disabled = S.view <= new Date(today.getFullYear(), today.getMonth(), 1);
      nextB.disabled = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1) > maxDate;
      if (!S.ci) sel.innerHTML = "Elige el día de <b>llegada</b>";
      else if (!S.co) sel.innerHTML = "Llegada <b>" + S.ci.getDate() + " " + MONTHS[S.ci.getMonth()].slice(0, 3) + "</b> · ahora elige la <b>salida</b>";
      else sel.innerHTML = "<b>" + nights() + (nights() === 1 ? " noche" : " noches") + "</b> · " + S.ci.getDate() + " " + MONTHS[S.ci.getMonth()].slice(0, 3) + " → " + S.co.getDate() + " " + MONTHS[S.co.getMonth()].slice(0, 3);
    }
    function rangeClear(a, b) { for (var d = new Date(a); d < b; d = addDays(d, 1)) if (!nightOk(d)) return false; return true; }

    months.addEventListener("click", function (e) {
      var bt = e.target.closest("button[data-d]"); if (!bt || bt.disabled) return;
      var d = parse(bt.dataset.d);
      if (!S.ci || S.co) { S.ci = d; S.co = null; }
      else if (d <= S.ci) { S.ci = d; }
      else S.co = d;
      err.textContent = "";
      renderMonths(); renderRooms(); renderSummary();
    });
    prevB.addEventListener("click", function () { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderMonths(); });
    nextB.addEventListener("click", function () { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderMonths(); });
    var clear = $("[data-clear]", root);
    if (clear) clear.addEventListener("click", function () { S.ci = S.co = null; renderMonths(); renderRooms(); renderSummary(); });

    // Huéspedes
    function renderGuests() {
      $("[data-adults]", root).value = S.adults; $("[data-adults]", root).textContent = S.adults;
      $("[data-kids]", root).value = S.kids; $("[data-kids]", root).textContent = S.kids;
      $('[data-g="adults-"]', root).disabled = S.adults <= 1;
      $('[data-g="adults+"]', root).disabled = S.adults + S.kids >= 4;
      $('[data-g="kids-"]', root).disabled = S.kids <= 0;
      $('[data-g="kids+"]', root).disabled = S.adults + S.kids >= 4;
    }
    $$("[data-g]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.dataset.g;
        if (g === "adults+") S.adults++; if (g === "adults-") S.adults--;
        if (g === "kids+") S.kids++; if (g === "kids-") S.kids--;
        renderGuests(); renderRooms(); renderSummary();
      });
    });

    // Habitaciones
    function renderRooms() {
      var guests = S.adults + S.kids;
      $$(".ropt", root).forEach(function (el) {
        var r = rooms.filter(function (x) { return x.id === el.dataset.room; })[0];
        var input = $("input", el), tag = $(".full", el), pr = $(".pr", el);
        var fits = guests <= r.max;
        var free = S.ci && S.co ? roomFree(r, S.ci, S.co) : true;
        input.disabled = !fits || !free;
        tag.textContent = !fits ? "Máx. " + r.max + " personas" : !free ? "Completa esas fechas" : "";
        if (S.ci && S.co && fits && free) {
          var tot = roomTotal(r);
          pr.innerHTML = eur(tot) + "<small>" + nights() + (nights() === 1 ? " noche" : " noches") + "</small>";
        } else pr.innerHTML = "desde " + r.week + " €<small>por noche</small>";
        if (input.disabled && input.checked) { input.checked = false; S.room = null; }
        if (S.room === r.id && !input.disabled) input.checked = true;
      });
    }
    function roomTotal(r) {
      var t = 0;
      for (var d = new Date(S.ci); d < S.co; d = addDays(d, 1)) t += (d.getDay() === 5 || d.getDay() === 6) ? r.weekend : r.week;
      return t;
    }
    root.addEventListener("change", function (e) {
      if (e.target.name === "habitacion") S.room = e.target.value;
      err.textContent = "";
      renderSummary();
    });

    // Resumen
    function renderSummary() {
      if (!sum) return;
      var r = rooms.filter(function (x) { return x.id === S.room; })[0];
      var n = nights();
      $("[data-s-dates]", sum).textContent = S.ci && S.co ? DAYS_S[S.ci.getDay()] + " " + S.ci.getDate() + " " + MONTHS[S.ci.getMonth()].slice(0, 3) + " → " + DAYS_S[S.co.getDay()] + " " + S.co.getDate() + " " + MONTHS[S.co.getMonth()].slice(0, 3) : "—";
      $("[data-s-guests]", sum).textContent = S.adults + (S.adults === 1 ? " adulto" : " adultos") + (S.kids ? " · " + S.kids + (S.kids === 1 ? " niño" : " niños") : "");
      $("[data-s-room]", sum).textContent = r ? r.name : "—";
      if (r) { var im = $(".ph img", sum); if (im.getAttribute("src") !== r.img) { im.src = r.img; im.alt = "Habitación " + r.name; } }
      var lines = $("[data-s-lines]", sum), html = "", total = 0;
      if (r && n) {
        var wk = 0, we = 0;
        for (var d = new Date(S.ci); d < S.co; d = addDays(d, 1)) { if (d.getDay() === 5 || d.getDay() === 6) we++; else wk++; }
        if (wk) { html += "<div><span>" + wk + " × noche entre semana</span><span>" + eur(wk * r.week) + "</span></div>"; }
        if (we) { html += "<div><span>" + we + " × noche de fin de semana</span><span>" + eur(we * r.weekend) + "</span></div>"; }
        total = wk * r.week + we * r.weekend;
        var people = S.adults + S.kids;
        if ($("#x-desayuno", root).checked) { var b = data.breakfast * people * n; html += "<div><span>Desayuno · " + people + " × " + n + "</span><span>" + eur(b) + "</span></div>"; total += b; }
        if ($("#x-cena", root).checked) { var c = data.dinner * people; html += "<div><span>Cena de temporada · " + people + "</span><span>" + eur(c) + "</span></div>"; total += c; }
        if ($("#x-mascota", root).checked) { html += "<div><span>Mascota</span><span>" + eur(data.pet) + "</span></div>"; total += data.pet; }
        var tax = data.touristTax * S.adults * n;
        html += "<div><span>Tasa turística</span><span>" + eur(tax) + "</span></div>"; total += tax;
      }
      lines.innerHTML = html;
      $("[data-s-total]", sum).textContent = total ? eur(total) : "—";
      go.disabled = !(r && n);
    }

    function validate() {
      if (!S.ci || !S.co) return "Elige las fechas de llegada y salida.";
      if (includesWeekend() && nights() < (data.minNights || 1)) return "Las estancias con viernes o sábado son de " + data.minNights + " noches como mínimo.";
      if (!S.room) return "Elige una habitación.";
      return "";
    }
    go.addEventListener("click", function () {
      var e = validate();
      if (e) { err.textContent = e; return; }
      var form = $("[data-guest-form]");
      form.hidden = false;
      go.hidden = true;
      var h = $("h2", form); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
      window.scrollTo({ top: form.getBoundingClientRect().top + scrollY - 120, behavior: reduced ? "auto" : "smooth" });
    });
    root.addEventListener("change", function (e) { if (e.target.closest(".checks")) renderSummary(); });

    // Datos del huésped y confirmación
    var form = $("[data-guest-form]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (el) {
        var v = el.value.trim(), msg = "";
        if (!v) msg = "Campo obligatorio";
        else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Email no válido";
        else if (el.type === "tel" && v.replace(/\D/g, "").length < 9) msg = "Teléfono no válido";
        var w = el.closest(".field"); w.classList.toggle("is-invalid", !!msg); $(".err", w).textContent = msg;
        if (msg) ok = false;
      });
      if (!ok) { var bad = $(".is-invalid input", form); if (bad) bad.focus(); return; }
      var b = $("button[type=submit]", form); b.disabled = true; b.textContent = "Confirmando…";
      setTimeout(function () {
        var done = $("[data-done]");
        $("[data-done-name]", done).textContent = form.elements.nombre.value.trim().split(" ")[0];
        $("[data-done-code]", done).textContent = "ALZ-" + (hash(form.elements.email.value + iso(S.ci)) % 90000 + 10000);
        $("[data-done-when]", done).textContent = $("[data-s-dates]", sum).textContent + " · " + $("[data-s-room]", sum).textContent;
        $$(".panel:not([data-done])", root).forEach(function (p) { p.hidden = true; });
        form.hidden = true;
        done.classList.add("is-visible");
        done.setAttribute("tabindex", "-1"); done.focus({ preventScroll: true });
        window.scrollTo({ top: done.getBoundingClientRect().top + scrollY - 140, behavior: reduced ? "auto" : "smooth" });
      }, 1000);
    });

    renderMonths(); renderGuests(); renderRooms(); renderSummary();
  }

  /* Arranque ---------------------------------------------------- */
  function boot() {
    safe(initNav, "initNav");
    safe(initGreeting, "initGreeting");
    safe(initWindow, "initWindow");
    safe(initReveals, "initReveals");
    safe(initBookbar, "initBookbar");
    safe(initBooking, "initBooking");
    if (window.gsap && window.ScrollTrigger) { try { gsap.registerPlugin(ScrollTrigger); } catch (_) {} }
    window.__KB_OK = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add("is-loaded"); }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
