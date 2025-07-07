# ===== CIRO Network Development Environment =====
# Multi-stage build for optimal development experience

FROM ubuntu:22.04 AS base

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    libclang-dev \
    clang \
    cmake \
    libudev-dev \
    unzip \
    sudo \
    ca-certificates \
    software-properties-common \
    apt-transport-https \
    gnupg \
    lsb-release \
    jq \
    vim \
    nano \
    htop \
    tree \
    && rm -rf /var/lib/apt/lists/*

# Create vscode user with sudo privileges
RUN groupadd --gid 1000 vscode \
    && useradd --uid 1000 --gid vscode --shell /bin/bash --create-home vscode \
    && echo 'vscode ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/vscode

# Switch to vscode user
USER vscode
WORKDIR /home/vscode

# ===== Rust Installation =====
FROM base AS rust-stage

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

# Install additional Rust components
RUN rustup component add clippy rustfmt rust-src rust-analyzer
RUN rustup target add wasm32-unknown-unknown

# Install common Rust tools
RUN cargo install \
    cargo-watch \
    cargo-edit \
    cargo-expand \
    cargo-udeps \
    cargo-deny \
    cargo-audit \
    cargo-tarpaulin \
    cargo-criterion \
    sqlx-cli \
    sea-orm-cli \
    diesel_cli \
    && rm -rf /home/vscode/.cargo/registry

# ===== Node.js Installation =====
FROM rust-stage AS nodejs-stage

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - \
    && sudo apt-get install -y nodejs

# Install global Node.js tools
RUN npm install -g \
    yarn \
    pnpm \
    @tauri-apps/cli \
    typescript \
    ts-node \
    eslint \
    prettier \
    vite \
    @types/node

# ===== Python Installation =====
FROM nodejs-stage AS python-stage

# Install Python 3.11
RUN sudo apt-get update && sudo apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python tools
RUN pip3 install \
    poetry \
    black \
    flake8 \
    mypy \
    pytest \
    jupyter \
    notebook \
    starknet-py \
    web3

# ===== Cairo/Starknet Installation =====
FROM python-stage AS cairo-stage

# Install Scarb (Cairo package manager)
RUN curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash
ENV PATH="/home/vscode/.local/bin:${PATH}"

# Install Starknet Foundry
RUN curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | bash
ENV PATH="/home/vscode/.local/bin:${PATH}"

# Install Starkli
RUN curl https://get.starkli.sh | bash
RUN ~/.starkli/bin/starkliup

# ===== GPU Support (Optional) =====
FROM cairo-stage AS gpu-stage

# Install CUDA (if available)
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb \
    && sudo dpkg -i cuda-keyring_1.0-1_all.deb \
    && sudo apt-get update \
    && sudo apt-get -y install cuda-toolkit-12-2 \
    && rm -rf /var/lib/apt/lists/* \
    && rm cuda-keyring_1.0-1_all.deb

# Install PyTorch with CUDA support
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# ===== Docker Installation =====
FROM gpu-stage AS docker-stage

# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && sudo apt-get update \
    && sudo apt-get install -y docker-ce-cli docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Add vscode to docker group
RUN sudo usermod -aG docker vscode

# ===== Final Stage =====
FROM docker-stage AS final

# Set environment variables
ENV CARGO_HOME=/usr/local/cargo
ENV RUSTUP_HOME=/usr/local/rustup
ENV PATH="/usr/local/cargo/bin:/home/vscode/.local/bin:/home/vscode/.starkli/bin:${PATH}"

# Create workspace directory
RUN sudo mkdir -p /workspace \
    && sudo chown vscode:vscode /workspace

# Set working directory
WORKDIR /workspace

# Copy shell configuration
COPY --chown=vscode:vscode .bashrc /home/vscode/.bashrc
COPY --chown=vscode:vscode .zshrc /home/vscode/.zshrc

# Final setup
RUN echo 'export PATH="/usr/local/cargo/bin:/home/vscode/.local/bin:/home/vscode/.starkli/bin:$PATH"' >> /home/vscode/.bashrc
RUN echo 'export PATH="/usr/local/cargo/bin:/home/vscode/.local/bin:/home/vscode/.starkli/bin:$PATH"' >> /home/vscode/.zshrc

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Default command
CMD ["bash"] 