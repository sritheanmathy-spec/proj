/**
 * A11y Remediation Engine — WCAG Target Size & Contrast Density HUD Radar
 * Evaluates touch target boundaries (WCAG 2.5.5 AAA / 2.5.8 AA Target Size)
 * and projects calculated luminance contrast ratios directly onto DOM elements.
 * Zero emojis across all logic and documentation.
 */
(function(root) {
  'use strict';

  /**
   * Parse RGB/Hex color string to RGB object
   */
  function parseColor(colorStr) {
    if (!colorStr) return { r: 0, g: 0, b: 0 };
    if (colorStr.startsWith('#')) {
      let hex = colorStr.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const num = parseInt(hex, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
    }
    return { r: 0, g: 0, b: 0 };
  }

  function getLuminance(rgb) {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function calculateContrastRatio(fgColor, bgColor) {
    const l1 = getLuminance(parseColor(fgColor));
    const l2 = getLuminance(parseColor(bgColor));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  }

  /**
   * Analyze touch target compliance for an element.
   * Compliant: >= 44x44px (WCAG AAA 2.5.5)
   * Minimum: >= 24x24px (WCAG AA 2.5.8)
   * Undersized: < 24x24px (Fail)
   */
  function evaluateTargetSize(width, height) {
    const minDim = Math.min(width, height);
    if (minDim >= 44) {
      return { status: 'pass', rating: 'Compliant', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', border: '#059669' };
    } else if (minDim >= 24) {
      return { status: 'warning', rating: 'Minimum AA', color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', border: '#d97706' };
    } else {
      return { status: 'fail', rating: 'Undersized', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: '#dc2626' };
    }
  }

  /**
   * Attach HUD overlay into target document (e.g. preview iframe)
   */
  function attachHud(doc) {
    if (!doc || !doc.body) return;
    removeHud(doc);

    const hudContainer = doc.createElement('div');
    hudContainer.id = 'a11y-hud-radar-root';
    hudContainer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999990; font-family: monospace;';

    // 1. Evaluate interactive targets (buttons, links, inputs)
    const targets = doc.querySelectorAll('button, a, input:not([type="hidden"]), select, textarea');
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const evalResult = evaluateTargetSize(rect.width, rect.height);

      const box = doc.createElement('div');
      box.className = 'a11y-hud-target-box';
      box.style.cssText = `
        position: absolute;
        left: ${rect.left + doc.defaultView.scrollX}px;
        top: ${rect.top + doc.defaultView.scrollY}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 2px dashed ${evalResult.border};
        background: ${evalResult.bg};
        box-sizing: border-box;
      `;

      const badge = doc.createElement('span');
      badge.className = 'a11y-hud-badge';
      badge.style.cssText = `
        position: absolute;
        top: -16px;
        left: 0;
        background: #0f172a;
        color: #ffffff;
        font-size: 9px;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 2px;
        white-space: nowrap;
        line-height: 12px;
        border: 1px solid ${evalResult.border};
      `;
      badge.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)} [${evalResult.rating.toUpperCase()}]`;

      box.appendChild(badge);
      hudContainer.appendChild(box);
    });

    // 2. Evaluate text contrast badges on headings & paragraphs
    const textEls = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
    textEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || !el.textContent.trim()) return;

      const style = doc.defaultView.getComputedStyle(el);
      const fg = style.color || '#000000';
      const bg = style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor;
      const ratio = calculateContrastRatio(fg, bg);

      const isPass = ratio >= 4.5;
      const badge = doc.createElement('div');
      badge.className = 'a11y-hud-contrast-badge';
      badge.style.cssText = `
        position: absolute;
        left: ${rect.left + doc.defaultView.scrollX + rect.width - 70}px;
        top: ${rect.top + doc.defaultView.scrollY - 10}px;
        background: ${isPass ? '#059669' : '#dc2626'};
        color: #ffffff;
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 3px;
        white-space: nowrap;
        line-height: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      `;
      badge.textContent = `${ratio}:1 [${isPass ? 'PASS AA' : 'FAIL'}]`;
      hudContainer.appendChild(badge);
    });

    doc.body.appendChild(hudContainer);
  }

  function removeHud(doc) {
    if (!doc) return;
    const existing = doc.getElementById('a11y-hud-radar-root');
    if (existing) existing.remove();
  }

  const api = {
    calculateContrastRatio,
    evaluateTargetSize,
    attachHud,
    removeHud
  };

  root.A11yHudRadar = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
