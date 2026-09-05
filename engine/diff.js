/**
 * A11y Remediation Engine — Diff Generator
 * Produces clean, professional enterprise visual line diffs (GitHub/GitLab style).
 */
(function(root) {

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
    const origLines = (originalCode || '').replace(/\r\n/g, '\n').trim().split('\n');
    const modLines = (modifiedCode || '').replace(/\r\n/g, '\n').trim().split('\n');
    const diffLines = [];

    let i = 0, j = 0;
    const maxIterations = (origLines.length + modLines.length) * 3;
    let iterations = 0;

    while ((i < origLines.length || j < modLines.length) && iterations++ < maxIterations) {
      const o = origLines[i];
      const m = modLines[j];
      const prevI = i;
      const prevJ = j;

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
        if (o !== undefined && (m === undefined || !modLines.slice(j, j + 50).includes(o))) {
          diffLines.push({
            type: 'removed',
            origLineNo: i + 1,
            modLineNo: null,
            content: o
          });
          i++;
        }
        if (m !== undefined && (o === undefined || !origLines.slice(i, i + 50).includes(m))) {
          diffLines.push({
            type: 'added',
            origLineNo: null,
            modLineNo: j + 1,
            content: m
          });
          j++;
        }
        if (o !== undefined && m !== undefined && o !== m && origLines.slice(i, i + 50).includes(m) && modLines.slice(j, j + 50).includes(o)) {
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

        // Safety fallback if no branch advanced indices
        if (i === prevI && j === prevJ) {
          if (i < origLines.length) {
            diffLines.push({
              type: 'removed',
              origLineNo: i + 1,
              modLineNo: null,
              content: origLines[i]
            });
            i++;
          }
          if (j < modLines.length) {
            diffLines.push({
              type: 'added',
              origLineNo: null,
              modLineNo: j + 1,
              content: modLines[j]
            });
            j++;
          }
        }
      }
    }

    return diffLines;
  }

  function renderDiffHtml(diffLines) {
    let html = '<div class="font-mono text-xs leading-relaxed overflow-x-auto rounded border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">';
    diffLines.forEach(line => {
      if (line.type === 'unchanged') {
        html += `<div class="text-slate-600 py-1 px-2 flex hover:bg-slate-50 transition-colors">
          <span class="w-8 select-none text-slate-400 text-right pr-3 font-mono text-[11px]">${line.modLineNo || ''}</span>
          <span class="text-slate-300 select-none mr-2 font-mono text-[11px]"> </span>
          <span class="font-mono text-[11px] break-all">${escapeHtml(line.content)}</span>
        </div>`;
      } else if (line.type === 'removed') {
        html += `<div class="bg-rose-50 text-rose-800 py-1 px-2 flex border-l-2 border-rose-500">
          <span class="w-8 select-none text-rose-400 text-right pr-3 font-mono text-[11px]">${line.origLineNo || ''}</span>
          <span class="text-rose-600 font-bold select-none mr-2 font-mono text-[11px]">-</span>
          <span class="font-mono text-[11px] break-all">${escapeHtml(line.content)}</span>
        </div>`;
      } else if (line.type === 'added') {
        html += `<div class="bg-emerald-50 text-emerald-800 py-1 px-2 flex border-l-2 border-emerald-600">
          <span class="w-8 select-none text-emerald-500 text-right pr-3 font-mono text-[11px]">${line.modLineNo || ''}</span>
          <span class="text-emerald-600 font-bold select-none mr-2 font-mono text-[11px]">+</span>
          <span class="font-mono text-[11px] break-all">${escapeHtml(line.content)}</span>
        </div>`;
      }
    });
    html += '</div>';
    return html;
  }

  const api = {
    escapeHtml,
    computeLineDiff,
    renderDiffHtml
  };

  root.A11yDiff = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
