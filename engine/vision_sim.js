/**
 * A11y Remediation Engine — Real-Time Vision Impairment Simulator
 * Generates and applies hardware-accelerated SVG color-matrix filters
 * to simulate Protanopia, Deuteranopia, Tritanopia, Cataracts, and Monochromacy.
 */
(function(root) {

  const FILTERS = {
    normal: {
      name: 'Normal Vision',
      description: 'Standard full-spectrum human color vision.',
      cssFilter: 'none'
    },
    protanopia: {
      name: 'Protanopia (Red-Blind)',
      description: 'L-cone deficiency (~1% of males). Red appears dark or brown.',
      cssFilter: 'url(#filter-protanopia)'
    },
    deuteranopia: {
      name: 'Deuteranopia (Green-Blind)',
      description: 'M-cone deficiency (~6% of males). Green and red become indistinguishable.',
      cssFilter: 'url(#filter-deuteranopia)'
    },
    tritanopia: {
      name: 'Tritanopia (Blue-Blind)',
      description: 'S-cone deficiency (rare). Blue and yellow become indistinguishable.',
      cssFilter: 'url(#filter-tritanopia)'
    },
    cataracts: {
      name: 'Cataracts / Low-Vision Blur',
      description: 'Simulates visual acuity below 20/70 with lens clouding.',
      cssFilter: 'blur(3px) contrast(0.85) brightness(1.1)'
    },
    achromatopsia: {
      name: 'Achromatopsia (Total Grayscale)',
      description: 'Complete lack of color perception; entirely rod-driven vision.',
      cssFilter: 'grayscale(100%)'
    }
  };

  function injectSvgFilterDefinitions() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('a11y-vision-svg-filters')) return;

    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('id', 'a11y-vision-svg-filters');
    svg.setAttribute('style', 'position: absolute; width: 0; height: 0; pointer-events: none;');

    svg.innerHTML = `
      <defs>
        <!-- Protanopia Filter Matrix -->
        <filter id="filter-protanopia">
          <feColorMatrix type="matrix" values="
            0.567, 0.433, 0,     0, 0
            0.558, 0.442, 0,     0, 0
            0,     0.242, 0.758, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Deuteranopia Filter Matrix -->
        <filter id="filter-deuteranopia">
          <feColorMatrix type="matrix" values="
            0.625, 0.375, 0,   0, 0
            0.700, 0.300, 0,   0, 0
            0,     0.300, 0.7, 0, 0
            0,     0,     0,   1, 0
          "/>
        </filter>

        <!-- Tritanopia Filter Matrix -->
        <filter id="filter-tritanopia">
          <feColorMatrix type="matrix" values="
            0.950, 0.050, 0,     0, 0
            0,     0.433, 0.567, 0, 0
            0,     0.475, 0.525, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>
      </defs>
    `;

    document.body.appendChild(svg);
  }

  function applyVisionFilter(filterKey, targetElement) {
    injectSvgFilterDefinitions();
    const config = FILTERS[filterKey] || FILTERS.normal;
    if (targetElement) {
      targetElement.style.filter = config.cssFilter;
    }
    return config;
  }

  const api = {
    FILTERS,
    injectSvgFilterDefinitions,
    applyVisionFilter
  };

  root.A11yVision = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : global);
