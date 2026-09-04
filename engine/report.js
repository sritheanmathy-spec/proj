/**
 * A11y Remediation Engine — Compliance Audit Report Generator
 * Generates formal WCAG 2.1 AA Audit Certificates and JSON reports without emojis.
 */
(function(root) {

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
          <td class="py-2.5 px-4 font-mono text-xs font-semibold text-slate-900">${item.ruleId}</td>
          <td class="py-2.5 px-4 text-xs text-slate-700">${item.wcagCriteria || 'WCAG 2.1 AA'}</td>
          <td class="py-2.5 px-4 text-xs">
            <span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium ${item.category === 'deterministic' ? 'bg-slate-100 text-slate-800' : 'bg-blue-50 text-blue-800 border border-blue-200'}">
              ${item.engine}
            </span>
          </td>
          <td class="py-2.5 px-4 text-xs">
            <span class="inline-block px-2 py-0.5 rounded font-bold text-[11px] ${isVerified ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
              ${isVerified ? 'VERIFIED' : 'NEEDS REVIEW'}
            </span>
          </td>
        </tr>`;
    });

    return `
      <div id="printCertificateArea" class="bg-white text-slate-900 p-8 max-w-4xl mx-auto rounded-lg shadow-sm border border-slate-200 font-sans">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-5 mb-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded border border-slate-900 bg-slate-900 flex items-center justify-center text-white font-bold text-base tracking-wider">
              A11Y
            </div>
            <div>
              <h1 class="text-lg font-bold tracking-tight text-slate-900">Certificate of Accessibility Remediation</h1>
              <p class="text-xs text-slate-500 font-mono">Standard: W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificate ID</div>
            <div class="font-mono text-xs font-bold text-slate-900">${auditId}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">${dateStr}</div>
          </div>
        </div>

        <!-- Verification Status Banner -->
        <div class="p-4 rounded border ${isFullSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'} mb-6 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold uppercase tracking-wider mb-0.5">
              ${isFullSuccess ? 'Verification Status: Conformance Achieved' : 'Verification Status: Manual Review Recommended'}
            </div>
            <p class="text-xs ${isFullSuccess ? 'text-emerald-700' : 'text-amber-700'}">
              Second-pass accessibility diagnostic scan confirmed resolution of target violations.
            </p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold font-mono ${isFullSuccess ? 'text-emerald-700' : 'text-amber-700'}">${auditData.successRate}%</div>
            <div class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Verified Resolution</div>
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-4 gap-3 mb-6 text-center">
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <div class="text-[11px] text-slate-500 uppercase font-semibold">Initial Violations</div>
            <div class="text-xl font-bold text-slate-900 mt-1 font-mono">${auditData.initialCount}</div>
          </div>
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <div class="text-[11px] text-slate-500 uppercase font-semibold">Remediations Applied</div>
            <div class="text-xl font-bold text-blue-700 mt-1 font-mono">${auditData.resolvedCount}</div>
          </div>
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <div class="text-[11px] text-slate-500 uppercase font-semibold">Residual Violations</div>
            <div class="text-xl font-bold ${auditData.remainingCount === 0 ? 'text-emerald-700' : 'text-amber-700'} mt-1 font-mono">${auditData.remainingCount}</div>
          </div>
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <div class="text-[11px] text-slate-500 uppercase font-semibold">Verification Score</div>
            <div class="text-xl font-bold text-emerald-700 mt-1 font-mono">${auditData.successRate}%</div>
          </div>
        </div>

        <!-- Audit Matrix Table -->
        <div class="mb-6">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Automated Audit & Verification Trail</h2>
          <div class="overflow-x-auto border border-slate-200 rounded">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-700 text-xs font-semibold border-b border-slate-200">
                  <th class="py-2.5 px-4">WCAG Rule</th>
                  <th class="py-2.5 px-4">Standard</th>
                  <th class="py-2.5 px-4">Remediation Engine</th>
                  <th class="py-2.5 px-4">Re-Scan Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Formal Footer -->
        <div class="text-[11px] text-slate-500 border-t border-slate-200 pt-4 leading-relaxed flex justify-between items-center">
          <p>This automated compliance record was produced by the A11y Remediation Engine closed feedback loop.</p>
          <div class="flex gap-2 print:hidden">
            <button onclick="window.print()" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-sm transition">
              Print / Save PDF
            </button>
            <button onclick="downloadAuditJson()" class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded shadow-sm transition">
              Download JSON
            </button>
          </div>
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

  const api = {
    generateCertificateHtml,
    exportAuditJson
  };

  root.A11yReport = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
