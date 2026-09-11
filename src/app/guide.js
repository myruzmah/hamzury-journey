/* ============================================================
   GUIDE ME — ADAPTIVE DIAGNOSTIC ENGINE
   Selects questions dynamically to resolve direction, experience & age
   ============================================================ */
import { $, esc } from "../data/constants.js";
import { TR } from "../data/tracks.js";
import { RT, ND } from "../data/routes.js";
import { QP, QID } from "../data/questions.js";
import { Router } from "./router.js";

export const Guide = (function () {
  const G = { asked: [], picks: [], sc: {}, ev: 0, current: null };
  const S = { level: null, jroute: null, age: null, route: null, track: null, guess: null };

  const resetG = () => {
    G.asked = [];
    G.picks = [];
    G.sc = {};
    G.ev = 0;
    G.current = null;
    TR.forEach((t) => (G.sc[t.id] = 0));
    S.age = null;
  };

  const ranked = () => TR.slice().sort((a, b) => G.sc[b.id] - G.sc[a.id]);
  const knowDirection = () => {
    const r = ranked();
    return G.sc[r[0].id] >= 3 && G.sc[r[0].id] - G.sc[r[1].id] >= 2;
  };
  const knowExperience = () => Math.abs(G.ev) >= 2;
  const knowAge = () => Boolean(S.age);
  const MAX_ASK = 4;
  const poolDry = () =>
    G.asked.filter((id) => QID(id).dim !== "age").length >= MAX_ASK ||
    QP.filter((q) => q.dim !== "age" && !G.asked.includes(q.id)).length === 0;

  const juniorLocked = () => S.age === "13-16";

  function enough() {
    if (!knowAge()) return false;
    if (juniorLocked()) return knowExperience() || poolDry();
    return (knowDirection() || poolDry()) && (knowExperience() || poolDry());
  }

  function nextQ() {
    const left = QP.filter((q) => q.dim !== "age" && !G.asked.includes(q.id));
    const needDir = !juniorLocked() && !knowDirection();
    const needExp = !knowExperience();
    if (!needDir && !needExp && !knowAge()) return "age";
    if (poolDry()) return knowAge() ? null : "age";
    let pool = left;
    if (needDir && !needExp) pool = left.filter((q) => q.dim === "track" || q.dim === "both");
    else if (needExp && !needDir) pool = left.filter((q) => q.dim === "level" || q.dim === "both");
    if (!pool.length) pool = left;
    return pool.sort((a, b) => b.w - a.w)[0].id;
  }

  function jmap(ids, activeId) {
    const tight = ids.length > 6 ? " tight" : "";
    return (
      '<div class="journey' + tight + '"><div class="jline"></div>' +
      ids
        .map((id) => {
          const n = ND[id];
          let cls = "", hint = "";
          if (id === activeId) {
            cls = " on";
            hint = "You start here";
          } else if (id === "found" && S.level === null) {
            cls = " maybe";
            hint = "If needed";
          } else if (id === "found" && S.level === "needs") {
            cls = " on";
            hint = "You start here";
          }
          return (
            '<button class="jnode' + cls + '" onclick="window.app.open(\'n-' + id + '\')">' +
            '<span class="dot"><i></i></span>' +
            '<span class="txt"><span class="nm">' + esc(n.nm) + "</span>" +
            (hint ? '<span class="hint">' + hint + "</span>" : "") +
            "</span></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderStep() {
    const gEl = $("#g");
    if (!gEl) return;

    if (enough()) {
      hypothesis();
      return;
    }

    const id = nextQ();
    if (!id) {
      hypothesis();
      return;
    }

    const q = QID(id);
    const seg = (done, now) => '<i class="' + (done ? "done" : now ? "now" : "") + '"></i>';
    const cur = q.dim;

    gEl.innerHTML =
      '<div class="prog">' +
      seg(juniorLocked() || knowDirection(), cur === "track" || cur === "both") +
      seg(knowExperience(), cur === "level" || cur === "both") +
      seg(knowAge(), cur === "age") +
      "</div>" +
      '<div class="q">' + esc(q.q) + "</div>" +
      '<div class="opts">' +
      q.a
        .map(
          (a, i) =>
            '<button class="opt" onclick="window.app.pick(' + i + ')"><span>' +
            esc(a[0]) +
            '</span><span class="mark">→</span></button>'
        )
        .join("") +
      "</div>" +
      (G.asked.length
        ? '<button class="iconbtn wide" style="margin-top:26px" onclick="window.app.qBack()">← Back</button>'
        : "");

    G.current = id;
  }

  function applyPick(id, ai) {
    const q = QID(id), a = q.a[ai];
    if (q.dim === "age") {
      S.age = a[1];
      return;
    }
    if (a[1]) {
      for (const k in a[1]) {
        G.sc[k] = (G.sc[k] || 0) + a[1][k];
      }
    }
    if (a[2]) G.ev += a[2];
  }

  function pick(i) {
    G.asked.push(G.current);
    G.picks.push([G.current, i]);
    applyPick(G.current, i);
    renderStep();
  }

  function qBack() {
    if (!G.picks.length) return;
    const keep = G.picks.slice(0, -1);
    resetG();
    keep.forEach((p) => {
      G.asked.push(p[0]);
      G.picks.push(p);
      applyPick(p[0], p[1]);
    });
    renderStep();
  }

  function hypothesis() {
    const best = ranked()[0];
    const junior = juniorLocked();
    const sure = knowDirection();
    S.level = G.ev >= 2 ? "ready" : "needs";
    S.route = junior ? "junior" : "ceo";
    S.track = junior ? null : best.id;
    S.guess = best.id;
    const r = RT[S.route];

    const gEl = $("#g");
    if (!gEl) return;

    gEl.innerHTML =
      '<div class="prog"><i class="done"></i><i class="done"></i><i class="done"></i></div>' +
      '<div class="label accent">We think you may fit here</div>' +
      '<h2 style="margin:14px 0 6px">' + esc(junior ? r.t : best.nm) + "</h2>" +
      '<div class="sub">' + esc(junior ? "A standalone journey for 13–16." : best.prob) + "</div>" +
      jmap(r.map(S), S.level === "needs" ? (junior ? "jbasic" : "found") : junior ? "jbasic" : "track") +
      '<div class="note">' +
      (S.level === "needs"
        ? "Your level means you begin at Foundation. It is the shortest route to your track."
        : "Your level means you go straight to your track.") +
      (!junior && !sure ? " We will confirm your direction at the check." : "") +
      "</div>" +
      '<div class="actions"><button class="btn primary" onclick="window.app.startApp(\'' +
      S.route +
      "'" +
      (S.track ? ",'" + S.track + "'" : "") +
      ')">Accept</button>' +
      '<button class="btn quiet" onclick="window.app.open(\'paths\')">Explore another path</button></div>' +
      '<div style="margin-top:20px"><button class="iconbtn wide" onclick="window.app.open(\'tracks\')">See all tracks</button></div>';
  }

  return {
    reset: resetG,
    renderStep,
    pick,
    qBack,
    getState: () => S
  };
})();
