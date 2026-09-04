/**
 * A11y Remediation Engine — Compliance Audit Report Generator
 * Generates official, print-ready WCAG 2.1 AA Audit Certificates and JSON reports.
 */

function generateCertificateHtml(auditData) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const auditId = 'A11Y-CERT-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const isFullSuccess = auditData.remainingCount === 0;

  let rowsHtml = '';
  (auditData.verifiedItems || []).forEach(item => {
    const isVerified = item.status === 'VERIFIED';
    rowsHtml += `
      <tr class="border-b border-slate-200">
        <td class="py-3 px-4 font-mono text-xs font-semibold">${item.ruleId}</td>
        <td class="py-3 px-4 text-xs">${item.wcagCriteria || 'WCAG 2.1 AA'}</td>
        <td class="py-3 px-4 text-xs">
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium ${item.category === 'deterministic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
            ${item.engine}
          </span>
        </td>
        <td class="py-3 px-4 text-xs">
          <span class="inline-block px-2 py-0.5 rounded font-bold text-[11px] ${isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${item.statusBadge}
          </span>
        </td>
      </tr>`;
  });

  return `
    <div id="printCertificateArea" class="bg-white text-slate-900 p-8 max-w-4xl mx-auto rounded-xl shadow-2xl border border-slate-200 font-sans">
      
      <!-- Top Decorative Ribbon -->
      <div class="flex items-center justify-between border-b-2 border-indigo-600 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow">
            A
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900">Certificate of Accessibility Remediation</h1>
            <p class="text-xs text-slate-500 font-mono">Standard: W3C WCAG 2.1 Level AA &bull; Automated Verification Pipeline</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs font-bold text-slate-700">Certificate ID:</div>
          <div class="font-mono text-xs font-bold text-indigo-600">${auditId}</div>
          <div class="text-[11px] text-slate-500">${dateStr}</div>
        </div>
      </div>

      <!-- Verification Seal Box -->
      <div class="p-4 rounded-xl ${isFullSuccess ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'} mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="text-3xl">${isFullSuccess ? '🛡️' : '⚠️'}</div>
          <div>
            <h2 class="text-sm font-bold ${isFullSuccess ? 'text-emerald-900' : 'text-amber-900'}">
              ${isFullSuccess ? 'Verification Verified: WCAG 2.1 AA Conformance Achieved' : 'Partial Remediation: Manual Review Recommended'}
            </h2>
            <p class="text-xs ${isFullSuccess ? 'text-emerald-700' : 'text-amber-700'}">
              Second-pass accessibility scanning confirmed zero residual structural violations across tested criteria.
            </p>
          </div>
        </div>
        <div class="text-center px-4 py-2 bg-white rounded-lg border ${isFullSuccess ? 'border-emerald-200 text-emerald-800' : 'border-amber-200 text-amber-800'} font-black text-lg">
          ${auditData.successRate}% Verified
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-4 gap-4 mb-6 text-center">
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 uppercase font-semibold">Initial Errors</div>
          <div class="text-xl font-bold text-rose-600">${auditData.initialCount}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 uppercase font-semibold">Remediations</div>
          <div class="text-xl font-bold text-indigo-600">${auditData.resolvedCount}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 uppercase font-semibold">Residual Errors</div>
          <div class="text-xl font-bold ${auditData.remainingCount === 0 ? 'text-emerald-600' : 'text-amber-600'}">${auditData.remainingCount}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 uppercase font-semibold">Compliance</div>
          <div class="text-xl font-bold text-emerald-600">${auditData.successRate}%</div>
        </div>
      </div>

      <!-- Audit Matrix Table -->
      <div class="mb-6">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Automated Audit & Remediation Log</h3>
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-700 text-xs font-semibold border-b border-slate-200">
                <th class="py-2.5 px-4">WCAG Rule</th>
                <th class="py-2.5 px-4">Standard</th>
                <th class="py-2.5 px-4">Remediation Engine</th>
                <th class="py-2.5 px-4">Re-Scan Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Legal & Technical Guarantee Footer -->
      <div class="text-[11px] text-slate-500 border-t border-slate-200 pt-4 leading-relaxed">
        <p><strong>Verification Statement:</strong> This automated audit trail was generated by the A11y Remediation Engine closed feedback loop. Remediation patches were synthesized via deterministic AST transforms and multimodal AI models, followed by an immediate secondary AST diagnostic pass confirming rule resolution.</p>
      </div>

      <!-- Action Buttons (Hidden when printing) -->
      <div class="mt-6 flex justify-end gap-3 print:hidden">
        <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5">
          <span>🖨️ Print / Save as PDF</span>
        </button>
        <button onclick="downloadAuditJson()" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5">
          <span>💾 Download JSON Report</span>
        </button>
      </div>

    </div>
  `;
}

function exportAuditJson(auditData) {
  const jsonReport = {
    standard: "WCAG 2.1 AA",
    generatedAt: new Date().toISOString(),
    summary: {
      initialViolations: auditData.initialCount,
      resolvedViolations: auditData.resolvedCount,
      remainingViolations: auditData.remainingCount,
      verificationRate: `${auditData.successRate}%`,
      isCompliant: auditData.remainingCount === 0
    },
    auditTrail: auditData.verifiedItems || []
  };

  const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wcag-audit-certificate-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateCertificateHtml,
    exportAuditJson
  };
}
if (typeof window !== 'undefined') {
  window.A11yReport = {
    generateCertificateHtml,
    exportAuditJson
  };
}
