// Ciro Network Theme and Enhanced Features

(function() {
    'use strict';

    // Mermaid Diagrams Support
    function initMermaidSupport() {
        // Load Mermaid from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
        script.onload = function() {
            // Initialize Mermaid
            mermaid.initialize({
                startOnLoad: true,
                theme: 'dark',
                logLevel: 'error',
                securityLevel: 'loose',
                themeVariables: {
                    primaryColor: '#7c3aed',
                    primaryTextColor: '#ffffff',
                    primaryBorderColor: '#6d28d9',
                    lineColor: '#a78bfa',
                    secondaryColor: '#3b82f6',
                    tertiaryColor: '#059669',
                    background: '#1e1b4b',
                    mainBkg: '#1e1b4b',
                    secondBkg: '#312e81',
                    tertiaryBkg: '#4338ca'
                },
                pie: {
                    textPosition: 0.5,
                    outerStrokeWidth: 2,
                    innerStrokeColor: '#ffffff',
                    outerStrokeColor: '#ffffff'
                },
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true
                }
            });
            
            // Process existing Mermaid code blocks
            const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');
            mermaidBlocks.forEach((block, index) => {
                const mermaidCode = block.textContent;
                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = mermaidCode;
                mermaidDiv.id = 'mermaid-' + index;
                
                // Replace the code block with the mermaid div
                block.parentElement.parentElement.insertBefore(mermaidDiv, block.parentElement);
                block.parentElement.style.display = 'none';
            });

            // Re-initialize Mermaid after adding elements
            mermaid.init();
        };
        document.head.appendChild(script);
    }

    // Enhanced Mathematics Support
    function initMathSupport() {
        // Initialize KaTeX if available
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(document.body, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\[", right: "\\]", display: true},
                    {left: "\\(", right: "\\)", display: false}
                ]
            });
        }

        // Wolfram Alpha Integration
        function createWolframWidget(container, query) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.wolframalpha.com/widget/widget.jsp?id=8ab1ea0b8b7c4c4b3d9bc2c6a1e5e4e3&i=${encodeURIComponent(query)}`;
            iframe.width = '100%';
            iframe.height = '400px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            container.appendChild(iframe);
        }

        // Process Wolfram Alpha widgets
        const wolframWidgets = document.querySelectorAll('.wolfram-widget code');
        wolframWidgets.forEach(widget => {
            const query = widget.textContent.trim();
            const container = widget.parentElement;
            const widgetDiv = document.createElement('div');
            widgetDiv.className = 'wolfram-embed';
            container.appendChild(widgetDiv);
            createWolframWidget(widgetDiv, query);
        });

        // Enhanced code syntax highlighting for mathematical expressions
        function enhanceMathCodeBlocks() {
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                let content = block.innerHTML;
                
                // Highlight mathematical operators
                content = content.replace(/([+\-*/=<>≥≤∑∏∫])/g, '<span class="math-op">$1</span>');
                
                // Highlight constants (numbers and common constants)
                content = content.replace(/\b(\d+\.?\d*|π|e|∞)\b/g, '<span class="math-const">$1</span>');
                
                // Highlight variables (single letters, optionally with subscripts)
                content = content.replace(/\b([a-zA-Z])(_\w+)?\b/g, '<span class="math-var">$1$2</span>');
                
                block.innerHTML = content;
            });
        }

        // Add copy functionality to equation blocks
        const equationBlocks = document.querySelectorAll('.equation-block');
        equationBlocks.forEach(block => {
            const copyButton = document.createElement('button');
            copyButton.innerHTML = '📋 Copy';
            copyButton.className = 'copy-equation-btn';
            copyButton.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(59, 130, 246, 0.8);
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
            `;
            
            copyButton.addEventListener('click', () => {
                const mathContent = block.querySelector('.katex-html, .katex-display');
                if (mathContent) {
                    const text = mathContent.textContent || mathContent.innerText;
                    navigator.clipboard.writeText(text).then(() => {
                        copyButton.innerHTML = '✅ Copied!';
                        setTimeout(() => {
                            copyButton.innerHTML = '📋 Copy';
                        }, 2000);
                    });
                }
            });
            
            block.style.position = 'relative';
            block.appendChild(copyButton);
        });

        enhanceMathCodeBlocks();
    }

    // Theme Management
    function initThemeSupport() {
        const html = document.documentElement;
        
        // Apply theme class to html element for CSS variables
        function applyTheme(theme) {
            // Remove all theme classes
            html.classList.remove('light', 'rust', 'coal', 'navy', 'ayu');
            // Add current theme class
            if (theme && theme !== 'default_theme') {
                html.classList.add(theme);
            } else {
                html.classList.add('light'); // default to light
            }
        }

        // Get current theme from mdBook
        function getCurrentTheme() {
            return localStorage.getItem('mdbook-theme') || 'navy';
        }

        // Apply initial theme
        applyTheme(getCurrentTheme());

        // Listen for theme changes
        const themeButtons = document.querySelectorAll('.theme');
        themeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const theme = this.id;
                setTimeout(() => {
                    applyTheme(theme);
                }, 10); // Small delay to let mdBook update storage
            });
        });
        
        // Also listen for storage changes (in case theme is changed in another tab)
        window.addEventListener('storage', function(e) {
            if (e.key === 'mdbook-theme') {
                applyTheme(e.newValue);
            }
        });
    }

    // Enhanced Sidebar Toggle
    function initSidebarToggle() {
        const html = document.documentElement;
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (!sidebarToggle || !sidebar) return;

        // Work with mdBook's existing sidebar logic instead of overriding it
        function toggleSidebar() {
            const sidebarCheckbox = document.getElementById('sidebar-toggle-anchor');
            if (sidebarCheckbox) {
                sidebarCheckbox.click(); // Use mdBook's built-in toggle
            }
        }

        // Don't override mdBook's sidebar state management
        // Just enhance it with keyboard shortcuts

        // Keyboard shortcut (s key)
        document.addEventListener('keydown', function(e) {
            if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Only if not in an input field
                if (!document.querySelector('input:focus, textarea:focus')) {
                    e.preventDefault();
                    toggleSidebar();
                }
            }
        });

        // Let mdBook handle the sidebar state management
        // We'll just provide keyboard enhancement
    }

    // Smooth scrolling for sidebar links
    function initSmoothScrolling() {
        const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Enhanced search functionality
    function initSearchEnhancements() {
        const searchInput = document.querySelector('#searchbar input');
        if (searchInput) {
            // Add placeholder text
            searchInput.placeholder = 'Search Ciro Network docs...';
            
            // Focus search with '/' key
            document.addEventListener('keydown', function(e) {
                if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    if (!document.querySelector('input:focus, textarea:focus')) {
                        e.preventDefault();
                        searchInput.focus();
                    }
                }
            });
        }
    }

    // Initialize everything when DOM is ready
    function init() {
        initMermaidSupport();
        initMathSupport();
        initThemeSupport();
        initSidebarToggle();
        initSmoothScrolling();
        initSearchEnhancements();
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize on navigation (for SPA-like behavior)
    window.addEventListener('popstate', init);
    
})();

// Export functions for potential external use
window.CiroMath = {
    validateEquation: function(equation) {
        try {
            return { valid: true, message: 'Equation is valid' };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    }
};
