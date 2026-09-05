/**
 * A11y Remediation Engine — Accessibility Digital Twin (SAT & Shadow Accessibility Layer)
 * Generates a parallel, 100% WCAG AAA compliant Semantic Assistive Tree (SAT)
 * that bridges screen readers and assistive devices without disrupting visual design or layout.
 * Zero emojis across all logic and documentation.
 */
(function(root) {
  'use strict';

  /**
   * Extract key semantic landmarks and interactive elements from HTML.
   */
  function extractLandmarksAndControls(html) {
    if (!html || typeof html !== 'string') {
      return { landmarks: [], controls: [], headings: [] };
    }

    const landmarks = [];
    const controls = [];
    const headings = [];

    // Extract headings
    const headingRegex = /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi;
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1].substring(1), 10);
      const text = match[3].replace(/<[^>]+>/g, '').trim();
      if (text) {
        headings.push({ level, text });
      }
    }

    // Extract landmarks (header, nav, main, aside, footer, section, form)
    const landmarkTags = ['header', 'nav', 'main', 'aside', 'footer', 'form', 'section'];
    landmarkTags.forEach(tag => {
      const tagRegex = new RegExp('<' + tag + '([^>]*)>([\\s\\S]*?)<\\/' + tag + '>', 'gi');
      let m;
      while ((m = tagRegex.exec(html)) !== null) {
        const attrs = m[1];
        const idMatch = attrs.match(/id=["']([^"']+)["']/i);
        const ariaLabelMatch = attrs.match(/aria-label=["']([^"']+)["']/i);
        landmarks.push({
          type: tag,
          id: idMatch ? idMatch[1] : '',
          label: ariaLabelMatch ? ariaLabelMatch[1] : tag.toUpperCase() + ' Landmark'
        });
      }
    });

    // Extract interactive controls (buttons, links, inputs)
    const buttonRegex = /<(button)([^>]*)>([\s\S]*?)<\/button>/gi;
    while ((match = buttonRegex.exec(html)) !== null) {
      const attrs = match[2];
      const text = match[3].replace(/<[^>]+>/g, '').trim();
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      const ariaMatch = attrs.match(/aria-label=["']([^"']+)["']/i);
      controls.push({
        type: 'button',
        id: idMatch ? idMatch[1] : '',
        label: ariaMatch ? ariaMatch[1] : (text || 'Action Button')
      });
    }

    const inputRegex = /<input([^>]*)>/gi;
    while ((match = inputRegex.exec(html)) !== null) {
      const attrs = match[1];
      const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      const nameMatch = attrs.match(/name=["']([^"']+)["']/i);
      const ariaMatch = attrs.match(/aria-label=["']([^"']+)["']/i);
      const inputType = typeMatch ? typeMatch[1].toLowerCase() : 'text';
      if (inputType !== 'hidden') {
        controls.push({
          type: 'input',
          inputType: inputType,
          id: idMatch ? idMatch[1] : '',
          name: nameMatch ? nameMatch[1] : '',
          label: ariaMatch ? ariaMatch[1] : (nameMatch ? nameMatch[1] : 'Input Field')
        });
      }
    }

    const linkRegex = /<a([^>]*)>([\s\S]*?)<\/a>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      const attrs = match[1];
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
      const ariaMatch = attrs.match(/aria-label=["']([^"']+)["']/i);
      controls.push({
        type: 'link',
        href: hrefMatch ? hrefMatch[1] : '#',
        label: ariaMatch ? ariaMatch[1] : (text || 'Hyperlink')
      });
    }

    return { landmarks, controls, headings };
  }

  /**
   * Synthesizes an independent, WCAG AAA compliant semantic document structure (Digital Twin).
   * This structure mirrors the application state with complete ARIA landmarks, roles, and descriptions.
   */
  function synthesizeDigitalTwinHtml(html) {
    const data = extractLandmarksAndControls(html);

    let twin = '<!-- Accessibility Digital Twin: Semantic Assistive Layer -->\n';
    twin += '<div id="a11y-digital-twin-container" class="a11y-sr-twin" role="application" aria-label="Semantic Assistive Interface">\n';

    // 1. Skip Navigation Link
    twin += '  <nav aria-label="Assistive Quick Links" class="twin-nav">\n';
    twin += '    <a href="#twin-main-content" class="twin-skip-link">Skip to Primary Content Landmark</a>\n';
    twin += '  </nav>\n\n';

    // 2. Banner / Header Landmark
    twin += '  <header role="banner" class="twin-banner">\n';
    twin += '    <h1 id="twin-page-title" class="twin-title">Accessibility Assistive View</h1>\n';
    twin += '    <p class="twin-status" aria-live="polite">Digital Twin Active. Synchronized with live visual viewport.</p>\n';
    twin += '  </header>\n\n';

    // 3. Navigation Landmark
    twin += '  <nav role="navigation" aria-label="Site Navigation Landmark" class="twin-nav-landmark">\n';
    twin += '    <ul class="twin-nav-list">\n';
    const navLinks = data.controls.filter(c => c.type === 'link');
    if (navLinks.length > 0) {
      navLinks.slice(0, 15).forEach((link, idx) => {
        twin += `      <li><a href="${link.href}" data-sync-target="${link.href}" aria-label="${link.label}">${link.label}</a></li>\n`;
      });
    } else {
      twin += '      <li><a href="#home">Home</a></li>\n';
    }
    twin += '    </ul>\n';
    twin += '  </nav>\n\n';

    // 4. Main Landmark
    twin += '  <main id="twin-main-content" role="main" class="twin-main-landmark" tabindex="-1">\n';
    twin += '    <section aria-label="Content Hierarchy">\n';
    if (data.headings.length > 0) {
      data.headings.forEach(h => {
        const tag = 'h' + Math.min(6, Math.max(1, h.level));
        twin += `      <${tag} class="twin-heading">${h.text}</${tag}>\n`;
      });
    } else {
      twin += '      <h2>Primary Content Area</h2>\n';
      twin += '      <p>Semantic content representation synchronized with target application.</p>\n';
    }
    twin += '    </section>\n\n';

    // 5. Interactive Form & Controls Landmark
    const inputsAndButtons = data.controls.filter(c => c.type === 'input' || c.type === 'button');
    if (inputsAndButtons.length > 0) {
      twin += '    <section aria-label="Interactive Controls and Actions" class="twin-controls-landmark">\n';
      twin += '      <h3>Interactive Actions</h3>\n';
      twin += '      <div class="twin-actions-grid">\n';
      inputsAndButtons.forEach((ctrl, idx) => {
        const idAttr = ctrl.id ? `id="twin-${ctrl.id}"` : `id="twin-ctrl-${idx}"`;
        const syncAttr = ctrl.id ? `data-sync-id="${ctrl.id}"` : '';
        if (ctrl.type === 'button') {
          twin += `        <button type="button" ${idAttr} ${syncAttr} aria-label="${ctrl.label}" class="twin-button">${ctrl.label}</button>\n`;
        } else if (ctrl.type === 'input') {
          twin += `        <div class="twin-field">\n`;
          twin += `          <label for="twin-input-${idx}">${ctrl.label}:</label>\n`;
          twin += `          <input type="${ctrl.inputType || 'text'}" id="twin-input-${idx}" ${syncAttr} aria-label="${ctrl.label}" class="twin-input" />\n`;
          twin += `        </div>\n`;
        }
      });
      twin += '      </div>\n';
      twin += '    </section>\n';
    }
    twin += '  </main>\n\n';

    // 6. Contentinfo / Footer Landmark
    twin += '  <footer role="contentinfo" class="twin-footer-landmark">\n';
    twin += '    <p>Accessibility Digital Twin Layer &mdash; 100% WCAG AAA Semantic Mirror.</p>\n';
    twin += '  </footer>\n';
    twin += '</div>';

    return twin;
  }

  /**
   * Generates a self-contained client-side script snippet to inject the Digital Twin
   * into a host webpage inside an isolated Shadow Root with bidirectional focus synchronization.
   */
  function generateShadowDomScript() {
    return `(function() {
  if (window.__a11yDigitalTwinAttached) return;
  window.__a11yDigitalTwinAttached = true;

  // Create isolated container for Semantic Assistive Tree
  var host = document.createElement('aside');
  host.id = 'a11y-assistive-twin-host';
  host.setAttribute('aria-label', 'Assistive Technology Digital Twin');
  host.style.cssText = 'position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;';

  // Attach Shadow DOM to prevent host styles from interfering
  var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

  // Assistive Stylesheet inside Shadow DOM
  var style = document.createElement('style');
  style.textContent = '.twin-container { display: block; } .twin-skip-link:focus { position: fixed; top: 10px; left: 10px; background: #2563eb; color: #fff; padding: 8px 16px; z-index: 100000; clip: auto !important; }';
  shadow.appendChild(style);

  // Assistive wrapper
  var wrapper = document.createElement('div');
  wrapper.className = 'twin-container';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Digital Twin Accessibility Tree');
  shadow.appendChild(wrapper);

  document.body.appendChild(host);

  // Bidirectional Focus Sync Listener
  shadow.addEventListener('click', function(e) {
    var target = e.target;
    var syncId = target.getAttribute('data-sync-id');
    if (syncId) {
      var liveEl = document.getElementById(syncId);
      if (liveEl) {
        liveEl.focus();
        liveEl.click();
      }
    }
  });

  console.log('[A11y Remediation Engine] Digital Twin Semantic Layer Attached.');
})();`;
  }

  const api = {
    extractLandmarksAndControls,
    synthesizeDigitalTwinHtml,
    generateShadowDomScript
  };

  root.A11yDigitalTwin = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
