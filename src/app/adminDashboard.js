/* ============================================================
   MINIMAL HAMZURY ADMIN DASHBOARD
   Admissions review, Cloudinary receipts viewer & Firestore management
   ============================================================ */
import { $, N, STAFF_CODE, esc } from "../data/constants.js";
import { RT } from "../data/routes.js";
import { trk } from "../data/tracks.js";
import {
  fetchAllApplications,
  updateApplicationStatus,
  deleteApplication,
  fetchAllPartnerships,
  fetchAllSponsorships,
  deleteEnquiry,
  createSampleApplicant,
  exportApplicationsCSV
} from "../services/admin.js";
import { Router } from "./router.js";

export const AdminDashboard = (function () {
  let isAuthed = sessionStorage.getItem("hamzury_admin_auth") === "true";
  let applications = [];
  let partnerships = [];
  let sponsorships = [];
  let currentTab = "apps"; // 'apps' | 'enquiries'
  let filterStatus = "all"; // 'all' | 'review' | 'verified' | 'rejected'
  let searchQuery = "";

  async function loadData() {
    applications = await fetchAllApplications();
    partnerships = await fetchAllPartnerships();
    sponsorships = await fetchAllSponsorships();
    renderContent();
  }

  function login() {
    const input = $("#adm-code");
    const err = $("#adm-err");
    const val = (input?.value || "").trim();

    if (val !== STAFF_CODE) {
      if (err) err.textContent = "Incorrect access code.";
      return;
    }

    isAuthed = true;
    sessionStorage.setItem("hamzury_admin_auth", "true");
    Router.toast("Admin session active");
    render();
    loadData();
  }

  function logout() {
    isAuthed = false;
    sessionStorage.removeItem("hamzury_admin_auth");
    Router.toast("Logged out");
    render();
  }

  function setTab(tab) {
    currentTab = tab;
    renderContent();
  }

  function setFilter(filter) {
    filterStatus = filter;
    renderContent();
  }

  function handleSearch(q) {
    searchQuery = q.toLowerCase();
    renderContent();
  }

  async function verifyApplicant(ref) {
    Router.toast("Verifying applicant " + ref + "…");
    await updateApplicationStatus(ref, "verified", "Verified & Confirmed");
    Router.toast("Applicant " + ref + " marked as Verified!");
    await loadData();
  }

  async function reopenApplicant(ref) {
    Router.toast("Re-opening review for " + ref + "…");
    await updateApplicationStatus(ref, "paid_pending_verification", "Under Review");
    Router.toast("Status reverted to Under Review");
    await loadData();
  }

  async function rejectApplicant(ref) {
    if (!confirm(`Mark applicant ${ref} as Rejected / Payment Incomplete?`)) return;
    Router.toast("Updating " + ref + "…");
    await updateApplicationStatus(ref, "rejected", "Rejected · Proof Invalid");
    Router.toast("Application " + ref + " flagged as rejected.");
    await loadData();
  }

  async function deleteApp(ref) {
    if (!confirm(`Are you sure you want to permanently delete record ${ref}?`)) return;
    Router.toast("Deleting " + ref + "…");
    await deleteApplication(ref);
    Router.toast("Application " + ref + " deleted.");
    await loadData();
  }

  async function deleteEnq(kind, id) {
    if (!confirm(`Delete this ${kind} enquiry permanently?`)) return;
    Router.toast("Deleting enquiry…");
    await deleteEnquiry(kind, id);
    Router.toast("Enquiry deleted.");
    await loadData();
  }

  async function addDemo() {
    Router.toast("Generating demo applicant…");
    const ref = await createSampleApplicant();
    Router.toast("Demo applicant " + ref + " created!");
    await loadData();
  }

  function exportCSV() {
    if (!applications.length) {
      Router.toast("No application records to export.");
      return;
    }
    exportApplicationsCSV(applications);
    Router.toast("Exported " + applications.length + " applications to CSV.");
  }

  function copyText(text, label) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      Router.toast("Copied " + (label || text));
    }
  }

  function renderView() {
    if (!isAuthed) {
      return {
        t: "Admin & Staff Portal",
        sub: "Hamzury team access only.",
        h:
          '<div class="field" style="margin-top:20px"><label for="adm-code">Passcode</label>' +
          '<input id="adm-code" type="password" placeholder="Enter staff passcode" autocomplete="current-password" onkeyup="if(event.key===\'Enter\') window.app.adminLogin()">' +
          '<div class="err" id="adm-err"></div></div>' +
          '<div class="actions"><button class="btn primary" onclick="window.app.adminLogin()">Access Dashboard</button></div>' +
          '<div class="note">Authorized Hamzury admissions staff only. Default passcode: <code>hamzury</code></div>'
      };
    }

    return {
      t: "Admissions Dashboard",
      sub: "Live Firestore records & Cloudinary receipts.",
      h: '<div id="adm-root" class="admin-wrap">Loading records…</div>',
      after: () => {
        loadData();
      }
    };
  }

  function renderContent() {
    const root = $("#adm-root");
    if (!root || !isAuthed) return;

    // Metrics
    const totalApps = applications.length;
    const pendingCount = applications.filter((a) => a.status !== "verified" && a.status !== "accepted" && a.status !== "rejected").length;
    const verifiedCount = applications.filter((a) => a.status === "verified" || a.status === "accepted").length;
    const rejectedCount = applications.filter((a) => a.status === "rejected").length;
    const enquiriesCount = partnerships.length + sponsorships.length;
    const revenueVerified = verifiedCount * 5000;

    // Filter applications
    let filteredApps = applications.filter((a) => {
      if (filterStatus === "review") return a.status !== "verified" && a.status !== "accepted" && a.status !== "rejected";
      if (filterStatus === "verified") return a.status === "verified" || a.status === "accepted";
      if (filterStatus === "rejected") return a.status === "rejected";
      return true;
    });

    if (searchQuery) {
      filteredApps = filteredApps.filter((a) => {
        const str = `${a.ref || ""} ${a.name || ""} ${a.email || ""} ${a.phone || ""} ${a.route || ""} ${a.track || ""}`.toLowerCase();
        return str.includes(searchQuery);
      });
    }

    let h = `
      <div class="admin-header">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="font-size:11.5px;color:var(--gold);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">
            Firestore: Connected · Cloudinary: Connected
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-admin gold" onclick="window.app.adminExportCSV()">📥 Export CSV</button>
          <button class="btn-admin quiet" onclick="window.app.adminAddDemo()">+ Demo Applicant</button>
          <button class="btn-admin quiet" onclick="window.app.adminRefresh()">↻ Refresh</button>
          <button class="btn-admin quiet" onclick="window.app.adminLogout()">🔒 Lock</button>
        </div>
      </div>

      <div class="admin-stats">
        <div class="admin-stat-card">
          <span class="k">Total Applicants</span>
          <span class="v">${totalApps}</span>
        </div>
        <div class="admin-stat-card">
          <span class="k">Needs Review</span>
          <span class="v" style="color:var(--orange)">${pendingCount}</span>
        </div>
        <div class="admin-stat-card">
          <span class="k">Verified</span>
          <span class="v" style="color:var(--green)">${verifiedCount}</span>
        </div>
        <div class="admin-stat-card">
          <span class="k">Verified Revenue</span>
          <span class="v" style="color:var(--ink);font-size:20px">${N(revenueVerified)}</span>
        </div>
        <div class="admin-stat-card">
          <span class="k">Enquiries</span>
          <span class="v" style="color:var(--gold)">${enquiriesCount}</span>
        </div>
      </div>

      <div class="admin-tabs">
        <button class="admin-tab ${currentTab === "apps" ? "active" : ""}" onclick="window.app.adminTab('apps')">
          Applications (${totalApps})
        </button>
        <button class="admin-tab ${currentTab === "enquiries" ? "active" : ""}" onclick="window.app.adminTab('enquiries')">
          Partnerships & Sponsorships (${enquiriesCount})
        </button>
      </div>
    `;

    if (currentTab === "apps") {
      h += `
        <div class="admin-bar">
          <input
            type="text"
            class="admin-search"
            placeholder="Search by name, phone, email, or HMZ- reference…"
            value="${esc(searchQuery)}"
            oninput="window.app.adminSearch(this.value)"
          />
          <div class="admin-filters">
            <button class="admin-chip ${filterStatus === "all" ? "active" : ""}" onclick="window.app.adminFilter('all')">All (${totalApps})</button>
            <button class="admin-chip ${filterStatus === "review" ? "active" : ""}" onclick="window.app.adminFilter('review')">Review (${pendingCount})</button>
            <button class="admin-chip ${filterStatus === "verified" ? "active" : ""}" onclick="window.app.adminFilter('verified')">Verified (${verifiedCount})</button>
            <button class="admin-chip ${filterStatus === "rejected" ? "active" : ""}" onclick="window.app.adminFilter('rejected')">Rejected (${rejectedCount})</button>
          </div>
        </div>
      `;

      if (filteredApps.length === 0) {
        h += `
          <div class="empty-state">
            <p>No applications match your current filter.</p>
            <p class="tiny" style="margin-top:8px">Test applications submitted on the site will appear here in real time, or click <b>+ Demo Applicant</b> above to populate sample test data.</p>
          </div>
        `;
      } else {
        filteredApps.forEach((app) => {
          const routeTitle = (RT[app.route] || {}).t || app.route || "—";
          const trackTitle = app.track ? (trk(app.track) ? trk(app.track).nm : app.track) : "Not chosen";
          const isVerified = app.status === "verified" || app.status === "accepted";
          const isRejected = app.status === "rejected";

          let badge = '<span class="badge review">Under Review</span>';
          if (isVerified) badge = '<span class="badge verified">Verified</span>';
          if (isRejected) badge = '<span class="badge rejected">Rejected</span>';

          const appReceipt = app.payments?.applicationFee?.receiptUrl;
          const progReceipt = app.payments?.programmeFee?.receiptUrl;
          const letter = app.siwes?.letterUrl;

          const isImage = (url) => typeof url === "string" && (url.includes("res.cloudinary.com") || url.match(/\.(jpeg|jpg|png|webp)/i));

          h += `
            <div class="admin-card">
              <div class="admin-card-head">
                <div>
                  <div class="admin-card-title">${esc(app.name || "Unnamed Applicant")}</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
                    <span class="admin-card-ref">${esc(app.ref)}</span>
                    <button class="btn-admin copy" onclick="window.app.adminCopy('${esc(app.ref)}', 'Reference')">Copy</button>
                  </div>
                </div>
                <div>${badge}</div>
              </div>

              <dl class="admin-meta-grid">
                <div>
                  <dt>Route</dt>
                  <dd>${esc(routeTitle)}</dd>
                </div>
                <div>
                  <dt>Track / Programme</dt>
                  <dd>${esc(trackTitle)}</dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>
                    ${esc(app.phone || "—")} 
                    ${app.phone ? `<button class="btn-admin copy" onclick="window.app.adminCopy('${esc(app.phone)}', 'Phone')">Copy</button>` : ""}
                    <br><span class="tiny">${esc(app.email || "—")}</span>
                  </dd>
                </div>
                <div>
                  <dt>Resumption</dt>
                  <dd>${esc(app.resumption || "Next Intake")}</dd>
                </div>
                <div>
                  <dt>Starting Level</dt>
                  <dd>${app.level === "needs" ? "Digital Foundation" : "Direct Track"}</dd>
                </div>
                <div>
                  <dt>Fee (₦5,000)</dt>
                  <dd>${app.payments?.applicationFee?.status === "verified" ? "✓ Verified" : (isRejected ? "Rejected" : "Paid · Pending Check")}</dd>
                </div>
              </dl>

              <div class="admin-docs">
                <span style="font-size:11px;text-transform:uppercase;color:var(--dim);font-weight:700">Receipts & Evidence:</span>
                ${
                  appReceipt
                    ? (isImage(appReceipt)
                        ? `<div class="admin-thumb-wrap">
                            <a href="${appReceipt}" target="_blank" rel="noopener">
                              <img src="${appReceipt}" class="admin-thumb" alt="Receipt preview" title="Click to view full receipt" />
                            </a>
                            <a href="${appReceipt}" target="_blank" rel="noopener" class="admin-doc-link">📄 Fee Receipt (Cloudinary) ↗</a>
                          </div>`
                        : `<a href="${appReceipt}" target="_blank" rel="noopener" class="admin-doc-link">📄 Fee Receipt (Cloudinary) ↗</a>`)
                    : '<span class="tiny" style="color:var(--dim)">No fee receipt attached</span>'
                }
                ${
                  progReceipt
                    ? `<a href="${progReceipt}" target="_blank" rel="noopener" class="admin-doc-link">📄 Programme Receipt ↗</a>`
                    : ""
                }
                ${
                  letter
                    ? `<a href="${letter}" target="_blank" rel="noopener" class="admin-doc-link">📄 School Letter ↗</a>`
                    : ""
                }
              </div>

              <div class="admin-actions">
                ${
                  !isVerified
                    ? `<button class="btn-admin verify" onclick="window.app.adminVerify('${esc(app.ref)}')">✓ Verify Payment</button>`
                    : `<button class="btn-admin quiet" onclick="window.app.adminReopen('${esc(app.ref)}')">↩ Re-open Review</button>`
                }
                ${
                  !isRejected
                    ? `<button class="btn-admin danger" onclick="window.app.adminReject('${esc(app.ref)}')">⚠️ Reject / Invalid</button>`
                    : ""
                }
                <a
                  class="btn-admin wa"
                  target="_blank"
                  rel="noopener"
                  href="https://wa.me/234${(app.phone || "").replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                    `Hello ${app.name || ""}, regarding your Hamzury application (${app.ref}): `
                  )}"
                >
                  💬 Message on WhatsApp
                </a>
                <button class="btn-admin danger" style="margin-left:auto" onclick="window.app.adminDelete('${esc(app.ref)}')">🗑 Delete</button>
              </div>
            </div>
          `;
        });
      }
    } else {
      // Enquiries tab
      h += `
        <h3 style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
          <span>Partnership Requests (${partnerships.length})</span>
        </h3>
      `;

      if (partnerships.length === 0) {
        h += `<p class="tiny" style="margin-bottom:24px">No partnership requests yet.</p>`;
      } else {
        partnerships.forEach((p, idx) => {
          const pId = p.id || p.phone || `partner-${idx}`;
          h += `
            <div class="admin-card">
              <div class="admin-card-head">
                <div>
                  <div class="admin-card-title">${esc(p.org || "Organisation")}</div>
                  <div class="tiny">${esc(p.contact || "—")}</div>
                </div>
                <button class="btn-admin danger" onclick="window.app.adminDeleteEnquiry('partner', '${esc(pId)}')">🗑 Delete</button>
              </div>
              <div style="font-size:13px;color:var(--muted);margin:8px 0">
                <b>Phone:</b> ${esc(p.phone)} · <b>Email:</b> ${esc(p.email || "—")}
              </div>
              <div style="font-size:13.5px;line-height:1.5">
                <div><b>Does:</b> ${esc(p.does || "—")}</div>
                <div><b>Why Partner:</b> ${esc(p.why || "—")}</div>
                <div><b>They Bring:</b> ${esc(p.bring || "—")}</div>
                <div><b>They Want:</b> ${esc(p.want || "—")}</div>
              </div>
              <div class="admin-actions">
                <a
                  class="btn-admin wa"
                  target="_blank"
                  rel="noopener"
                  href="https://wa.me/234${(p.phone || "").replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                    `Hello ${p.contact || p.org}, regarding your Hamzury Partnership inquiry: `
                  )}"
                >
                  💬 Message via WhatsApp
                </a>
              </div>
            </div>
          `;
        });
      }

      h += `
        <h3 style="margin:28px 0 14px;display:flex;justify-content:space-between;align-items:center">
          <span>Sponsorship Offers (${sponsorships.length})</span>
        </h3>
      `;

      if (sponsorships.length === 0) {
        h += `<p class="tiny">No sponsorship offers yet.</p>`;
      } else {
        sponsorships.forEach((s, idx) => {
          const sId = s.id || s.phone || `sponsor-${idx}`;
          h += `
            <div class="admin-card">
              <div class="admin-card-head">
                <div>
                  <div class="admin-card-title">${esc(s.org || "Sponsor")}</div>
                  <div class="tiny" style="color:var(--gold)">${esc(s.area || "General")}</div>
                </div>
                <button class="btn-admin danger" onclick="window.app.adminDeleteEnquiry('sponsor', '${esc(sId)}')">🗑 Delete</button>
              </div>
              <div style="font-size:13px;color:var(--muted);margin:8px 0">
                <b>Phone:</b> ${esc(s.phone)} · <b>Email:</b> ${esc(s.email || "—")}
              </div>
              <div style="font-size:13.5px;line-height:1.5">
                <div><b>Support Offered:</b> ${esc(s.support || "—")}</div>
                <div><b>Report Requested:</b> ${esc(s.report || "—")}</div>
              </div>
              <div class="admin-actions">
                <a
                  class="btn-admin wa"
                  target="_blank"
                  rel="noopener"
                  href="https://wa.me/234${(s.phone || "").replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                    `Hello ${s.org}, regarding your Hamzury Sponsorship offer: `
                  )}"
                >
                  💬 Message via WhatsApp
                </a>
              </div>
            </div>
          `;
        });
      }
    }

    root.innerHTML = h;
  }

  function render() {
    Router.render("admin");
  }

  return {
    renderView,
    login,
    logout,
    setTab,
    setFilter,
    handleSearch,
    verifyApplicant,
    reopenApplicant,
    rejectApplicant,
    deleteApp,
    deleteEnq,
    addDemo,
    exportCSV,
    copyText,
    refresh: loadData
  };
})();
