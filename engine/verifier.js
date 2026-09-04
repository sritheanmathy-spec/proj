/**
 * A11y Remediation Engine — Verifier
 * Wrapped in UMD/IIFE to prevent global variable collision in browser.
 */
(function(root) {
  const detector = (typeof require !== 'undefined') ? require('./detector.js') : root.A11yDetector;
  const detectViolations = detector.detectViolations;

  function verifyRemediation(initialViolations, remediatedHtml, remediationActions = []) {
    // Pass 2: Re-run accessibility detection on the modified HTML
    const postViolations = detectViolations(remediatedHtml);

    // Map post-scan rule IDs and selectors for quick lookup
    const remainingRuleMap = new Map();
    postViolations.forEach(v => {
      const key = `${v.ruleId}-${v.selector}`;
      remainingRuleMap.set(key, (remainingRuleMap.get(key) || 0) + 1);
    });

    const verifiedItems = [];

    initialViolations.forEach((initial, index) => {
      const action = remediationActions.find(a => a.ruleId === initial.ruleId) || remediationActions[index];
      const key = `${initial.ruleId}-${initial.selector}`;
      const remainingCount = remainingRuleMap.get(key) || 0;

      let isResolved = remainingCount === 0;
      
      const stillFailing = postViolations.some(pv => pv.ruleId === initial.ruleId && pv.elementHtml === initial.elementHtml);
      if (!stillFailing) {
        isResolved = true;
      }

      if (isResolved) {
        verifiedItems.push({
          id: initial.id,
          ruleId: initial.ruleId,
          impact: initial.impact,
          category: initial.category,
          engine: initial.engine || (initial.category === 'ai_interpretation' ? 'AI / LLM Semantic Model' : 'Deterministic Logic'),
          status: 'VERIFIED',
          statusBadge: 'Verified',
          statusColor: 'emerald',
          originalCode: initial.elementHtml,
          fixedCode: action ? action.fixedSnippet : 'Attribute / Structure modified',
          explanation: action ? action.explanation : 'Issue eliminated and verified by second-pass AST & scanner check.',
          wcagCriteria: initial.wcag
        });
      } else {
        verifiedItems.push({
          id: initial.id,
          ruleId: initial.ruleId,
          impact: initial.impact,
          category: initial.category,
          engine: initial.engine || 'Hybrid Engine',
          status: 'NEEDS_REVIEW',
          statusBadge: 'Needs Review',
          statusColor: 'amber',
          originalCode: initial.elementHtml,
          fixedCode: action ? action.fixedSnippet : 'Attempted rewrite',
          explanation: 'Residual rule violation detected in second pass. Flagged for human review.',
          wcagCriteria: initial.wcag
        });
      }
    });

    const initialCount = initialViolations.length;
    const resolvedCount = verifiedItems.filter(item => item.status === 'VERIFIED').length;
    const reviewCount = verifiedItems.filter(item => item.status === 'NEEDS_REVIEW').length;
    const successRate = initialCount > 0 ? Math.round((resolvedCount / initialCount) * 100) : 100;

    return {
      initialCount,
      remainingCount: postViolations.length,
      resolvedCount,
      reviewCount,
      successRate,
      postViolations,
      verifiedItems,
      isComplete: postViolations.length === 0
    };
  }

  const api = {
    verifyRemediation
  };

  root.A11yVerifier = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
