/* ============================================================
   HAMZURY PLATFORM CONSTANTS & HELPERS
   ============================================================ */

export const FEE = 5000;

export const BANK = {
  bank: "Moniepoint",
  name: "Hamzury Mainstream Ltd",
  acct: "82025158500"
};

export const WHATSAPP = "08067149356";

export const STAFF_CODE = "hamzury";
export const ADMIN_EMAIL = (import.meta.env?.VITE_ADMIN_EMAIL || "admin@hamzury.com").toLowerCase();
export const ADMIN_PASSWORD = import.meta.env?.VITE_ADMIN_PASSWORD || "HamzuryAdmin2026#";

export const N = (n) => "₦" + Number(n).toLocaleString("en-NG");

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

export const $ = (s, parent = document) => parent.querySelector(s);
export const $$ = (s, parent = document) => Array.from(parent.querySelectorAll(s));

export const mkRef = () =>
  "HMZ-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export const nextIntake = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export const payRow = (k, v) =>
  '<div class="payrow"><span class="pk">' + esc(k) + '</span><span class="pv">' + esc(v) + "</span></div>";

export const fact = (k, v) =>
  '<div class="fact"><dt>' + esc(k) + "</dt><dd>" + v + "</dd></div>";

export const facts = (rows) =>
  '<dl class="facts">' + rows.map((r) => fact(r[0], r[1])).join("") + "</dl>";
