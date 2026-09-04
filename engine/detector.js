/**
 * A11y Remediation Engine — Universal Detector
 * Detects WCAG 2.1 AA accessibility violations across any arbitrary HTML.
 */

function parseColor(str) {
  if (!str) return null;
  str = str.trim().toLowerCase();
  
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
  }

  const rgbMatch = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
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
    lightgray: { r: 211, g: 211, b: 211 },
    darkgray: { r: 169, g: 169, b: 169 },
    red: { r: 255, g: 0, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    green: { r: 0, g: 128, b: 0 },
    yellow: { r: 255, g: 255, b: 0 }
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

function findInheritedBackground(el) {
  let curr = el;
  while (curr && curr !== document.documentElement) {
    const s = parseInlineStyle(curr.getAttribute ? curr.getAttribute('style') : '');
    const bg = s['background-color'] || s.background;
    if (bg) {
      const parsed = parseColor(bg);
      if (parsed) return parsed;
    }
    curr = curr.parentElement;
  }
  return { r: 255, g: 255, b: 255 }; // Default browser white background
}

/**
 * Universal Detector
 */
function detectViolations(html) {
  const violations = [];
  let violationId = 1;

  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Heading Hierarchy Check
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let prevLevel = 0;
    headings.forEach((heading, idx) => {
      const currentLevel = parseInt(heading.tagName.substring(1), 10);
      
      // Check skipped level from previous heading
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
          data: { currentLevel, expectedLevel: prevLevel + 1, text: heading.textContent.trim() }
        });
      } else if (prevLevel === 0 && currentLevel > 1) {
        // First heading in document starts lower than h1
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'heading-order',
          wcag: 'WCAG 1.3.1 Info and Relationships (Level A)',
          impact: 'moderate',
          selector: heading.tagName.toLowerCase(),
          elementHtml: heading.outerHTML,
          description: `First heading in document is <h${currentLevel}>. Main headings should start at <h1> or <h2>.`,
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: `Promote initial heading <h${currentLevel}> to <h1> or <h2>.`,
          data: { currentLevel, expectedLevel: 1, text: heading.textContent.trim() }
        });
      }
      prevLevel = currentLevel;
    });

    // 2. Image Alt Text Check (missing alt or empty alt without decorative role)
    const images = Array.from(doc.querySelectorAll('img'));
    images.forEach(img => {
      const hasAlt = img.hasAttribute('alt');
      const altVal = img.getAttribute('alt');
      const isDecorative = img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true';

      if (!hasAlt || (!isDecorative && altVal !== null && altVal.trim() === '')) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'image-alt',
          wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
          impact: 'critical',
          selector: 'img',
          elementHtml: img.outerHTML,
          description: hasAlt ? 'Image has empty alt attribute on non-decorative graphic.' : 'Image is missing alternative text (alt attribute).',
          category: 'ai_interpretation',
          engine: 'AI / LLM Semantic Model',
          recommendation: 'Use contextual AI to synthesize a descriptive alt attribute based on context.',
          data: { src: img.getAttribute('src') || 'image' }
        });
      }
    });

    // 3. Form Input/Select/Textarea Label Check
    const formControls = Array.from(doc.querySelectorAll('input, select, textarea'));
    formControls.forEach(control => {
      const tag = control.tagName.toLowerCase();
      const type = (control.getAttribute('type') || 'text').toLowerCase();
      if (tag === 'input' && ['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return;

      const id = control.getAttribute('id');
      const hasAria = control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby') || control.hasAttribute('title');
      const wrappingLabel = control.closest('label');
      const linkedLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;

      if (!hasAria && !wrappingLabel && !linkedLabel) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'label',
          wcag: 'WCAG 1.3.1 & 4.1.2 Name, Role, Value (Level A)',
          impact: 'critical',
          selector: `${tag}${id ? '#' + id : ''}`,
          elementHtml: control.outerHTML,
          description: `Form <${tag}> has no associated <label> or aria-label.`,
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: `Add a linked <label for="..."> or aria-label with a descriptive name.`,
          data: {
            tag,
            type,
            id: id || null,
            name: control.getAttribute('name') || null,
            placeholder: control.getAttribute('placeholder') || null
          }
        });
      }
    });

    // 4. Button Accessible Name Check
    const buttons = Array.from(doc.querySelectorAll('button'));
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      const hasAria = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby') || btn.hasAttribute('title');
      if (!text && !hasAria) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'button-name',
          wcag: 'WCAG 4.1.2 Name, Role, Value (Level A)',
          impact: 'critical',
          selector: 'button',
          elementHtml: btn.outerHTML,
          description: 'Button has no accessible text or aria-label.',
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: 'Provide discernible text content or aria-label for button.',
          data: {}
        });
      }
    });

    // 5. Link Accessible Name Check (empty <a> or only icon)
    const links = Array.from(doc.querySelectorAll('a[href]'));
    links.forEach(a => {
      const text = a.textContent.trim();
      const hasAria = a.hasAttribute('aria-label') || a.hasAttribute('aria-labelledby') || a.hasAttribute('title');
      const imgWithAlt = a.querySelector('img[alt]');
      if (!text && !hasAria && !imgWithAlt) {
        violations.push({
          id: 'V-' + (violationId++),
          ruleId: 'link-name',
          wcag: 'WCAG 2.4.4 & 4.1.2 Name, Role, Value (Level A)',
          impact: 'serious',
          selector: 'a',
          elementHtml: a.outerHTML,
          description: 'Link element has no discernible text or accessible label.',
          category: 'deterministic',
          engine: 'Deterministic Logic',
          recommendation: 'Add discernible text or aria-label describing the link destination.',
          data: { href: a.getAttribute('href') || '#' }
        });
      }
    });

    // 6. Color Contrast Check (with inherited background)
    const styledEls = Array.from(doc.querySelectorAll('[style]'));
    styledEls.forEach(el => {
      const styles = parseInlineStyle(el.getAttribute('style'));
      if (styles.color) {
        const fg = parseColor(styles.color);
        const bg = (styles['background-color'] || styles.background) ? parseColor(styles['background-color'] || styles.background) : findInheritedBackground(el);
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
              description: `Insufficient text contrast: ${ratio.toFixed(2)}:1 (Expected >= 4.5:1 for normal text).`,
              category: 'deterministic',
              engine: 'Deterministic Math',
              recommendation: 'Mathematically adjust foreground luminance to satisfy 4.5:1 ratio.',
              data: {
                fgHex: styles.color,
                ratio: parseFloat(ratio.toFixed(2))
              }
            });
          }
        }
      }
    });

    return violations;
  }

  // Node.js Regex Fallback
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
        recommendation: `Change <h${level}> to <h${prevLevel + 1}>.`,
        data: { currentLevel: level, expectedLevel: prevLevel + 1, text }
      });
    } else if (prevLevel === 0 && level > 1) {
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'heading-order',
        wcag: 'WCAG 1.3.1 Info and Relationships (Level A)',
        impact: 'moderate',
        selector: 'h' + level,
        elementHtml: match[0],
        description: `First heading in document is <h${level}>. Main headings should start at <h1> or <h2>.`,
        category: 'deterministic',
        engine: 'Deterministic Logic',
        recommendation: `Promote initial heading <h${level}> to <h1> or <h2>.`,
        data: { currentLevel: level, expectedLevel: 1, text }
      });
    }
    prevLevel = level;
  }

  // 2. Images missing alt or empty alt
  const imgRegex = /<img(?:\s+[^>]*?)?>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    const hasAlt = /alt\s*=\s*(["'])(.*?)\1/i.exec(tag);
    const isDecorative = /role\s*=\s*["']presentation["']|aria-hidden\s*=\s*["']true["']/i.test(tag);
    if (!hasAlt || (!isDecorative && hasAlt && hasAlt[2].trim() === '')) {
      const srcMatch = /src\s*=\s*(["'])(.*?)\1/i.exec(tag);
      const src = srcMatch ? srcMatch[2] : 'image';
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'image-alt',
        wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
        impact: 'critical',
        selector: 'img',
        elementHtml: tag,
        description: hasAlt ? 'Image has empty alt attribute.' : 'Image is missing alternative text (alt attribute).',
        category: 'ai_interpretation',
        engine: 'AI / LLM Semantic Model',
        recommendation: 'Use contextual AI to generate descriptive alt text.',
        data: { src }
      });
    }
  }

  // 3. Inputs, selects, textareas missing label
  const formControlRegex = /<(input|select|textarea)(?:\s+[^>]*?)?(?:\/>|>)/gi;
  while ((match = formControlRegex.exec(html)) !== null) {
    const tagFull = match[0];
    const tagName = match[1].toLowerCase();
    const typeMatch = /type\s*=\s*(["'])(.*?)\1/i.exec(tagFull);
    const type = typeMatch ? typeMatch[2].toLowerCase() : 'text';
    if (tagName === 'input' && ['hidden', 'submit', 'button', 'reset'].includes(type)) continue;

    const idMatch = /id\s*=\s*(["'])(.*?)\1/i.exec(tagFull);
    const id = idMatch ? idMatch[2] : null;
    const hasAria = /aria-label|aria-labelledby|title/i.test(tagFull);

    let hasLinkedLabel = false;
    if (id) {
      const labelRegex = new RegExp('<label[^>]*for=["\']' + id + '["\']', 'i');
      hasLinkedLabel = labelRegex.test(html);
    }

    if (!hasAria && !hasLinkedLabel) {
      const nameMatch = /name\s*=\s*(["'])(.*?)\1/i.exec(tagFull);
      const placeholderMatch = /placeholder\s*=\s*(["'])(.*?)\1/i.exec(tagFull);
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'label',
        wcag: 'WCAG 1.3.1 & 4.1.2 Name, Role, Value (Level A)',
        impact: 'critical',
        selector: `${tagName}${id ? '#' + id : ''}`,
        elementHtml: tagFull,
        description: `Form <${tagName}> has no associated <label> or aria-label.`,
        category: 'deterministic',
        engine: 'Deterministic Logic',
        recommendation: 'Add a linked <label for="..."> element.',
        data: {
          tag: tagName,
          type,
          id,
          name: nameMatch ? nameMatch[2] : null,
          placeholder: placeholderMatch ? placeholderMatch[2] : null
        }
      });
    }
  }

  // 4. Buttons missing name
  const btnRegex = /<button(?:\s+[^>]*?)?>([\s\S]*?)<\/button>/gi;
  while ((match = btnRegex.exec(html)) !== null) {
    const full = match[0];
    const inner = match[1].replace(/<[^>]+>/g, '').trim();
    const hasAria = /aria-label|aria-labelledby|title/i.test(full);
    if (!inner && !hasAria) {
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'button-name',
        wcag: 'WCAG 4.1.2 Name, Role, Value (Level A)',
        impact: 'critical',
        selector: 'button',
        elementHtml: full,
        description: 'Button has no accessible text or aria-label.',
        category: 'deterministic',
        engine: 'Deterministic Logic',
        recommendation: 'Provide discernible text or aria-label for button.',
        data: {}
      });
    }
  }

  // 5. Links missing name
  const linkRegex = /<a\s+[^>]*href=["'][^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    const full = match[0];
    const inner = match[1].replace(/<[^>]+>/g, '').trim();
    const hasAria = /aria-label|aria-labelledby|title/i.test(full);
    const hasImgAlt = /<img[^>]*alt=["'][^"']+["']/i.test(match[1]);
    if (!inner && !hasAria && !hasImgAlt) {
      violations.push({
        id: 'V-' + (violationId++),
        ruleId: 'link-name',
        wcag: 'WCAG 2.4.4 & 4.1.2 Name, Role, Value (Level A)',
        impact: 'serious',
        selector: 'a',
        elementHtml: full,
        description: 'Link has no discernible text or accessible label.',
        category: 'deterministic',
        engine: 'Deterministic Logic',
        recommendation: 'Provide discernible text or aria-label for link.',
        data: {}
      });
    }
  }

  // 6. Color contrast
  const styleRegex = /style\s*=\s*(["'])(.*?)\1/gi;
  while ((match = styleRegex.exec(html)) !== null) {
    const styleStr = match[2];
    const styles = parseInlineStyle(styleStr);
    if (styles.color) {
      const fg = parseColor(styles.color);
      const bg = (styles['background-color'] || styles.background) ? parseColor(styles['background-color'] || styles.background) : { r: 255, g: 255, b: 255 };
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
            recommendation: 'Adjust foreground color to satisfy 4.5:1 ratio.',
            data: { fgHex: styles.color, ratio: parseFloat(ratio.toFixed(2)) }
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
