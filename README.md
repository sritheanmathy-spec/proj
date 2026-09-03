# A11y Remediation Engine — "Detect → Fix → Verify"
> Automated Accessibility Remediation Prototype built for Hackathon Live Demo

## 🌟 The Core Idea
Existing tools only do **Detection** ("Your website has errors"). Coding assistants hallucinate unverified fixes. 
This prototype provides the missing feedback loop:

```
Accessibility Violation
        ↓
Stage 1: Detect (axe-core WCAG 2.1 AA Scanner)
        ↓
Stage 2: Hybrid Remediation
         ├── Deterministic Formulas (Contrast Math & Heading Tree Normalization)
         └── AI / LLM Semantic Models (Contextual Alt-Text Inference)
        ↓
Stage 3: Verification Loop (Second-pass AST & Diagnostic Re-Scan)
        ↓
Verified Source Code [ Verified ✅ | Needs Review ⚠️ ]
```

---

## 🚀 Quickstart

### Option 1: Open in Browser Directly
Simply double-click `index.html` or open it in Google Chrome / Microsoft Edge. No build steps or heavy dependencies required.

### Option 2: Run with Local Web Server
```bash
cd C:\Users\srith\.gemini\antigravity\scratch\a11y-remediation-engine
npm test
npm start
```
Open `http://localhost:3000` in your browser.

---

## 🎤 How to Demo During the Hackathon Pitch

1. **Preset 1 (Pitch Script Example)**:
   - Click the **"Pitch Script Example"** preset button.
   - Points out the exact problem from Section 5 of your pitch:
     - `<h1>Products</h1>` followed by `<h4>Shoes</h4>`
     - `<img src="shoe.jpg">`
     - `<input type="text">`
2. **Hit "Step-by-Step Pitch" (🎬)**:
   - Walks the judges through the 3 phases with real-time visual progress:
     - **Stage 1 (Detect):** Highlights 3 violations and classifies them into *Deterministic* vs *AI/LLM*.
     - **Stage 2 (Fix):** Shows the deterministic heading fix (`<h4>` $\to$ `<h2>`), AI contextual alt text (`"Red running shoe"`), and form label linkage.
     - **Stage 3 (Verify):** Runs the second pass, displays the **`Verified ✅`** badge on all items, and generates the line diff and clean rendered preview.
3. **Show the Diff Tab**:
   - Switches between "Code Diff" (highlighting red deletions and green additions), "Clean HTML", and "Live Preview".
4. **Try Custom Input**:
   - Paste any HTML snippet into the left editor and hit **"Run Pipeline"** (⚡) to show real-time processing to curious judges.

---

## 📁 File Structure
- `index.html` — Stage presentation UI with Tailwind CSS and responsive 3-column workflow.
- `app.js` — Application controller, preset manager, and step-by-step pitch animator.
- `engine/detector.js` — WCAG 2.1 AA rule engine (heading hierarchy, image alt, form labels, color contrast).
- `engine/remediator.js` — Hybrid remediation engine (deterministic math/rules + contextual LLM reasoning).
- `engine/verifier.js` — Verification re-scan comparing pre- and post-remediation AST states.
- `engine/diff.js` — Syntax-aware visual line diff engine.
- `test.js` — Automated verification test suite.
