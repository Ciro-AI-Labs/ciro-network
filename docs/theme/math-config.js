// Custom MathJax Configuration for Ciro Network Documentation
window.MathJax = {
  tex: {
    // Only process content inside explicit delimiters
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]'], ['$$', '$$']],
    // Don't process single $ delimiters to avoid conflicts
    processEscapes: true,
    processEnvironments: true,
    autoload: {
      color: [],
      colorv2: ['color']
    },
    packages: {
      '[+]': ['noerrors']
    }
  },
  options: {
    // Ignore HTML elements that shouldn't be processed
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process',
    // Don't process content inside code blocks
    skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  loader: {
    load: ['[tex]/noerrors']
  }
};

// Load MathJax
(function () {
  var script = document.createElement('script');
  script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
  document.head.appendChild(script);
  script.onload = function () {
    var script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    document.head.appendChild(script);
  };
})(); 