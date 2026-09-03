/**
 * A11y Remediation Engine — UI Application Controller
 */

// Presets
const PRESETS = {
  script: {
    name: "Pitch Script Example",
    description: "The exact snippet from the presentation: skipped heading (h1 -> h4), shoe.jpg without alt, unlabelled input.",
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
  ecommerce: {
    name: "E-Commerce Product Card",
    description: "Banner image, skipped headings (h1 -> h4), pricing contrast, search input without label.",
    html: `<div class="product-card">
  <h1>Summer Collection</h1>
  <h4>Running Sneakers</h4>
  <img src="sneakers-red.png">
  <p style="color: #999999; background: #ffffff;">High performance running footwear.</p>
  <input type="number" placeholder="Qty">
  <button></button>
</div>`
  }
};

let currentViolations = [];
let currentRemediation = null;
let currentVerification = null;
let isStepModeActive = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupPresetButtons();
  setupActionButtons();
  setupViewTabs();
  loadPreset('script');
});

function setupPresetButtons() {
  const container = document.getElementById('presetButtons');
  if (!container) return;

  Object.entries(PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = `preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${key === 'script' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`;
    btn.innerHTML = `<span class="mr-1.5">●</span>${preset.name}`;
    btn.onclick = () => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.className = 'preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700';
      });
      btn.className = 'preset-btn px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm';
      loadPreset(key);
    };
    container.appendChild(btn);
  });
}

function loadPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;
  const editor = document.getElementById('htmlEditor');
  if (editor) {
    editor.value = preset.html;
  }
  const descEl = document.getElementById('presetDescription');
  if (descEl) {
    descEl.textContent = preset.description;
  }
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

  updateBadge('detectCountBadge', 0, 'slate');
  updateBadge('remediateCountBadge', 0, 'slate');
  updateBadge('verifyCountBadge', 0, 'slate');
  setPipelineStep(0);
}

function updateBadge(id, count, color = 'indigo') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = count;
  if (count > 0) {
    el.className = `text-xs px-2 py-0.5 rounded-full font-bold ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : color === 'rose' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'}`;
  } else {
    el.className = 'text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700';
  }
}

function setupActionButtons() {
  document.getElementById('runPipelineBtn')?.addEventListener('click', () => runPipeline(false));
  document.getElementById('stepModeBtn')?.addEventListener('click', () => runPipeline(true));
  document.getElementById('copyCodeBtn')?.addEventListener('click', copyRemediatedCode);
  document.getElementById('downloadHtmlBtn')?.addEventListener('click', downloadRemediatedHtml);
}

function setupViewTabs() {
  const tabs = ['diff', 'code', 'preview'];
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

  if (stepMode) await delay(1000);

  // Stage 2: FIX (Hybrid Engine)
  setPipelineStep(2);
  const remediationResult = window.A11yRemediator.remediateHtml(inputHtml);
  currentRemediation = remediationResult;
  renderRemediation(remediationResult.actions);
  updateBadge('remediateCountBadge', remediationResult.actions.length, 'indigo');

  if (stepMode) await delay(1000);

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

  // Render Diff and Code Views
  renderDiff(inputHtml, remediationResult.remediatedHtml);
  document.getElementById('remediatedCode').textContent = remediationResult.remediatedHtml;
  updateRenderedPreview(remediationResult.remediatedHtml);

  if (stepMode) await delay(500);
  setPipelineStep(4); // All done
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
      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
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
  actions.forEach((a) => {
    const isDeterministic = a.category === 'deterministic';
    html += `
      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
        <div class="flex items-center justify-between mb-1.5">
          <div class="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span>${a.title}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${isDeterministic ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'}">
            ${isDeterministic ? '⚙️ ' + a.engine : '🧠 ' + a.engine}
          </span>
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
        <span>Initial Violations: <strong class="text-slate-200">${verification.initialCount}</strong></span>
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
        input { display: block; margin: 6px 0 16px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; width: 220px; }
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

function downloadRemediatedHtml() {
  const code = document.getElementById('remediatedCode')?.textContent;
  if (!code) return;
  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accessible-remediated-code.html';
  a.click();
  URL.revokeObjectURL(url);
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
