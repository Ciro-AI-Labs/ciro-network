// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item "><a href="index.html"><strong aria-hidden="true">1.</strong> 👋 Welcome to Ciro</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="vision.html"><strong aria-hidden="true">1.1.</strong> 🔭 Our Vision: Decentralizing AI</a></li><li class="chapter-item "><a href="introduction.html"><strong aria-hidden="true">1.2.</strong> 🌌 What is Ciro Network?</a></li></ol></li><li class="chapter-item "><a href="getting-started/index.html"><strong aria-hidden="true">2.</strong> 🚀 Getting Started</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="getting-started/for-developers.html"><strong aria-hidden="true">2.1.</strong> 👨‍💻 For Developers</a></li><li class="chapter-item "><a href="getting-started/for-providers.html"><strong aria-hidden="true">2.2.</strong> 🖥️ For GPU Providers</a></li><li class="chapter-item "><a href="getting-started/for-users.html"><strong aria-hidden="true">2.3.</strong> 💼 For Compute Users</a></li></ol></li><li class="chapter-item "><a href="tech/index.html"><strong aria-hidden="true">3.</strong> 🛠️ The Ciro Tech Stack</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="tech/overview.html"><strong aria-hidden="true">3.1.</strong> 🛰️ System Overview</a></li><li class="chapter-item "><a href="tech/zk-ml.html"><strong aria-hidden="true">3.2.</strong> ✨ The Magic of ZK-ML</a></li><li class="chapter-item "><a href="tech/starknet.html"><strong aria-hidden="true">3.3.</strong> 💎 Starknet &amp; Cairo: Our Foundation</a></li><li class="chapter-item "><a href="tech/contracts.html"><strong aria-hidden="true">3.4.</strong> 📜 Smart Contracts Deep Dive</a></li><li class="chapter-item "><a href="tech/mathematical-models.html"><strong aria-hidden="true">3.5.</strong> 🧮 Mathematical Models &amp; Economics</a></li></ol></li><li class="chapter-item "><a href="tokenomics/index.html"><strong aria-hidden="true">4.</strong> 🪙 CIRO Tokenomics</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="tokenomics/intro.html"><strong aria-hidden="true">4.1.</strong> The CIRO Token</a></li><li class="chapter-item "><a href="tokenomics/staking.html"><strong aria-hidden="true">4.2.</strong> 💰 Staking, Providing &amp; Earning</a></li><li class="chapter-item "><a href="tokenomics/governance.html"><strong aria-hidden="true">4.3.</strong> ⚖️ Governance: Shape the Future</a></li></ol></li><li class="chapter-item "><a href="contributing/index.html"><strong aria-hidden="true">5.</strong> 🤝 Contribute &amp; Participate</a><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="contributing/guide.html"><strong aria-hidden="true">5.1.</strong> 🗺️ Contribution Guide</a></li><li class="chapter-item "><a href="contributing/running-a-node.html"><strong aria-hidden="true">5.2.</strong> 🔌 Running a Worker Node</a></li><li class="chapter-item "><a href="contributing/community.html"><strong aria-hidden="true">5.3.</strong> 🎉 Community, Grants &amp; Bounties</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
