/**
 * A11y Remediation Engine — Neurodiversity & Cognitive Load Suite
 * Features:
 * 1. Bionic Reading Transformer (ADHD/Fixation Anchor Bolding)
 * 2. Dyslexia Typography & Spacing Optimization
 * 3. Reading Focus Ruler (Eye Tracking Guide)
 * 4. Sensory Overload Shield (Motion & Clutter Suppressor)
 * Zero emojis across all logic and documentation.
 */
(function(root) {
  'use strict';

  // 1. Bionic Reading Word Fixation Algorithm
  function applyBionicReading(text) {
    if (!text) return '';
    return text.replace(/\b([a-zA-Z0-9]+)\b/g, (match, word) => {
      if (word.length <= 1) return match;
      const midpoint = word.length <= 3 ? 1 : Math.ceil(word.length * 0.45);
      const boldPart = word.substring(0, midpoint);
      const rest = word.substring(midpoint);
      return '<b>' + boldPart + '</b>' + rest;
    });
  }

  function transformHtmlForBionicReading(html) {
    if (!html) return '';
    return html.replace(/(>)([^<<]+)(<)/g, (match, open, text, close) => {
      const trimmed = text.trim();
      if (!trimmed || text.includes('{}') || text.includes('{') || text.includes('function')) {
        return match;
      }
      return open + applyBionicReading(text) + close;
    });
  }

  // 2. Duslexia & Sensory Overload CSS Rules
  const DYSLEXIA_STYLES = `
    /* Dyslexia Typography & Spacing Optimization */
    body, p, h1, h2, h3, h4, h5, h6, li, span, a, label, button, input {
      font-family: 'Comic Sans MS', 'OpenDyslexic', 'Verdana', sans-serif !important;
      letter-spacing: 0.08em !important;
      word-spacing: 0.16em !important;
      line-height: 1.85 !important;
    }
    p, li {
      margin-bottom: 1.25em !important;
      max-width: 68ch !important;
    }
    body {
      background-color: #fdfbf7 !important;
      color: #1e293b !important;
    }
  `;

  const SENSORY_SHIELD_STYLES = `
    /* Sensory Overload Shield: Suppress motion and high frequency animations */
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
    marquee, blink {
      display: none !important;
    }
    video[autoplay], audio[autoplay] {
      display: none !important;
    }
  `;

  const FOCUS_RULER_STYLES = `
    /* Reading Focus Ruler Overlay */
    #a11y-focus-ruler-overlay-top, #a11y-focus-ruler-overlay-bottom {
      position: fixed !important;
      left: 0 !important;
      width: 100vw !important;
      background: rgba(15, 23, 42, 0.45) !important;
      pointer-events: none !important;
      z-index: 999998 !important;
      transition: top 0.05s linear, height 0.05s linear !important;
    }
    #a11y-focus-ruler-band {
      position: fixed !important;
      left: 0 !important;
      width: 100vw !important;
      height: 38px !important;
      background: rgba(254, 240, 138, 0.18) !important;
      border-top: 2px solid #2563eb !important;
      border-bottom: 2px solid #2563eb !important;
      pointer-events: none !important;
      z-index: 999999 !important;
      transition: top 0.05s linear !important;
      box-shadow: 0 0 15px rgba(37, 99, 235, 0.2) !important;
    }
  `;

  // Helper: Inject or toggle neurodiversity modes in target document
  function toggleBionicReading(doc, enable) {
    if (!doc || !doc.body) return;
    const existing = doc.getElementById('a11y-bionic-root');
    if (enable) {
      if (!existing) {
        doc.body.setAttribute('data-original-html', doc.body.innerHTML);
        doc.body.innerHTML = transformHtmlForBionicReading(doc.body.innerHTML);
        const marker = doc.createElement('div');
        marker.id = 'a11y-bionic-root';
        marker.style.display = 'none';
        doc.body.appendChild(marker);
      }
    } else {
      if (existing) {
        const orig = doc.body.getAttribute('data-original-html');
        if (orig) doc.body.innerHTML = orig;
        existing.remove();
      }
    }
  }

  function toggleDyslexiaTypography(doc, enable) {
    if (!doc || !doc.head) return;
    const existing = doc.getElementById('a11y-dyslexia-styles');
    if (enable && !existing) {
      const style = doc.createElement('style');
      style.id = 'a11y-dyslexia-styles';
      style.textContent = DYSLEXIA_STYLES;
      doc.head.appendChild(style);
    } else if (!enable && existing) {
      existing.remove();
    }
  }

  function toggleSensoryShield(doc, enable) {
    if (!doc || !doc.head) return;
    const existing = doc.getElementById('a11y-sensory-styles');
    if (enable && !existing) {
      const style = doc.createElement('style');
      style.id = 'a11y-sensory-styles';
      style.textContent = SENSORY_SHIELD_STYLES;
      doc.head.appendChild(style);
    } else if (!enable && existing) {
      existing.remove();
    }
  }

  function toggleFocusRuler(doc, enable) {
    if (!doc || !doc.body) return ;
    const existingBand = doc.getElementById('a11y-focus-ruler-band');
    const existingTop = doc.getElementById('a11y-focus-ruler-overlay-top');
    const existingBottom = doc.getElementById('a11y-focus-ruler-overlay-bottom');

    if (enable) {
      if (!existingBand) {
        let style = doc.getElementById('a11y-ruler-styles');
        if (!style) {
          style = doc.createElement('style');
          style.id = 'a11y-ruler-styles';
          style.textContent = FOCUS_RULER_STYLES;
          doc.head.appendChild(style);
        }

        const top = doc.createElement('div');
        top.id = 'a11y-focus-ruler-overlay-top';
        top.style.top = '0';
        top.style.height = '150px';

        const band = doc.createElement('div');
        band.id = 'a11y-focus-ruler-band';
        band.style.top = '150px';

        const bottom = doc.createElement('div');
        bottom.id = 'a11y-focus-ruler-overlay-bottom';
        bottom.style.top = '188px';
        bottom.style.height = '100vh';

        doc.body.appendChild(top);
        doc.body.appendChild(band);
        doc.body.appendChild(bottom);

        doc.onmousemove = function(e) {
          const y = e.clientY;
          const bandHeight = 38;
          top.style.height = Math.max(0, y - bandHeight / 2) + 'px';
          band.style.top = (y - bandHeight / 2) + 'px';
          bottom.style.top = (y + bandHeight / 2) + 'px';
        };
      }
    } else {
      existingBand?.remove();
      existingTop?.remove();
      existingBottom?.remove();
      doc.getElementById('a11y-ruler-styles')?.remove();
      doc.onmousemove = null;
    }
  }


  const api = {
    applyBionicReading,
    transformHtmlForBionicReading,
    toggleBionicReading,
    toggleDyslexiaTypography,
    toggleSensoryShield,
    toggleFocusRuler,
    DYSLEXIA_STYLES,
    SENSORY_SHIELD_STYLES,
    FOCUS_RULER_STYLES
  };


  root.A11yNeurodiversity = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);