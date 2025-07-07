#!/bin/bash

# ===== CIRO Network DevContainer Post-Create Script =====
# This script runs after the container is created

set -e

echo "🚀 Setting up CIRO Network development environment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -qq

# Install any missing dependencies
echo "🔧 Installing additional tools..."
sudo apt-get install -y -qq \
    protobuf-compiler \
    libprotobuf-dev \
    pkg-config \
    libssl-dev \
    libclang-dev

# Setup Git configuration if not present
if [ ! -f ~/.gitconfig ]; then
    echo "🔧 Setting up Git configuration..."
    git config --global user.name "CIRO Developer"
    git config --global user.email "dev@ciro.ai"
    git config --global init.defaultBranch main
    git config --global pull.rebase true
    git config --global core.autocrlf false
fi

# Install rust-analyzer if not present
if ! command -v rust-analyzer &> /dev/null; then
    echo "🦀 Installing rust-analyzer..."
    rustup component add rust-analyzer
fi

# Install Cairo language server if not present
if ! command -v cairo-language-server &> /dev/null; then
    echo "🏛️ Installing Cairo language server..."
    cargo install cairo-language-server
fi

# Install documentation tools
echo "📚 Installing documentation tools..."
if ! command -v mdbook &> /dev/null; then
    echo "📖 Installing mdBook..."
    cargo install mdbook
fi

if ! command -v mdbook-mermaid &> /dev/null; then
    echo "🐙 Installing mdBook Mermaid plugin..."
    cargo install mdbook-mermaid
fi

if ! command -v mdbook-last-changed &> /dev/null; then
    echo "🕐 Installing mdBook last-changed plugin..."
    cargo install mdbook-last-changed
fi

# Install Node.js dependencies for documentation linting if package.json exists
if [ -f package.json ]; then
    echo "📦 Installing Node.js dependencies for documentation..."
    npm install
fi

# Setup pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pip3 install pre-commit
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3
  - repo: https://github.com/doublify/pre-commit-rust
    rev: v1.0
    hooks:
      - id: fmt
      - id: clippy
EOF
pre-commit install

# Setup shared directories
echo "📁 Creating shared directories..."
mkdir -p \
    shared/ciro-types/src \
    shared/ciro-crypto/src \
    shared/ciro-network/src \
    shared/ciro-utils/src

# Create basic Cargo.toml files for shared crates
echo "📝 Creating shared crate configurations..."

# ciro-types
cat > shared/ciro-types/Cargo.toml << 'EOF'
[package]
name = "ciro-types"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true
description = "Common types and data structures for CIRO Network"

[dependencies]
serde = { workspace = true }
serde_json = { workspace = true }
uuid = { workspace = true }
chrono = { workspace = true }
thiserror = { workspace = true }
starknet = { workspace = true }
EOF

# ciro-crypto  
cat > shared/ciro-crypto/Cargo.toml << 'EOF'
[package]
name = "ciro-crypto"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true
description = "Cryptographic utilities for CIRO Network"

[dependencies]
rand = { workspace = true }
sha2 = { workspace = true }
ed25519-dalek = { workspace = true }
secp256k1 = { workspace = true }
starknet-crypto = { workspace = true }
ciro-types = { path = "../ciro-types" }
EOF

# ciro-network
cat > shared/ciro-network/Cargo.toml << 'EOF'
[package]
name = "ciro-network"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true
description = "P2P networking for CIRO Network"

[dependencies]
libp2p = { workspace = true }
tokio = { workspace = true }
futures = { workspace = true }
tracing = { workspace = true }
ciro-types = { path = "../ciro-types" }
ciro-crypto = { path = "../ciro-crypto" }
EOF

# ciro-utils
cat > shared/ciro-utils/Cargo.toml << 'EOF'
[package]
name = "ciro-utils"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true
description = "Utility functions for CIRO Network"

[dependencies]
anyhow = { workspace = true }
thiserror = { workspace = true }
tracing = { workspace = true }
config = { workspace = true }
ciro-types = { path = "../ciro-types" }
EOF

# Create basic lib.rs files
echo "pub mod lib;" > shared/ciro-types/src/lib.rs
echo "pub mod lib;" > shared/ciro-crypto/src/lib.rs
echo "pub mod lib;" > shared/ciro-network/src/lib.rs
echo "pub mod lib;" > shared/ciro-utils/src/lib.rs

# Setup environment variables
echo "🌍 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Install Node.js dependencies for Tauri if package.json exists
if [ -f tauri-app/package.json ]; then
    echo "📦 Installing Node.js dependencies for Tauri app..."
    cd tauri-app && npm install && cd ..
fi

# Build all Rust crates to check everything is working
echo "🔨 Building Rust workspace..."
cargo check --workspace

# Initialize the database
echo "🗄️  Initializing database..."
if command -v sqlx &> /dev/null; then
    sqlx database create || true
    sqlx migrate run || true
fi

# Setup VS Code workspace settings
echo "⚙️  Setting up VS Code workspace..."
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
    "rust-analyzer.cargo.allFeatures": true,
    "rust-analyzer.check.command": "clippy",
    "rust-analyzer.procMacro.enable": true,
    "rust-analyzer.diagnostics.disabled": ["unresolved-proc-macro"],
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "files.associations": {
        "*.cairo": "cairo"
    },
    "cairo.enableLanguageServer": true,
    "cairo.languageServerPath": "cairo-language-server"
}
EOF

# Setup launch configuration
cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Debug Rust Worker Node",
            "cargo": {
                "args": ["build", "--bin=ciro-worker"],
                "filter": {
                    "name": "ciro-worker",
                    "kind": "bin"
                }
            },
            "args": [],
            "cwd": "${workspaceFolder}"
        }
    ]
}
EOF

echo "✅ CIRO Network development environment setup complete!"
echo "🎉 You can now start developing!"
echo ""
echo "📚 Quick start commands:"
echo "  - cargo build --workspace    # Build all Rust crates"
echo "  - cargo test --workspace     # Run all tests"
echo "  - scarb build               # Build Cairo contracts"
echo "  - cd tauri-app && npm run dev  # Start Tauri app development"
echo "  - npm run dev:docs           # Start documentation development server"
echo "  - npm run build:docs         # Build documentation"
echo "" 