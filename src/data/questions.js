/* ============================================================
   HAMZURY DIAGNOSTIC QUESTIONS & LEVEL CHECKS
   ============================================================ */

export const QP = [
  {
    id: "afternoon",
    dim: "track",
    w: 3,
    q: "What would you rather spend an afternoon doing?",
    a: [
      ["Building something", { startup: 2, agentic: 2 }, 0],
      ["Helping someone solve a problem", { assistant: 2, industry: 1 }, 0],
      ["Making something look better", { brand: 2, media: 2 }, 0],
      ["Finding what the numbers say", { data: 3 }, 0],
      ["Making a process faster", { automation: 3 }, 0],
      ["Selling an idea", { revenue: 3 }, 0],
      ["I don't know yet", {}, 0]
    ]
  },
  {
    id: "done",
    dim: "both",
    w: 2,
    q: "Which of these have you actually done?",
    a: [
      ["Solved a real problem with digital tools", { automation: 2, data: 1 }, 1],
      ["Made something people used", { startup: 3 }, 2],
      ["Sold or explained something", { revenue: 2, brand: 1 }, 1],
      ["Organised work for other people", { assistant: 2, wealth: 1 }, 1],
      ["Worked in a traditional business", { industry: 3 }, 1],
      ["Not much yet", {}, -2]
    ]
  },
  {
    id: "computer",
    dim: "level",
    w: 4,
    q: "Using a computer feels…",
    a: [
      ["Easy", {}, 2],
      ["I can manage", {}, 0],
      ["I need help", {}, -2],
      ["I avoid it", {}, -2],
      ["I'm not sure", {}, 0]
    ]
  },
  {
    id: "tools",
    dim: "level",
    w: 3,
    q: "Which of these have you used for real work?",
    a: [
      ["Spreadsheets or documents", { data: 1 }, 2],
      ["Design or content tools", { media: 1, brand: 1 }, 2],
      ["AI tools, beyond curiosity", { agentic: 1 }, 2],
      ["Business tools — CRM, invoicing, bookkeeping", { revenue: 1, wealth: 1 }, 2],
      ["None of these yet", {}, -2]
    ]
  },
  {
    id: "unfamiliar",
    dim: "level",
    w: 2,
    q: "When something is unfamiliar, you…",
    a: [
      ["Break it into parts", { data: 1 }, 1],
      ["Try things until it works", { startup: 1 }, 1],
      ["Watch someone first", { assistant: 1 }, 0],
      ["Ask for direction", {}, -1]
    ]
  },
  {
    id: "worth",
    dim: "track",
    w: 2,
    q: "What would make this worth it?",
    a: [
      ["A capability I can use", { data: 1, assistant: 1 }, 0],
      ["A service I can sell", { automation: 2, revenue: 2 }, 0],
      ["A business I can build", { startup: 3 }, 0],
      ["Real experience", { industry: 1, assistant: 1 }, 0]
    ]
  },
  {
    id: "age",
    dim: "age",
    w: 9,
    q: "How old are you?",
    a: [
      ["13–16", "13-16"],
      ["17–20", "17-20"],
      ["21–25", "21-25"],
      ["26 and above", "26+"]
    ]
  }
];

export const QID = (id) => QP.find((q) => q.id === id);

export const CHK_FOUNDER = [
  { q: "Do you have a landing page or website for the business?", a: [["Yes, live", 1], ["Being built", 0], ["Not yet", -1]] },
  { q: "Do you have an offer or lead magnet that brings people in?", a: [["Yes, working", 1], ["Something informal", 0], ["No", -1]] },
  { q: "Is the business earning revenue?", a: [["Regularly", 1], ["Sometimes", 0], ["Not yet", -1]] },
  { q: "Can you state the problem you solve in one sentence?", a: [["Clearly", 1], ["Roughly", 0], ["Not really", -1]] }
];

export const CHK_ECO = [
  { q: "Is your business running now?", a: [["Yes", 1], ["Restarting", 0], ["No", -1]] },
  { q: "Have you built the systems it runs on?", a: [["Yes", 1], ["Partly", 0], ["No", -1]] },
  { q: "Is revenue over ₦1,000,000?", a: [["Yes", 1], ["Close", 0], ["No", -1]] },
  { q: "Where was it built?", a: [["With Hamzury", 0], ["On my own", 0], ["With others", 0]] }
];

export const CHK_JUNIOR = [
  { q: "Has your child used a computer or laptop before?", a: [["Yes, often", 1], ["A few times", 0], ["Not really", -1]] },
  { q: "Has your child made anything on a computer — a document, a design, a game?", a: [["Yes", 1], ["Once or twice", 0], ["No", -1]] },
  { q: "How comfortable is your child with typing and finding files?", a: [["Comfortable", 1], ["Managing", 0], ["Still learning", -1]] },
  { q: "Has your child used any building or coding tool before?", a: [["Yes", 1], ["Tried once", 0], ["Not yet", -1]] }
];

export const CHK = [
  { q: "Day to day, using a computer feels…", a: [["Comfortable", 1], ["Manageable", 0], ["New to me", -1]] },
  { q: "Have you used Docs, Sheets or Drive for real work?", a: [["Yes, regularly", 1], ["A little", 0], ["Not yet", -1]] },
  { q: "Can you find, rename and organise your own files?", a: [["Easily", 1], ["Slowly", 0], ["Not really", -1]] },
  { q: "Have you built or produced something digital before?", a: [["Yes", 1], ["Once or twice", 0], ["No", -1]] },
  { q: "How do you handle a tool you have never seen?", a: [["Work it out myself", 1], ["Look for a guide", 0], ["Wait for help", -1]] },
  { q: "Have you used AI tools for anything beyond curiosity?", a: [["Yes, for real work", 1], ["Tried them", 0], ["No", -1]] },
  { q: "Writing a clear email or message is…", a: [["Easy", 1], ["Manageable", 0], ["Hard for me", -1]] },
  { q: "Have you used a phone or laptop to solve a problem for someone else?", a: [["Yes", 1], ["Once or twice", 0], ["No", -1]] },
  { q: "If something goes wrong online, you…", a: [["Search and fix it", 1], ["Try a little", 0], ["Stop and ask", -1]] }
];

export const checkPasses = (score) => score >= 3;
