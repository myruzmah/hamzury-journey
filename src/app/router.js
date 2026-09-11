/* ============================================================
   MODAL ROUTER & FOCUS MANAGEMENT
   Clean hash-based URL routing with accessibility focus trapping
   ============================================================ */
import { $, esc } from "../data/constants.js";

export const Router = (function () {
  let modal, panel, content, backbtn;
  let lastFocus = null;
  let toastTimer = null;
  const V = {};
  const S = { stack: 0 };

  const FOC = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function init() {
    modal = $("#modal");
    panel = $("#panel");
    content = $("#content");
    backbtn = $("#backbtn");

    window.addEventListener("popstate", sync);

    let downOnBackdrop = false;
    modal.addEventListener("mousedown", (e) => {
      downOnBackdrop = (e.target === modal);
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal && downOnBackdrop) close();
      downOnBackdrop = false;
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const it = Array.from(panel.querySelectorAll(FOC)).filter((el) => el.offsetParent !== null);
      if (!it.length) return;
      const f = it[0], l = it[it.length - 1];
      if (e.shiftKey && (document.activeElement === f || document.activeElement === panel)) {
        e.preventDefault();
        l.focus();
      } else if (!e.shiftKey && document.activeElement === l) {
        e.preventDefault();
        f.focus();
      }
    });

    // Initial check
    sync();
  }

  function registerView(key, viewFn) {
    V[key] = viewFn;
  }

  function render(key) {
    const v = V[key];
    if (!v) return hide();
    const d = v();
    content.innerHTML =
      '<h2 id="mt">' + esc(d.t) + "</h2>" +
      (d.sub ? '<div class="sub">' + esc(d.sub) + "</div>" : "") +
      d.h;

    if (!modal.classList.contains("open")) {
      lastFocus = document.activeElement;
      modal.hidden = false;
      modal.classList.add("open");
      document.body.classList.add("locked");
    }

    backbtn.hidden = S.stack < 2;
    panel.scrollTop = 0;
    panel.focus();
    if (d.after) d.after();
  }

  function hide() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.hidden = true;
    document.body.classList.remove("locked");
    S.stack = 0;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function open(key) {
    if (!V[key]) return;
    if (location.hash !== "#/" + key) {
      S.stack++;
      history.pushState({ m: key, d: S.stack }, "", "#/" + key);
    }
    render(key);
  }

  function close() {
    if (!modal.classList.contains("open")) return;
    if (S.stack > 0) {
      history.go(-S.stack);
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      hide();
    }
  }

  function back() {
    history.back();
  }

  function sync() {
    const key = (location.hash || "").replace(/^#\/?/, "");
    if (V[key]) {
      S.stack = (history.state && history.state.d) || 0;
      render(key);
    } else {
      hide();
    }
  }

  function toast(message) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth"
    });
  }

  return {
    init,
    registerView,
    open,
    close,
    back,
    render,
    toast,
    scrollToTop,
    getViews: () => V,
    getState: () => S
  };
})();
