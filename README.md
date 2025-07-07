# 🌐 CIRO Network

### **Decentralized Compute Layer for Starknet**

<p align="center">
  <img src="https://img.shields.io/badge/Cairo-1.0-blue?style=for-the-badge&logo=ethereum" alt="Cairo 1.0">
  <img src="https://img.shields.io/badge/Rust-1.70+-orange?style=for-the-badge&logo=rust" alt="Rust">
  <img src="https://img.shields.io/badge/Starknet-Mainnet-purple?style=for-the-badge" alt="Starknet">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  <strong>Transform idle GPUs into a decentralized AI powerhouse on Starknet</strong>
</p>

---

## 🚀 **Overview**

CIRO Network is a **Starknet-native marketplace** that connects GPU owners with
AI applications, creating a decentralized compute layer for the next generation
of dApps. Built with **Cairo smart contracts** and **Rust infrastructure**, it
provides low-latency, verifiable compute while feeding CIRO's real-time context
engine.

### **Key Features**

- 🔗 **Starknet Native**: Built specifically for Starknet's proving
  infrastructure
- ⚡ **Low Latency**: <100ms response times for real-time applications
- 🛡️ **Verifiable Compute**: ZK-ML proofs ensure computation integrity
- 💰 **Economic Security**: Stake/slash mechanisms protect against malicious
  actors
- 🖥️ **Cross-Platform**: Worker nodes run on Windows, macOS, and Linux
- 🔄 **CIRO Integration**: Seamless connection to existing analytics platform

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Starknet      │    │   Worker Nodes  │    │   CIRO Platform │
│   Smart         │◄──►│   (Rust)        │◄──►│   (Analytics)   │
│   Contracts     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Desktop App   │    │   P2P Network   │    │   Kafka/Flink   │
│   (Tauri)       │    │   (libp2p)      │    │   Streams       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📁 **Project Structure**

```
ciro-network/
├── cairo-contracts/          # Starknet smart contracts
│   ├── src/
│   ├── tests/
│   └── scripts/
├── rust-node/               # Worker node implementation
│   ├── src/
│   ├── docker/
│   └── config/
├── tauri-app/               # Cross-platform desktop app
│   ├── src/
│   ├── src-tauri/
│   └── dist/
├── backend/                 # Backend services & APIs
│   ├── api/
│   ├── services/
│   └── db/
├── docs/                    # Documentation
│   ├── architecture/
│   ├── user-guides/
│   └── api-reference/
└── .taskmaster/            # Project management
    ├── tasks/
    └── docs/
```

---

## 🛠️ **Technology Stack**

### **Smart Contracts**

- **Cairo 1.0**: Starknet-native smart contracts
- **Scarb**: Package manager and build tool
- **Starknet Foundry**: Testing framework

### **Worker Nodes**

- **Rust**: High-performance system programming
- **Docker**: Containerized compute environments
- **libp2p**: Peer-to-peer networking
- **Tokio**: Async runtime

### **Desktop Application**

- **Tauri**: Cross-platform desktop framework
- **React/TypeScript**: Modern web technologies
- **Tailwind CSS**: Utility-first styling

### **Backend Services**

- **Rust/Axum**: High-performance web framework
- **PostgreSQL**: Primary database
- **Redis**: Caching and session management
- **Apache Kafka**: Event streaming

---

## 🚀 **Quick Start**

### **Prerequisites**

- **Rust** 1.70+ ([Install](https://rustup.rs/))
- **Node.js** 18+ ([Install](https://nodejs.org/))
- **Docker** ([Install](https://docs.docker.com/get-docker/))
- **Scarb** ([Install](https://docs.swmansion.com/scarb/download.html))

### **Development Setup**

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ciro-AI-Labs/ciro-network.git
   cd ciro-network
   ```

2. **Install dependencies**

   ```bash
   # Install Rust dependencies
   cargo build

   # Install Node.js dependencies
   cd tauri-app && npm install
   ```

3. **Run the development environment**

   ```bash
   # Start the backend services
   docker-compose up -d

   # Run the desktop application
   cd tauri-app && npm run tauri dev
   ```

---

## 📚 **Documentation**

- 🏗️ **[Architecture Guide](docs/architecture/)**
- 🧑‍💻 **[API Reference](docs/api-reference/)**
- 📖 **[User Guides](docs/user-guides/)**
- 🔧 **[Development Setup](docs/development/)**
- 🚀 **[Deployment Guide](docs/deployment/)**

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md)
for details.

### **Development Workflow**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔒 **Security**

Security is paramount in decentralized systems. Please review our
[Security Policy](SECURITY.md) and report vulnerabilities to
<security@ciro.network>.

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

---

## 🔗 **Links**

- **Website**: [ciro.network](https://ciro.network)
- **Documentation**: [docs.ciro.network](https://docs.ciro.network)
- **Community**: [Discord](https://discord.gg/ciro)
- **Twitter**: [@CiroNetwork](https://twitter.com/CiroNetwork)

---

<p align="center">
  <strong>Built with ❤️ by the CIRO Labs team</strong>
</p>

<p align="center">
  <sub>Transforming idle compute into decentralized AI infrastructure</sub>
</p>
