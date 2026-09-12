/* PANGEA — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- hero load ---- */
  window.addEventListener("load", function () { document.body.classList.add("loaded"); });
  // fallback in case load already fired
  if (document.readyState === "complete") document.body.classList.add("loaded");

  /* ---- nav: stuck state + mobile menu ---- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");

  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks && navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- year ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- count-up animation ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix + target.toFixed(dec) + suffix; return; }
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- reveal + triggers via IntersectionObserver ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add("in");

      // count-ups inside
      el.querySelectorAll && el.querySelectorAll("[data-count]").forEach(function (c) {
        if (!c.dataset.done) { c.dataset.done = "1"; animateCount(c); }
      });
      // stat underline
      if (el.hasAttribute("data-stat")) el.classList.add("in");
      // bar fills
      if (el.hasAttribute("data-bar")) {
        var fill = el.querySelector("[data-fill]");
        if (fill) fill.style.width = fill.getAttribute("data-fill") + "%";
      }
      io.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal, [data-stat], [data-bar], .hud").forEach(function (el) { io.observe(el); });

  // hero HUD counts run on load regardless
  document.querySelectorAll(".hud [data-count]").forEach(function (c) {
    if (!c.dataset.done) { c.dataset.done = "1"; setTimeout(function(){ animateCount(c); }, 900); }
  });

  /* ---- active section in nav (home page anchors) ---- */
  var sections = [].slice.call(document.querySelectorAll("main section[id]"));
  var anchorMap = {};
  document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (a) {
    anchorMap[a.getAttribute("href").slice(1)] = a;
  });
  if (sections.length && Object.keys(anchorMap).length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var a = anchorMap[e.target.id];
          if (a) {
            document.querySelectorAll(".nav__links a.is-active").forEach(function (x) { x.classList.remove("is-active"); });
            a.classList.add("is-active");
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (anchorMap[s.id]) spy.observe(s); });
  }

  /* ---- contact form ---- */
  var form = document.getElementById("briefForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var sent = document.getElementById("formSent");
      if (sent) sent.classList.add("show");
      form.querySelectorAll("input, textarea, select, button").forEach(function (el) { el.disabled = true; });
    });
  }

  /* ---- subtle parallax on hero craft ---- */
  if (!reduce) {
    var craft = document.querySelector(".hero__craft");
    if (craft) {
      window.addEventListener("scroll", function () {
        var y = window.scrollY;
        if (y < window.innerHeight) craft.style.setProperty("--py", (y * 0.12) + "px");
      }, { passive: true });
    }
  }
})();
