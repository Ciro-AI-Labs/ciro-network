# Development Setup Guide

This repository contains both the **Ciro Network Website** (Next.js) and the **Documentation** (mdBook). Here's how to run them properly:

## 🌐 Website (Next.js)

### From the root directory:
```bash
# Start the website development server
npm run dev
# Runs on http://localhost:3000 (or next available port)

# Build for production
npm run build

# Start production server
npm run start
```

## 📚 Documentation (mdBook)

### From the root directory:
```bash
# Start the documentation server
npm run docs:dev
# Runs on http://localhost:3000 (or next available port)

# Build documentation
npm run docs:build

# Clean documentation build
npm run docs:clean
```

### From the docs/ directory:
```bash
cd docs

# Start the documentation server
npm run dev
# This now correctly uses mdBook instead of Next.js

# Build documentation
npm run build
```

## 🚀 Run Both Simultaneously

```bash
# Start both website and docs together
npm run dev:all
# Website: http://localhost:3000
# Docs: http://localhost:3001 (or next available)
```

## 🔧 What Was Fixed

Previously, running `npm run dev` from the `docs/` directory would start another Next.js server because it was finding the parent `package.json`. Now:

1. ✅ `docs/` has its own `package.json` with mdBook scripts
2. ✅ Root `package.json` includes convenience scripts for docs
3. ✅ Both services can run independently or together
4. ✅ No more port conflicts or confusion

## 📁 Project Structure

```
ciro-network/
├── src/                    # Next.js website source
├── docs/                   # mdBook documentation
│   ├── package.json       # Docs-specific scripts
│   ├── book.toml          # mdBook configuration
│   └── src/               # Documentation source
├── package.json           # Main website + convenience scripts
└── ...
```

## 🎯 Quick Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start website only |
| `npm run docs:dev` | Start docs only |
| `npm run dev:all` | Start both |
| `cd docs && npm run dev` | Start docs from docs directory | 