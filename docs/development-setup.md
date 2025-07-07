# 🛠️ Development Setup Guide

This guide will help you set up the CIRO Network development environment on your
local machine.

## 🚀 Quick Start (Recommended)

### Option 1: VSCode DevContainer (Easiest)

1. **Prerequisites:**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Setup:**

   ```bash
   git clone https://github.com/Ciro-AI-Labs/ciro-network.git
   cd ciro-network
   code .
   ```

3. **Open in Container:**
   - Press `F1` → "Dev Containers: Reopen in Container"
   - Wait for container to build (first time takes 5-10 minutes)
   - Everything is automatically configured! 🎉

### Option 2: Local Development

If you prefer to set up the environment locally, follow the manual setup below.

---

## 📋 Manual Setup

### 1. Prerequisites

#### System Requirements

- **OS**: macOS 12+, Windows 10+, or Ubuntu 20.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **GPU**: Optional but recommended for compute testing

#### Required Tools

##### 🦀 Rust (Required)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup component add clippy rustfmt rust-analyzer
rustup target add wasm32-unknown-unknown
```

##### 🏛️ Cairo & Starknet (Required)

```bash
# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash

# Install Starknet Foundry
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | bash

# Install Starkli
curl https://get.starkli.sh | bash
starkliup
```

##### 📦 Node.js (For Tauri App)

```bash
# Install Node.js 18+ (use nvm or download from nodejs.org)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

##### 🐳 Docker (For Services)

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Or use your system's package manager

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Ciro-AI-Labs/ciro-network.git
cd ciro-network

# Copy environment variables
cp environment.example .env

# Edit .env with your values
nano .env
```

### 3. Build Everything

```bash
# Install Rust dependencies and build
cargo build --workspace

# Build Cairo contracts
cd cairo-contracts
scarb build
cd ..

# Setup Tauri app
cd tauri-app
npm install
npm run tauri build
cd ..
```

### 4. Start Development Services

```bash
# Start Docker services
docker-compose -f .devcontainer/docker-compose.yml up -d

# Verify services are running
docker-compose ps
```

### 5. Run Tests

```bash
# Run all Rust tests
cargo test --workspace

# Run Cairo contract tests
cd cairo-contracts
scarb test
cd ..

# Run integration tests
cargo test --test integration_tests
```

---

## 🔧 Development Workflow

### Daily Development Commands

```bash
# Start development environment
docker-compose -f .devcontainer/docker-compose.yml up -d

# Build all projects
cargo build --workspace

# Run tests
cargo test --workspace

# Format code
cargo fmt --all

# Run linter
cargo clippy --workspace --all-targets --all-features

# Build Cairo contracts
cd cairo-contracts && scarb build

# Start Tauri app in development mode
cd tauri-app && npm run tauri dev
```

### Useful Aliases

Add these to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# CIRO Network Development Aliases
alias ciro-build='cargo build --workspace'
alias ciro-test='cargo test --workspace'
alias ciro-fmt='cargo fmt --all'
alias ciro-clippy='cargo clippy --workspace --all-targets --all-features'
alias ciro-cairo='cd cairo-contracts && scarb build'
alias ciro-app='cd tauri-app && npm run tauri dev'
alias ciro-services='docker-compose -f .devcontainer/docker-compose.yml ps'
alias ciro-logs='docker-compose -f .devcontainer/docker-compose.yml logs -f'
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
cargo test --workspace

# Run specific test
cargo test test_name

# Run tests with coverage
cargo tarpaulin --workspace --out html
```

### Integration Tests

```bash
# Start required services
docker-compose -f .devcontainer/docker-compose.yml up -d

# Run integration tests
cargo test --test integration_tests
```

### Cairo Contract Tests

```bash
cd cairo-contracts
scarb test
```

### Performance Tests

```bash
# Run benchmarks
cargo bench --workspace
```

---

## 📊 Monitoring & Debugging

### Service URLs (Development)

- **PostgreSQL**: `postgresql://ciro:ciro@localhost:5432/ciro_dev`
- **Redis**: `redis://localhost:6379`
- **Starknet Devnet**: `http://localhost:5050`
- **Kafka**: `localhost:9092`
- **Jaeger (Tracing)**: `http://localhost:16686`
- **Prometheus (Metrics)**: `http://localhost:9090`
- **Grafana (Dashboard)**: `http://localhost:3001` (admin/admin)

### Debugging

#### Rust Applications

```bash
# Run with debug logging
RUST_LOG=debug cargo run

# Use rust-lldb for debugging
rust-lldb target/debug/your-binary
```

#### Cairo Contracts

```bash
# Deploy to local devnet
cd cairo-contracts
scarb build
starkli deploy target/dev/contract.json

# Check contract state
starkli call <contract-address> <function-name>
```

#### Tauri App

```bash
# Open dev tools
cd tauri-app
npm run tauri dev
# Press F12 in the app window
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Rust Compilation Errors

```bash
# Update Rust toolchain
rustup update

# Clean and rebuild
cargo clean
cargo build --workspace
```

#### 2. Cairo Build Errors

```bash
# Update Scarb
scarb --version  # Check current version
# Download latest from https://docs.swmansion.com/scarb/download.html

# Clean and rebuild
scarb clean
scarb build
```

#### 3. Docker Issues

```bash
# Reset Docker services
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml up -d

# Check logs
docker-compose -f .devcontainer/docker-compose.yml logs
```

#### 4. Node.js/Tauri Issues

```bash
# Clear Node modules
cd tauri-app
rm -rf node_modules package-lock.json
npm install

# Update Tauri CLI
npm install -g @tauri-apps/cli@latest
```

### Performance Issues

#### 1. Slow Compilation

```bash
# Use faster linker (Linux/macOS)
echo '[target.x86_64-unknown-linux-gnu]' >> ~/.cargo/config.toml
echo 'linker = "clang"' >> ~/.cargo/config.toml
echo 'rustflags = ["-C", "link-arg=-fuse-ld=lld"]' >> ~/.cargo/config.toml

# Enable parallel compilation
echo 'CARGO_BUILD_JOBS=4' >> .env
```

#### 2. Large Docker Images

```bash
# Prune unused Docker resources
docker system prune -a

# Use multi-stage builds (already configured)
```

---

## 🌟 IDE Setup

### VSCode (Recommended)

Extensions (auto-installed in DevContainer):

- **Rust Analyzer** - Rust language support
- **Cairo** - Cairo language support
- **Tauri** - Tauri development support
- **Docker** - Container management
- **GitLens** - Enhanced Git features

### Other IDEs

#### IntelliJ IDEA / CLion

- Install Rust plugin
- Install Cairo plugin
- Configure Cargo integration

#### Vim/Neovim

```lua
-- Add to your init.lua
require('lspconfig').rust_analyzer.setup{}
require('lspconfig').cairo_ls.setup{}
```

---

## 📚 Additional Resources

### Documentation

- [Rust Book](https://doc.rust-lang.org/book/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starknet Documentation](https://docs.starknet.io/)
- [Tauri Documentation](https://tauri.app/v1/guides/)

### Community

- [CIRO Network Discord](https://discord.gg/ciro-network)
- [Starknet Community](https://community.starknet.io/)
- [Rust Community](https://www.rust-lang.org/community)

### Tools

- [Rust Playground](https://play.rust-lang.org/)
- [Cairo Playground](https://www.cairo-lang.org/playground/)
- [Starknet Devnet](https://github.com/Shard-Labs/starknet-devnet)

---

## 🆘 Getting Help

1. **Check Documentation**: Start with this guide and the README
2. **Search Issues**: Look for similar issues in the GitHub repository
3. **Ask Questions**: Create a GitHub issue or ask in Discord
4. **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution
   guidelines

---

## 🎯 Next Steps

After setup, you can:

1. **Explore the Architecture**: Read [docs/architecture/](./architecture/)
2. **Start Developing**: Pick a task from the
   [project board](https://github.com/Ciro-AI-Labs/ciro-network/projects)
3. **Run Examples**: Check out example implementations in `examples/`
4. **Join Community**: Connect with other developers in Discord

Happy coding! 🚀
