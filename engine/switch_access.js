/**
 * A11y Remediation Engine — Switch Access & Motor Impairment Assistive Scanner
 * Emulates single-switch scanning navigation for users with severe physical/motor disabilities
 * (quadriplegia, ALS, cerebral palsy) using keyboard/switch input and acoustic metronome pulses.
 * Zero emojis across all logic and documentation.
 */
(function(root) {
  'use strict';

  let scanTimer = null;
  let currentIndex = -1;
  let activeTargets = [];
  let isScanning = false;
  let audioCtx = null;

  function getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    return audioCtx;
  }

  function playMetronomeTick(freq = 880) {
    if (typeof window === 'undefined') return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context may be restricted
    }
  }

  function getInteractiveElements(doc) {
    if (!doc) return [];
    const elements = doc.querySelectorAll('button:not([disabled]), a[href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
    return Array.from(elements).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function highlightElement(el) {
    if (!el) return;
    if (typeof el.setAttribute === 'function') el.setAttribute('data-a11y-switch-active', 'true');
    if (el.style) {
      el.style.outline = '4px solid #2563eb';
      el.style.outlineOffset = '3px';
      el.style.boxShadow = '0 0 0 6px rgba(37, 99, 235, 0.35)';
    }
    if (typeof el.focus === 'function') el.focus();
  }

  function clearHighlight(el) {
    if (!el) return;
    if (typeof el.removeAttribute === 'function') el.removeAttribute('data-a11y-switch-active');
    if (el.style) {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
    }
  }

  function startScanning(doc, options = {}) {
    stopScanning();
    if (!doc) return;

    activeTargets = getInteractiveElements(doc);
    if (activeTargets.length === 0) {
      if (options.onStatus) options.onStatus('No interactive elements found for switch scanning.');
      return;
    }

    currentIndex = 0;
    isScanning = true;
    const intervalMs = options.intervalMs || 1600;

    function step() {
      if (!isScanning || activeTargets.length === 0) return;

      // Clear previous
      activeTargets.forEach(el => clearHighlight(el));

      const target = activeTargets[currentIndex];
      highlightElement(target);
      playMetronomeTick(920);

      const tag = (target.tagName || 'element').toLowerCase();
      const label = (typeof target.getAttribute === 'function' ? target.getAttribute('aria-label') : '') || target.textContent?.trim() || (typeof target.getAttribute === 'function' ? target.getAttribute('name') : '') || tag;
      
      if (options.onScan) {
        options.onScan({
          index: currentIndex,
          total: activeTargets.length,
          tag,
          label: label.substring(0, 30),
          element: target
        });
      }

      currentIndex = (currentIndex + 1) % activeTargets.length;
    }

    step();
    scanTimer = setInterval(step, intervalMs);
  }

  function triggerActiveElement() {
    if (!isScanning || activeTargets.length === 0) return false;
    const activeIdx = (currentIndex - 1 + activeTargets.length) % activeTargets.length;
    const target = activeTargets[activeIdx];
    if (target) {
      playMetronomeTick(1200);
      target.click();
      return true;
    }
    return false;
  }

  function stopScanning() {
    isScanning = false;
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    activeTargets.forEach(el => clearHighlight(el));
    activeTargets = [];
    currentIndex = -1;
  }

  function getIsScanning() {
    return isScanning;
  }

  const api = {
    startScanning,
    stopScanning,
    triggerActiveElement,
    getIsScanning,
    getInteractiveElements,
    playMetronomeTick
  };

  root.A11ySwitchAccess = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
