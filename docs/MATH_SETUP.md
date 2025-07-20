# 🧮 Mathematical Rendering Setup Guide

This guide explains how to set up enhanced mathematical rendering for the Ciro Network documentation with KaTeX and Wolfram Alpha integration.

## 📋 Prerequisites

1. **Rust and mdBook**: Ensure you have mdBook installed
2. **Node.js**: For managing JavaScript dependencies (optional)
3. **Internet connection**: For Wolfram Alpha widget integration

## 🔧 Installation Steps

### 1. Install mdbook-katex (Recommended)

```bash
# Install the KaTeX preprocessor for mdBook
cargo install mdbook-katex
```

### 2. Alternative: Manual KaTeX Setup

If you prefer manual setup or the cargo installation doesn't work:

```bash
# Create a local node_modules for KaTeX (optional)
npm init -y
npm install katex
```

### 3. Verify Configuration

The `book.toml` file should already include:

```toml
[preprocessor.katex]
command = "mdbook-katex"
renderer = ["html"]

[output.html]
mathjax-support = true
additional-css = ["theme/ciro-theme.css", "theme/custom.css"]
additional-js = ["theme/ciro-theme.js"]
```

## 🚀 Usage Examples

### Basic LaTeX Math

Inline math: `$E = mc^2$`

Block math:
```
$$
\eta = \frac{\sum_{i=1}^{n} C_i \times U_i \times R_i}{\sum_{i=1}^{n} C_i \times P_i}
$$
```

### Enhanced Equation Blocks

Use the custom `equation-block` class for styled mathematical content:

```html
<div class="equation-block">

$$F(u) = F_{\text{base}} \times \left(1 + \frac{u^2}{1-u}\right)$$

Where:
- $F_{\text{base}} = 0.01$ CIRO (base fee)
- $u$ = network utilization ratio (0.0 - 0.95)

</div>
```

### Wolfram Alpha Integration

Add interactive calculations with Wolfram Alpha widgets:

```html
<div class="wolfram-widget">

**Interactive Calculator:**

```
Plot[10000*(1 - Exp[-n/500]), {n, 0, 2000}, 
PlotLabel -> "Throughput vs Worker Count"]
```

[Open in Wolfram Alpha →](https://www.wolframalpha.com/input/...)

</div>
```

## 🎨 Styling Features

### Mathematical Highlighting

The system automatically highlights:
- **Variables**: `$x$, `$\alpha$`, `$\beta_i$` in blue
- **Constants**: `$\pi$`, `$e$`, numbers in amber
- **Operators**: `$+$`, `$-$`, `$\times$`, `$\sum$` in green

### Copy Functionality

Equation blocks include a copy button for easy sharing of mathematical expressions.

### Performance Monitoring

The system tracks math rendering performance and logs timing information in the browser console.

## 🐛 Troubleshooting

### KaTeX Not Rendering

1. Check that `mdbook-katex` is installed: `cargo install mdbook-katex`
2. Verify `book.toml` includes the katex preprocessor
3. Ensure equations use proper LaTeX syntax

### Wolfram Alpha Widgets Not Loading

1. Check internet connection
2. Verify widget URLs are properly encoded
3. Some ad blockers may interfere with iframe widgets

### Mathematical Syntax Errors

Common issues:
- Use `\times` instead of `*` for multiplication
- Use `\text{...}` for text within equations
- Escape special characters with backslashes

## 📚 Additional Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html)
- [Wolfram Alpha Widget Documentation](https://developer.wolframalpha.com/portal/myapps/)
- [LaTeX Mathematical Notation](https://en.wikibooks.org/wiki/LaTeX/Mathematics)

## ⚙️ Configuration Options

### Custom Math Environments

Add custom mathematical environments in `custom.css`:

```css
.theorem {
    background: rgba(124, 58, 237, 0.1);
    border-left: 4px solid #7c3aed;
    padding: 1rem;
    margin: 1rem 0;
}
```

### Performance Tuning

For better performance with complex equations:

```javascript
// In ciro-theme.js, adjust KaTeX options
if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(document.body, {
        delimiters: [...],
        trust: true,  // Enable \href, \url, etc.
        strict: false  // Be more lenient with syntax
    });
}
```

## 🔄 Building and Testing

```bash
# Build the documentation
mdbook build

# Serve locally for testing
mdbook serve --open

# Check for mathematical rendering
# Open browser developer tools to see performance logs
```

The mathematical rendering should now be fully functional with enhanced styling, Wolfram Alpha integration, and performance monitoring! 