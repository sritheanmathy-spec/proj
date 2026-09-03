/**
 * A11y Remediation Engine — Detector
 * Detects WCAG 2.1 AA accessibility violations in HTML snippets or full documents.
 */

function parseColor(str) {
  if (!str) return null;
  str = str.trim().toLowerCase();
  
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
  }

  const rgbMatch = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }

  const names = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
    red: { r: 255, g: 0, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    green: { r: 0, g: 128, b: 0 }
  };
  return names[str] || null;
}

function getLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(fgRgb, bgRgb) {
  const lum1 = getLuminance(fgRgb);
  const lum2 = getLuminance(bgRgb);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseInlineStyle(styleStr) {
  const styles = {};
  if (!styleStr) return styles;
  styleStr.split(';').forEach(rule => {
    const parts = rule.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim().toLowerCase();
      const val = parts.slice(1).join(':').trim().toLowerCase();
      if (key && val) styles[key] = val;
    }
  });
  return styles;
}

function detectViolations(html) {
  const violations = [];
  let violationId = 1;

  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Heading Hierarchy Check
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let prevLevel = 0;
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1), 10);
      if (prevLevel > 0 && currentLevel > prevLevel + 1) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'heading-order',
          wcag: 'WCAG 1.3.1 Info and Relationships (Level A)',
          impact: 'moderate',
          selector: heading.tagName.toLowerCase(),
          elementHtml: heading.outerHTML,
          description: `Heading level skipped: jumps from <h${prevLevel}> directly to <h${currentLevel}>. Should be <h${prevLevel + 1}>.`,
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: `Change <h${currentLevel}> to <h${prevLevel + 1}> to maintain semantic document outline.`,
          data: {
            currentLevel,
            expectedLevel: prevLevel + 1,
            text: heading.textContent.trim()
          }
        });
      }
      prevLevel = currentLevel;
    });

    // 2. Image Alt Text Check
    const images = Array.from(doc.querySelectorAll('img'));
    images.forEach(img => {
      const hasAlt = img.hasAttribute('alt');
      const altVal = img.getAttribute('alt');
      if (!hasAlt || (hasAlt && altVal.trim() === '' && !img.hasAttribute('aria-hidden') && img.getAttribute('role') !== 'presentation')) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'image-alt',
          wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
          impact: 'critical',
          selector: 'img',
          elementHtml: img.outerHTML,
          description: 'Image is missing alternative text (alt attribute). Screen readers cannot convey image purpose.',
          category: 'ai_interpretation',
          engine: 'AI / LLM Semantic Model',
          recommendation: 'Use contextual AI/LLM to generate meaningful alt text based on context and surrounding headings.',
          data: {
            src: img.getAttribute('src') || '',
            parentTag: img.parentElement ? img.parentElement.tagName.toLowerCase() : 'body'
          }
        });
      }
    });

    // 3. Form Input Label Check
    const inputs = Array.from(doc.querySelectorAll('input, select, textarea'));
    inputs.forEach(input => {
      const type = (input.getAttribute('type') || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset'].includes(type)) return;

      const id = input.getAttribute('id');
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      const wrappingLabel = input.closest('label');
      const linkedLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;

      if (!hasAriaLabel && !wrappingLabel && !linkedLabel) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'label',
          wcag: 'WCAG 1.3.1 & 4.1.2 Name, Role, Value (Level A)',
          impact: 'critical',
          selector: input.tagName.toLowerCase() + (id ? '#' + id : ''),
          elementHtml: input.outerHTML,
          description: `Form <${input.tagName.toLowerCase()}> has no associated <label> or aria-label.`,
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: 'Add a linked <label for="..."> element with an explicit id.',
          data: {
            tag: input.tagName.toLowerCase(),
            type,
            id: id || null,
            name: input.getAttribute('name') || null,
            placeholder: input.getAttribute('placeholder') || null
          }
        });
      }
    });

    // 4. Color Contrast Check (Inline styles)
    const styledEls = Array.from(doc.querySelectorAll('[style]'));
    styledEls.forEach(el => {
      const styles = parseInlineStyle(el.getAttribute('style'));
      if (styles.color && (styles['background-color'] || styles.background)) {
        const fg = parseColor(styles.color);
        const bg = parseColor(styles['background-color'] || styles.background);
        if (fg && bg) {
          const ratio = getContrastRatio(fg, bg);
          if (ratio < 4.5) {
            violations.push({
              id: 'V-' + (violationId++),
              ruleId: 'color-contrast',
              wcag: 'WCAG 1.4.3 Contrast (Minimum) (Level AA)',
              impact: 'serious',
              selector: el.tagName.toLowerCase(),
              elementHtml: el.outerHTML,
              description: `Insufficient text contrast ratio: ${ratio.toFixed(2)}:1 (Expected >= 4.5:1 for normal text).`,
              category: 'deterministic',
              engine: 'Deterministic Math',
              recommendation: 'Mathematically adjust foreground hex color to satisfy 4.5:1 ratio against background.',
              data: {
                fgHex: styles.color,
                bgHex: styles['background-color'] || styles.background,
                ratio: parseFloat(ratio.toFixed(2))
              }
            });
          }
        }
      }
    });

    // 5. Button Without Name / Text
    const buttons = Array.from(doc.querySelectorAll('button'));
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      const hasAria = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby') || btn.hasAttribute('title');
      if (!text && !hasAria && btn.children.length === 0) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'button-name',
          wcag: 'WCAG 4.1.2 Name, Role, Value (Level A)',
          impact: 'critical',
          selector: 'button',
          elementHtml: btn.outerHTML,
          description: 'Button element has no accessible text or aria-label.',
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: 'Provide discernible text content or aria-label for button.',
          data: {}
        });
      }
    });

    return violations;
  }

  // Node.js fallback
  return detectWithRegex(html);
}

function detectWithRegex(html) {
  const violations = [];
  let violationId = 1;

  // 1. Heading jumps
  const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi;
  let match;
  let prevLevel = 0;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[3].replace(/<[^>]+>/g, '').trim();
    if (prevLevel > 0 && level > prevLevel + 1) {
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'heading-order',
        wcag: 'WCAG 1.3.1 Info and Relationships (Level A)',
        impact: 'moderate',
        selector: 'h' + level,
        elementHtml: match[0],
        description: `Heading level skipped: jumps from <h${prevLevel}> directly to <h${level}>. Should be <h${prevLevel + 1}>.`,
        category: 'deterministic',
        engine: 'Deterministic Logic',
        recommendation: `Change <h${level}> to <h${prevLevel + 1}> to maintain semantic document outline.`,
        data: { currentLevel: level, expectedLevel: prevLevel + 1, text }
      });
    }
    prevLevel = level;
  }

  // 2. Images missing alt
  const imgRegex = /<img(?:\s+[^>]*?)?>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    const hasAlt = /alt\s*=\s*(["']).*?\1/i.test(tag);
    if (!hasAlt) {
      const srcMatch = /src\s*=\s*(["'])(.*?)\1/i.exec(tag);
      const src = srcMatch ? srcMatch[2] : '';
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'image-alt',
        wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
        impact: 'critical',
        selector: 'img',
        elementHtml: tag,
        description: 'Image is missing alternative text (alt attribute). Screen readers cannot convey image purpose.',
        category: 'ai_interpretation',
        engine: 'AI / LLM Semantic Model',
        recommendation: 'Use contextual AI/LLM to generate descriptive alt text based on context and surrounding headings.',
        data: { src }
      });
    }
  }

  // 3. Inputs missing label
  const inputRegex = /<input(?:\s+[^>]*?)?>/gi;
  while ((match = inputRegex.exec(html)) !== null) {
    const tag = match[0];
    const typeMatch = /type\s*=\s*(["'])(.*?)\1/i.exec(tag);
    const type = typeMatch ? typeMatch[2].toLowerCase() : 'text';
    if (['hidden', 'submit', 'button', 'reset'].includes(type)) continue;

    const idMatch = /id\s*=\s*(["'])(.*?)\1/i.exec(tag);
    const id = idMatch ? idMatch[2] : null;
    const hasAria = /aria-label|aria-labelledby/i.test(tag);

    let hasLinkedLabel = false;
    if (id) {
      const labelRegex = new RegExp('<label[^>]*for=["\']' + id + '["\']', 'i');
      hasLinkedLabel = labelRegex.test(html);
    }

    if (!hasAria && !hasLinkedLabel) {
      const nameMatch = /name\s*=\s*(["'])(.*?)\1/i.exec(tag);
      const placeholderMatch = /placeholder\s*=\s*(["'])(.*?)\1/i.exec(tag);
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'label',
        wcag: 'WCAG 1.3.1 & 4.1.2 Name, Role, Value (Level A)',
        impact: 'critical',
        selector: 'input' + (id ? '#' + id : ''),
        elementHtml: tag,
        description: 'Form <input> has no associated <label> or aria-label.',
        category: 'deterministic',
        engine: 'Deterministic Logic',
        recommendation: 'Add a linked <label for="..."> element with an explicit input id.',
        data: {
          tag: 'input',
          type,
          id,
          name: nameMatch ? nameMatch[2] : null,
          placeholder: placeholderMatch ? placeholderMatch[2] : null
        }
      });
    }
  }

  // 4. Color Contrast
  const styleRegex = /style\s*=\s*(["'])(.*?)\1/gi;
  while ((match = styleRegex.exec(html)) !== null) {
    const styleStr = match[2];
    const styles = parseInlineStyle(styleStr);
    if (styles.color && (styles['background-color'] || styles.background)) {
      const fg = parseColor(styles.color);
      const bg = parseColor(styles['background-color'] || styles.background);
      if (fg && bg) {
        const ratio = getContrastRatio(fg, bg);
        if (ratio < 4.5) {
          violations.push({
            id: 'V-' + (violationId++),
            ruleId: 'color-contrast',
            wcag: 'WCAG 1.4.3 Contrast (Minimum) (Level AA)',
            impact: 'serious',
            selector: 'styled-element',
            elementHtml: match[0],
            description: `Insufficient text contrast ratio: ${ratio.toFixed(2)}:1 (Expected >= 4.5:1 for normal text).`,
            category: 'deterministic',
            engine: 'Deterministic Math',
            recommendation: 'Mathematically adjust foreground hex color to satisfy 4.5:1 ratio against background.',
            data: {
              fgHex: styles.color,
              bgHex: styles['background-color'] || styles.background,
              ratio: parseFloat(ratio.toFixed(2))
            }
          });
        }
      }
    }
  }

  return violations;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectViolations,
    detectWithRegex,
    parseColor,
    getLuminance,
    getContrastRatio,
    parseInlineStyle
  };
}
if (typeof window !== 'undefined') {
  window.A11yDetector = {
    detectViolations,
    detectWithRegex,
    parseColor,
    getLuminance,
    getContrastRatio,
    parseInlineStyle
  };
}
