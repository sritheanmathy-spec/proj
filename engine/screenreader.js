/**
 * A11y Remediation Engine — Screen Reader Audio Simulator
 * Translates DOM nodes into realistic screen-reader acoustic streams
 * (matching NVDA, JAWS, and VoiceOver speech syntax) and controls
 * speech synthesis with real-time transcript tracking.
 */

function generateSpeechScript(html) {
  const utterances = [];
  
  let doc;
  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, 'text/html');
  } else {
    // Node.js lightweight regex generator
    return generateScriptWithRegex(html);
  }

  // Walk through elements in document order
  const elements = doc.body.querySelectorAll('*');
  elements.forEach(el => {
    const tag = el.tagName.toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = tag.substring(1);
      const text = el.textContent.trim();
      if (text) {
        utterances.push({
          type: 'heading',
          tag,
          text: `Heading level ${level}, ${text}.`,
          rawText: text,
          warning: null
        });
      }
    }

    // Images
    else if (tag === 'img') {
      const src = el.getAttribute('src') || 'image';
      const hasAlt = el.hasAttribute('alt');
      const alt = el.getAttribute('alt');

      if (!hasAlt) {
        const filename = src.split('/').pop();
        utterances.push({
          type: 'image',
          tag: 'img',
          text: `Graphic, ${filename.replace('.', ' dot ')}.`,
          rawText: filename,
          warning: 'Missing alternative text'
        });
      } else if (alt && alt.trim() !== '') {
        utterances.push({
          type: 'image',
          tag: 'img',
          text: `Graphic: ${alt}.`,
          rawText: alt,
          warning: null
        });
      }
    }

    // Form Inputs
    else if (['input', 'select', 'textarea'].includes(tag)) {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset'].includes(type)) return;

      const id = el.getAttribute('id');
      const hasAria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      const linkedLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;
      const wrappingLabel = el.closest('label');

      const labelText = hasAria || (linkedLabel ? linkedLabel.textContent.trim() : (wrappingLabel ? wrappingLabel.textContent.trim() : null));

      if (labelText) {
        utterances.push({
          type: 'input',
          tag: 'input',
          text: `${labelText}, edit text.`,
          rawText: labelText,
          warning: null
        });
      } else {
        utterances.push({
          type: 'input',
          tag: 'input',
          text: `Unlabelled edit text.`,
          rawText: 'Unlabelled',
          warning: 'Missing form label'
        });
      }
    }

    // Buttons
    else if (tag === 'button') {
      const text = el.textContent.trim();
      const aria = el.getAttribute('aria-label') || el.getAttribute('title');
      const name = text || aria;
      if (name) {
        utterances.push({
          type: 'button',
          tag: 'button',
          text: `${name}, button.`,
          rawText: name,
          warning: null
        });
      } else {
        utterances.push({
          type: 'button',
          tag: 'button',
          text: `Button.`,
          rawText: 'Empty button',
          warning: 'Empty button name'
        });
      }
    }

    // Paragraphs
    else if (tag === 'p' && el.textContent.trim() && el.children.length === 0) {
      utterances.push({
        type: 'text',
        tag: 'p',
        text: el.textContent.trim(),
        rawText: el.textContent.trim(),
        warning: null
      });
    }
  });

  const fullText = utterances.map(u => u.text).join(' ');
  return { utterances, fullText };
}

function generateScriptWithRegex(html) {
  const utterances = [];
  const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi;
  let m;
  while ((m = headingRegex.exec(html)) !== null) {
    utterances.push({
      type: 'heading',
      tag: `h${m[1]}`,
      text: `Heading level ${m[1]}, ${m[3].replace(/<[^>]+>/g, '').trim()}.`,
      warning: null
    });
  }
  const imgRegex = /<img(?:\s+[^>]*?)?>/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    const altMatch = /alt\s*=\s*(["'])(.*?)\1/i.exec(m[0]);
    if (altMatch) {
      utterances.push({
        type: 'image',
        tag: 'img',
        text: `Graphic: ${altMatch[2]}.`,
        warning: null
      });
    } else {
      const srcMatch = /src\s*=\s*(["'])(.*?)\1/i.exec(m[0]);
      const src = srcMatch ? srcMatch[2] : 'image';
      utterances.push({
        type: 'image',
        tag: 'img',
        text: `Graphic, ${src.replace('.', ' dot ')}.`,
        warning: 'Missing alternative text'
      });
    }
  }
  const fullText = utterances.map(u => u.text).join(' ');
  return { utterances, fullText };
}

let activeUtterance = null;

function speakScript(text, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this environment');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  // Prefer natural English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira')));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;
  if (options.onBoundary) utterance.onboundary = options.onBoundary;

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

function isSpeaking() {
  return typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateSpeechScript,
    generateScriptWithRegex
  };
}
if (typeof window !== 'undefined') {
  window.A11yScreenReader = {
    generateSpeechScript,
    speakScript,
    stopSpeech,
    isSpeaking
  };
}
