/* ============================================================
   HAMZURY TRACKS / PROGRAMMES
   14 distinct capabilities tied to market problems and real businesses
   ============================================================ */

export const TR = [
  {
    id: "data",
    nm: "AI Data & Insight Analyst",
    p: 64000,
    prob: "Businesses hold data they never use.",
    market: "Any business with sales, stock or customer records.",
    work: "Dashboards, reports and decision briefs from real records.",
    out: "Turn a company's own data into decisions it can act on.",
    biz: "Monthly reporting retainer or one-off analysis.",
    fit: "For people who notice patterns and want to know why the numbers moved."
  },
  {
    id: "automation",
    nm: "AI Automation Agency",
    p: 64000,
    prob: "Manual work repeats until it breaks.",
    market: "Operations-heavy businesses with repetitive processes.",
    work: "Workflows and automations that run without supervision.",
    out: "Remove hours of manual work from a business.",
    biz: "Build fee plus maintenance, or retained support.",
    fit: "For people who cannot stand doing the same thing twice."
  },
  {
    id: "assistant",
    nm: "AI Executive Assistant",
    p: 59000,
    prob: "Leaders lose hours to work beneath them.",
    market: "Founders, executives and small leadership teams.",
    work: "Research, documentation, reporting and communication systems.",
    out: "Multiply an executive's output without adding headcount.",
    biz: "Monthly retainer or fractional support.",
    fit: "For organised people who like keeping someone else effective."
  },
  {
    id: "brand",
    nm: "AI Brand & Positioning",
    p: 59000,
    prob: "Good businesses lose to clearer ones.",
    market: "Businesses with a real offer and unclear positioning.",
    work: "Positioning, messaging and the content that carries it.",
    out: "Make a business understood and chosen.",
    biz: "Brand project or retained brand support.",
    fit: "For people with taste who can explain why something matters."
  },
  {
    id: "revenue",
    nm: "AI Revenue & Systems Closer",
    p: 64000,
    prob: "Interest arrives, then disappears.",
    market: "Businesses with enquiries and no follow-up system.",
    work: "Offer, follow-up, WhatsApp systems, CRM and tracking.",
    out: "Turn enquiries into closed business, on record.",
    biz: "System build fee or retained sales operations.",
    fit: "For people who are comfortable asking for the decision."
  },
  {
    id: "startup",
    nm: "AI Startup Architect",
    p: 64000,
    prob: "Ideas fail on structure, not effort.",
    market: "Founders and teams at the idea stage.",
    work: "Validation, business model, product spec and an MVP.",
    out: "Take an idea to something real and tested.",
    biz: "Venture build or product consulting.",
    fit: "For people with an idea they are tired of only talking about."
  },
  {
    id: "agentic",
    nm: "Agentic AI Engineer",
    p: 69000,
    prob: "Multi-step work is where AI fails.",
    market: "Businesses whose processes span several systems.",
    work: "AI agents and agentic workflows that hold up under load.",
    out: "Build agents that complete real multi-step work.",
    biz: "Build and maintain, or technical consulting.",
    fit: "For technical people who want AI to do real multi-step work."
  },
  {
    id: "media",
    nm: "AI Media & Faceless Agency",
    p: 59000,
    prob: "Attention starts, then stops.",
    market: "Businesses needing visibility without a media team.",
    work: "Content systems, production workflows and distribution.",
    out: "Keep a business visible without burning out.",
    biz: "Monthly content retainer or channel management.",
    fit: "For people who can make things worth watching, consistently."
  },
  {
    id: "industry",
    nm: "Industry AI Transformer",
    p: 64000,
    prob: "Traditional industry is largely untouched.",
    market: "Agriculture, transport, trade, construction, health, education.",
    work: "One operational problem, analysed and solved with technology.",
    out: "Modernise a real operation in a traditional sector.",
    biz: "Transformation project or sector consulting.",
    fit: "For people who know a trade and can see what is broken in it."
  },
  {
    id: "wealth",
    nm: "AI Wealth & Compliance",
    p: 59000,
    prob: "Disorder costs more than competition.",
    market: "Businesses formalising their money and filing.",
    work: "Compliance calendars, financial workflows and record systems.",
    out: "Put a business in order and keep it there.",
    biz: "System setup or ongoing compliance support.",
    fit: "For careful people who bring order to money and records."
  },
  {
    id: "web",
    nm: "Website Design & Development",
    p: 56000,
    prob: "Most businesses have no working front door.",
    market: "Any business that needs to be found and trusted online.",
    work: "Designed, built and deployed websites that convert.",
    out: "Ship a working site a business can rely on.",
    biz: "Build fee plus hosting, care and iteration.",
    fit: "For people who want to build the thing a business is judged by."
  },
  {
    id: "software",
    nm: "Software & App Development",
    p: 56000,
    prob: "Off-the-shelf tools rarely fit the actual process.",
    market: "Businesses outgrowing spreadsheets and manual systems.",
    work: "Applications built to a real specification and shipped.",
    out: "Build software people actually use.",
    biz: "Project build, or product with recurring licensing.",
    fit: "For people who want to build the tool, not just use it."
  },
  {
    id: "cyber",
    nm: "Cybersecurity",
    p: 70000,
    prob: "Most businesses only think about security after the loss.",
    market: "Any business holding money, customer records or accounts.",
    work: "Assessments, hardening, monitoring and incident response practice.",
    out: "Find the weakness before someone else does.",
    biz: "Security audit, retained monitoring, or incident support.",
    fit: "For people who think about how things break before they do."
  },
  {
    id: "product",
    nm: "Product Design",
    p: 59000,
    prob: "People abandon products that are confusing, not products that are ugly.",
    market: "Anyone building an app, a site or a service people must use.",
    work: "Research, flows, wireframes, interface design and testing.",
    out: "Design something people can actually use without being taught.",
    biz: "Design project, retained product partner, or design system build.",
    fit: "For people who care that something is easy to use, not just pretty."
  }
];

export const trk = (id) => TR.find((t) => t.id === id);
