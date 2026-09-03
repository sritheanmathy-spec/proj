/**
 * A11y Remediation Engine — Diff Generator
 * Produces clean visual diffs between original and remediated HTML code.
 */

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function computeLineDiff(originalCode, modifiedCode) {
  const origLines = originalCode.trim().split('\n');
  const modLines = modifiedCode.trim().split('\n');

  const diffLines = [];
  const maxLen = Math.max(origLines.length, modLines.length);

  let i = 0, j = 0;
  while (i < origLines.length || j < modLines.length) {
    const o = origLines[i];
    const m = modLines[j];

    if (o === m) {
      diffLines.push({
        type: 'unchanged',
        origLineNo: i + 1,
        modLineNo: j + 1,
        content: o
      });
      i++;
      j++;
    } else {
      // Find matches ahead or treat as change
      if (o !== undefined && (m === undefined || !modLines.slice(j).includes(o))) {
        diffLines.push({
          type: 'removed',
          origLineNo: i + 1,
          modLineNo: null,
          content: o
        });
        i++;
      }
      if (m !== undefined && (o === undefined || !origLines.slice(i).includes(m))) {
        diffLines.push({
          type: 'added',
          origLineNo: null,
          modLineNo: j + 1,
          content: m
        });
        j++;
      }
      if (o !== undefined && m !== undefined && o !== m && origLines.slice(i).includes(m) && modLines.slice(j).includes(o)) {
        diffLines.push({
          type: 'removed',
          origLineNo: i + 1,
          modLineNo: null,
          content: o
        });
        diffLines.push({
          type: 'added',
          origLineNo: null,
          modLineNo: j + 1,
          content: m
        });
        i++;
        j++;
      }
    }
  }

  return diffLines;
}

function renderDiffHtml(diffLines) {
  let html = '<div class="font-mono text-xs leading-relaxed overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-4">';
  diffLines.forEach(line => {
    if (line.type === 'unchanged') {
      html += `<div class="text-slate-400 py-0.5 flex"><span class="w-8 select-none text-slate-600 text-right pr-3">${line.modLineNo || ''}</span><span class="text-slate-600 select-none mr-2"> </span><span>${escapeHtml(line.content)}</span></div>`;
    } else if (line.type === 'removed') {
      html += `<div class="bg-rose-950/40 text-rose-300 py-0.5 flex border-l-2 border-rose-500 pl-1"><span class="w-8 select-none text-rose-500/60 text-right pr-3">${line.origLineNo || ''}</span><span class="text-rose-400 font-bold select-none mr-2">-</span><span>${escapeHtml(line.content)}</span></div>`;
    } else if (line.type === 'added') {
      html += `<div class="bg-emerald-950/40 text-emerald-300 py-0.5 flex border-l-2 border-emerald-500 pl-1"><span class="w-8 select-none text-emerald-500/60 text-right pr-3">${line.modLineNo || ''}</span><span class="text-emerald-400 font-bold select-none mr-2">+</span><span>${escapeHtml(line.content)}</span></div>`;
    }
  });
  html += '</div>';
  return html;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    computeLineDiff,
    renderDiffHtml
  };
}
if (typeof window !== 'undefined') {
  window.A11yDiff = {
    escapeHtml,
    computeLineDiff,
    renderDiffHtml
  };
}
