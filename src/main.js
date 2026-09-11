/* ============================================================
   HAMZURY MAIN APPLICATION BOOTSTRAP
   Scalable, hostable frontend for Vercel & Firebase
   ============================================================ */
import "./styles/theme.css";
import "./styles/components.css";
import "./styles/admin.css";
import "./styles/main.css";

import { $, esc, STAFF_CODE } from "./data/constants.js";
import { RT } from "./data/routes.js";
import { Router } from "./app/router.js";
import { Guide } from "./app/guide.js";
import { ApplicationFlow } from "./app/applicationFlow.js";
import { StatusChecker } from "./app/statusChecker.js";
import { AdminDashboard } from "./app/adminDashboard.js";
import { registerAllViews, handleEnquirySubmission } from "./app/views.js";

// Staff tap counter
let staffTaps = 0;
let staffTimer = null;

function staffTap() {
  staffTaps++;
  clearTimeout(staffTimer);
  staffTimer = setTimeout(() => {
    staffTaps = 0;
  }, 1200);
  if (staffTaps >= 3) {
    staffTaps = 0;
    Router.open("staff");
  }
}

function staffGo() {
  const v = ($("#st-code")?.value || "").trim();
  if (v !== STAFF_CODE) {
    const err = $("#st-err");
    if (err) err.textContent = "Incorrect code.";
    return;
  }
  Router.toast("Staff access authorized");
  Router.open("treasury");
}

function toggleValues() {
  const t = $("#values");
  const b = $("#vtoggle");
  if (!t || !b) return;
  const open = t.classList.toggle("open");
  b.setAttribute("aria-expanded", String(open));
}

function paintLandingPage() {
  // Values table
  const valEl = $("#values");
  if (valEl) {
    valEl.innerHTML = [
      ["Evidence", "Work you can show", "Not attendance"],
      ["Capability", "Built to a standard", "Not a syllabus finished"],
      ["Placement", "Where your level puts you", "Not where you paid to be"],
      ["The market", "Real customers, real money", "Not practice exercises"],
      ["The business", "Yours to keep", "Not a portfolio piece"],
      ["Progress", "Month by month, unlocked", "Not a certificate at the end"]
    ]
      .map(
        (r) =>
          '<tr><td class="vk">' +
          esc(r[0]) +
          '</td><td class="vy">' +
          esc(r[1]) +
          '</td><td class="vn">' +
          esc(r[2]) +
          "</td></tr>"
      )
      .join("");
  }

  // Stance flow
  const stanceEl = $("#stance-flow");
  if (stanceEl) {
    stanceEl.innerHTML = [
      ["Awareness", "People know you exist"],
      ["Strategy", "What you sell, and to whom"],
      ["Structure", "The business can hold weight"],
      ["System", "It runs without you"],
      ["Result", "Revenue, and proof"]
    ]
      .map(
        (x, i, arr) =>
          "<b" +
          (i === arr.length - 1 ? ' class="end"' : "") +
          ">" +
          esc(x[0]) +
          "<span>" +
          esc(x[1]) +
          "</span></b>"
      )
      .join("<i>→</i>");
  }

  // Index rows (all doors)
  const indexEl = $("#index");
  if (indexEl) {
    const row = (i, t, m, act) =>
      '<button class="row" onclick="' +
      act +
      '"><span class="n">' +
      i +
      '</span><span class="t">' +
      esc(t) +
      '<span class="m">' +
      esc(m) +
      '</span></span><span class="go">→</span></button>';

    const grp = (t) =>
      '</div><div class="label" style="margin:34px 0 10px">' + t + '</div><div class="index">';

    let n = 0;
    const rw = (d) => {
      n++;
      return row(String(n).padStart(2, "0"), d[0], d[1], d[2]);
    };

    indexEl.innerHTML =
      [
        ["Junior Innovator", RT.junior.m, "window.app.open('r-junior')"],
        ["Innovator → CEO", RT.ceo.m, "window.app.open('r-ceo')"],
        ["CEO → Founder", RT.founder.m, "window.app.open('r-founder')"],
        ["Founder → Ecosystem", RT.ecosystem.m, "window.app.open('r-ecosystem')"],
        ["SIWES / Internship", "Same journey, different arrangement", "window.app.open('r-siwes')"],
        ["Programmes", "Twelve problems worth solving", "window.app.open('tracks')"]
      ]
        .map(rw)
        .join("") +
      grp("Inside Hamzury") +
      [
        ["Life at Hamzury", "Where the work happens", "window.app.open('life')"],
        ["Treasury", "Cohorts, projects, businesses", "window.app.open('treasury')"]
      ]
        .map(rw)
        .join("") +
      grp("Work with us") +
      [
        ["Partnership", "Build something together", "window.app.open('partnership')"],
        ["Sponsorship", "Fund a participant", "window.app.open('sponsorship')"]
      ]
        .map(rw)
        .join("");
  }
}

// Global public API on window.app
window.app = {
  open: (k) => Router.open(k),
  close: () => Router.close(),
  back: () => Router.back(),
  top: () => Router.scrollToTop(),
  toast: (m) => Router.toast(m),

  // Guide
  pick: (i) => Guide.pick(i),
  qBack: () => Guide.qBack(),

  // Application
  startApp: (route, track) => ApplicationFlow.startApp(route, track),
  aNext: () => ApplicationFlow.aNext(),
  aBack: () => ApplicationFlow.aBack(),
  pickProg: (v) => ApplicationFlow.pickProg(v),
  clearProg: () => ApplicationFlow.clearProg(),
  setMonths: (m) => ApplicationFlow.setMonths(m),
  chk: (i) => ApplicationFlow.chk(i),
  takeReceipt: (el) => ApplicationFlow.takeReceipt(el),
  takeReceipt2: (el) => ApplicationFlow.takeReceipt2(el),
  takeLetter: (el) => ApplicationFlow.takeLetter(el),
  toggleTerms: (v) => ApplicationFlow.toggleTerms(v),
  sendAppWhatsApp: () => ApplicationFlow.sendAppWhatsApp(),

  // Enquiries & Status
  sendEnquiry: (k) => handleEnquirySubmission(k),
  checkStatus: () => StatusChecker.checkStatus(),

  // Admin Dashboard
  adminLogin: () => AdminDashboard.login(),
  adminLogout: () => AdminDashboard.logout(),
  adminTab: (t) => AdminDashboard.setTab(t),
  adminFilter: (f) => AdminDashboard.setFilter(f),
  adminSearch: (q) => AdminDashboard.handleSearch(q),
  adminVerify: (ref) => AdminDashboard.verifyApplicant(ref),
  adminReopen: (ref) => AdminDashboard.reopenApplicant(ref),
  adminReject: (ref) => AdminDashboard.rejectApplicant(ref),
  adminDelete: (ref) => AdminDashboard.deleteApp(ref),
  adminDeleteEnquiry: (kind, id) => AdminDashboard.deleteEnq(kind, id),
  adminCreateCourse: () => AdminDashboard.createCourse(),
  adminDeleteCourse: (id) => AdminDashboard.removeCourse(id),
  adminExportCSV: () => AdminDashboard.exportCSV(),
  adminCopy: (text, label) => AdminDashboard.copyText(text, label),
  adminRefresh: () => AdminDashboard.refresh(),

  // UI helpers
  toggleValues,
  staffTap,
  staffGo: () => AdminDashboard.login()
};

// Initialize views and router on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  registerAllViews();
  Router.init();
  paintLandingPage();
});

// Also initialize immediately if DOM already loaded
if (document.readyState === "interactive" || document.readyState === "complete") {
  registerAllViews();
  Router.init();
  paintLandingPage();
}
