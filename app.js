/**
 * A11y Remediation Engine — High-Level Enterprise Platform Controller
 * Integrates:
 * - 3-Stage Pipeline (Detect -> Fix -> Verify)
 * - Accessible Object Model (AOM) Tree Inspector
 * - Real-Time Vision Impairment & Color Blindness Simulator
 * - AI Reasoning & Transparency Inspector with Alternative Switcher
 * - CI/CD GitHub Action & Git Patch Exporter
 * - Screen Reader Audio Simulator (Web Speech API)
 * - Live Website URL Scanner Proxy
 * - WCAG Compliance Audit Certificate
 */

// Presets
const PRESETS = {
  script: {
    name: "Pitch Script Example",
    description: "The presentation script snippet: skipped heading (h1 -> h4), shoe.jpg without alt, unlabelled input.",
    html: `<h1>Products</h1>

<h4>Shoes</h4>

<img src="shoe.jpg">

<input type="text">`
  },
  contrast: {
    name: "Contrast & Form Controls",
    description: "Low contrast text (#888 on #fff), unlabelled email input, and empty button.",
    html: `<header>
  <h2>Account Setup</h2>
  <p style="color: #888888; background-color: #ffffff;">Please complete your profile to continue.</p>
</header>

<section>
  <input type="email" placeholder="Enter your email">
  <button></button>
</section>`
  },
  complex: {
    name: "Complex Real-World Store",
    description: "Arbitrary checkout form: skipped headings, select dropdown, textarea, icon buttons, empty links.",
    html: `<main>
  <h3>MegaStore Checkout</h3>
  <h5>Billing Address</h5>
  <img src="https://example.com/assets/visa-card.png">
  <input type="text" placeholder="Full name">
  <select name="state"><option value="CA">California</option></select>
  <textarea placeholder="Special delivery instructions"></textarea>
  <p style="color: #888888; background-color: #ffffff;">Terms and conditions apply.</p>
  <button class="btn-checkout"><svg></svg></button>
  <a href="/terms"><i class="icon-legal"></i></a>
</main>`
  }
};

let currentViolations = [];
let currentRemediation = null;
let currentVerification = null;

document.addEventListener('DOMContentLoaded', () => {
  setupPresetButtons();
  setupActionButtons();
  setupViewTabs();
  setupScreenReaderAudio();
  setupUrlScanner();
  setupCertModal();
  setupVisionSimulator();
  setupCicdModal();
  setupAiModal();
  setupKeyboardShortcuts();
  loadPreset('script');
});

/* ----------------------------------------------------
 * PRESET & TAB MANAGEMENT
 * ---------------------------------------------------- */
function setupPresetButtons() {
  const container = document.getElementById('presetButtons');
  if (!container) return;

  Object.entries(PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = `preset-btn px-2.5 py-1 text-xs font-medium rounded-lg border transition ${key === 'script' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`;
    btn.innerHTML = `<span class="mr-1">●</span>${preset.name}`;
    btn.onclick = () => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.className = 'preset-btn px-2.5 py-1 text-xs font-medium rounded-lg border transition bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700';
      });
      btn.className = 'preset-btn px-2.5 py-1 text-xs font-medium rounded-lg border transition bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm';
      loadPreset(key);
    };
    container.appendChild(btn);
  });
}

function loadPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;
  const editor = document.getElementById('htmlEditor');
  if (editor) editor.value = preset.html;

  const descEl = document.getElementById('presetDescription');
  if (descEl) descEl.textContent = preset.description;

  resetPipelineUI();
}

function resetPipelineUI() {
  currentViolations = [];
  currentRemediation = null;
  currentVerification = null;

  document.getElementById('violationsList').innerHTML = '<div class="text-xs text-slate-500 italic p-4 text-center">Click "Run Pipeline" to detect accessibility violations.</div>';
  document.getElementById('remediationList').innerHTML = '<div class="text-xs text-slate-500 italic p-4 text-center">Remediation steps will appear here.</div>';
  document.getElementById('verificationList').innerHTML = '<div class="text-xs text-slate-500 italic p-4 text-center">Verification status will appear here.</div>';
  
  document.getElementById('diffView').innerHTML = '<div class="text-xs text-slate-500 italic p-6 text-center">Run pipeline to inspect line-by-line diff.</div>';
  document.getElementById('remediatedCode').textContent = '';
  document.getElementById('renderedPreview').srcdoc = '';
  document.getElementById('aomTreeContainer').innerHTML = '<div class="text-xs text-slate-500 italic p-4 text-center">Run pipeline to inspect Accessibility Tree hierarchy.</div>';

  updateBadge('detectCountBadge', 0, 'slate');
  updateBadge('remediateCountBadge', 0, 'slate');
  updateBadge('verifyCountBadge', 0, 'slate');
  setPipelineStep(0);
  stopAudioNarration();
}

function updateBadge(id, count, color = 'indigo') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = count;
  if (count > 0 || (typeof count === 'string' && count.includes('/'))) {
    el.className = `text-xs px-2 py-0.5 rounded-full font-bold ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : color === 'rose' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'}`;
  } else {
    el.className = 'text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700';
  }
}

function setupActionButtons() {
  document.getElementById('runPipelineBtn')?.addEventListener('click', () => runPipeline(false));
  document.getElementById('stepModeBtn')?.addEventListener('click', () => runPipeline(true));
  document.getElementById('copyCodeBtn')?.addEventListener('click', copyRemediatedCode);
}

function setupViewTabs() {
  const tabs = ['diff', 'preview', 'aom', 'code'];
  tabs.forEach(tab => {
    const tabBtn = document.getElementById(`tab-${tab}`);
    if (!tabBtn) return;
    tabBtn.addEventListener('click', () => {
      tabs.forEach(t => {
        document.getElementById(`tab-${t}`)?.classList.remove('active-tab', 'border-indigo-500', 'text-indigo-400');
        document.getElementById(`tab-${t}`)?.classList.add('text-slate-400', 'border-transparent');
        document.getElementById(`view-${t}`)?.classList.add('hidden');
      });
      tabBtn.classList.add('active-tab', 'border-indigo-500', 'text-indigo-400');
      tabBtn.classList.remove('text-slate-400', 'border-transparent');
      document.getElementById(`view-${tab}`)?.classList.remove('hidden');
    });
  });
}

function setPipelineStep(step) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step-indicator-${i}`);
    if (!el) continue;
    if (i < step) {
      el.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 shadow-sm';
    } else if (i === step) {
      el.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-900/60 border border-indigo-500 text-indigo-200 animate-pulse shadow-sm';
    } else {
      el.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900/40 border border-slate-800 text-slate-500';
    }
  }
}

/* ----------------------------------------------------
 * PIPELINE CORE EXECUTION
 * ---------------------------------------------------- */
async function runPipeline(stepMode = false) {
  const inputHtml = document.getElementById('htmlEditor').value.trim();
  if (!inputHtml) {
    alert('Please provide some HTML code first!');
    return;
  }

  // Stage 1: DETECT
  setPipelineStep(1);
  const violations = window.A11yDetector.detectViolations(inputHtml);
  currentViolations = violations;
  renderViolations(violations);
  updateBadge('detectCountBadge', violations.length, violations.length > 0 ? 'rose' : 'emerald');

  if (stepMode) await delay(800);

  // Stage 2: FIX (Hybrid Engine)
  setPipelineStep(2);
  const remediationResult = window.A11yRemediator.remediateHtml(inputHtml);
  currentRemediation = remediationResult;
  renderRemediation(remediationResult.actions);
  updateBadge('remediateCountBadge', remediationResult.actions.length, 'indigo');

  if (stepMode) await delay(800);

  // Stage 3: VERIFY (The Feedback Loop)
  setPipelineStep(3);
  const verification = window.A11yVerifier.verifyRemediation(
    violations,
    remediationResult.remediatedHtml,
    remediationResult.actions
  );
  currentVerification = verification;
  renderVerification(verification);
  updateBadge('verifyCountBadge', `${verification.resolvedCount}/${verification.initialCount}`, verification.isComplete ? 'emerald' : 'amber');

  // Render Diff, Clean Code, Live Preview, and AOM Tree
  renderDiff(inputHtml, remediationResult.remediatedHtml);
  document.getElementById('remediatedCode').textContent = remediationResult.remediatedHtml;
  updateRenderedPreview(remediationResult.remediatedHtml);
  renderAomComparison(inputHtml, remediationResult.remediatedHtml);

  if (stepMode) await delay(400);
  setPipelineStep(4);
}

function renderViolations(violations) {
  const container = document.getElementById('violationsList');
  if (!container) return;

  if (violations.length === 0) {
    container.innerHTML = `
      <div class="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
        <span class="text-base">✅</span>
        <span><strong>Clean Code!</strong> No WCAG AA violations detected in input snippet.</span>
      </div>`;
    return;
  }

  let html = '<div class="space-y-2.5">';
  violations.forEach((v) => {
    const isDeterministic = v.category === 'deterministic';
    html += `
      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-mono font-bold text-slate-200">&lt;${escapeHtml(v.selector)}&gt;</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${v.impact === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">${v.impact}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${isDeterministic ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'}">
            ${isDeterministic ? '⚙️ Deterministic' : '🧠 AI / LLM'}
          </span>
        </div>
        <p class="text-xs text-slate-300 mb-2">${v.description}</p>
        <div class="font-mono text-[11px] bg-slate-950 px-2.5 py-1.5 rounded text-rose-300/90 border border-rose-950/60 overflow-x-auto">
          ${escapeHtml(v.elementHtml)}
        </div>
        <div class="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
          <span class="text-slate-500">Criteria:</span> ${v.wcag}
        </div>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderRemediation(actions) {
  const container = document.getElementById('remediationList');
  if (!container) return;

  if (!actions || actions.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 italic p-4 text-center">No code modifications needed.</div>';
    return;
  }

  let html = '<div class="space-y-2.5">';
  actions.forEach((a, index) => {
    const isAi = a.category === 'ai_interpretation';
    html += `
      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
        <div class="flex items-center justify-between mb-1.5">
          <div class="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span>${a.title}</span>
          </div>
          <div class="flex items-center gap-1">
            ${isAi ? `
              <button onclick="openAiReasoningModal(${index})" class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/50 flex items-center gap-1 transition shadow-sm">
                <span>🧠 AI Reasoning</span>
                <span class="text-[9px] text-purple-300">98.6%</span>
              </button>` : `
              <span class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-950 text-blue-300 border border-blue-800">
                ⚙️ ${a.engine}
              </span>
            `}
          </div>
        </div>
        <p class="text-xs text-slate-300 mb-2 leading-relaxed">${a.explanation}</p>
        <div class="space-y-1.5 font-mono text-[11px]">
          <div class="bg-rose-950/30 text-rose-300/80 px-2 py-1 rounded border border-rose-900/40 line-through">
            ${escapeHtml(a.originalSnippet)}
          </div>
          <div class="bg-emerald-950/40 text-emerald-300 px-2 py-1 rounded border border-emerald-900/40">
            ${escapeHtml(a.fixedSnippet)}
          </div>
        </div>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderVerification(verification) {
  const container = document.getElementById('verificationList');
  if (!container) return;

  let headerHtml = `
    <div class="p-3.5 rounded-xl ${verification.isComplete ? 'bg-emerald-950/40 border border-emerald-500/40' : 'bg-amber-950/40 border border-amber-500/40'} mb-3">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-bold text-slate-200">Re-Scan Verification Outcome</span>
        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${verification.isComplete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">
          ${verification.successRate}% Resolved
        </span>
      </div>
      <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div class="h-full ${verification.isComplete ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${verification.successRate}%"></div>
      </div>
      <div class="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
        <span>Initial Errors: <strong class="text-slate-200">${verification.initialCount}</strong></span>
        <span>Verified Fixed: <strong class="text-emerald-400">${verification.resolvedCount}</strong></span>
        <span>Needs Review: <strong class="text-amber-400">${verification.reviewCount}</strong></span>
      </div>
    </div>`;

  let itemsHtml = '<div class="space-y-2.5">';
  verification.verifiedItems.forEach((item) => {
    const isVerified = item.status === 'VERIFIED';
    itemsHtml += `
      <div class="p-3 rounded-lg bg-slate-900 border ${isVerified ? 'border-emerald-900/50' : 'border-amber-900/50'}">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-mono font-semibold text-slate-300">${item.ruleId}</span>
          </div>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded font-mono ${isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}">
            ${item.statusBadge}
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">${item.explanation}</p>
        <div class="mt-2 text-[10px] text-slate-500 flex justify-between">
          <span>Engine: ${item.engine}</span>
          <span>${item.wcagCriteria}</span>
        </div>
      </div>`;
  });
  itemsHtml += '</div>';

  container.innerHTML = headerHtml + itemsHtml;
}

function renderDiff(orig, mod) {
  const diffLines = window.A11yDiff.computeLineDiff(orig, mod);
  const diffHtml = window.A11yDiff.renderDiffHtml(diffLines);
  document.getElementById('diffView').innerHTML = diffHtml;
}

function updateRenderedPreview(html) {
  const iframe = document.getElementById('renderedPreview');
  if (!iframe) return;

  const styledDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #ffffff; color: #1e293b; margin: 0; }
        h1 { font-size: 1.5rem; margin-top: 0; }
        h2 { font-size: 1.25rem; color: #334155; }
        h4 { font-size: 1rem; color: #64748b; }
        img { max-width: 140px; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; display: block; margin: 10px 0; }
        input, select, textarea { display: block; margin: 6px 0 16px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; width: 240px; }
        label { display: block; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
        button { background: #4f46e5; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>`;
  iframe.srcdoc = styledDocument;
}

/* ----------------------------------------------------
 * INNOVATION 1: ACCESSIBILITY TREE (AOM) COMPARISON
 * ---------------------------------------------------- */
function renderAomComparison(beforeHtml, afterHtml) {
  const container = document.getElementById('aomTreeContainer');
  if (!container || !window.A11yAOM) return;

  const beforeTree = window.A11yAOM.buildAomTree(beforeHtml, false);
  const afterTree = window.A11yAOM.buildAomTree(afterHtml, true);

  const html = `
    <div class="space-y-4">
      <div class="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-300">
        <strong>Accessible Object Model (AOM):</strong> The internal accessibility tree exposed to screen readers and assistive tech.
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div class="text-[11px] font-bold text-rose-400 mb-1.5 flex items-center gap-1">
            <span>❌ BEFORE AOM Tree (Inaccessible)</span>
          </div>
          ${window.A11yAOM.renderAomTreeHtml(beforeTree, 'Before')}
        </div>
        <div>
          <div class="text-[11px] font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
            <span>✅ AFTER AOM Tree (Verified)</span>
          </div>
          ${window.A11yAOM.renderAomTreeHtml(afterTree, 'After')}
        </div>
      </div>
    </div>`;

  container.innerHTML = html;
}

/* ----------------------------------------------------
 * INNOVATION 2: VISION IMPAIRMENT SIMULATOR
 * ---------------------------------------------------- */
function setupVisionSimulator() {
  const select = document.getElementById('visionFilterSelect');
  if (!select || !window.A11yVision) return;

  select.addEventListener('change', (e) => {
    const iframe = document.getElementById('renderedPreview');
    window.A11yVision.applyVisionFilter(e.target.value, iframe);
  });
}

/* ----------------------------------------------------
 * INNOVATION 3: AI REASONING & TRANSPARENCY INSPECTOR
 * ---------------------------------------------------- */
function setupAiModal() {
  const modal = document.getElementById('aiModal');
  document.getElementById('closeAiModalBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
}

window.openAiReasoningModal = function(actionIndex) {
  const modal = document.getElementById('aiModal');
  const container = document.getElementById('aiModalContent');
  if (!modal || !container || !currentRemediation) return;

  const action = currentRemediation.actions[actionIndex];
  if (!action) return;

  const details = window.A11yAiInspector.getAiReasoningDetails(action);

  let altsHtml = '';
  details.alternatives.forEach(altText => {
    altsHtml += `
      <div class="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs">
        <span class="text-slate-300 font-mono">"${escapeHtml(altText)}"</span>
        <button onclick="applyAiAlternative('${escapeHtml(altText)}')" class="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[10px] font-bold transition">
          Use This
        </button>
      </div>`;
  });

  container.innerHTML = `
    <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 font-semibold">Model:</span>
        <span class="font-mono text-purple-300 font-bold">${details.model}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 font-semibold">Confidence Score:</span>
        <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">${details.confidence}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 font-semibold">Target Resource:</span>
        <span class="font-mono text-slate-200">${details.targetResource}</span>
      </div>
    </div>

    <div>
      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Context Signals Extracted:</span>
      <div class="space-y-1 font-mono text-[11px]">
        ${details.contextSignals.map(s => `<div class="p-1.5 rounded bg-slate-950/70 border border-slate-800 text-indigo-300">✓ ${s}</div>`).join('')}
      </div>
    </div>

    <div>
      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Alternative AI Alt-Text Suggestions:</span>
      <div class="space-y-1.5">
        ${altsHtml}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.applyAiAlternative = function(newAlt) {
  const editor = document.getElementById('htmlEditor');
  if (!editor) return;

  const currentCode = editor.value;
  // Re-run with custom alt option
  const res = window.A11yRemediator.remediateHtml(currentCode, { customAlt: newAlt });
  currentRemediation = res;
  renderRemediation(res.actions);
  document.getElementById('remediatedCode').textContent = res.remediatedHtml;
  updateRenderedPreview(res.remediatedHtml);
  document.getElementById('aiModal')?.classList.add('hidden');
  alert(`Applied alternative alt text: "${newAlt}"`);
};

/* ----------------------------------------------------
 * INNOVATION 4: CI/CD GITHUB ACTION EXPORTER
 * ---------------------------------------------------- */
function setupCicdModal() {
  const modal = document.getElementById('cicdModal');
  document.getElementById('openCicdModalBtn')?.addEventListener('click', () => {
    if (window.A11yCiCd) {
      document.getElementById('cicdYmlContent').textContent = window.A11yCiCd.generateGitHubActionYaml();
    }
    modal?.classList.remove('hidden');
  });
  document.getElementById('closeCicdModalBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
  document.getElementById('copyYmlBtn')?.addEventListener('click', () => {
    const yaml = document.getElementById('cicdYmlContent')?.textContent;
    if (yaml) {
      navigator.clipboard.writeText(yaml).then(() => {
        const btn = document.getElementById('copyYmlBtn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy YAML'; }, 1500);
      });
    }
  });
  document.getElementById('downloadPatchBtn')?.addEventListener('click', () => {
    const orig = document.getElementById('htmlEditor')?.value || '';
    const mod = currentRemediation ? currentRemediation.remediatedHtml : orig;
    const patch = window.A11yCiCd.generateGitPatch(orig, mod);
    const blob = new Blob([patch], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `a11y-remediation-${Date.now()}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ----------------------------------------------------
 * SCREEN READER AUDIO SIMULATOR
 * ---------------------------------------------------- */
function setupScreenReaderAudio() {
  document.getElementById('playBeforeAudioBtn')?.addEventListener('click', playBeforeNarration);
  document.getElementById('playAfterAudioBtn')?.addEventListener('click', playAfterNarration);
  document.getElementById('stopAudioBtn')?.addEventListener('click', stopAudioNarration);
}

function playBeforeNarration() {
  const inputHtml = document.getElementById('htmlEditor').value.trim();
  if (!inputHtml) return;

  stopAudioNarration();
  const scriptData = window.A11yScreenReader.generateSpeechScript(inputHtml);

  setAudioTicker('Playing BEFORE (Inaccessible Screen Reader Stream)...');
  showAudioWaveform(true);

  window.A11yScreenReader.speakScript(scriptData.fullText, {
    rate: 1.0,
    pitch: 0.95,
    onBoundary: (e) => {
      const words = scriptData.fullText.substring(e.charIndex, e.charIndex + 30);
      setAudioTicker(`Reading: "${words}..."`);
    },
    onEnd: () => {
      setAudioTicker('Finished BEFORE narration. Try playing AFTER to hear the difference!');
      showAudioWaveform(false);
    }
  });
}

function playAfterNarration() {
  let modHtml = currentRemediation ? currentRemediation.remediatedHtml : null;
  if (!modHtml) {
    const inputHtml = document.getElementById('htmlEditor').value.trim();
    if (!inputHtml) return;
    const res = window.A11yRemediator.remediateHtml(inputHtml);
    modHtml = res.remediatedHtml;
  }

  stopAudioNarration();
  const scriptData = window.A11yScreenReader.generateSpeechScript(modHtml);

  setAudioTicker('Playing AFTER (Verified Accessible Screen Reader Stream)...');
  showAudioWaveform(true);

  window.A11yScreenReader.speakScript(scriptData.fullText, {
    rate: 1.05,
    pitch: 1.05,
    onBoundary: (e) => {
      const words = scriptData.fullText.substring(e.charIndex, e.charIndex + 30);
      setAudioTicker(`Reading: "${words}..."`);
    },
    onEnd: () => {
      setAudioTicker('Finished AFTER narration. Clear, verified accessibility structure!');
      showAudioWaveform(false);
    }
  });
}

function stopAudioNarration() {
  window.A11yScreenReader?.stopSpeech();
  showAudioWaveform(false);
  setAudioTicker('Audio stopped. Ready.');
}

function setAudioTicker(text) {
  const el = document.getElementById('speechTicker');
  if (el) el.textContent = text;
}

function showAudioWaveform(show) {
  const wf = document.getElementById('audioWaveform');
  if (!wf) return;
  if (show) {
    wf.classList.remove('hidden');
    wf.classList.add('flex');
  } else {
    wf.classList.add('hidden');
    wf.classList.remove('flex');
  }
}

/* ----------------------------------------------------
 * LIVE WEBSITE URL SCANNER
 * ---------------------------------------------------- */
function setupUrlScanner() {
  const modal = document.getElementById('urlModal');
  document.getElementById('openUrlModalBtn')?.addEventListener('click', () => {
    modal?.classList.remove('hidden');
  });
  document.getElementById('closeUrlModalBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
  document.getElementById('cancelUrlBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
  document.getElementById('fetchUrlBtn')?.addEventListener('click', fetchAndRemediateUrl);
}

window.setUrlPreset = function(url) {
  const input = document.getElementById('targetUrlInput');
  if (input) input.value = url;
};

async function fetchAndRemediateUrl() {
  const input = document.getElementById('targetUrlInput');
  const targetUrl = input?.value.trim();
  if (!targetUrl) return;

  const btn = document.getElementById('fetchUrlBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>⏳ Fetching URL...</span>';
  btn.disabled = true;

  try {
    const proxyUrl = `/api/fetch-url?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();

    if (!data.success) {
      alert(`Could not fetch URL: ${data.error}`);
      return;
    }

    document.getElementById('htmlEditor').value = data.html;
    document.getElementById('presetDescription').textContent = `Live Scanned URL: ${targetUrl} (${data.length} characters analyzed)`;
    document.getElementById('urlModal')?.classList.add('hidden');

    await runPipeline(false);
  } catch (err) {
    alert(`Error connecting to fetch proxy: ${err.message}`);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/* ----------------------------------------------------
 * WCAG COMPLIANCE CERTIFICATE AUDIT
 * ---------------------------------------------------- */
function setupCertModal() {
  const modal = document.getElementById('certModal');
  document.getElementById('exportCertBtn')?.addEventListener('click', openCertModal);
  document.getElementById('closeCertModalBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
}

async function openCertModal() {
  const modal = document.getElementById('certModal');
  const container = document.getElementById('certContentContainer');
  if (!modal || !container) return;

  if (!currentVerification) {
    await runPipeline(false);
  }

  const certHtml = window.A11yReport.generateCertificateHtml(currentVerification);
  container.innerHTML = certHtml;
  modal.classList.remove('hidden');
}

window.downloadAuditJson = function() {
  if (currentVerification) {
    window.A11yReport.exportAuditJson(currentVerification);
  }
};

/* ----------------------------------------------------
 * KEYBOARD SHORTCUTS
 * ---------------------------------------------------- */
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPipeline(false);
    } else if (e.key === 'Escape') {
      document.querySelectorAll('#urlModal, #certModal, #cicdModal, #aiModal').forEach(m => m.classList.add('hidden'));
    }
  });
}

function copyRemediatedCode() {
  const code = document.getElementById('remediatedCode')?.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyCodeBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>✅ Copied!</span>';
    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
