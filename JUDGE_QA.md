# Hackathon Judge Q&A Cheat Sheet

Prepare for these top 5 questions that technical judges, product managers, and accessibility advocates will ask:

---

### Q1: "Why not just paste the code into ChatGPT, Claude, or GitHub Copilot and ask it to fix the accessibility errors?"
**Answer:**
> "That's the fundamental problem we solve. LLMs alone hallucinate, break styling, and most importantly: **they have no verification loop**. If you ask an LLM to fix HTML, it might generate clean-looking code, but you have no automated proof that it actually passes WCAG standards.
> 
> Furthermore, using an LLM for everything is slow and expensive. For color contrast or heading hierarchy, normal algorithms and math give 100% deterministic accuracy. Our system is hybrid: **deterministic math where the answer is binary, AI only where human semantic interpretation is required, followed by an automated re-scan to guarantee verification.**"

---

### Q2: "What happens when an automated fix introduces a new violation or doesn't work?"
**Answer:**
> "That is why Stage 3—the Verification Loop—is our core differentiator. If the second-pass scanner detects that a rule is still failing, or if a secondary issue was created, our system flags it with **Needs Review ⚠️** instead of falsely claiming it's resolved. We never blindly ship unverified code."

---

### Q3: "Does your tool guarantee 100% legal WCAG compliance?"
**Answer:**
> "No automated tool—including axe-core itself—can guarantee 100% legal compliance, because some accessibility criteria require human subjective judgment. 
> 
> What we focus on is **drastically reducing the 80% of common, repetitive WCAG violations** (like missing alt tags, unlabelled form inputs, contrast ratios, and heading jumps) so accessibility engineers can focus on complex cognitive and screen-reader user journeys rather than fixing syntax by hand."

---

### Q4: "How does this scale to real-world codebases with React, Vue, or JSX instead of raw HTML?"
**Answer:**
> "Our AST-based transformation engine maps directly to Babel and TypeScript ASTs. Instead of replacing plain HTML strings, the same classification engine inspects JSX AST nodes (e.g. `<img />` and `<input />` components in React) and writes verified props directly back into the component files. Our MVP proves the end-to-end pipeline on HTML, and JSX support is the natural next step for our VS Code extension."

---

### Q5: "How does this fit into a developer's real-world workflow?"
**Answer:**
> "We see two primary integration points:
> 1. **VS Code Extension:** Developers run it on save or on command to auto-remediate files with instant side-by-side diffs.
> 2. **CI/CD Pipeline (GitHub Action):** On pull requests, the engine scans changed files and can either fail builds on unverified regressions or automatically generate a verified remediation PR."
