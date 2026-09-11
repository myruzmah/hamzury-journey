/* ============================================================
   HAMZURY VIEW ENGINE
   View definitions for routes, programmes, treasury, and enquiries
   ============================================================ */
import { $, N, FEE, WHATSAPP, STAFF_CODE, esc, facts } from "../data/constants.js";
import { TR, trk } from "../data/tracks.js";
import { RT, ND, TY, TSTATS, LIFE, QA, relate } from "../data/routes.js";
import { Router } from "./router.js";
import { Guide } from "./guide.js";
import { ApplicationFlow } from "./applicationFlow.js";
import { StatusChecker } from "./statusChecker.js";
import { savePartnership, saveSponsorship } from "../services/enquiries.js";

export function registerAllViews() {
  const S = Guide.getState();

  /* Helper to render the thin journey line */
  function jmap(ids, activeId) {
    const tight = ids.length > 6 ? " tight" : "";
    return (
      '<div class="journey' +
      tight +
      '"><div class="jline"></div>' +
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
            '<button class="jnode' +
            cls +
            '" onclick="window.app.open(\'n-' +
            id +
            "')\">" +
            '<span class="dot"><i></i></span>' +
            '<span class="txt"><span class="nm">' +
            esc(n.nm) +
            "</span>" +
            (hint ? '<span class="hint">' + hint + "</span>" : "") +
            "</span></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // Register individual Node details
  Object.keys(ND).forEach((id) => {
    Router.registerView("n-" + id, () => {
      const n = ND[id];
      return {
        t: n.nm,
        h:
          facts([
            ["Why", esc(n.why)],
            ["Required", esc(n.req)],
            ["You will", esc(n.will)],
            ["Next", esc(n.next)]
          ]) +
          (id === "found"
            ? '<div class="note">Assigned by the check, never chosen. If you already have it, you skip it.</div>'
            : "") +
          (id === "track"
            ? '<button class="btn quiet" style="margin-top:26px" onclick="window.app.open(\'tracks\')">See the tracks</button>'
            : "") +
          (id === "build"
            ? '<button class="btn quiet" style="margin-top:26px" onclick="window.app.open(\'inside\')">Inside a month</button>'
            : "")
      };
    });
  });

  // Register individual Route details
  Object.keys(RT).forEach((k) => {
    Router.registerView("r-" + k, () => {
      const r = RT[k];
      const start = S.level === "needs" ? (k === "junior" ? "jbasic" : "found") : null;
      return {
        t: r.t,
        sub: r.m,
        h:
          jmap(r.map(S), start) +
          relate(k) +
          '<div class="actions"><button class="btn primary" onclick="window.app.startApp(\'' +
          k +
          "')\">Apply</button>" +
          '<button class="btn quiet" onclick="window.app.open(\'paths\')">Other routes</button></div>'
      };
    });
  });

  // All doors / paths
  Router.registerView("paths", () => ({
    t: "Find my path",
    sub: "If you already know what you want.",
    h:
      '<div class="index">' +
      Object.keys(RT)
        .map(
          (k, i) =>
            '<button class="row" onclick="window.app.open(\'r-' +
            k +
            "')\"><span class=\"n\">" +
            String(i + 1).padStart(2, "0") +
            '</span><span class="t">' +
            esc(RT[k].t) +
            '<span class="m">' +
            esc(RT[k].m) +
            '</span></span><span class="go">→</span></button>'
        )
        .join("") +
      '<button class="row" onclick="window.app.open(\'tracks\')"><span class="n">06</span>' +
      '<span class="t">Programmes<span class="m">Choose a capability directly</span></span><span class="go">→</span></button></div>' +
      '<div class="note">Not sure? <button style="color:var(--gold)" onclick="window.app.open(\'guide\')">Guide me instead</button></div>'
  }));

  // Programmes / Tracks list
  Router.registerView("tracks", () => {
    let n = 0;
    const grp = (t, sub) =>
      '<div class="label" style="margin:40px 0 4px">' +
      t +
      "</div>" +
      (sub ? '<p class="tiny" style="margin:0 0 12px">' + sub + "</p>" : '<div style="height:10px"></div>') +
      '<div class="index">';
    const row = (nm, meta, price, act) => {
      n++;
      return (
        '<button class="row" onclick="' +
        act +
        '"><span class="n">' +
        String(n).padStart(2, "0") +
        '</span><span class="t">' +
        esc(nm) +
        '<span class="m">' +
        esc(meta) +
        '</span></span>' +
        '<span class="go">' +
        price +
        "</span></button>"
      );
    };

    return {
      t: "Programmes",
      sub: "Every stage has its own. Start where your level puts you.",
      h:
        grp("Junior Innovator", "Ages 13–16. Foundation first, then a specialist route.") +
        row("Basic Foundation", "Required first — one month", N(25000), "window.app.open('r-junior')") +
        row("Software", "Build with code and digital tools", N(30000), "window.app.open('r-junior')") +
        row("Robotics", "Build with physical and technical systems", N(120000), "window.app.open('r-junior')") +
        "</div>" +
        grp("Innovator → CEO", "Ages 17+. One track, taken to a working business.") +
        TR.map((t) => row(t.nm, t.prob, N(t.p), "window.app.open('t-" + t.id + "')")).join("") +
        "</div>" +
        grp("CEO → Founder", "For a business that already works.") +
        row("CEO → Founder", "Partnerships, grants and growth", N(100000) + " / month", "window.app.open('r-founder')") +
        "</div>" +
        grp("Founder → Ecosystem", "Its own level. Built with us, or on your own.") +
        row("Founder → Ecosystem", "Proven revenue over " + N(1000000), N(200000), "window.app.open('r-ecosystem')") +
        "</div>" +
        grp("SIWES / Internship", "A working entry into the professional journey.") +
        row("SIWES placement", "Junior staff · 5 days · 8:00–3:00", "From " + N(30000), "window.app.open('r-siwes')") +
        row("Direct internship", "Junior staff · 5 days · 8:00–3:00", N(70000) + " / month", "window.app.open('r-siwes')") +
        "</div>"
    };
  });

  // Individual Track details
  TR.forEach((t) => {
    Router.registerView("t-" + t.id, () => ({
      t: t.nm,
      h:
        facts([
          ["The problem", esc(t.prob)],
          ["The market", esc(t.market)],
          ["The work", esc(t.work)],
          ["The outcome", esc(t.out)],
          ["The business", esc(t.biz)]
        ]) +
        '<div class="label" style="margin:36px 0 4px">The journey</div>' +
        jmap(["track", "build", "market", "revenue", "ceo"], "track") +
        '<div class="amt" style="margin-top:26px"><div class="l">Track fee<small>Separate from the ' +
        N(FEE) +
        ' application fee</small></div><div class="v now">' +
        N(t.p) +
        "</div></div>" +
        relate("ceo") +
        '<div class="actions"><button class="btn primary" onclick="window.app.startApp(\'ceo\',\'' +
        t.id +
        "')\">Apply</button>" +
        '<button class="btn quiet" onclick="window.app.open(\'tracks\')">Other programmes</button></div>'
    }));
  });

  // Inside the journey
  Router.registerView("inside", () => ({
    t: "Inside the journey",
    sub: "Every journey runs month by month. Each month is an achievement cycle.",
    h:
      '<div class="label" style="margin-bottom:4px">A day</div>' +
      facts([
        ["8:00–10:00", "Guided workspace. Practical building."],
        ["10:00–2:00", "Mentor-guided learning, application, building and submission."]
      ]) +
      '<div class="label" style="margin:36px 0 4px">The loop</div>' +
      '<div class="journey"><div class="jline"></div>' +
      ["Month", "Missions", "Tasks", "Submission", "Review", "Points", "Achievement", "Next unlock"]
        .map(
          (x, i) =>
            '<div class="jnode' +
            (i === 7 ? " on" : "") +
            '"><span class="dot"><i></i></span><span class="txt"><span class="nm">' +
            x +
            "</span></span></div>"
        )
        .join("") +
      "</div>" +
      '<div class="note">AI is the standard, not an extra. Better result, faster execution.</div>'
  }));

  // Fees view
  Router.registerView("fees", () => ({
    t: "Fees",
    sub: "Two payments, at two different moments.",
    h:
      '<div class="amt"><div class="l">Discovery<small>Exploring and Guide Me</small></div><div class="v later">Free</div></div>' +
      '<div class="amt"><div class="l">Application<small>Once you decide to apply</small></div><div class="v now">' +
      N(FEE) +
      "</div></div>" +
      '<div class="amt"><div class="l">Programme<small>After your route is set</small></div><div class="v later">Separate</div></div>' +
      '<div class="note">Never combined. You are never asked for a programme fee before your route is set.</div>' +
      facts([
        ["Junior", N(25000) + " Foundation · " + N(30000) + " Software · " + N(120000) + " Robotics"],
        ["Tracks", N(56000) + "–" + N(69000)],
        ["SIWES / Internship", "1 month " + N(30000) + " · 2 months " + N(50000) + " · 3 months " + N(70000)],
        ["Direct Internship", N(70000) + " per month · 5 days · 8:00–3:00"],
        ["CEO → Founder", N(100000) + " per month"],
        ["Founder → Ecosystem", N(200000) + " · requires proven revenue over " + N(1000000)],
        ["Longer placements", "Progression stays monthly. Each month is its own cycle."],
        ["Digital Foundation", N(45000) + " · one month"]
      ])
  }));

  // Questions / FAQ
  Router.registerView("questions", () => ({
    t: "Questions",
    h:
      '<dl class="facts">' +
      QA.map(
        (x) =>
          '<div class="fact"><dt style="letter-spacing:0;text-transform:none;font-size:14px;color:var(--ink);font-weight:600">' +
          esc(x[0]) +
          '</dt><dd style="color:var(--muted)">' +
          esc(x[1]) +
          "</dd></div>"
      ).join("") +
      "</dl>"
  }));

  // Life at Hamzury
  Router.registerView("life", () => ({
    t: "Life at Hamzury",
    h:
      '<div class="tiles">' +
      LIFE.map(
        (l) =>
          '<button class="tile" onclick="window.app.open(\'l-' +
          l.id +
          "')\"><span class=\"tn\">" +
          esc(l.nm) +
          '</span><span class="tm">' +
          esc(l.m) +
          "</span></button>"
      ).join("") +
      "</div>"
  }));

  LIFE.forEach((l) => {
    Router.registerView("l-" + l.id, () => ({
      t: l.nm,
      sub: l.m,
      h:
        '<div class="tiles">' +
        [1, 2, 3, 4].map(() => '<div class="tile" style="min-height:150px"></div>').join("") +
        "</div>" +
        '<div class="note">Photography appears here once supplied.</div>'
    }));
  });

  // Treasury
  Router.registerView("treasury", () => ({
    t: "Treasury",
    sub: "The evidence room.",
    h:
      '<div class="index">' +
      TY.map(
        (y) =>
          '<button class="row" onclick="window.app.open(\'y-' +
          y.y +
          "')\"><span class=\"n\">" +
          y.s.slice(0, 3).toUpperCase() +
          '</span><span class="t">' +
          y.y +
          '</span><span class="go">→</span></button>'
      ).join("") +
      "</div>"
  }));

  TY.forEach((y) => {
    Router.registerView("y-" + y.y, () => ({
      t: String(y.y),
      sub: y.s,
      h:
        '<div class="crumbs"><button onclick="window.app.open(\'treasury\')">Treasury</button><span>/</span><span>' +
        y.y +
        "</span></div>" +
        TSTATS.map((s) => '<div class="stat"><span class="k">' + s + '</span><span class="v">—</span></div>').join("") +
        (y.months.length
          ? '<div class="index" style="margin-top:30px">' +
            y.months
              .map(
                (m) =>
                  '<button class="row" onclick="window.app.open(\'m-' +
                  y.y +
                  "-" +
                  m +
                  "')\"><span class=\"n\"></span><span class=\"t\" style=\"font-size:19px\">" +
                  m +
                  '</span><span class="go">→</span></button>'
              )
              .join("") +
            "</div>"
          : '<div class="empty" style="margin-top:30px">Records appear here as the Treasury is updated.</div>') +
        '<p class="tiny" style="margin-top:30px">Public records will be published here, and downloadable, once the Treasury holds data.</p>'
    }));

    y.months.forEach((m) => {
      Router.registerView("m-" + y.y + "-" + m, () => ({
        t: m + " " + y.y,
        h:
          '<div class="crumbs"><button onclick="window.app.open(\'treasury\')">Treasury</button><span>/</span>' +
          '<button onclick="window.app.open(\'y-' +
          y.y +
          "')\">" +
          y.y +
          "</button><span>/</span><span>" +
          m +
          "</span></div>" +
          '<div class="empty">Records appear here as the Treasury is updated.</div>' +
          '<div class="tiny" style="margin-top:26px">A participant record holds: name · track · project · business · problem solved · website · outcome. Published only with consent.</div>'
      }));
    });
  });

  // Live Applicant Login & Status Checker
  Router.registerView("login", () => ({
    t: "Applicant Portal",
    sub: "Check your application status live on the cloud registry.",
    h:
      '<div class="field"><label for="lg-ref">Your application reference</label>' +
      '<input id="lg-ref" placeholder="HMZ-2026-XXXXX" autocomplete="off" style="text-transform:uppercase">' +
      '<div class="err" id="lg-err"></div></div>' +
      '<div class="actions"><button class="btn primary" id="lg-btn" onclick="window.app.checkStatus()">Check status</button></div>' +
      '<div id="lg-result"></div>' +
      '<div class="note">Enter your HMZ reference given upon application submission to see real-time payment verification and placement updates.</div>' +
      '<div class="actions"><a class="btn quiet" style="text-decoration:none;display:inline-block" target="_blank" rel="noopener" href="https://wa.me/234' +
      WHATSAPP.replace(/^0/, "") +
      '">Message Hamzury Support</a></div>'
  }));

  // Guide Me
  Router.registerView("guide", () => ({
    t: "Guide me",
    h: '<div id="g"></div>',
    after: () => {
      Guide.reset();
      Guide.renderStep();
    }
  }));

  // Application
  Router.registerView("apply", () => ({
    t: "Apply",
    h: '<div id="a"></div>',
    after: () => ApplicationFlow.renderStep()
  }));

  // Partnership & Sponsorship
  Router.registerView("partnership", () => ({
    t: "Partner",
    sub: "What can we build together?",
    h:
      '<div class="journey"><div class="jline"></div>' +
      ["Introduce", "Understand", "Match", "Propose", "Build", "Measure"]
        .map(
          (x, i) =>
            '<div class="jnode' +
            (i === 5 ? " on" : "") +
            '"><span class="dot"><i></i></span><span class="txt"><span class="nm">' +
            x +
            "</span></span></div>"
        )
        .join("") +
      "</div>" +
      facts([
        ["Who", "Schools, organisations, companies, training and technology partners, community groups."],
        ["We need", "What you do, why you want to partner, what you bring, what you want from us."],
        ["You get", "A defined arrangement with an agreed outcome and a way to measure it."]
      ]) +
      '<div class="actions"><button class="btn primary" onclick="window.app.open(\'partner-form\')">Start a partnership request</button></div>'
  }));

  Router.registerView("sponsorship", () => ({
    t: "Sponsor",
    sub: "Help build what comes next.",
    h:
      '<div class="journey"><div class="jline"></div>' +
      ["Choose impact", "Define support", "Connect", "Agree", "Support", "Report"]
        .map(
          (x, i) =>
            '<div class="jnode' +
            (i === 5 ? " on" : "") +
            '"><span class="dot"><i></i></span><span class="txt"><span class="nm">' +
            x +
            "</span></span></div>"
        )
        .join("") +
      "</div>" +
      facts([
        ["Who", "Individuals, businesses, foundations and institutions."],
        ["You choose", "Junior innovation, digital skills, technology, entrepreneurship, equipment, scholarships or projects."],
        ["You see", "Where your support went, what was built, who benefited, what changed."]
      ]) +
      '<div class="note">Reported through the Treasury, so support is a public record rather than a private claim.</div>' +
      '<div class="actions"><button class="btn primary" onclick="window.app.open(\'sponsor-form\')">Discuss sponsorship</button></div>'
  }));

  const efield = (k, l, ph) =>
    '<div class="field"><label for="pf-' +
    k +
    '">' +
    l +
    '</label><input id="pf-' +
    k +
    '"' +
    (ph ? ' placeholder="' + ph + '"' : "") +
    '><div class="err" id="pe-' +
    k +
    '"></div></div>';

  Router.registerView("partner-form", () => ({
    t: "Partnership request",
    h:
      efield("org", "Organisation") +
      efield("contact", "Contact name") +
      efield("phone", "Phone", "080...") +
      efield("email", "Email") +
      efield("does", "What your organisation does") +
      efield("why", "Why you want to partner") +
      efield("bring", "What you can contribute") +
      efield("want", "What you want Hamzury to provide") +
      efield("outcome", "Expected outcome") +
      '<div class="actions"><button class="btn primary" onclick="window.app.sendEnquiry(\'partner\')">Send request</button></div>' +
      '<div class="note">This submits your request to Hamzury and opens WhatsApp to connect directly.</div>'
  }));

  Router.registerView("sponsor-form", () => ({
    t: "Sponsorship",
    h:
      '<div class="field"><label for="pf-area">What you want to support</label><select id="pf-area">' +
      ["Junior innovation", "Digital skills", "Technology", "Entrepreneurship", "Equipment", "Scholarships", "Projects"]
        .map((x) => "<option>" + x + "</option>")
        .join("") +
      "</select></div>" +
      efield("org", "Name or organisation") +
      efield("phone", "Phone", "080...") +
      efield("email", "Email") +
      efield("support", "What you would like to give") +
      efield("report", "What you want reported back") +
      '<div class="actions"><button class="btn primary" onclick="window.app.sendEnquiry(\'sponsor\')">Send</button></div>' +
      '<div class="note">This submits your offer to Hamzury and opens WhatsApp to connect directly.</div>'
  }));

  // Staff login view
  Router.registerView("staff", () => ({
    t: "Staff access",
    sub: "Hamzury team only.",
    h:
      '<div class="field"><label for="st-code">Access code</label>' +
      '<input id="st-code" type="password" autocomplete="off"><div class="err" id="st-err"></div></div>' +
      '<div class="actions"><button class="btn primary" onclick="window.app.staffGo()">Continue</button></div>' +
      '<div class="note">This portal requires team authorization.</div>'
  }));
}

/**
 * Handles Partnership or Sponsorship form submission to Firestore + WhatsApp
 */
export async function handleEnquirySubmission(kind) {
  const fields = ["org", "contact", "phone", "email", "does", "why", "bring", "want", "outcome", "support", "report"];
  const payload = {};
  fields.forEach((k) => {
    const el = $("#pf-" + k);
    if (el) payload[k] = el.value.trim();
  });
  const sel = $("#pf-area");
  if (sel) payload.area = sel.value;

  if (!payload.org) {
    const e = $("#pe-org");
    if (e) e.textContent = "Required.";
    return;
  }
  if (!payload.phone) {
    const e = $("#pe-phone");
    if (e) e.textContent = "Required.";
    return;
  }

  // Save to Firestore
  if (kind === "partner") {
    savePartnership(payload);
  } else {
    saveSponsorship(payload);
  }

  const L =
    kind === "partner"
      ? [
          "HAMZURY PARTNERSHIP REQUEST",
          "",
          "Organisation: " + payload.org,
          "Contact: " + (payload.contact || "—"),
          "Phone: " + payload.phone,
          "Email: " + (payload.email || "—"),
          "",
          "What they do: " + (payload.does || "—"),
          "Why partner: " + (payload.why || "—"),
          "They bring: " + (payload.bring || "—"),
          "They want: " + (payload.want || "—"),
          "Expected outcome: " + (payload.outcome || "—")
        ]
      : [
          "HAMZURY SPONSORSHIP",
          "",
          "Name: " + payload.org,
          "Phone: " + payload.phone,
          "Email: " + (payload.email || "—"),
          "",
          "Impact area: " + (payload.area || "—"),
          "Support offered: " + (payload.support || "—"),
          "Wants reported: " + (payload.report || "—")
        ];

  window.open("https://wa.me/234" + WHATSAPP.replace(/^0/, "") + "?text=" + encodeURIComponent(L.join("\n")), "_blank", "noopener");
  Router.toast("Saved & opening WhatsApp");
}
