# A11y Remediation Engine — Enterprise Accessibility Platform
> Automated Accessibility Remediation and Closed-Loop Verification for WCAG 2.1 AA Compliance

## Overview
Traditional accessibility linters only perform passive detection, reporting defects without solutions. Standard generative AI coding assistants propose changes that frequently fail to resolve violations or introduce new accessibility defects.

The A11y Remediation Engine bridges this gap by providing an end-to-end, closed-loop pipeline:

```
[ Input HTML Document ]
         │
         ▼
[ Stage 1: Diagnostic Detection ]
    • axe-core 4.8 rule evaluation
    • DOM & AST static analysis
         │
         ▼
[ Stage 2: Hybrid Remediation Engine ]
    • Deterministic AST transformations (Contrast math, heading hierarchy normalization)
    • Contextual AI semantic models (Context-aware alt-text synthesis)
         │
         ▼
[ Stage 3: Closed-Loop Verification ]
    • Pass 2 AST and scanner re-evaluation
    • Regression analysis and defect resolution status
         │
         ▼
[ Verified Source Document ] (Verified Compliant | Flagged for Human Review)
```

---

## Capabilities

1. **Deterministic AST Transformations**: Mathematical luminance adjustments for WCAG 1.4.3 (4.5:1 minimum contrast ratio) and deterministic heading tree restructuring for WCAG 1.3.1.
2. **Contextual Semantic Repair**: Multimodal AI inference for informative visual assets and context-aware accessible names.
3. **Automated Closed-Loop Verification**: Re-runs the full diagnostic test suite on modified code to verify that violations are resolved without introducing secondary faults.
4. **Accessible Object Model (AOM) Comparison**: Inspects before-and-after accessibility tree nodes exposed to assistive technologies.
5. **Vision Impairment Simulator**: Emulates Protanopia, Deuteranopia, Tritanopia, Cataracts, and Achromatopsia across rendered documents in real time.
6. **Screen Reader Audio Simulation**: Real-time acoustic synthesis streaming text to speech matching NVDA, JAWS, and VoiceOver navigation patterns.
7. **CI/CD Integration Hub**: Ready-to-commit GitHub Action workflows and Git `.patch` file export.
8. **Compliance Audit Reporting**: Downloadable audit certificates with cryptographic verification hashes and WCAG 2.1 AA criterion breakdowns.

---

## Quickstart

### Option 1: Direct Browser Access
Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari). No compilation or external dependencies are required.

### Option 2: Local Development Server
```bash
# Run test suite
npm test

# Start server
npm start
```
Navigate to `http://localhost:3000` (or `http://localhost:3001`).

---

## Architecture & Codebase Structure

- `index.html` — Enterprise white/slate responsive user interface.
- `app.js` — Platform application controller, data table manager, and event router.
- `engine/detector.js` — WCAG 2.1 AA diagnostic detection engine.
- `engine/remediator.js` — Hybrid remediation engine (deterministic formulas + contextual AI logic).
- `engine/verifier.js` — Closed-loop verification and regression analysis.
- `engine/diff.js` — Syntax-aware line diff engine.
- `engine/aom.js` — Accessible Object Model (AOM) tree builder.
- `engine/vision_sim.js` — SVG-filter based vision impairment simulator.
- `engine/cicd.js` — GitHub Action workflow and Git patch generator.
- `engine/ai_inspector.js` — AI transparency model reasoning and alternative switcher.
- `engine/screenreader.js` — Screen reader acoustic stream simulator.
- `engine/runtime-heal.js` — Universal client-side runtime self-healing engine (<8KB) for instant 1-line script deployment.
- `engine/edge_deploy.js` — Cloudflare Edge Worker (HTMLRewriter) and React JSX/Vue exporter.
- `engine/vpat.js` — Official VPAT 2.4 / Section 508 Accessibility Conformance Report (ACR) generator with SHA-256 digest.
- `test.js` — Automated verification and regression test suite (7 comprehensive test suites).

---

## Applying Remediations to Real Websites

### 1. Universal 1-Line Drop-In Script (WordPress, Shopify, Squarespace, Webflow)
Add the runtime script to your website's `<head>` or before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/gh/sritheanmathy-spec/proj@main/engine/runtime-heal.js" async></script>
```
Heals missing image alt attributes, unlabelled form inputs, empty buttons, contrast defects, and heading hierarchies dynamically in the live DOM.

### 2. Live DevTools Console Tester (Zero-Install Verification)
Inspect and remediate any client website live in the browser console:
```javascript
const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/sritheanmathy-spec/proj@main/engine/runtime-heal.js';document.head.appendChild(s);
```

### 3. Edge CDN HTMLRewriter (Cloudflare / Fastly)
Stream and patch accessibility attributes at the CDN edge with zero backend code changes.

### 4. Search & Replace Source Guide
Exact "Find in your template" vs "Replace with rectified code" tables with 1-click copy for developers.

### 5. Official VPAT 2.4 / Section 508 Legal Conformance Report
Instant ACR document generation with cryptographic SHA-256 compliance hash for enterprise procurement.