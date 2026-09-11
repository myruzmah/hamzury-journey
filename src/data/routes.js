/* ============================================================
   HAMZURY ROUTES, JOURNEY NODES & EDUCATIONAL BRIEFINGS
   ============================================================ */
import { esc } from "./constants.js";

export const ND = {
  start: { nm: "Start", why: "You are here.", req: "Nothing.", will: "See the route before you commit.", next: "Check" },
  check: { nm: "Check", why: "We read your current level.", req: "A few questions.", will: "Be placed, not tested.", next: "Foundation or track" },
  found: { nm: "Foundation", why: "The base every track assumes.", req: "Assigned by the check, not chosen.", will: "Work fluently with the tools. One month, ₦45,000.", next: "Your track" },
  jbasic: { nm: "Foundation", why: "Where every Junior begins.", req: "Age 13–16.", will: "Build digital confidence and make things.", next: "Software or Hardware" },
  jspec: { nm: "Software / Hardware", why: "Your direction.", req: "Foundation complete.", will: "Build real projects.", next: "Projects" },
  jproj: { nm: "Projects", why: "Proof you can make things.", req: "A specialist route.", will: "Take one project all the way.", next: "Innovator → CEO at 17" },
  track: { nm: "Track", why: "One problem worth solving.", req: "Foundation, or equivalent.", will: "Build the capability to solve it.", next: "Build" },
  build: { nm: "Build", why: "Capability becomes evidence.", req: "A working skill.", will: "Build for Hamzury, then for yourself.", next: "Market" },
  market: { nm: "Market", why: "Someone must want it.", req: "Something built.", will: "Find the market and make the offer.", next: "Revenue" },
  revenue: { nm: "Revenue", why: "Value the market recognised.", req: "Delivered work.", will: "Sell, deliver and review honestly.", next: "CEO" },
  ceo: { nm: "CEO", why: "Can I make it work?", req: "Evidence across the cycle.", will: "Operate the business you built.", next: "Founder" },
  founder: { nm: "Founder", why: "Can I build the system that works?", req: "CEO capability, verified.", will: "Build systems, team and structure. One month, one achievement.", next: "Ecosystem" },
  product: { nm: "Product", why: "Can a customer understand and receive it?", req: "An existing business.", will: "Make the offer clear and repeatable.", next: "Marketing" },
  marketing: { nm: "Marketing", why: "Random posting is not marketing.", req: "A clear product.", will: "Build audience, message, content, lead, follow-up.", next: "Sales" },
  sales: { nm: "Sales", why: "Interest has to go somewhere.", req: "Demand.", will: "Build the path from prospect to decision.", next: "CRM" },
  crm: { nm: "CRM", why: "Customers should not live in WhatsApp memory.", req: "Sales activity.", will: "Build lead, follow-up, customer, delivery, retention.", next: "Finance" },
  finance: { nm: "Finance", why: "You cannot decide what you cannot see.", req: "Revenue.", will: "Build visibility over money in and out.", next: "Operations" },
  operations: { nm: "Operations", why: "What happens after payment?", req: "Delivery.", will: "Define who does what, and when.", next: "Workflows" },
  workflows: { nm: "Workflows", why: "Repeated work should be repeatable.", req: "Operations.", will: "Turn habits into process.", next: "Automation" },
  automation: { nm: "Automation", why: "Technology should remove manual work.", req: "Workflows.", will: "Automate what should not need you.", next: "Team" },
  team: { nm: "Team", why: "The CEO should not do everything.", req: "Systems worth handing over.", will: "Bring in the capability you lack.", next: "Management" },
  management: { nm: "Management", why: "People, systems, numbers, outcomes.", req: "A team.", will: "Manage rather than perform.", next: "Scale" },
  scale: { nm: "Scale", why: "Growth without collapse.", req: "Management.", will: "Grow what already works.", next: "Founder" },
  business: { nm: "Business", why: "A skill is not yet a business.", req: "A market and an offer.", will: "Build name, brand, offer, landing page, WhatsApp, CRM, operations.", next: "Revenue" },
  present: { nm: "Present", why: "Work that cannot be shown cannot be sold.", req: "A finished project.", will: "Show it and defend it.", next: "Next level" },
  test: { nm: "Test", why: "It has to actually work.", req: "A build.", will: "Test, break and fix it.", next: "Project" },
  proven: { nm: "Proven business", why: "You have already done it once.", req: "Revenue over ₦1,000,000.", will: "Build from experience, not from zero.", next: "Ecosystem" },
  expand: { nm: "Expand", why: "Growth or a second venture.", req: "A working business.", will: "Strengthen, expand or start something new.", next: "New venture" },
  venture: { nm: "New venture", why: "You do not restart at the beginning.", req: "Founder experience.", will: "Assess, build, launch, manage.", next: "Scale" },
  eco: { nm: "Ecosystem", why: "Independent, not alone.", req: "Founder status.", will: "Own your company, keep the network.", next: "—" }
};

export const RT = {
  junior: {
    t: "Junior Innovator",
    m: "Ages 13–16",
    min: 13,
    max: 16,
    map: (state) =>
      ["start", "check", "jbasic", "jspec"]
        .concat(state?.jroute === "hardware" ? ["build", "test"] : ["build"])
        .concat(["jproj", "present"])
  },
  ceo: {
    t: "Innovator → CEO",
    m: "Ages 17+",
    min: 17,
    max: null,
    map: (state) =>
      ["start", "check"]
        .concat(state?.level === "ready" ? [] : ["found"])
        .concat(["track", "build", "market", "business", "revenue", "ceo"])
  },
  founder: {
    t: "CEO → Founder",
    m: "₦100,000 / month",
    min: 17,
    max: null,
    map: () =>
      ["ceo", "product", "marketing", "sales", "crm", "finance", "operations", "workflows", "automation", "team", "management", "scale", "founder"]
  },
  ecosystem: {
    t: "Founder → Ecosystem",
    m: "₦200,000 · proven revenue over ₦1,000,000",
    min: 17,
    max: null,
    map: () =>
      ["proven", "eco", "expand", "venture", "build", "management", "scale"]
  },
  siwes: {
    t: "SIWES / Internship",
    m: "Junior Staff · 5 days · 8:00–3:00 · monthly",
    min: 17,
    max: null,
    map: (state) =>
      ["start", "check"]
        .concat(state?.level === "ready" ? [] : ["found"])
        .concat(["track", "build", "market", "business", "revenue", "ceo"])
  }
};

export const EDU = {
  junior: [
    ["Your child is assessed, not enrolled.", "You apply as the parent or guardian, and answer a few questions about your child. Those answers decide where they begin — you do not choose it."],
    ["Three days a week, building.", "Not lessons and notes. Your child makes something real, and stands up and presents it."],
    ["It ends with a project, not a certificate.", "After that come hackathons and opportunities."]
  ],
  ceo: [
    ["You are placed, not enrolled.", "A short check decides whether you start at Foundation or go straight to your track."],
    ["Three days a week, month by month.", "Build, market, customer, revenue. Each month has one achievement to hit."],
    ["You leave operating something.", "Not \"I learned a skill\" — a business that can take a customer and issue an invoice."]
  ],
  siwes: [
    ["You work here. You are not a visitor.", "Junior staff, five days a week, 8:00 to 3:00, on real Hamzury work."],
    ["Your level decides where you enter.", "You do not restart at zero because you came through a placement. School documentation is verified."],
    ["You progress while you work.", "Your own project runs alongside the job. Contribution can qualify for a percentage."]
  ],
  founder: [
    ["This is for a business that already works.", "Not an idea. Something with customers and revenue you can point at."],
    ["We look at what you already have.", "Your landing page, what brings people in, your revenue, and whether you can state the problem in one sentence."],
    ["It is growth, not systems.", "Partnerships, grants, and the things that take the business past you."]
  ],
  ecosystem: [
    ["You may have built it without us.", "If the evidence is there, that counts. We accept what you proved on your own."],
    ["You report your stage and impact.", "That is the entry. It is not an exam."],
    ["Three departments stand behind you.", "HR, Finance and Growth, at minimum."]
  ]
};

export const LADDER = [
  ["junior", "Junior Innovator", "Capability"],
  ["ceo", "Innovator → CEO", "Capability → business"],
  ["founder", "CEO → Founder", "Business → growth"],
  ["ecosystem", "Founder → Ecosystem", "Growth → expansion"]
];

export function relate(k) {
  const line = {
    junior: "Capability. The stage before Innovator → CEO.",
    ceo: "Capability into business. After Junior Innovator, before CEO → Founder.",
    founder: "Business into growth. After Innovator → CEO.",
    ecosystem: "Growth into expansion. The stage after CEO → Founder.",
    siwes: "Not a separate ladder — you join the professional journey at your level."
  }[k];
  return line ? '<p class="tiny" style="margin:18px 0 0">' + esc(line) + "</p>" : "";
}

export const FLOW = {
  siwes: ["edu", "details", "placement", "fee", "bridge", "programme", "requirement", "check", "progfee", "slip"],
  DEFAULT: ["edu", "details", "fee", "bridge", "programme", "requirement", "check", "progfee", "slip"]
};

export const STEP_LABEL = {
  edu: "Before you apply",
  details: "Your details",
  placement: "Your placement",
  fee: "Application fee",
  bridge: "Your programme",
  programme: "Your programme",
  requirement: "Requirement",
  check: "Your level",
  progfee: "Programme fee",
  slip: "Your slip"
};

export const PHASE = {
  edu: "p-learn",
  details: "p-you",
  placement: "p-you",
  fee: "p-you",
  bridge: "p-choose",
  programme: "p-choose",
  requirement: "p-choose",
  check: "p-choose",
  progfee: "p-finish",
  slip: "p-finish"
};

export const TY = [
  { y: 2027, s: "Upcoming", months: [] },
  { y: 2026, s: "Current", months: ["January", "February", "March", "April", "May", "June", "July", "August"] },
  { y: 2025, s: "Archive", months: ["April", "August", "December"] }
];

export const TSTATS = ["Impact", "Cohorts", "Businesses", "Projects", "Outcomes", "Participation"];

export const LIFE = [
  { id: "dandali", nm: "Dandali", m: "Building" },
  { id: "zaure", nm: "Zaure", m: "Presenting" },
  { id: "madafa", nm: "Workspace", m: "Daily work" },
  { id: "tsunguna", nm: "Mentoring", m: "Unblocking" },
  { id: "build", nm: "Building", m: "Hands on" },
  { id: "present", nm: "Presentations", m: "Showing work" },
  { id: "events", nm: "Events", m: "The ecosystem" }
];

export const QA = [
  ["Is ₦5,000 the full fee?", "No. It is the application fee. Programme fees come later, separately, once your route is set."],
  ["Do I choose Foundation?", "No. We check your level and place you. If you already have it, you skip it."],
  ["Does paying guarantee admission?", "No. It puts a verified application on record."],
  ["When can I apply?", "Between the 1st and 25th each month."],
  ["Do I need to know my career?", "No. Guide Me works from what you have already done."],
  ["Will I earn money?", "We do not promise income. We build the capability and the business around it."]
];
