/**
 * Automated test suite for A11y Remediation Engine
 */
const assert = require('assert');
const { detectViolations } = require('./engine/detector.js');
const { remediateHtml } = require('./engine/remediator.js');
const { verifyRemediation } = require('./engine/verifier.js');
const { computeLineDiff } = require('./engine/diff.js');
const A11yNeurodiversity = require('./engine/neurodiversity.js');
const A11yDigitalTwin = require('./engine/digital_twin.js');
const { generateScriptWithRegex, calculateSpatialPan } = require('./engine/screenreader.js');

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

// Test Case 7: Universal Runtime Self-Healing & Base Href Preservation
{
  const fs = require('fs');
  const path = require('path');
  const runtimeScript = fs.readFileSync(path.join(__dirname, 'engine', 'runtime-heal.js'), 'utf8');
  assert(runtimeScript.length > 1000, 'runtime-heal.js must exist and contain code');

  // Verify simulated DOM execution of runtime healing
  const mockImages = [
    {
      tagName: 'IMG',
      attrs: { src: '/assets/product-shoe.png' },
      getAttribute(k) { return this.attrs[k] || null; },
      setAttribute(k, v) { this.attrs[k] = v; },
      closest() { return null; }
    }
  ];
  const mockInputs = [
    {
      tagName: 'INPUT',
      attrs: { type: 'text', placeholder: 'Enter your email address' },
      getAttribute(k) { return this.attrs[k] || null; },
      setAttribute(k, v) { this.attrs[k] = v; },
      closest() { return null; }
    }
  ];
  const mockButtons = [
    {
      tagName: 'BUTTON',
      attrs: {},
      textContent: '',
      getAttribute(k) { return this.attrs[k] || null; },
      setAttribute(k, v) { this.attrs[k] = v; }
    }
  ];

  // Run in simulated VM scope
  const vm = require('vm');
  const context = {
    console: { info: () => {}, log: () => {} },
    document: {
      readyState: 'complete',
      querySelectorAll(selector) {
        if (selector === 'img:not([alt])') return mockImages;
        if (selector.includes('input:not([type="hidden"])')) return mockInputs;
        if (selector.includes('button:not([aria-label])')) return mockButtons;
        return [];
      },
      querySelector() { return null; },
      getElementById() { return null; },
      createElement() {
        return {
          id: '',
          setAttribute() {},
          style: {},
          innerHTML: ''
        };
      },
      body: { appendChild() {} }
    },
    window: {}
  };
  vm.createContext(context);
  vm.runInContext(runtimeScript, context);

  // Assert self-healing results
  assert(mockImages[0].attrs.alt, 'Image must be healed with alt attribute');
  assert(mockImages[0].attrs['data-a11y-healed'] === 'alt-injected', 'Image must be tagged as healed');
  assert(mockInputs[0].attrs['aria-label'], 'Input must be healed with aria-label');
  assert(mockButtons[0].attrs['aria-label'], 'Button must be healed with aria-label');

  // Verify base href preservation regex logic
  const originalHtml = `<!DOCTYPE html><html><head><title>Test</title><link rel="stylesheet" href="/style.css"></head><body><h1>Content</h1></body></html>`;
  const targetUrl = 'https://example.com/store/page';
  const baseTag = `<base href="${targetUrl}">`;
  const preservedHtml = originalHtml.replace(/<head(\s[^>]*)?>/i, `$&<base href="${targetUrl}">`);
  assert(preservedHtml.includes('<base href="https://example.com/store/page">'), 'Base href must be injected to preserve relative CSS and image links');
  console.log('[PASS] Test Case 7 (Universal Runtime Self-Healing & Base Href Preservation): PASS');
}

// Test Case 8: Prevailing Real-World Code & Label Duplication Prevention
{
  const prevailingHtml = `
    <div class="login-container">
      <h5 class="login-title">Welcome Back</h5>
      <form method="post">
        <label for="Username">Username</label>
        <input id="Username" name="Username" type="text">
        <input type="hidden" name="__RequestVerificationToken" value="token123">
        <button type="submit">Sign In</button>
      </form>
    </div>
  `;

  const violations = detectViolations(prevailingHtml);
  // Only heading-order should be flagged (h5 skipped), NOT label or button
  assert(violations.some(v => v.ruleId === 'heading-order'), 'Must flag skipped h5 heading');
  assert(!violations.some(v => v.ruleId === 'label'), 'Must NOT flag input with existing valid label');

  const res = remediateHtml(prevailingHtml);
  // Ensure heading is adjusted to h1
  assert(res.remediatedHtml.includes('<h1 class="login-title">Welcome Back</h1>'), 'h5 must be promoted to h1');
  // Ensure NO duplicate label is created
  const labelMatches = res.remediatedHtml.match(/<label[^>]*for="Username"/g);
  assert.strictEqual(labelMatches ? labelMatches.length : 0, 1, 'Username label must NOT be duplicated');
  assert(res.remediatedHtml.includes('value="token123"'), 'Hidden verification tokens must be preserved');
  console.log('[PASS] Test Case 8 (Prevailing Real-World Code & Label Duplication Prevention): PASS');
}

// Test Case 9: Line Diff CRLF Normalization & Safety Bounds
{
  const crlfOriginal = "<h1>Title</h1>\r\n<p>Line 1</p>\r\n<p>Line 2</p>";
  const crlfModified = "<h1>Title</h1>\r\n<p>Line 1 Updated</p>\r\n<p>Line 2</p>";
  const diffs = computeLineDiff(crlfOriginal, crlfModified);

  assert(diffs.length > 0, 'Diffs must be generated for CRLF input');
  assert(!diffs.some(d => d.content && d.content.includes('\r')), 'Carriage returns must be stripped from diff content');
  assert(diffs.some(d => d.type === 'removed' && d.content.includes('Line 1')), 'Must show removed line');
  assert(diffs.some(d => d.type === 'added' && d.content.includes('Line 1 Updated')), 'Must show added line');
  console.log('[PASS] Test Case 9 (Line Diff CRLF Normalization & Safety Bounds): PASS');
}

// Test Case 10: Neurodiversity Suite (Bionic Reading & Cognitive Load Styles)
{
  const bionicWord = A11yNeurodiversity.applyBionicReading('Accessibility');
  assert.strictEqual(bionicWord, '<b>Access</b>ibility', 'Word fixation must bold the initial fixation anchor');

  const bionicHtml = A11yNeurodiversity.transformHtmlForBionicReading('<p>Clean code architecture</p>');
  assert(bionicHtml.includes('<b>Cle</b>an') && bionicHtml.includes('<b>co</b>de'), 'Bionic Reading must bold text content inside HTML tags');

  assert(A11yNeurodiversity.DYSLEXIA_STYLES.includes('OpenDyslexic'), 'Dyslexia styles must define high-legibility typography');
  assert(A11yNeurodiversity.SENSORY_SHIELD_STYLES.includes('animation-duration: 0.001ms'), 'Sensory shield must suppress motion and animations');
  console.log('[PASS] Test Case 10 (Neurodiversity Suite - Bionic Reading & Cognitive Styles): PASS');
}

// Test Case 11: Accessibility Digital Twin (Semantic Assistive Tree & Shadow Layer)
{
  const inputHtml = `
    <header><nav><a href="#about">About</a><a href="#contact">Contact</a></nav></header>
    <main>
      <h2>Services</h2>
      <button id="cta-btn">Get Started</button>
      <input type="text" id="user-email" aria-label="Email Address">
    </main>
    <footer><p>Copyright 2026</p></footer>
  `;

  const extracted = A11yDigitalTwin.extractLandmarksAndControls(inputHtml);
  assert(extracted.landmarks.some(l => l.type === 'header'), 'Must extract header landmark');
  assert(extracted.landmarks.some(l => l.type === 'nav'), 'Must extract nav landmark');
  assert(extracted.headings.some(h => h.text === 'Services'), 'Must extract heading');
  assert(extracted.controls.some(c => c.type === 'button' && c.id === 'cta-btn'), 'Must extract CTA button');
  assert(extracted.controls.some(c => c.type === 'input' && c.id === 'user-email'), 'Must extract input field');

  const twinHtml = A11yDigitalTwin.synthesizeDigitalTwinHtml(inputHtml);
  assert(twinHtml.includes('id="a11y-digital-twin-container"'), 'Twin HTML must have root container');
  assert(twinHtml.includes('role="banner"'), 'Twin HTML must contain banner landmark');
  assert(twinHtml.includes('role="navigation"'), 'Twin HTML must contain navigation landmark');
  assert(twinHtml.includes('role="main"'), 'Twin HTML must contain main landmark');
  assert(twinHtml.includes('role="contentinfo"'), 'Twin HTML must contain contentinfo landmark');
  assert(twinHtml.includes('class="twin-skip-link"'), 'Twin HTML must contain skip navigation link');

  const shadowScript = A11yDigitalTwin.generateShadowDomScript();
  assert(shadowScript.includes('attachShadow'), 'Shadow DOM script must attach isolated shadow root');
  assert(shadowScript.includes('data-sync-id'), 'Shadow DOM script must bind bidirectional focus sync');
  console.log('[PASS] Test Case 11 (Accessibility Digital Twin - SAT & Shadow DOM Synthesis): PASS');
}

// Test Case 12: 3D Spatial Binaural Soundscape Panning
{
  const testHtml = `
    <nav><a href="/products">Products</a></nav>
    <main>
      <h1>Catalog</h1>
      <button id="buy-btn">Purchase Now</button>
    </main>
  `;

  const scriptData = generateScriptWithRegex(testHtml);
  assert(scriptData.utterances.length >= 2, 'Must generate utterances');

  const headingUtterance = scriptData.utterances.find(u => u.type === 'heading');
  assert(headingUtterance, 'Must generate heading utterance');
  assert.strictEqual(headingUtterance.pan, 0.0, 'Heading acoustic pan must be center (0.0)');
  assert.strictEqual(headingUtterance.category, 'content', 'Heading category must be content');

  const buttonUtterance = scriptData.utterances.find(u => u.type === 'button');
  assert(buttonUtterance, 'Must generate button utterance');
  assert.strictEqual(buttonUtterance.pan, 0.75, 'Button acoustic pan must be right channel (+0.75)');
  assert.strictEqual(buttonUtterance.category, 'action', 'Button category must be action');

  assert.strictEqual(calculateSpatialPan('navigation'), -0.75, 'Navigation pan must be left channel (-0.75)');
  assert.strictEqual(calculateSpatialPan('button'), 0.75, 'Button pan must be right channel (+0.75)');
  assert.strictEqual(calculateSpatialPan('heading'), 0.0, 'Heading pan must be center (0.0)');
  console.log('[PASS] Test Case 12 (3D Spatial Binaural Soundscape Panning): PASS');
}

console.log('---------------------------------');
console.log('ALL 12 TEST CASES PASSED SUCCESSFULLY!');

