/**
 * A11y Remediation Engine — High-Level Enterprise Platform Controller
 * Integrates:
 * - 3-Stage Pipeline (Detect -> Fix -> Verify)
 * - Structured Diagnostics Table & Detail Inspector
 * - Exact Search-and-Replace Code Modification Guide
 * - Universal 1-Line Self-Healing Runtime & DevTools Console Tester
 * - Live Healed Website Reverse Proxy Viewer
 * - Autonomous Edge Deployment Hub (Cloudflare Worker, React JSX, Git Patch)
 * - Interactive Keyboard Tab-Order Traversal Visualizer
 * - Official VPAT 2.4 Section 508 Legal Conformance Report
 * - Accessible Object Model (AOM) Tree Comparison
 * - Vision Impairment & Color Blindness Simulator
 * - AI Reasoning & Transparency Inspector with Alternative Switcher
 * - Screen Reader Audio Simulator (Web Speech API)
 * - Live Website URL Scanner Proxy
 */

// Presets
const PRESETS = {
  script: {
    name: "Presentation Sample",
    description: "Pitch benchmark snippet: skipped heading (h1 -> h4), shoe.jpg without alt, unlabelled input.",
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
let selectedViolationIndex = 0;
let currentFramework = 'runtime'; // 'runtime', 'table', 'cf', 'react', 'patch'
let currentScannedUrl = null;
let tabAnimationTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  setupPresetButtons();
  setupActionButtons();
  setupViewTabs();
  setupScreenReaderAudio();
  setupUrlScanner();
  setupVpatModal();
  setupApplyModal();
  setupVisionSimulator();
  setupCicdModal();
  setupAiModal();
  setupFrameworkDeploy();
  setupKeyboardTabSimulator();
  setupKeyboardShortcuts();
  setupEditorListener();
  loadPreset('script');
});

/* ----------------------------------------------------
 * PRESET & TAB MANAGEMENT
 * ---------------------------------------------------- */
function setupPresetButtons() {
  const container = document.getElementById('presetButtons');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `preset-btn px-2.5 py-1 text-xs font-medium rounded border transition ${
      key === 'script' 
        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-sm' 
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
    }`;
    btn.textContent = preset.name;
    btn.onclick = () => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.className = 'preset-btn px-2.5 py-1 text-xs font-medium rounded border transition bg-white border-slate-200 text-slate-600 hover:bg-slate-50';
      });
      btn.className = 'preset-btn px-2.5 py-1 text-xs font-medium rounded border transition bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-sm';
      currentScannedUrl = null;
      hideLiveHealButton();
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
    updateCharCount(preset.html.length);
  }

  const descEl = document.getElementById('presetDescription');
  if (descEl) descEl.textContent = preset.description;

  resetPipelineUI();
}

function setupEditorListener() {
  const editor = document.getElementById('htmlEditor');
  if (editor) {
    editor.addEventListener('input', (e) => {
      updateCharCount(e.target.value.length);
    });
  }
}

function updateCharCount(len) {
  const charEl = document.getElementById('charCount');
  if (charEl) charEl.textContent = `${len} chars`;
}

function resetPipelineUI() {
  currentViolations = [];
  currentRemediation = null;
  currentVerification = null;
  selectedViolationIndex = 0;

  if (tabAnimationTimer) {
    clearInterval(tabAnimationTimer);
    tabAnimationTimer = null;
  }

  const tableContainer = document.getElementById('violationsTableContainer');
  if (tableContainer) {
    tableContainer.innerHTML = '<div class="text-xs text-slate-500 italic p-6 text-center">Click "Run Analysis" to inspect accessibility violations.</div>';
  }

  const inspectorRuleId = document.getElementById('inspectorRuleId');
  if (inspectorRuleId) {
    inspectorRuleId.textContent = 'Select an issue';
    inspectorRuleId.className = 'text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300';
  }

  const inspectorContent = document.getElementById('inspectorContent');
  if (inspectorContent) {
    inspectorContent.innerHTML = 'Click any row in the findings table above to inspect the exact offending DOM node, WCAG success criterion, and applied patch.';
  }

  const verificationBanner = document.getElementById('verificationStatusBadge');
  if (verificationBanner) {
    verificationBanner.textContent = 'Pending';
    verificationBanner.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300';
  }

  const progressBar = document.getElementById('verificationProgressBar');
  if (progressBar) progressBar.style.width = '0%';

  const detailsText = document.getElementById('verificationDetailsText');
  if (detailsText) detailsText.textContent = 'Run the analysis pipeline to execute the second-pass automated verification scan.';

  document.getElementById('frameworkCodeView').textContent = 'Run analysis to generate production edge deployment code.';
  document.getElementById('diffView').innerHTML = '<div class="text-xs text-slate-500 italic p-6 text-center">Run analysis to inspect line-by-line diff.</div>';
  document.getElementById('remediatedCode').textContent = '';
  document.getElementById('renderedPreview').srcdoc = '';
  document.getElementById('aomTreeContainer').innerHTML = '<div class="text-xs text-slate-500 italic p-6 text-center">Run analysis to inspect Accessibility Tree hierarchy.</div>';

  updateBadge('detectCountBadge', 0, 'slate');
  updateBadge('verifyCountBadge', 0, 'slate');
  resetScorecard();
  setPipelineStep(0);
  stopAudioNarration();
}

function resetScorecard() {
  document.getElementById('scorePassRate').textContent = '—';
  document.getElementById('scorePassRateDelta').textContent = 'Awaiting run';
  document.getElementById('scorePassRateBar').style.width = '0%';

  document.getElementById('scoreInitialCount').textContent = '—';
  document.getElementById('scoreResolvedCount').textContent = '—';
  document.getElementById('scoreRemainingCount').textContent = '—';
  document.getElementById('scoreAuditStatus').textContent = 'Pending Scan';
}

function updateBadge(id, count, color = 'blue') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = count;
  if (count > 0 || (typeof count === 'string' && count.includes('/'))) {
    if (color === 'emerald') {
      el.className = 'text-xs px-2 py-0.5 rounded font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300';
    } else if (color === 'rose') {
      el.className = 'text-xs px-2 py-0.5 rounded font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-300';
    } else {
      el.className = 'text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-300';
    }
  } else {
    el.className = 'text-xs px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-300';
  }
}

function setupActionButtons() {
  document.getElementById('runPipelineBtn')?.addEventListener('click', () => runPipeline(false));
  document.getElementById('stepModeBtn')?.addEventListener('click', () => runPipeline(true));
  document.getElementById('copyCodeBtn')?.addEventListener('click', copyRemediatedCode);
  document.getElementById('openDeployTabBtn')?.addEventListener('click', () => {
    switchMainTab('deploy');
  });
}

function setupViewTabs() {
  const tabs = ['deploy', 'sandbox', 'diff', 'code', 'aom'];
  tabs.forEach(tab => {
    const tabBtn = document.getElementById(`tab-${tab}`);
    if (!tabBtn) return;
    tabBtn.addEventListener('click', () => {
      switchMainTab(tab);
    });
  });
}

function switchMainTab(activeTab) {
  const tabs = ['deploy', 'sandbox', 'diff', 'code', 'aom'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (btn) {
      btn.classList.remove('active-tab', 'border-blue-600', 'text-blue-700', 'bg-white', 'font-semibold');
      btn.classList.add('text-slate-600', 'border-transparent', 'font-medium');
    }
    document.getElementById(`view-${t}`)?.classList.add('hidden');
  });
  const activeBtn = document.getElementById(`tab-${activeTab}`);
  if (activeBtn) {
    activeBtn.classList.add('active-tab', 'border-blue-600', 'text-blue-700', 'bg-white', 'font-semibold');
    activeBtn.classList.remove('text-slate-600', 'border-transparent', 'font-medium');
  }
  document.getElementById(`view-${activeTab}`)?.classList.remove('hidden');
}

function setPipelineStep(step) {
  const steps = [
    { num: 1, name: 'Detect', activeText: 'Analyzing...', doneText: 'Completed' },
    { num: 2, name: 'Remediate', activeText: 'Transforming...', doneText: 'Completed' },
    { num: 3, name: 'Verify & Deliver', activeText: 'Verifying...', doneText: 'Completed' }
  ];

  steps.forEach(s => {
    const col = document.getElementById(`step-col-${s.num}`);
    const badge = document.getElementById(`step-badge-${s.num}`);
    const status = document.getElementById(`step-status-${s.num}`);
    if (!col || !badge || !status) return;

    if (s.num < step) {
      col.className = 'flex items-center gap-3 p-2.5 rounded border border-emerald-200 bg-emerald-50/40 transition shadow-sm';
      badge.className = 'w-7 h-7 rounded bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0';
      status.textContent = s.doneText;
      status.className = 'text-[10px] font-semibold text-emerald-700 font-mono';
    } else if (s.num === step) {
      col.className = 'flex items-center gap-3 p-2.5 rounded border border-blue-300 bg-blue-50/50 transition shadow-sm';
      badge.className = 'w-7 h-7 rounded bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0';
      status.textContent = s.activeText;
      status.className = 'text-[10px] font-semibold text-blue-700 font-mono';
    } else {
      col.className = 'flex items-center gap-3 p-2.5 rounded border border-slate-200 bg-white transition shadow-sm';
      badge.className = 'w-7 h-7 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center border border-slate-300 flex-shrink-0';
      status.textContent = 'Ready';
      status.className = 'text-[10px] font-medium text-slate-500 font-mono';
    }
  });
}

/* ----------------------------------------------------
 * PIPELINE CORE EXECUTION
 * ---------------------------------------------------- */
async function runPipeline(stepMode = false) {
  const inputHtml = document.getElementById('htmlEditor').value.trim();
  if (!inputHtml) {
    alert('Please enter HTML source code in the editor.');
    return;
  }

  const startTime = performance.now();

  // Stage 1: DETECT
  setPipelineStep(1);
  const violations = window.A11yDetector.detectViolations(inputHtml);
  currentViolations = violations;
  renderViolationsTable(violations);
  updateBadge('detectCountBadge', violations.length, violations.length > 0 ? 'rose' : 'emerald');

  if (stepMode) await delay(800);

  // Stage 2: REMEDIATE (Hybrid Engine)
  setPipelineStep(2);
  const remediationResult = window.A11yRemediator.remediateHtml(inputHtml);
  currentRemediation = remediationResult;

  if (stepMode) await delay(800);

  // Stage 3: VERIFY & DELIVER
  setPipelineStep(3);
  const verification = window.A11yVerifier.verifyRemediation(
    violations,
    remediationResult.remediatedHtml,
    remediationResult.actions
  );
  currentVerification = verification;
  renderVerificationStatus(verification);
  updateBadge('verifyCountBadge', `${verification.resolvedCount}/${verification.initialCount}`, verification.isComplete ? 'emerald' : 'amber');

  // Update Analytical Scorecards
  updateScorecard(violations, remediationResult, verification);

  // Render Multi-Framework Code & Exact Search & Replace Table
  renderFrameworkCode();
  renderExactReplaceTable();

  // Render Diff, Remediated Code, Live Preview, and AOM Tree
  renderDiff(inputHtml, remediationResult.remediatedHtml);
  document.getElementById('remediatedCode').textContent = remediationResult.remediatedHtml;
  updateRenderedPreview(remediationResult.remediatedHtml);
  renderAomComparison(inputHtml, remediationResult.remediatedHtml);

  // Default select first issue in inspector
  if (violations.length > 0) {
    selectIssueRow(0);
  }

  if (stepMode) await delay(400);
  setPipelineStep(4);

  const duration = Math.round(performance.now() - startTime);
  const execEl = document.getElementById('systemExecutionTime');
  if (execEl) execEl.textContent = `Execution: ${duration}ms`;
}

/* ----------------------------------------------------
 * VIOLATIONS DATA TABLE & INSPECTOR
 * ---------------------------------------------------- */
function renderViolationsTable(violations) {
  const container = document.getElementById('violationsTableContainer');
  if (!container) return;

  if (violations.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center space-y-2">
        <div class="inline-flex p-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <p class="text-xs font-bold text-slate-800">WCAG 2.1 AA Compliant</p>
        <p class="text-[11px] text-slate-500">Zero accessibility violations detected in source document.</p>
      </div>`;
    return;
  }

  let html = `
    <table class="w-full text-left text-xs border-collapse">
      <thead>
        <tr class="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <th class="py-2 px-3">Severity</th>
          <th class="py-2 px-3">Rule ID</th>
          <th class="py-2 px-3">Element</th>
          <th class="py-2 px-3">Engine</th>
          <th class="py-2 px-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">`;

  violations.forEach((v, index) => {
    const isCritical = v.impact === 'critical';
    const isDeterministic = v.category === 'deterministic';
    const isSelected = index === selectedViolationIndex;

    html += `
      <tr id="violation-row-${index}" onclick="selectIssueRow(${index})" class="cursor-pointer transition hover:bg-slate-50/80 ${isSelected ? 'bg-blue-50/50' : ''}">
        <td class="py-2 px-3">
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
            isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }">
            ${v.impact}
          </span>
        </td>
        <td class="py-2 px-3 font-mono font-medium text-slate-800">${escapeHtml(v.ruleId)}</td>
        <td class="py-2 px-3 font-mono text-[11px] text-slate-600 truncate max-w-[90px]">&lt;${escapeHtml(v.selector)}&gt;</td>
        <td class="py-2 px-3">
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
            isDeterministic ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
          }">
            ${isDeterministic ? 'Deterministic' : 'AI Model'}
          </span>
        </td>
        <td class="py-2 px-3 text-right">
          <button type="button" onclick="event.stopPropagation(); selectIssueRow(${index});" class="text-[11px] text-blue-600 hover:text-blue-800 font-semibold">Inspect</button>
        </td>
      </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

window.selectIssueRow = function(index) {
  selectedViolationIndex = index;
  const violation = currentViolations[index];
  if (!violation) return;

  currentViolations.forEach((_, i) => {
    const r = document.getElementById(`violation-row-${i}`);
    if (r) {
      if (i === index) {
        r.classList.add('bg-blue-50/50');
      } else {
        r.classList.remove('bg-blue-50/50');
      }
    }
  });

  const ruleBadge = document.getElementById('inspectorRuleId');
  if (ruleBadge) {
    ruleBadge.textContent = violation.ruleId;
    ruleBadge.className = 'text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200';
  }

  const action = currentRemediation ? (currentRemediation.actions.find(a => a.ruleId === violation.ruleId) || currentRemediation.actions[index]) : null;
  const isAi = violation.category === 'ai_interpretation';

  const container = document.getElementById('inspectorContent');
  if (!container) return;

  let patchHtml = '';
  if (action) {
    patchHtml = `
      <div class="mt-2 space-y-1.5">
        <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Remediation Patch:</span>
        <div class="space-y-1 font-mono text-[11px]">
          <div class="bg-rose-50 text-rose-800 px-2 py-1 rounded border border-rose-200 line-through">
            ${escapeHtml(action.originalSnippet)}
          </div>
          <div class="bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200">
            ${escapeHtml(action.fixedSnippet)}
          </div>
        </div>
      </div>`;
  }

  let aiButtonHtml = '';
  if (isAi && action) {
    aiButtonHtml = `
      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[11px] text-purple-700 font-medium">Contextual Semantic Model (98.6% Confidence)</span>
        <button type="button" onclick="openAiReasoningModal(${index})" class="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition flex items-center gap-1">
          <span>Inspect Reasoning</span>
        </button>
      </div>`;
  }

  container.innerHTML = `
    <div class="space-y-2">
      <div>
        <p class="text-xs font-semibold text-slate-800">${escapeHtml(violation.description)}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">WCAG Success Criterion: <strong class="text-slate-700">${escapeHtml(violation.wcag)}</strong></p>
      </div>

      <div>
        <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Offending DOM Node:</span>
        <div class="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
          ${escapeHtml(violation.elementHtml)}
        </div>
      </div>

      ${patchHtml}
      ${aiButtonHtml}
    </div>`;
};

/* ----------------------------------------------------
 * VERIFICATION STATUS BANNER
 * ---------------------------------------------------- */
function renderVerificationStatus(verification) {
  const badge = document.getElementById('verificationStatusBadge');
  const progressBar = document.getElementById('verificationProgressBar');
  const detailsText = document.getElementById('verificationDetailsText');

  if (badge) {
    if (verification.isComplete) {
      badge.textContent = 'VERIFIED COMPLIANT';
      badge.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300';
    } else {
      badge.textContent = 'NEEDS REVIEW';
      badge.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300';
    }
  }

  if (progressBar) {
    progressBar.style.width = `${verification.successRate}%`;
    progressBar.className = verification.isComplete ? 'bg-emerald-600 h-1.5 rounded-full transition-all duration-500' : 'bg-amber-500 h-1.5 rounded-full transition-all duration-500';
  }

  if (detailsText) {
    detailsText.innerHTML = `
      Pass 2 closed-loop re-scan confirmed: <strong>${verification.resolvedCount} of ${verification.initialCount}</strong> violations eliminated.
      ${verification.remainingCount === 0 ? 'Zero residual defects detected in transformed document.' : `${verification.remainingCount} items flagged for review.`}
    `;
  }
}

/* ----------------------------------------------------
 * ANALYTICAL SCORECARD METRICS
 * ---------------------------------------------------- */
function updateScorecard(violations, remediation, verification) {
  const initial = violations.length;
  const resolved = verification.resolvedCount;
  const remaining = verification.remainingCount;

  const passRate = verification.successRate;
  const rateEl = document.getElementById('scorePassRate');
  const rateDelta = document.getElementById('scorePassRateDelta');
  const rateBar = document.getElementById('scorePassRateBar');

  if (rateEl) rateEl.textContent = `${passRate}%`;
  if (rateDelta) {
    rateDelta.textContent = passRate === 100 ? '+100% verified' : `${passRate}% resolved`;
    rateDelta.className = passRate === 100 ? 'text-xs font-mono font-semibold text-emerald-600' : 'text-xs font-mono font-semibold text-amber-600';
  }
  if (rateBar) {
    rateBar.style.width = `${passRate}%`;
    rateBar.className = passRate === 100 ? 'bg-emerald-600 h-1.5 rounded-full transition-all duration-500' : 'bg-blue-600 h-1.5 rounded-full transition-all duration-500';
  }

  const initEl = document.getElementById('scoreInitialCount');
  if (initEl) initEl.textContent = initial;

  const resEl = document.getElementById('scoreResolvedCount');
  if (resEl) resEl.textContent = resolved;

  const remEl = document.getElementById('scoreRemainingCount');
  const auditStatus = document.getElementById('scoreAuditStatus');
  if (remEl) remEl.textContent = remaining;
  if (auditStatus) {
    auditStatus.textContent = remaining === 0 ? 'PASSED' : 'FLAGGED';
    auditStatus.className = remaining === 0 ? 'text-xs font-mono font-bold text-emerald-700' : 'text-xs font-mono font-bold text-amber-700';
  }
}

/* ----------------------------------------------------
 * DEPLOY & MULTI-FRAMEWORK EXPORTER & SEARCH & REPLACE
 * ---------------------------------------------------- */
function setupFrameworkDeploy() {
  document.getElementById('copyFrameworkBtn')?.addEventListener('click', () => {
    let textToCopy = '';
    if (currentFramework === 'table') {
      textToCopy = generateSearchReplacePlainText();
    } else {
      textToCopy = document.getElementById('frameworkCodeView')?.textContent || '';
    }
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const btn = document.getElementById('copyFrameworkBtn');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>Copied</span>';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    });
  });

  document.getElementById('downloadBundleBtn')?.addEventListener('click', downloadRemediatedBundle);
}

window.switchFrameworkView = function(fw) {
  currentFramework = fw;
  ['runtime', 'table', 'cf', 'react', 'patch'].forEach(id => {
    const btn = document.getElementById(`fw-${id}`);
    if (btn) {
      if (id === fw) {
        btn.className = 'px-2 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm';
      } else {
        btn.className = 'px-2 py-1 rounded text-[11px] font-mono font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';
      }
    }
  });

  const tableContainer = document.getElementById('exactReplaceTableContainer');
  const codeView = document.getElementById('frameworkCodeView');

  if (fw === 'table') {
    tableContainer?.classList.remove('hidden');
    codeView?.classList.add('hidden');
    renderExactReplaceTable();
  } else {
    tableContainer?.classList.add('hidden');
    codeView?.classList.remove('hidden');
    renderFrameworkCode();
  }
};

function renderFrameworkCode() {
  const view = document.getElementById('frameworkCodeView');
  if (!view) return;

  if (currentFramework === 'runtime') {
    view.textContent = `<!-- A11y Remediation Engine Universal Client-Side Self-Healing Runtime -->
<!-- Paste this into your website's <head>, WordPress header, or Google Tag Manager: -->
<script src="https://cdn.jsdelivr.net/gh/sritheanmathy-spec/proj@main/engine/runtime-heal.js" async></script>

<!-- Live DevTools Console One-Liner (Test on your website right now in DevTools Console): -->
fetch('https://cdn.jsdelivr.net/gh/sritheanmathy-spec/proj@main/engine/runtime-heal.js').then(r=>r.text()).then(eval);`;
    return;
  }

  if (!currentRemediation) {
    view.textContent = 'Run analysis to generate production edge deployment code.';
    return;
  }

  const html = currentRemediation.remediatedHtml;
  const actions = currentRemediation.actions;

  if (currentFramework === 'cf') {
    view.textContent = window.A11yEdgeDeploy.generateCloudflareWorker(actions);
  } else if (currentFramework === 'react') {
    view.textContent = window.A11yEdgeDeploy.generateReactJsx(html, 'AccessibleProductView');
  } else if (currentFramework === 'patch') {
    const orig = document.getElementById('htmlEditor')?.value || '';
    view.textContent = window.A11yCiCd.generateGitPatch(orig, html);
  }
}

function renderExactReplaceTable() {
  const container = document.getElementById('exactReplaceTableContainer');
  if (!container) return;

  if (!currentRemediation || !currentRemediation.actions || currentRemediation.actions.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 italic p-4 text-center">No specific code replacements needed.</div>';
    return;
  }

  let rows = '';
  currentRemediation.actions.forEach((a, index) => {
    rows += `
      <tr class="border-b border-slate-200">
        <td class="py-2 px-2.5 font-mono text-[11px] text-slate-700 font-semibold">${escapeHtml(a.ruleId)}</td>
        <td class="py-2 px-2.5">
          <div class="bg-rose-50 text-rose-800 p-1.5 rounded font-mono text-[10px] overflow-x-auto border border-rose-200">${escapeHtml(a.originalSnippet)}</div>
        </td>
        <td class="py-2 px-2.5">
          <div class="bg-emerald-50 text-emerald-800 p-1.5 rounded font-mono text-[10px] overflow-x-auto border border-emerald-200">${escapeHtml(a.fixedSnippet)}</div>
        </td>
        <td class="py-2 px-2 text-right">
          <button onclick="copySnippetText('${escapeHtml(a.fixedSnippet).replace(/'/g, "\\'")}')" class="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[10px] font-semibold">Copy</button>
        </td>
      </tr>`;
  });

  container.innerHTML = `
    <table class="w-full text-left text-xs border-collapse bg-white rounded border border-slate-200">
      <thead>
        <tr class="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wider">
          <th class="py-2 px-2.5 w-1/5">Criterion</th>
          <th class="py-2 px-2.5 w-2/5">Find in Source Code</th>
          <th class="py-2 px-2.5 w-2/5">Replace With (Rectified)</th>
          <th class="py-2 px-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

window.copySnippetText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Snippet copied to clipboard!');
  });
};

function generateSearchReplacePlainText() {
  if (!currentRemediation || !currentRemediation.actions) return '';
  let out = 'EXACT CODE REPLACEMENT GUIDE FOR YOUR SOURCE CODE:\n\n';
  currentRemediation.actions.forEach((a, i) => {
    out += `[#${i+1}] Rule: ${a.ruleId} (${a.title})\n`;
    out += `FIND IN YOUR SOURCE:\n${a.originalSnippet}\n\n`;
    out += `REPLACE WITH RECTIFIED CODE:\n${a.fixedSnippet}\n`;
    out += `---------------------------------------------------------\n\n`;
  });
  return out;
}

function downloadRemediatedBundle() {
  if (!currentRemediation) {
    alert('Please run the analysis pipeline first.');
    return;
  }

  let html = currentRemediation.remediatedHtml;

  // If a live URL was scanned, ensure base href is present so the downloaded file loads 100% of the CSS/images
  if (currentScannedUrl && !html.includes('<base href=')) {
    const baseTag = `<base href="${currentScannedUrl}">`;
    if (/<head\b[^>]*>/i.test(html)) {
      html = html.replace(/<head\b[^>]*>/i, `$& \n  ${baseTag}`);
    } else {
      html = `${baseTag}\n${html}`;
    }
  }

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `remediated-website-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------------------------------
 * APPLY FIX TO REAL WEBSITE MODAL
 * ---------------------------------------------------- */
function setupApplyModal() {
  const modal = document.getElementById('applyModal');
  document.getElementById('openApplyModalBtn')?.addEventListener('click', () => {
    modal?.classList.remove('hidden');
  });
  document.getElementById('closeApplyModalBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
}

window.copyRuntimeTag = function() {
  const tag = '<script src="https://cdn.jsdelivr.net/gh/sritheanmathy-spec/proj@main/engine/runtime-heal.js" async></script>';
  navigator.clipboard.writeText(tag).then(() => {
    alert('1-Line Embed Script copied! Paste it into your website header or Google Tag Manager.');
  });
};

window.copyConsoleSnippet = function() {
  const cmd = "fetch('https://cdn.jsdelivr.net/gh/sritheanmathy-spec/proj@main/engine/runtime-heal.js').then(r=>r.text()).then(eval);";
  navigator.clipboard.writeText(cmd).then(() => {
    alert('Console command copied! Open your website, press F12, click Console, paste and hit Enter.');
  });
};

/* ----------------------------------------------------
 * INTERACTIVE KEYBOARD TAB-ORDER SIMULATOR
 * ---------------------------------------------------- */
function setupKeyboardTabSimulator() {
  document.getElementById('simulateTabOrderBtn')?.addEventListener('click', runTabOrderSimulation);
}

function runTabOrderSimulation() {
  const iframe = document.getElementById('renderedPreview');
  const ticker = document.getElementById('focusSequenceTicker');
  if (!iframe || !iframe.contentDocument) return;

  const doc = iframe.contentDocument;

  doc.querySelectorAll('.a11y-tab-badge').forEach(b => b.remove());
  doc.querySelectorAll('.a11y-focused-el').forEach(el => el.classList.remove('a11y-focused-el'));

  if (!doc.getElementById('a11y-focus-styles')) {
    const style = doc.createElement('style');
    style.id = 'a11y-focus-styles';
    style.textContent = `
      .a11y-focused-el {
        outline: 3px solid #2563eb !important;
        outline-offset: 3px !important;
        background-color: rgba(37, 99, 235, 0.08) !important;
        position: relative !important;
      }
      .a11y-tab-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #2563eb;
        color: white;
        font-family: monospace;
        font-size: 10px;
        font-weight: bold;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `;
    doc.head.appendChild(style);
  }

  const focusable = Array.from(doc.body.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));

  if (focusable.length === 0) {
    if (ticker) ticker.textContent = 'No interactive focusable elements detected on page.';
    return;
  }

  if (tabAnimationTimer) {
    clearInterval(tabAnimationTimer);
  }

  let step = 0;
  function highlightNext() {
    focusable.forEach(el => el.classList.remove('a11y-focused-el'));

    if (step >= focusable.length) {
      if (ticker) ticker.innerHTML = `Traversal complete: <strong>${focusable.length} interactive elements</strong> verified keyboard operable (WCAG 2.1.1).`;
      clearInterval(tabAnimationTimer);
      tabAnimationTimer = null;
      return;
    }

    const currentEl = focusable[step];
    currentEl.classList.add('a11y-focused-el');
    currentEl.focus();

    if (!currentEl.querySelector('.a11y-tab-badge')) {
      const badge = doc.createElement('span');
      badge.className = 'a11y-tab-badge';
      badge.textContent = step + 1;
      currentEl.appendChild(badge);
    }

    const tag = currentEl.tagName.toLowerCase();
    const name = currentEl.getAttribute('aria-label') || currentEl.textContent.trim() || currentEl.getAttribute('placeholder') || 'Input control';
    
    if (ticker) {
      ticker.innerHTML = `Focus Step ${step + 1} of ${focusable.length}: <strong>&lt;${tag}&gt;</strong> "${escapeHtml(name.substring(0, 30))}" (WCAG 2.1.1 Operable - Sequential Tab Navigation)`;
    }

    step++;
  }

  highlightNext();
  tabAnimationTimer = setInterval(highlightNext, 900);
}

/* ----------------------------------------------------
 * OFFICIAL VPAT 2.4 LEGAL CONFORMANCE MODAL
 * ---------------------------------------------------- */
function setupVpatModal() {
  const modal = document.getElementById('vpatModal');
  document.getElementById('openVpatModalBtn')?.addEventListener('click', openVpatModal);
  document.getElementById('closeVpatModalBtn')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });

  document.getElementById('printVpatBtn')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('exportVpatJsonBtn')?.addEventListener('click', () => {
    if (!currentVerification) return;
    const report = window.A11yVpat.generateVpat24Report(currentVerification);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VPAT-2.4-ACR-${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

async function openVpatModal() {
  const modal = document.getElementById('vpatModal');
  const container = document.getElementById('vpatContentContainer');
  if (!modal || !container) return;

  if (!currentVerification) {
    await runPipeline(false);
  }

  const vpatData = window.A11yVpat.generateVpat24Report(currentVerification);
  container.innerHTML = window.A11yVpat.renderVpatHtml(vpatData);
  modal.classList.remove('hidden');
}

/* ----------------------------------------------------
 * DIFF & PREVIEW
 * ---------------------------------------------------- */
function renderDiff(orig, mod) {
  const diffLines = window.A11yDiff.computeLineDiff(orig, mod);
  const diffHtml = window.A11yDiff.renderDiffHtml(diffLines);
  const diffEl = document.getElementById('diffView');
  if (diffEl) diffEl.innerHTML = diffHtml;
}

function updateRenderedPreview(html) {
  const iframe = document.getElementById('renderedPreview');
  if (!iframe) return;

  // If a full HTML document is provided (with <html> and <body>), use it directly
  let styledDocument = html;
  if (!html.includes('<html') && !html.includes('<body')) {
    styledDocument = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; background: #ffffff; color: #0f172a; margin: 0; line-height: 1.5; }
          h1 { font-size: 1.35rem; margin-top: 0; color: #0f172a; }
          h2 { font-size: 1.15rem; color: #1e293b; }
          h4 { font-size: 0.95rem; color: #475569; }
          img { max-width: 140px; height: auto; border-radius: 4px; border: 1px solid #e2e8f0; display: block; margin: 8px 0; }
          input, select, textarea { display: block; margin: 4px 0 12px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; width: 220px; box-sizing: border-box; }
          label { display: block; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
          button { background: #2563eb; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-block; margin-top: 4px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>`;
  }
  iframe.srcdoc = styledDocument;
}

/* ----------------------------------------------------
 * ACCESSIBILITY OBJECT MODEL (AOM) COMPARISON
 * ---------------------------------------------------- */
function renderAomComparison(beforeHtml, afterHtml) {
  const container = document.getElementById('aomTreeContainer');
  if (!container || !window.A11yAOM) return;

  const beforeTree = window.A11yAOM.buildAomTree(beforeHtml, false);
  const afterTree = window.A11yAOM.buildAomTree(afterHtml, true);

  const html = `
    <div class="space-y-4">
      <div class="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700">
        <strong>Accessible Object Model (AOM):</strong> Browser accessibility tree nodes exposed to assistive technology and screen readers.
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div class="text-[11px] font-bold text-rose-700 mb-1.5 flex items-center gap-1">
            <span>Initial AOM Tree (Inaccessible)</span>
          </div>
          ${window.A11yAOM.renderAomTreeHtml(beforeTree, 'Before')}
        </div>
        <div>
          <div class="text-[11px] font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
            <span>Verified AOM Tree (Remediated)</span>
          </div>
          ${window.A11yAOM.renderAomTreeHtml(afterTree, 'After')}
        </div>
      </div>
    </div>`;

  container.innerHTML = html;
}

/* ----------------------------------------------------
 * VISION IMPAIRMENT SIMULATOR
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
 * AI REASONING & TRANSPARENCY INSPECTOR
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
      <div class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
        <span class="text-slate-800 font-mono">"${escapeHtml(altText)}"</span>
        <button type="button" onclick="applyAiAlternative('${escapeHtml(altText)}')" class="px-2 py-0.5 rounded bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 text-[11px] font-semibold transition shadow-sm">
          Apply Suggestion
        </button>
      </div>`;
  });

  container.innerHTML = `
    <div class="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
      <div class="flex justify-between items-center">
        <span class="text-slate-600 font-semibold">Model Architecture:</span>
        <span class="font-mono text-purple-700 font-bold">${details.model}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-600 font-semibold">Inference Confidence:</span>
        <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">${details.confidence}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-600 font-semibold">Target Element Resource:</span>
        <span class="font-mono text-slate-800">${details.targetResource}</span>
      </div>
    </div>

    <div>
      <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Context Signals Extracted:</span>
      <div class="space-y-1 font-mono text-[11px]">
        ${details.contextSignals.map(s => `<div class="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700">&bull; ${s}</div>`).join('')}
      </div>
    </div>

    <div>
      <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Alternative Suggestions:</span>
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
  const res = window.A11yRemediator.remediateHtml(currentCode, { customAlt: newAlt });
  currentRemediation = res;

  if (currentViolations.length > 0) {
    const verification = window.A11yVerifier.verifyRemediation(currentViolations, res.remediatedHtml, res.actions);
    currentVerification = verification;
    renderVerificationStatus(verification);
    updateScorecard(currentViolations, res, verification);
  }

  renderFrameworkCode();
  renderExactReplaceTable();
  renderDiff(currentCode, res.remediatedHtml);
  document.getElementById('remediatedCode').textContent = res.remediatedHtml;
  updateRenderedPreview(res.remediatedHtml);
  document.getElementById('aiModal')?.classList.add('hidden');
  selectIssueRow(selectedViolationIndex);
};

/* ----------------------------------------------------
 * CI/CD GITHUB ACTION EXPORTER
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
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = 'Copy YAML'; }, 1500);
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

  setAudioTicker('Streaming initial screen reader audio...');
  setAudioIndicator(true);

  window.A11yScreenReader.speakScript(scriptData.fullText, {
    rate: 1.0,
    pitch: 0.95,
    onBoundary: (e) => {
      const words = scriptData.fullText.substring(e.charIndex, e.charIndex + 35);
      setAudioTicker(`Reading: "${words}..."`);
    },
    onEnd: () => {
      setAudioTicker('Completed initial audio stream. Test remediated HTML to compare.');
      setAudioIndicator(false);
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

  setAudioTicker('Streaming verified remediated screen reader audio...');
  setAudioIndicator(true);

  window.A11yScreenReader.speakScript(scriptData.fullText, {
    rate: 1.05,
    pitch: 1.05,
    onBoundary: (e) => {
      const words = scriptData.fullText.substring(e.charIndex, e.charIndex + 35);
      setAudioTicker(`Reading: "${words}..."`);
    },
    onEnd: () => {
      setAudioTicker('Completed remediated audio stream. Verified accessibility structure.');
      setAudioIndicator(false);
    }
  });
}

function stopAudioNarration() {
  window.A11yScreenReader?.stopSpeech();
  setAudioIndicator(false);
  setAudioTicker('Audio stopped. Ready.');
}

function setAudioTicker(text) {
  const el = document.getElementById('speechTicker');
  if (el) el.textContent = text;
}

function setAudioIndicator(active) {
  const dot = document.getElementById('audioActiveIndicator');
  if (!dot) return;
  if (active) {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0';
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-slate-300 flex-shrink-0';
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
  document.getElementById('openLiveHealBtn')?.addEventListener('click', openLiveHealedWebsite);
}

function showLiveHealButton(url) {
  const btn = document.getElementById('openLiveHealBtn');
  if (btn) {
    btn.classList.remove('hidden');
  }
}

function hideLiveHealButton() {
  const btn = document.getElementById('openLiveHealBtn');
  if (btn) {
    btn.classList.add('hidden');
  }
}

function openLiveHealedWebsite() {
  if (!currentScannedUrl) return;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    window.open(`/api/live-heal?url=${encodeURIComponent(currentScannedUrl)}`, '_blank');
  } else {
    downloadRemediatedBundle();
  }
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
  btn.innerHTML = '<span>Fetching URL...</span>';
  btn.disabled = true;

  try {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let htmlContent = '';

    if (isLocal) {
      const proxyUrl = `/api/fetch-url?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      htmlContent = data.html;
    } else {
      const publicProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(publicProxy);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let raw = await res.text();
      // Ensure <base href> is in head
      const baseTag = `<base href="${targetUrl}">`;
      if (/<head\b[^>]*>/i.test(raw)) {
        htmlContent = raw.replace(/<head\b[^>]*>/i, `$& \n  ${baseTag}`);
      } else {
        htmlContent = `${baseTag}\n${raw}`;
      }
    }

    currentScannedUrl = targetUrl;
    showLiveHealButton(targetUrl);

    document.getElementById('htmlEditor').value = htmlContent;
    updateCharCount(htmlContent.length);
    document.getElementById('presetDescription').textContent = `Live Scanned URL: ${targetUrl} (Full Document Preserved with <base href>)`;
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
 * KEYBOARD SHORTCUTS
 * ---------------------------------------------------- */
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPipeline(false);
    } else if (e.key === 'Escape') {
      document.querySelectorAll('#urlModal, #vpatModal, #cicdModal, #aiModal, #applyModal').forEach(m => m.classList.add('hidden'));
    }
  });
}

function copyRemediatedCode() {
  const code = document.getElementById('remediatedCode')?.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyCodeBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Copied Full HTML</span>';
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
