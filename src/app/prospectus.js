/* ============================================================
   HAMZURY JOURNEY PROSPECTUS
   Comprehensive curriculum, tracks, schedule & printable PDF guide
   ============================================================ */
import { N, FEE, BANK, WHATSAPP, esc } from "../data/constants.js";
import { TR } from "../data/tracks.js";
import { getAllCourses } from "../services/courses.js";

export const Prospectus = (function () {
  function renderView() {
    const courses = getAllCourses();

    const h = `
      <div class="prospectus-wrap">
        <div class="prospectus-hero">
          <div class="label accent" style="margin-bottom:8px">Official Institutional Document</div>
          <h1 style="font-size:clamp(28px, 4vw, 42px);margin-bottom:12px;letter-spacing:-0.03em">
            HAMZURY JOURNEY PROSPECTUS
          </h1>
          <p class="sub" style="font-size:16px;line-height:1.6;max-width:62ch">
            A comprehensive overview of our learning philosophy, the four journey stages, specialization tracks, daily operating schedule, and admissions requirements.
          </p>

          <div class="actions" style="margin-top:24px">
            <button class="btn primary" onclick="window.print()">📥 Print or Save as PDF</button>
            <button class="btn quiet" onclick="window.app.open('apply')">Apply to Next Intake</button>
          </div>
        </div>

        <hr style="border:0;border-top:1px solid var(--line);margin:36px 0">

        <!-- Philosophy -->
        <section class="prospectus-section">
          <div class="label">1. Core Philosophy</div>
          <h2 style="font-size:24px;margin:10px 0 16px">Business is built. Not attended.</h2>
          <p style="color:var(--muted);line-height:1.65;font-size:15px;margin-bottom:18px">
            At Hamzury, technology is not treated as abstract academic exercises. Participants do not write code for toy assignments or sit through lecture attendance drills. Every participant selects a genuine market problem and builds a verifiable, working business around it.
          </p>
          <div class="prospectus-principles">
            <div class="principle-card">
              <b>Evidence over Attendance</b>
              <p>You are judged by working software and customer transactions, not how many hours you sat in a room.</p>
            </div>
            <div class="principle-card">
              <b>Capability over Syllabus</b>
              <p>Built to an uncompromising commercial standard, not checking off topics on a PDF list.</p>
            </div>
            <div class="principle-card">
              <b>100% Founder Ownership</b>
              <p>Everything you construct — code, brands, revenue, and client relationships — remains 100% your business to keep.</p>
            </div>
          </div>
        </section>

        <!-- The 4 Stages -->
        <section class="prospectus-section" style="margin-top:42px">
          <div class="label">2. The Four Journey Stages</div>
          <h2 style="font-size:24px;margin:10px 0 20px">Start where your level puts you.</h2>

          <div class="stage-card">
            <div class="stage-head">
              <span class="stage-title">Stage 01: Junior Innovator</span>
              <span class="stage-badge">Ages 13 – 16</span>
            </div>
            <p style="font-size:14px;color:var(--muted);margin:8px 0 12px">
              Built for young minds to develop disciplined digital foundation before choosing technical pathways.
            </p>
            <ul class="prospectus-list">
              <li><b>Basic Foundation:</b> 1 Month · Computer navigation, problem solving, digital logic (₦25,000).</li>
              <li><b>Software Track:</b> Software development, algorithms, web & mobile mechanics (₦30,000).</li>
              <li><b>Robotics & Hardware:</b> Physical computing, electronics, embedded systems (₦120,000).</li>
            </ul>
          </div>

          <div class="stage-card" style="margin-top:16px">
            <div class="stage-head">
              <span class="stage-title">Stage 02: Innovator → CEO</span>
              <span class="stage-badge">Ages 17+ · Flagship</span>
            </div>
            <p style="font-size:14px;color:var(--muted);margin:8px 0 12px">
              One chosen specialization track taken to a market-ready, customer-tested business.
            </p>
            <div style="font-size:13.5px;color:var(--gold)">
              Tuition: ₦56,000 – ₦70,000 (Monthly achievement milestones with mentor-guided builds).
            </div>
          </div>

          <div class="stage-card" style="margin-top:16px">
            <div class="stage-head">
              <span class="stage-title">Stage 03: CEO → Founder</span>
              <span class="stage-badge">Operating Ventures</span>
            </div>
            <p style="font-size:14px;color:var(--muted);margin:8px 0 12px">
              For active businesses needing structural expansion, formal contracts, institutional governance, and venture grants.
            </p>
            <div style="font-size:13.5px;color:var(--gold)">
              Tuition: ₦100,000 / month · Retained partnership and strategic growth.
            </div>
          </div>

          <div class="stage-card" style="margin-top:16px">
            <div class="stage-head">
              <span class="stage-title">Stage 04: Founder → Ecosystem</span>
              <span class="stage-badge">Venture Scale</span>
            </div>
            <p style="font-size:14px;color:var(--muted);margin:8px 0 12px">
              Elite institutional backing. Requires verified historical turnover exceeding ₦1,000,000.
            </p>
            <div style="font-size:13.5px;color:var(--gold)">
              Tuition: ₦200,000 · Institutional integration with legal, finance, and talent pools.
            </div>
          </div>
        </section>

        <!-- SIWES / Placement -->
        <section class="prospectus-section" style="margin-top:42px">
          <div class="label">3. SIWES & Professional Placements</div>
          <h2 style="font-size:24px;margin:10px 0 16px">Same journey, institutional arrangement.</h2>
          <p style="color:var(--muted);line-height:1.6;font-size:14.5px">
            Students from universities, polytechnics, and colleges undergo rigorous industrial attachment embedded directly within Hamzury’s engineering and product teams.
          </p>
          <div class="siwes-grid">
            <div class="siwes-item">
              <span class="k">1 Month Attachment</span>
              <span class="v">₦30,000</span>
              <span class="d">Fast-track technical induction</span>
            </div>
            <div class="siwes-item">
              <span class="k">2 Months Attachment</span>
              <span class="v">₦50,000</span>
              <span class="d">Full project sprint & submission</span>
            </div>
            <div class="siwes-item">
              <span class="k">3 Months Attachment</span>
              <span class="v">₦70,000</span>
              <span class="d">Comprehensive commercial build</span>
            </div>
            <div class="siwes-item">
              <span class="k">Direct Staff Internship</span>
              <span class="v">₦70,000 / mo</span>
              <span class="d">5 days / week (8:00 AM – 3:00 PM)</span>
            </div>
          </div>
        </section>

        <!-- Course Directory -->
        <section class="prospectus-section" style="margin-top:42px">
          <div class="label">4. Specialization Programmes & Courses (${courses.length})</div>
          <h2 style="font-size:24px;margin:10px 0 20px">Market problems worth solving.</h2>

          <div class="prospectus-tracks-grid">
            ${courses
              .map(
                (c, idx) => `
              <div class="prospectus-track-card">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
                  <h3 style="font-size:17px;font-weight:600">${idx + 1}. ${esc(c.nm)}</h3>
                  <span style="font-size:14px;color:var(--gold);font-weight:700">${N(c.p)}</span>
                </div>
                <div style="font-size:13px;line-height:1.5;color:var(--muted);margin-bottom:10px">
                  <b>Problem:</b> ${esc(c.prob)}
                </div>
                <div style="font-size:13px;line-height:1.5;color:var(--ink)">
                  <b>The Work:</b> ${esc(c.work)}
                </div>
                <div style="font-size:12.5px;color:var(--dim);margin-top:8px">
                  <b>Outcome:</b> ${esc(c.out)}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </section>

        <!-- Daily Operating Schedule -->
        <section class="prospectus-section" style="margin-top:42px">
          <div class="label">5. Daily Operating Schedule</div>
          <h2 style="font-size:24px;margin:10px 0 16px">The Rhythm of Practical Building</h2>
          <div class="schedule-box">
            <div class="schedule-row">
              <span class="time">08:00 AM – 10:00 AM</span>
              <span class="desc"><b>Guided Practical Building:</b> Focused development sprints, setup, architectural iteration, and live deployment.</span>
            </div>
            <div class="schedule-row">
              <span class="time">10:00 AM – 02:00 PM</span>
              <span class="desc"><b>Mentor-Guided Application:</b> Real-time problem solving, market testing, peer code reviews, and weekly milestone submissions.</span>
            </div>
            <div class="schedule-row">
              <span class="time">Monthly Cycle</span>
              <span class="desc"><b>Achievement Unlock:</b> Participants undergo monthly project assessment reviews. Completion of practical milestones unlocks the next operational phase.</span>
            </div>
          </div>
        </section>

        <!-- Admissions & Fees Policy -->
        <section class="prospectus-section" style="margin-top:42px;padding-bottom:30px">
          <div class="label">6. Admissions & Payment Protocol</div>
          <h2 style="font-size:24px;margin:10px 0 16px">Transparent, Two-Payment System</h2>
          <div class="prospectus-principles">
            <div class="principle-card">
              <b>Application Fee (₦5,000)</b>
              <p>Paid upon registration. Covers discovery assessment, diagnostic testing, and enrollment verification. Non-refundable.</p>
            </div>
            <div class="principle-card">
              <b>Programme Fee (Separate)</b>
              <p>Paid only after your track and level are confirmed by our admissions panel. Never paid prematurely.</p>
            </div>
            <div class="principle-card">
              <b>Official Banking Details</b>
              <p>Bank: <b>Moniepoint</b><br>Account Name: <b>Hamzury Mainstream Ltd</b><br>Account Number: <b>82025158500</b></p>
            </div>
          </div>

          <div class="actions" style="margin-top:36px;display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn primary" onclick="window.print()">📥 Print or Save as PDF</button>
            <button class="btn quiet" onclick="window.app.open('apply')">Apply to Next Intake</button>
            <a class="btn quiet" target="_blank" rel="noopener" href="https://wa.me/234${WHATSAPP.replace(/^0/, "")}">
              Chat with Admissions Office
            </a>
          </div>
        </section>
      </div>
    `;

    return {
      t: "Journey Prospectus",
      sub: "Official curriculum, tracks, schedule and admissions manual.",
      h
    };
  }

  return {
    renderView
  };
})();
