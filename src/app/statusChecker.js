/* ============================================================
   APPLICANT STATUS CHECKER PORTAL
   Queries Cloud Firestore in real-time by HMZ Reference ID
   ============================================================ */
import { $, N, FEE, WHATSAPP, esc, fact } from "../data/constants.js";
import { getApplicationByRef } from "../services/applications.js";
import { trk } from "../data/tracks.js";
import { RT } from "../data/routes.js";

export const StatusChecker = (function () {
  async function checkStatus() {
    const input = $("#lg-ref");
    const err = $("#lg-err");
    const resultBox = $("#lg-result");
    const btn = $("#lg-btn");

    if (!input) return;
    const ref = (input.value || "").trim().toUpperCase();

    if (!/^HMZ-/.test(ref)) {
      if (err) err.textContent = "Please enter a valid reference starting with HMZ- (e.g. HMZ-2026-XXXXX).";
      if (resultBox) resultBox.innerHTML = "";
      return;
    }

    if (err) err.textContent = "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Searching records…";
    }

    try {
      const app = await getApplicationByRef(ref);

      if (!app) {
        if (err) {
          err.textContent = "No application found with reference " + ref + ". Please check for typing mistakes or apply first.";
        }
        if (resultBox) resultBox.innerHTML = "";
        return;
      }

      // Render the live status card
      const routeTitle = (RT[app.route] || {}).t || app.route || "—";
      const trackTitle = app.track ? (trk(app.track) ? trk(app.track).nm : app.track) : "Not assigned";
      const startPoint = app.level === "needs" ? "Digital Foundation" : "Direct to Track";

      const statusBadge =
        app.status === "verified"
          ? '<span class="badge verified">Verified & Confirmed</span>'
          : app.status === "accepted"
          ? '<span class="badge verified">Admitted</span>'
          : '<span class="badge review">Payment Evidence Under Review</span>';

      const appFee = app.payments?.applicationFee;
      const progFee = app.payments?.programmeFee;

      let html =
        '<div class="slip" style="margin-top:20px">' +
        '<div class="sliphead"><span>Record Found</span>' +
        statusBadge +
        "</div>" +
        '<h3 style="margin:16px 0 4px">' +
        esc(app.name) +
        "</h3>" +
        '<p class="tiny" style="color:var(--dim);margin-bottom:18px">Reference: <b>' +
        esc(app.ref) +
        "</b></p>" +
        '<dl class="facts">' +
        fact("Route", esc(routeTitle)) +
        fact("Track", esc(trackTitle)) +
        fact("Starting point", esc(startPoint)) +
        (app.resumption ? fact("Resumption", esc(app.resumption)) : "") +
        (app.location ? fact("Location", esc(app.location)) : "") +
        "</dl>" +
        '<div class="label" style="margin:24px 0 8px">Payment verification</div>' +
        '<div class="amt"><div class="l">Application fee (' +
        N(FEE) +
        ')</div><div class="v now">' +
        (appFee?.status === "verified" ? "Verified" : "Under verification") +
        "</div></div>" +
        (progFee?.amount
          ? '<div class="amt"><div class="l">' +
            esc(progFee.title || "Programme fee") +
            '</div><div class="v now">' +
            (progFee.status === "verified" ? "Verified" : "Under verification") +
            "</div></div>"
          : "") +
        "</div>" +
        '<div class="note ok" style="margin-top:20px">Your record is held on the Hamzury cloud registry. Need assistance or need to change details? Message admissions directly with your reference.</div>' +
        '<div class="actions" style="margin-top:16px">' +
        '<a class="btn quiet" target="_blank" rel="noopener" href="https://wa.me/234' +
        WHATSAPP.replace(/^0/, "") +
        "?text=" +
        encodeURIComponent("Hello Hamzury Admissions, I am checking on my application reference " + app.ref) +
        '">Message Admissions on WhatsApp</a>' +
        "</div>";

      if (resultBox) resultBox.innerHTML = html;
    } catch (e) {
      console.error(e);
      if (err) err.textContent = "Error querying status. Please check your internet connection.";
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Check status";
      }
    }
  }

  return {
    checkStatus
  };
})();
