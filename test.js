/**
 * Automated test suite for A11y Remediation Engine
 */
const assert = require('assert');
const { detectViolations } = require('./engine/detector.js');
const { remediateHtml } = require('./engine/remediator.js');
const { verifyRemediation } = require('./engine/verifier.js');
const { computeLineDiff } = require('./engine/diff.js');

console.log('--- RUNNING TEST SUITE ---');

// Test Case 1: Presentation Pitch Script
{
  const input = `<h1>Products</h1>\n<h4>Shoes</h4>\n<img src="shoe.jpg">\n<input type="text">`;
  const violations = detectViolations(input);
  assert.strictEqual(violations.length, 3, 'Should detect 3 violations in script example');

  const headingV = violations.find(v => v.ruleId === 'heading-order');
  const imgV = violations.find(v => v.ruleId === 'image-alt');
  const labelV = violations.find(v => v.ruleId === 'label');

  assert(headingV, 'Must detect heading order violation');
  assert(imgV, 'Must detect missing image alt violation');
  assert(labelV, 'Must detect missing label violation');

  assert.strictEqual(headingV.category, 'deterministic', 'Heading order must be deterministic');
  assert.strictEqual(imgV.category, 'ai_interpretation', 'Image alt must be AI interpretation');
  assert.strictEqual(labelV.category, 'deterministic', 'Label must be deterministic');

  const res = remediateHtml(input);
  assert(res.remediatedHtml.includes('<h2>Shoes</h2>'), 'Heading 4 must be rewritten to heading 2');
  assert(res.remediatedHtml.includes('alt="Red running shoe"'), 'Alt text must be generated for shoe.jpg');
  assert(res.remediatedHtml.includes('<label for='), 'Label must be generated for input');

  const verification = verifyRemediation(violations, res.remediatedHtml, res.actions);
  assert.strictEqual(verification.remainingCount, 0, 'Zero violations must remain');
  assert.strictEqual(verification.resolvedCount, 3, 'All 3 violations must be resolved');
  assert.strictEqual(verification.successRate, 100, 'Success rate must be 100%');
  console.log('[PASS] Test Case 1 (Pitch Script Example): PASS');
}

// Test Case 2: Color Contrast
{
  const input = `<div style="color: #999999; background: #ffffff;">Low contrast text</div>`;
  const violations = detectViolations(input);
  assert.strictEqual(violations.length, 1, 'Should detect 1 contrast violation');

  const res = remediateHtml(input);
  const verification = verifyRemediation(violations, res.remediatedHtml, res.actions);
  assert.strictEqual(verification.remainingCount, 0, 'Contrast issue must be resolved');
  assert.strictEqual(verification.successRate, 100, 'Success rate must be 100%');
  console.log('[PASS] Test Case 2 (Color Contrast Remediation): PASS');
}

// Test Case 3: Empty Button
{
  const input = `<button></button>`;
  const res = remediateHtml(input);
  assert(res.remediatedHtml.includes('aria-label') || res.remediatedHtml.includes('Submit'), 'Button must receive accessible name');
  console.log('[PASS] Test Case 3 (Button Name): PASS');
}

// Test Case 4: Diff Computation
{
  const orig = `<h1>Products</h1>\n<h4>Shoes</h4>`;
  const mod = `<h1>Products</h1>\n<h2>Shoes</h2>`;
  const diffs = computeLineDiff(orig, mod);
  assert(diffs.some(d => d.type === 'removed' && d.content.includes('<h4>Shoes</h4>')), 'Diff should show removed h4');
  assert(diffs.some(d => d.type === 'added' && d.content.includes('<h2>Shoes</h2>')), 'Diff should show added h2');
  console.log('[PASS] Test Case 4 (Line Diff Computation): PASS');
}

// Test Case 5: VPAT 2.4 / Section 508 ACR Report Generation
{
  const { generateVpat24Report } = require('./engine/vpat.js');
  const mockVerification = {
    initialCount: 3,
    resolvedCount: 3,
    remainingCount: 0,
    isComplete: true,
    verifiedItems: [
      { ruleId: 'image-alt', status: 'VERIFIED' },
      { ruleId: 'heading-order', status: 'VERIFIED' },
      { ruleId: 'label', status: 'VERIFIED' }
    ]
  };
  const vpat = generateVpat24Report(mockVerification);
  assert(vpat.reportId.startsWith('ACR-VPAT-'), 'VPAT must generate an ACR report ID');
  assert(vpat.digestHash.startsWith('sha256:'), 'VPAT must generate a SHA-256 digest');
  assert.strictEqual(vpat.conformanceStatus, 'Conformant (Level AA)', 'Must report Level AA conformance');
  assert(vpat.criteriaTable.length >= 8, 'Must cover at least 8 key WCAG criteria');
  console.log('[PASS] Test Case 5 (VPAT 2.4 Report Generation): PASS');
}

// Test Case 6: Edge CDN Worker & React JSX Generation
{
  const { generateCloudflareWorker, generateReactJsx } = require('./engine/edge_deploy.js');
  const mockActions = [
    { ruleId: 'image-alt', fixedSnippet: '<img src="test.jpg" alt="Test image">' },
    { ruleId: 'heading-order', fixedSnippet: '<h2>Section</h2>' }
  ];
  const workerCode = generateCloudflareWorker(mockActions, 'https://test.com');
  assert(workerCode.includes('HTMLRewriter'), 'Cloudflare Worker must use HTMLRewriter');
  assert(workerCode.includes("rewriter.on('img:not([alt])'"), 'Worker must attach image handler');

  const rawHtml = '<div class="card"><img src="item.jpg" alt="Product"><input type="text" for="name"></div>';
  const jsx = generateReactJsx(rawHtml, 'ProductCard');
  assert(jsx.includes('className="card"'), 'React JSX must convert class to className');
  assert(jsx.includes('htmlFor="name"'), 'React JSX must convert for to htmlFor');
  assert(jsx.includes('<img') && jsx.includes('/>'), 'React JSX must self-close void tags');
  console.log('[PASS] Test Case 6 (Edge Deploy & React JSX Exporter): PASS');
}

console.log('---------------------------------');
console.log('ALL 6 TEST CASES PASSED SUCCESSFULLY!');
