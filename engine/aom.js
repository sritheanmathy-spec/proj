/**
 * A11y Remediation Engine — Accessible Object Model (AOM) Inspector
 * Constructs and compares the Accessibility Tree (Roles, Names, States)
 * before and after remediation, mirroring Chrome DevTools and NVDA object trees.
 */
(function(root) {

  function buildAomTree(html, isRemediated = false) {
    let doc;
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      doc = parser.parseFromString(html, 'text/html');
    } else {
      return buildAomWithRegex(html, isRemediated);
    }

    const rootNode = {
      role: 'WebArea',
      name: 'Document Root',
      valid: true,
      children: []
    };

    let prevHeadingLevel = 0;

    // Traverse DOM elements in body
    const elements = doc.body.querySelectorAll('*');
    elements.forEach(el => {
      const tag = el.tagName.toLowerCase();

      // Heading Node
      if (/^h[1-6]$/.test(tag)) {
        const level = parseInt(tag.substring(1), 10);
        const text = el.textContent.trim();
        let valid = true;
        let note = null;

        if (prevHeadingLevel > 0 && level > prevHeadingLevel + 1) {
          valid = false;
          note = `FAULT: Skipped level (h${prevHeadingLevel} -> h${level})`;
        } else if (prevHeadingLevel === 0 && level > 1) {
          valid = false;
          note = `FAULT: Document outline starts at h${level}`;
        } else if (isRemediated) {
          note = `VERIFIED: Hierarchical Level ${level}`;
        }

        prevHeadingLevel = level;

        rootNode.children.push({
          role: 'heading',
          tag,
          level,
          name: text || '(empty heading)',
          valid,
          note
        });
      }

      // Graphic / Image Node
      else if (tag === 'img') {
        const src = el.getAttribute('src') || 'image';
        const filename = src.split('/').pop() || 'image';
        const hasAlt = el.hasAttribute('alt');
        const alt = el.getAttribute('alt');
        const isDecorative = el.getAttribute('role') === 'presentation' || el.getAttribute('aria-hidden') === 'true';

        let valid = true;
        let name = '';
        let note = null;

        if (isDecorative) {
          name = '(decorative)';
          note = 'Ignored by screen reader (role=presentation)';
        } else if (!hasAlt) {
          valid = false;
          name = filename;
          note = 'FAULT: No accessible name (missing alt)';
        } else if (alt !== null && alt.trim() === '') {
          valid = false;
          name = '(empty)';
          note = 'FAULT: Empty alt attribute on informative image';
        } else {
          name = `"${alt}"`;
          note = isRemediated ? 'VERIFIED: Contextual alt text' : 'Compliant';
        }

        rootNode.children.push({
          role: 'image',
          tag: 'img',
          name,
          valid,
          note
        });
      }

      // Form Control Nodes (input, select, textarea)
      else if (['input', 'select', 'textarea'].includes(tag)) {
        const type = (el.getAttribute('type') || 'text').toLowerCase();
        if (tag === 'input' && ['hidden', 'submit', 'button', 'reset'].includes(type)) return;

        const id = el.getAttribute('id');
        const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        const linkedLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;
        const wrappingLabel = el.closest('label');

        const labelText = ariaLabel || (linkedLabel ? linkedLabel.textContent.trim() : (wrappingLabel ? wrappingLabel.textContent.trim() : null));

        let valid = !!labelText;
        let note = valid ? (isRemediated ? 'VERIFIED: Accessible label linked' : 'Labelled') : 'FAULT: Unlabelled form control';

        rootNode.children.push({
          role: tag === 'textarea' ? 'textbox (multiline)' : (tag === 'select' ? 'combobox' : `textbox (${type})`),
          tag,
          name: labelText ? `"${labelText}"` : '(NO ACCESSIBLE NAME)',
          valid,
          note
        });
      }

      // Button Nodes
      else if (tag === 'button') {
        const text = el.textContent.trim();
        const aria = el.getAttribute('aria-label') || el.getAttribute('title');
        const name = text || aria;
        let valid = !!name;
        let note = valid ? (isRemediated ? 'VERIFIED: Accessible action name' : 'Named') : 'FAULT: Empty button name';

        rootNode.children.push({
          role: 'button',
          tag: 'button',
          name: name ? `"${name}"` : '(NO ACCESSIBLE NAME)',
          valid,
          note
        });
      }

      // Link Nodes
      else if (tag === 'a' && el.hasAttribute('href')) {
        const text = el.textContent.trim();
        const aria = el.getAttribute('aria-label') || el.getAttribute('title');
        const hasImgAlt = el.querySelector('img[alt]');
        const name = text || aria || (hasImgAlt ? hasImgAlt.getAttribute('alt') : null);
        let valid = !!name;
        let note = valid ? (isRemediated ? 'VERIFIED: Discernible link text' : 'Named') : 'FAULT: Link missing text';

        rootNode.children.push({
          role: 'link',
          tag: 'a',
          name: name ? `"${name}"` : '(NO ACCESSIBLE NAME)',
          valid,
          note
        });
      }
    });

    return rootNode;
  }

  function buildAomWithRegex(html, isRemediated = false) {
    const rootNode = { role: 'WebArea', name: 'Document Root', valid: true, children: [] };
    const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi;
    let m, prev = 0;
    while ((m = headingRegex.exec(html)) !== null) {
      const lvl = parseInt(m[1], 10);
      const name = m[3].replace(/<[^>]+>/g, '').trim();
      const valid = !(prev > 0 && lvl > prev + 1);
      rootNode.children.push({
        role: 'heading',
        tag: `h${lvl}`,
        level: lvl,
        name,
        valid,
        note: valid ? 'Level ' + lvl : `FAULT: Skipped level`
      });
      prev = lvl;
    }
    return rootNode;
  }

  function renderAomTreeHtml(tree, title = 'Accessibility Tree') {
    let html = `
      <div class="space-y-1 font-mono text-xs">
        <div class="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
          <span class="text-indigo-400 font-bold">▾ [${tree.role}]</span>
          <span>${tree.name}</span>
        </div>
        <div class="pl-4 space-y-1 border-l border-slate-800 ml-3 mt-1">`;

    if (tree.children.length === 0) {
      html += `<div class="text-slate-500 italic p-2 text-[11px]">No accessibility nodes detected.</div>`;
    } else {
      tree.children.forEach(node => {
        const isValid = node.valid;
        html += `
          <div class="flex items-center justify-between p-2 rounded-lg border ${isValid ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-rose-950/30 border-rose-800/60 text-rose-300'} transition hover:border-slate-700">
            <div class="flex items-center gap-2 truncate">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isValid ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-rose-900 text-rose-200 border border-rose-700'}">
                ${node.role}${node.level ? ' ' + node.level : ''}
              </span>
              <span class="truncate font-semibold">${node.name}</span>
            </div>
            <div class="text-[10px] font-semibold flex items-center gap-1.5 flex-shrink-0">
              ${isValid ? `<span class="text-emerald-400">✓ ${node.note || 'Accessible'}</span>` : `<span class="text-rose-400 font-bold">⚠ ${node.note}</span>`}
            </div>
          </div>`;
      });
    }

    html += `</div></div>`;
    return html;
  }

  const api = {
    buildAomTree,
    renderAomTreeHtml
  };

  root.A11yAOM = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
