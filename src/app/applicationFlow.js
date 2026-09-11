/* ============================================================
   APPLICATION WORKFLOW ENGINE
   Multi-step wizard with Firebase Storage uploads & Firestore persistence
   ============================================================ */
import { $, N, FEE, BANK, WHATSAPP, mkRef, nextIntake, payRow, fact, esc } from "../data/constants.js";
import { TR, trk } from "../data/tracks.js";
import { RT, EDU, FLOW, STEP_LABEL, PHASE } from "../data/routes.js";
import { CHK, CHK_FOUNDER, CHK_ECO, CHK_JUNIOR, checkPasses } from "../data/questions.js";
import { submitApplication } from "../services/applications.js";
import { Router } from "./router.js";
import { Guide } from "./guide.js";

export const ApplicationFlow = (function () {
  const A = {
    s: 0,
    ei: 0,
    route: null,
    track: null,
    ci: 0,
    chk: 0,
    cans: [],
    name: "",
    email: "",
    phone: "",
    location: "",
    dob: "",
    school: "",
    cls: "",
    interests: "",
    gname: "",
    grel: "",
    gphone: "",
    gemail: "",
    gemergency: "",
    consent: false,
    ref: null,
    receipt: null,
    receiptName: null,
    receiptFile: null,
    receipt2: null,
    receiptName2: null,
    receiptFile2: null,
    letter: null,
    letterName: null,
    letterFile: null,
    months: null,
    isSubmitting: false
  };

  const currentFlow = () => FLOW[A.route] || FLOW.DEFAULT;
  const currentStepId = () => currentFlow()[A.s];

  function startApp(route = "ceo", track = null) {
    Object.assign(A, {
      s: 0,
      ei: 0,
      route: route || A.route,
      track: track || null,
      ci: 0,
      chk: 0,
      cans: [],
      name: "",
      email: "",
      phone: "",
      location: "",
      dob: "",
      school: "",
      cls: "",
      interests: "",
      gname: "",
      grel: "",
      gphone: "",
      gemail: "",
      gemergency: "",
      consent: false,
      ref: null,
      receipt: null,
      receiptName: null,
      receiptFile: null,
      receipt2: null,
      receiptName2: null,
      receiptFile2: null,
      letter: null,
      letterName: null,
      letterFile: null,
      months: null,
      isSubmitting: false
    });

    const guideState = Guide.getState();
    guideState.level = null;
    guideState.jroute = null;
    if (A.route === "junior") guideState.age = "13-16";

    Router.open("apply");
  }

  function chkSet() {
    return A.route === "junior"
      ? CHK_JUNIOR
      : A.route === "founder"
      ? CHK_FOUNDER
      : A.route === "ecosystem"
      ? CHK_ECO
      : CHK;
  }

  function progDue() {
    const guideState = Guide.getState();
    if (A.route === "junior") {
      return guideState.level === "needs"
        ? ["Junior Basic Foundation", 25000]
        : [A.track === "hardware" ? "Robotics" : "Software", A.track === "hardware" ? 120000 : 30000];
    }
    if (A.route === "founder") return ["CEO → Founder — first month", 100000];
    if (A.route === "ecosystem") return ["Founder → Ecosystem", 200000];
    if (A.route === "siwes") {
      const m = A.months || "1";
      const amt = { "1": 30000, "2": 50000, "3": 70000 }[m];
      return ["SIWES placement — " + m + " month" + (m === "1" ? "" : "s"), amt];
    }
    if (guideState.level === "needs") return ["Digital Foundation", 45000];
    const t = trk(A.track);
    return [t ? t.nm : "Programme", t ? t.p : null];
  }

  function progLabel() {
    if (A.route === "junior") return A.track === "hardware" ? "Robotics" : A.track === "software" ? "Software" : "Programme fee";
    if (A.route === "siwes") return A.siwes === "intern" ? "Direct internship" : A.months ? ("SIWES · " + A.months + " month" + (A.months === "1" ? "" : "s")) : "Placement fee";
    if (A.route === "founder") return "CEO → Founder";
    if (A.route === "ecosystem") return "Founder → Ecosystem";
    return A.track && trk(A.track) ? trk(A.track).nm : "Programme fee";
  }

  function progFee() {
    if (A.route === "junior") return A.track === "hardware" ? N(120000) : A.track === "software" ? N(30000) : "To be confirmed";
    if (A.route === "siwes") {
      const m = { "1": 30000, "2": 50000, "3": 70000 }[A.months || "1"];
      return m ? N(m) : "To be confirmed";
    }
    if (A.route === "founder") return N(100000) + " / month";
    if (A.route === "ecosystem") return N(200000);
    return A.track && trk(A.track) ? N(trk(A.track).p) : "To be confirmed";
  }

  function startingPoint() {
    const guideState = Guide.getState();
    if (A.route === "junior") return guideState.level === "needs" ? "Junior Basic Foundation" : "the specialist route";
    return guideState.level === "needs" ? "Foundation" : "your track";
  }

  function applicationMessage() {
    const guideState = Guide.getState();
    const L = [];
    L.push("HAMZURY APPLICATION");
    L.push("Reference: " + (A.ref || ""));
    L.push("");
    L.push("Name: " + (A.name || "—"));
    L.push("Phone: " + (A.phone || "—"));
    L.push("Email: " + (A.email || "—"));
    L.push("Location: " + (A.location || "—"));
    if (A.route === "junior") {
      L.push("Date of birth: " + (A.dob || "—"));
      L.push("School: " + (A.school || "—") + (A.cls ? " · " + A.cls : ""));
      L.push("");
      L.push("GUARDIAN");
      L.push("Name: " + (A.gname || "—") + (A.grel ? " (" + A.grel + ")" : ""));
      L.push("Phone: " + (A.gphone || "—"));
      L.push("Email: " + (A.gemail || "—"));
      L.push("Emergency: " + (A.gemergency || "—"));
      L.push("Consent given: " + (A.consent ? "Yes" : "No"));
    }
    if (guideState.age) L.push("Age: " + guideState.age);
    L.push("");
    L.push("Route: " + ((RT[A.route] || {}).t || "—"));
    if (A.track) L.push("Track: " + (trk(A.track) ? trk(A.track).nm : A.track));
    L.push("Starting point: " + (guideState.level === "needs" ? "Foundation first" : guideState.level === "ready" ? "Straight to track" : "To be confirmed"));
    L.push("");
    L.push("Programme chosen: " + progLabel() + " — " + progFee());
    L.push("");
    L.push("Application fee: " + N(FEE) + " — receipt attached.");
    return L.join("\n");
  }

  function renderProgHeader() {
    return (
      '<div class="prog">' +
      currentFlow()
        .map((id, i) => '<i class="' + (i <= A.s ? PHASE[id] : "") + (i === A.s ? " now" : "") + '"></i>')
        .join("") +
      "</div>" +
      '<div class="label" style="margin-bottom:20px">' +
      STEP_LABEL[currentStepId()] +
      "</div>"
    );
  }

  function acts(hasBack, nextCall, nextLabel = "Continue") {
    return (
      '<div class="actions">' +
      (hasBack ? '<button class="btn quiet" onclick="window.app.aBack()">Back</button>' : "") +
      (nextCall ? '<button class="btn primary" onclick="' + nextCall + '">' + nextLabel + "</button>" : "") +
      "</div>"
    );
  }

  function setErr(id, message) {
    const input = $("#f-" + id);
    const err = $("#e-" + id);
    if (err) err.textContent = message || "";
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  function renderStep() {
    const box = $("#a");
    if (!box) return;
    const guideState = Guide.getState();
    const r = A.route ? RT[A.route] : null;
    let h = renderProgHeader();

    switch (currentStepId()) {
      case "edu": {
        const set = EDU[A.route] || EDU.ceo;
        const e = set[A.ei] || set[0];
        h +=
          '<h2 style="margin-bottom:10px">' +
          esc(e[0]) +
          "</h2>" +
          '<div class="sub">' +
          esc(e[1]) +
          "</div>" +
          '<p class="tiny" style="margin-top:26px">Apply now and your resumption is ' +
          nextIntake() +
          ".</p>" +
          '<div class="actions">' +
          (A.ei > 0 ? '<button class="btn quiet" onclick="window.app.aBack()">Back</button>' : "") +
          '<button class="btn primary" onclick="window.app.aNext()">' +
          (A.ei < set.length - 1 ? "Next" : "Start") +
          "</button></div>";
        break;
      }

      case "details":
        if (A.route === "junior") {
          const fld = (k, l, t = "text", ph = "") =>
            '<div class="field"><label for="f-' +
            k +
            '">' +
            l +
            '</label><input id="f-' +
            k +
            '" type="' +
            t +
            '"' +
            (ph ? ' placeholder="' + ph + '"' : "") +
            ' value="' +
            esc(A[k] || "") +
            '"><div class="err" id="e-' +
            k +
            '"></div></div>';

          h +=
            '<div class="label">Parent or guardian</div>' +
            fld("gname", "Your full name") +
            fld("grel", "Relationship to the child", "text", "Parent, guardian…") +
            fld("gphone", "Your phone", "tel") +
            fld("gemail", "Your email", "email") +
            fld("gemergency", "Emergency contact", "tel") +
            '<div class="label" style="margin-top:34px">The child</div>' +
            fld("name", "Full name") +
            fld("dob", "Date of birth", "date") +
            fld("school", "School") +
            fld("cls", "Class") +
            fld("location", "Location") +
            fld("interests", "Interests") +
            '<div class="field" style="margin-top:22px"><label style="display:flex;gap:14px;align-items:flex-start;text-transform:none;letter-spacing:0;font-size:14.5px;color:var(--muted);font-weight:400;min-height:48px;padding:12px 0;cursor:pointer">' +
            '<input type="checkbox" id="f-consent" style="width:20px;height:20px;flex:0 0 auto;margin-top:2px;accent-color:var(--orange)"' +
            (A.consent ? " checked" : "") +
            ">" +
            "<span>I am the parent or guardian and I consent to this application.</span></label>" +
            '<div class="err" id="e-consent"></div></div>' +
            acts(true, "window.app.aNext()");
          break;
        }

        h +=
          '<h2 style="margin-bottom:22px">' +
          esc(r ? r.t : "Application") +
          "</h2>" +
          ["name|Name|text", "email|Email|email", "phone|Phone|tel", "location|Location|text"]
            .map((fd) => {
              const [k, l, t] = fd.split("|");
              return (
                '<div class="field"><label for="f-' +
                k +
                '">' +
                l +
                '</label><input id="f-' +
                k +
                '" type="' +
                t +
                '" value="' +
                esc(A[k] || "") +
                '"><div class="err" id="e-' +
                k +
                '"></div></div>'
              );
            })
            .join("") +
          acts(true, "window.app.aNext()");
        break;

      case "placement": {
        const months = [
          ["1", "1 month", 30000],
          ["2", "2 months", 50000],
          ["3", "3 months or more", 70000]
        ];
        h +=
          '<div class="q">How long is your placement?</div>' +
          '<div class="opts">' +
          months
            .map(
              (m) =>
                '<button class="opt' +
                (A.months === m[0] ? " on" : "") +
                '" onclick="window.app.setMonths(\'' +
                m[0] +
                "')\">" +
                "<span>" +
                m[1] +
                '</span><span class="mark">' +
                N(m[2]) +
                "</span></button>"
            )
            .join("") +
          "</div>" +
          (A.months === "3"
            ? '<div class="note">Three months is paid in full, once. Longer placements continue monthly after that.</div>'
            : "") +
          '<div class="label" style="margin:32px 0 8px">School letter</div>' +
          '<p class="tiny" style="margin:0 0 12px">Your placement letter from the school. We verify it.</p>' +
          '<label class="drop' +
          (A.letter ? " ok" : "") +
          '" for="lt">' +
          (A.letter ? "School letter attached (" + esc(A.letterName) + ")" : "Attach School Letter (PDF / Image)") +
          "</label>" +
          '<input id="lt" type="file" accept="image/*,application/pdf" style="display:none" onchange="window.app.takeLetter(this)">' +
          '<div class="upload-progress" id="up-lt" style="display:none"><div class="upload-progress-bar" id="pb-lt"></div></div>' +
          '<div class="err" id="e-letter"></div>' +
          acts(true, "window.app.aNext()");
        break;
      }

      case "fee":
        h +=
          '<div class="big">' +
          N(FEE) +
          "</div>" +
          '<div class="sub" style="margin-top:14px">Application fee. Separate from any programme fee, and it does not guarantee admission.</div>' +
          '<div class="pay">' +
          payRow("Bank", BANK.bank) +
          payRow("Account name", BANK.name) +
          payRow("Account number", BANK.acct) +
          payRow("Amount", N(FEE)) +
          payRow("Use as narration", esc(A.name || "Your full name")) +
          "</div>" +
          '<label class="drop' +
          (A.receipt ? " ok" : "") +
          '" for="rc" style="margin-top:22px">' +
          (A.receipt ? "Receipt attached (" + esc(A.receiptName) + ")" : "Upload Transfer Receipt (PDF / Image)") +
          "</label>" +
          '<input id="rc" type="file" accept="image/*,application/pdf" style="display:none" onchange="window.app.takeReceipt(this)">' +
          '<div class="upload-progress" id="up-rc" style="display:none"><div class="upload-progress-bar" id="pb-rc"></div></div>' +
          '<div class="err" id="e-receipt"></div>' +
          acts(true, "window.app.aNext()", "I have paid");
        break;

      case "bridge":
        h =
          '<div class="label accent">Application fee received</div>' +
          '<h2 style="margin:12px 0 8px">Now choose what you will build on.</h2>' +
          '<div class="sub">The next step is the programme your business is built around. Then we check where you start.</div>' +
          '<div class="actions"><button class="btn quiet" onclick="window.app.aBack()">Back</button>' +
          '<button class="btn primary" onclick="window.app.aNext()">Next</button></div>';
        break;

      case "programme": {
        if (A.route === "founder" || A.route === "ecosystem") {
          const adv =
            A.route === "founder"
              ? ["CEO → Founder", N(100000) + " per month", "Partnerships, grants and the growth that takes the business past you."]
              : ["Founder → Ecosystem", N(200000), "Report your stage and impact, with HR, Finance and Growth behind you."];
          h +=
            "<h2>" +
            esc(adv[0]) +
            '</h2><div class="sub" style="margin-top:8px">' +
            esc(adv[2]) +
            "</div>" +
            '<div class="amt" style="margin-top:24px"><div class="l">Programme fee</div><div class="v now">' +
            adv[1] +
            "</div></div>" +
            acts(true, "window.app.aNext()");
          break;
        }
        const opts =
          A.route === "junior"
            ? [
                ["software", "Software", 30000, "For a child who likes making things happen on a screen."],
                ["hardware", "Robotics", 120000, "For a child who likes building things they can hold."]
              ]
            : TR.map((t) => [t.id, t.nm, t.p, t.fit]);

        h +=
          '<div class="q">' +
          (A.route === "junior" ? "Which route for your child?" : "Which programme?") +
          "</div>" +
          '<div class="opts">' +
          opts
            .map(
              (o) =>
                '<button class="opt' +
                (A.track === o[0] ? " on" : "") +
                '" onclick="window.app.pickProg(\'' +
                o[0] +
                "')\">" +
                "<span>" +
                esc(o[1]) +
                "<small>" +
                esc(o[3]) +
                "</small></span>" +
                '<span class="mark">' +
                N(o[2]) +
                "</span></button>"
            )
            .join("") +
          "</div>" +
          '<div class="actions"><button class="btn quiet" onclick="window.app.aBack()">Back</button>' +
          (A.track ? '<button class="btn primary" onclick="window.app.aNext()">Continue</button>' : "") +
          "</div>";
        break;
      }

      case "requirement": {
        const nm =
          A.route === "junior"
            ? A.track === "hardware"
              ? "Robotics"
              : "Software"
            : trk(A.track)
            ? trk(A.track).nm
            : "This programme";

        h =
          '<div class="label accent">' +
          esc(nm) +
          "</div>" +
          '<h2 style="margin:12px 0 8px">There is a requirement.</h2>' +
          '<div class="sub">' +
          (A.route === "junior"
            ? "Before your child starts this route, the digital basics have to be in place. A few questions decide it."
            : "Before you start this programme, the digital foundation has to be in place. A few questions decide it.") +
          "</div>" +
          '<div class="actions"><button class="btn quiet" onclick="window.app.aBack()">Back</button>' +
          '<button class="btn primary" onclick="window.app.aNext()">Answer them</button></div>';
        break;
      }

      case "check": {
        const set = chkSet();
        if (A.ci < set.length) {
          const c = set[A.ci];
          h +=
            (A.route === "junior" ? '<div class="note">Answered by the parent or guardian, about the child.</div>' : "") +
            '<div class="q">' +
            esc(c.q) +
            '</div><div class="opts">' +
            c.a
              .map(
                (o, i) =>
                  '<button class="opt" onclick="window.app.chk(' +
                  i +
                  ')"><span>' +
                  esc(o[0]) +
                  '</span><span class="mark">→</span></button>'
              )
              .join("") +
            "</div>" +
            '<div class="actions"><button class="btn quiet" onclick="window.app.aBack()">Back</button></div>';
          break;
        }

        guideState.level = (A.route === "junior" ? A.chk >= 1 : checkPasses(A.chk)) ? "ready" : "needs";
        const due = progDue();
        h +=
          "<h2>" +
          (guideState.level === "needs"
            ? A.route === "junior"
              ? "Start with Basic Foundation."
              : "You start at Foundation."
            : "You are ready.") +
          "</h2>" +
          '<div class="sub">' +
          (guideState.level === "needs"
            ? A.route === "junior"
              ? "The basics are not in place yet. Basic Foundation builds them in one month, then the route you chose follows."
              : "Foundation is one month, and it is the shortest way to the programme you chose. Nothing is lost."
            : "The requirement is met. You go straight to what you chose.") +
          "</div>" +
          '<div class="actions"><button class="btn quiet" onclick="window.app.aBack()">Back</button>' +
          '<button class="btn primary" onclick="window.app.aNext()">' +
          (due[1] ? "Pay " + N(due[1]) : "Continue") +
          "</button></div>";
        break;
      }

      case "progfee": {
        const due = progDue();
        const later = guideState.level === "needs" && A.track && trk(A.track);
        h +=
          '<h2 style="margin-bottom:6px">' +
          esc(due[0]) +
          "</h2>" +
          '<div class="sub">' +
          (later
            ? "Foundation comes first — one month. Your track fee is paid after it, not now."
            : "The " + N(FEE) + " application fee is already paid and is not part of this.") +
          "</div>" +
          (later
            ? '<div class="amt" style="margin-top:18px"><div class="l">' +
              esc(trk(A.track).nm) +
              "<small>After Foundation</small></div><div class=\"v later\">" +
              N(trk(A.track).p) +
              "</div></div>"
            : "") +
          (due[1]
            ? '<div class="pay" style="margin-top:22px">' +
              payRow("Bank", BANK.bank) +
              payRow("Account name", BANK.name) +
              payRow("Account number", BANK.acct) +
              payRow("Amount", N(due[1])) +
              payRow("Use as narration", esc(A.name || "Your full name")) +
              "</div>" +
              '<label class="drop' +
              (A.receipt2 ? " ok" : "") +
              '" for="rc2" style="margin-top:22px">' +
              (A.receipt2 ? "Receipt attached (" + esc(A.receiptName2) + ")" : "Upload Transfer Receipt (PDF / Image)") +
              "</label>" +
              '<input id="rc2" type="file" accept="image/*,application/pdf" style="display:none" onchange="window.app.takeReceipt2(this)">' +
              '<div class="upload-progress" id="up-rc2" style="display:none"><div class="upload-progress-bar" id="pb-rc2"></div></div>' +
              '<div class="err" id="e-receipt2"></div>' +
              '<p class="tiny" style="margin-top:14px">Resumption is ' +
              nextIntake() +
              ".</p>"
            : '<div class="note">This fee is confirmed with you directly, before resumption on ' +
              nextIntake() +
              ".</div>") +
          acts(true, "window.app.aNext()", due[1] ? "I have paid" : "Continue");
        break;
      }

      case "slip": {
        const due = progDue();
        if (!A.ref) A.ref = mkRef();
        const track = A.track
          ? A.route === "junior"
            ? A.track === "hardware"
              ? "Robotics"
              : "Software"
            : trk(A.track)
            ? trk(A.track).nm
            : A.track
          : null;
        const remaining =
          guideState.level === "needs" && A.track && A.route !== "siwes"
            ? A.route === "junior"
              ? A.track === "hardware"
                ? 120000
                : 30000
              : trk(A.track)
              ? trk(A.track).p
              : null
            : null;

        h =
          '<div class="slip" id="slip">' +
          '<div class="sliphead"><span>Hamzury Innovation Hub</span><span id="slip-ref">' +
          esc(A.ref) +
          "</span></div>" +
          '<h2 style="margin:18px 0 4px">Application submitted</h2>' +
          '<p class="sub" style="margin-bottom:20px">' +
          esc(A.name || "") +
          "</p>" +
          '<dl class="facts">' +
          fact("Route", esc((RT[A.route] || {}).t || "—")) +
          (track ? fact("Programme", esc(track)) : "") +
          fact("Starting point", esc(startingPoint())) +
          (A.route === "siwes" && A.months ? fact("Placement", A.months + " month" + (A.months === "1" ? "" : "s")) : "") +
          fact("Resumption", nextIntake()) +
          "</dl>" +
          '<div class="label" style="margin:26px 0 6px">Payments</div>' +
          '<div class="amt"><div class="l">Application fee</div><div class="v later">' +
          N(FEE) +
          " — paid</div></div>" +
          '<div class="amt"><div class="l">' +
          esc(due[0]) +
          '</div><div class="v later">' +
          (due[1] ? N(due[1]) + " — paid" : "Confirmed with you") +
          "</div></div>" +
          (remaining
            ? '<div class="amt"><div class="l">' +
              esc(track) +
              '<small>After Foundation</small></div>' +
              '<div class="v later">' +
              N(remaining) +
              " — later</div></div>"
            : "") +
          '<p class="tiny" style="margin-top:26px">Payment evidence is verified in Firebase and checked by staff. Admission is not automatic.</p>' +
          "</div>" +
          '<div class="note ok" style="border-color:var(--gold)">Thank you. Your records have been saved securely. ' +
          "We will contact you on " +
          esc(A.phone || "the number you provided") +
          " once payment is verified. Quote your reference <b>" +
          esc(A.ref) +
          "</b> to check status at any time.</div>" +
          '<div class="actions">' +
          '<button class="btn primary" onclick="window.print()">Print or save as PDF</button>' +
          '<button class="btn quiet" onclick="window.app.sendAppWhatsApp()">Message on WhatsApp</button>' +
          '<button class="btn quiet" onclick="window.app.close()">Done</button>' +
          "</div>";

        // Background submission to Firebase
        if (!A.isSubmitting) {
          A.isSubmitting = true;
          submitApplication(
            {
              ref: A.ref,
              name: A.name,
              email: A.email,
              phone: A.phone,
              location: A.location,
              route: A.route,
              track: A.track,
              level: guideState.level,
              age: guideState.age,
              resumption: nextIntake(),
              progDueAmount: due[1],
              progDueTitle: due[0],
              gname: A.gname,
              grel: A.grel,
              gphone: A.gphone,
              gemail: A.gemail,
              gemergency: A.gemergency,
              consent: A.consent,
              dob: A.dob,
              school: A.school,
              cls: A.cls,
              interests: A.interests,
              months: A.months,
              receipt: A.receipt,
              receiptName: A.receiptName,
              receipt2: A.receipt2,
              receiptName2: A.receiptName2,
              letter: A.letter,
              letterName: A.letterName
            },
            {
              receipt: A.receiptFile,
              receipt2: A.receiptFile2,
              letter: A.letterFile
            }
          ).catch((err) => {
            console.error("Submission error:", err);
          });
        }

        break;
      }
    }

    box.innerHTML = h;
  }

  function aNext() {
    const id = currentStepId();
    const guideState = Guide.getState();

    if (id === "edu") {
      const set = EDU[A.route] || EDU.ceo;
      if (A.ei < set.length - 1) {
        A.ei++;
        renderStep();
        return;
      }
    }

    if (id === "details" && A.route === "junior") {
      ["name", "dob", "school", "cls", "location", "interests", "gname", "grel", "gphone", "gemail", "gemergency"].forEach((k) => {
        const el = $("#f-" + k);
        if (el) A[k] = el.value.trim();
      });
      A.consent = $("#f-consent") ? $("#f-consent").checked : false;
      let ok = true;
      ok = setErr("gname", (A.gname || "").length < 2 ? "Your name." : "") && ok;
      ok = setErr("gphone", (A.gphone || "").replace(/\D/g, "").length < 7 ? "A reachable number." : "") && ok;
      ok = setErr("gemail", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(A.gemail || "") ? "" : "A valid email.") && ok;
      ok = setErr("gemergency", (A.gemergency || "").replace(/\D/g, "").length < 7 ? "An emergency number." : "") && ok;
      ok = setErr("name", (A.name || "").length < 2 ? "The child's name." : "") && ok;
      ok = setErr("dob", A.dob ? "" : "Date of birth.") && ok;
      ok = setErr("school", (A.school || "").length < 2 ? "School name." : "") && ok;
      ok = setErr("consent", A.consent ? "" : "Guardian consent is required.") && ok;
      if (!ok) return;
      A.email = A.gemail;
      A.phone = A.gphone;
    } else if (id === "details") {
      A.name = ($("#f-name")?.value || "").trim();
      A.email = ($("#f-email")?.value || "").trim();
      A.phone = ($("#f-phone")?.value || "").trim();
      A.location = ($("#f-location")?.value || "").trim();
      let ok = true;
      ok = setErr("name", A.name.length < 2 ? "Your name." : "") && ok;
      ok = setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(A.email) ? "" : "A valid email.") && ok;
      ok = setErr("phone", A.phone.replace(/\D/g, "").length < 7 ? "A reachable number." : "") && ok;
      ok = setErr("location", A.location.length < 2 ? "Your city." : "") && ok;
      if (!ok) return;
    }

    if (id === "fee" && !A.receipt) {
      setErr("receipt", "Upload your receipt before continuing.");
      return;
    }
    if (id === "progfee" && progDue()[1] && !A.receipt2) {
      setErr("receipt2", "Upload your receipt before continuing.");
      return;
    }
    if (id === "placement") {
      if (!A.months) {
        setErr("letter", "Choose how long your placement is.");
        return;
      }
      if (!A.letter) {
        setErr("letter", "Attach your school letter before continuing.");
        return;
      }
    }
    if (id === "programme" && A.route !== "founder" && A.route !== "ecosystem" && !A.track) {
      return;
    }

    if (A.s === currentFlow().length - 1) return;
    A.s++;
    renderStep();
  }

  function aBack() {
    const id = currentStepId();
    if (id === "edu") {
      if (A.ei > 0) {
        A.ei--;
        renderStep();
      }
      return;
    }
    if (id === "check") {
      if (A.ci > 0) {
        A.ci--;
        A.chk -= chkSet()[A.ci].a[A.cans[A.ci]][1];
        renderStep();
        return;
      }
      A.s--;
      renderStep();
      return;
    }
    if (A.s > 0) {
      A.s--;
      if (currentStepId() === "check") {
        A.ci = 0;
        A.chk = 0;
        A.cans = [];
      }
      if (currentStepId() === "edu") {
        const set = EDU[A.route] || EDU.ceo;
        A.ei = set.length - 1;
      }
      renderStep();
    }
  }

  function pickProg(v) {
    A.track = v;
    if (A.route === "junior") Guide.getState().jroute = v;
    renderStep();
  }

  function clearProg() {
    A.track = null;
    renderStep();
  }

  function setMonths(m) {
    A.months = m;
    renderStep();
  }

  function chk(i) {
    const set = chkSet();
    A.chk += set[A.ci].a[i][1];
    A.cans[A.ci] = i;
    A.ci++;
    renderStep();
  }

  function handleFileSelection(input, callback) {
    const f = input.files && input.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      Router.toast("File must be under 10MB");
      return;
    }
    callback(f);
  }

  function takeReceipt(input) {
    handleFileSelection(input, (f) => {
      A.receiptFile = f;
      A.receiptName = f.name;
      A.receipt = URL.createObjectURL(f);
      Router.toast("Receipt attached: " + f.name);
      renderStep();
    });
  }

  function takeReceipt2(input) {
    handleFileSelection(input, (f) => {
      A.receiptFile2 = f;
      A.receiptName2 = f.name;
      A.receipt2 = URL.createObjectURL(f);
      Router.toast("Receipt attached: " + f.name);
      renderStep();
    });
  }

  function takeLetter(input) {
    handleFileSelection(input, (f) => {
      A.letterFile = f;
      A.letterName = f.name;
      A.letter = URL.createObjectURL(f);
      Router.toast("School letter attached: " + f.name);
      renderStep();
    });
  }

  function sendAppWhatsApp() {
    const text = applicationMessage();
    window.open("https://wa.me/234" + WHATSAPP.replace(/^0/, "") + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  }

  return {
    startApp,
    renderStep,
    aNext,
    aBack,
    pickProg,
    clearProg,
    setMonths,
    chk,
    takeReceipt,
    takeReceipt2,
    takeLetter,
    sendAppWhatsApp,
    getState: () => A
  };
})();
