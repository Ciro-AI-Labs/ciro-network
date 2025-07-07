# ⚙️ Rust Worker Node

**High-Performance Compute Workers for CIRO Network**

## Overview

The Rust worker node is the core infrastructure component that connects GPU
owners to the CIRO Network. It handles job execution, resource management, P2P
networking, and blockchain interactions with enterprise-grade performance and
security.

## Architecture

```
rust-node/
├── src/
│   ├── main.rs                     # Entry point and CLI
│   ├── lib.rs                      # Core library exports
│   ├── node/                       # Node management
│   │   ├── mod.rs
│   │   ├── worker.rs              # Worker node implementation
│   │   ├── coordinator.rs         # Job coordination
│   │   └── health.rs              # Health monitoring
│   ├── compute/                    # Compute engine
│   │   ├── mod.rs
│   │   ├── executor.rs            # Job execution engine
│   │   ├── containers.rs          # Docker container management
│   │   ├── gpu.rs                 # GPU resource management
│   │   └── verification.rs        # Result verification
│   ├── network/                    # P2P networking
│   │   ├── mod.rs
│   │   ├── p2p.rs                 # libp2p implementation
│   │   ├── discovery.rs           # Peer discovery
│   │   └── gossip.rs              # Gossip protocol
│   ├── blockchain/                 # Starknet integration
│   │   ├── mod.rs
│   │   ├── client.rs              # Starknet client
│   │   ├── contracts.rs           # Contract interactions
│   │   └── events.rs              # Event handling
│   ├── storage/                    # Data persistence
│   │   ├── mod.rs
│   │   ├── database.rs            # Local database
│   │   └── cache.rs               # In-memory cache
│   └── utils/                      # Utilities
│       ├── mod.rs
│       ├── crypto.rs              # Cryptographic utilities
│       ├── config.rs              # Configuration management
│       └── metrics.rs             # Performance metrics
├── docker/
│   ├── Dockerfile.worker          # Worker node Docker image
│   ├── Dockerfile.coordinator     # Coordinator Docker image
│   └── docker-compose.yml         # Development environment
└── config/
    ├── default.toml               # Default configuration
    ├── development.toml           # Development settings
    └── production.toml            # Production settings
```

## Key Components

### 🔧 **Worker Node**

- GPU resource management and monitoring
- Job execution and result verification
- Peer-to-peer networking and discovery
- Blockchain state synchronization

### 🚀 **Compute Engine**

- Docker container orchestration
- GPU workload scheduling
- Resource isolation and security
- Performance optimization

### 🌐 **P2P Network**

- libp2p-based networking stack
- Peer discovery and routing
- Gossip protocol for job distribution
- NAT traversal and connectivity

### ⛓️ **Blockchain Integration**

- Starknet client and contract interactions
- Event listening and processing
- Transaction signing and submission
- State synchronization

## Development Setup

### Prerequisites

- **Rust** 1.70+ ([Install](https://rustup.rs/))
- **Docker** ([Install](https://docs.docker.com/get-docker/))
- **CUDA** 12.0+ (for GPU support)

### Getting Started

1. **Clone and build**

   ```bash
   cd rust-node
   cargo build --release
   ```

2. **Run tests**

   ```bash
   cargo test
   ```

3. **Start development node**

   ```bash
   cargo run -- --config config/development.toml
   ```

## Configuration

### Basic Configuration

```toml
# config/default.toml
[node]
id = "worker-001"
bind_address = "0.0.0.0:8080"
data_dir = "./data"

[gpu]
enabled = true
devices = "all"
memory_limit = "80%"

[network]
listen_port = 9000
bootstrap_peers = []

[blockchain]
network = "testnet"
rpc_url = "https://starknet-testnet.infura.io/v3/YOUR_KEY"
```

### GPU Configuration

```toml
[gpu]
enabled = true
devices = ["0", "1"]  # Specific GPU indices
memory_limit = "8GB"
utilization_threshold = 0.9
```

## Running the Node

### Development Mode

```bash
# Start with development configuration
cargo run -- --config config/development.toml

# Enable debug logging
RUST_LOG=debug cargo run -- --config config/development.toml
```

### Production Mode

```bash
# Build optimized binary
cargo build --release

# Run with production configuration
./target/release/ciro-worker --config config/production.toml
```

### Docker Deployment

```bash
# Build Docker image
docker build -f docker/Dockerfile.worker -t ciro-worker .

# Run worker container
docker run -d \
  --name ciro-worker \
  --gpus all \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ./data:/app/data \
  ciro-worker
```

## Monitoring

### Health Checks

```bash
# Check node health
curl http://localhost:8080/health

# Get node metrics
curl http://localhost:8080/metrics
```

### Performance Metrics

- CPU and GPU utilization
- Memory usage and limits
- Network throughput
- Job completion rates
- Error rates and latency

## Security

### Isolation

- Docker containers for job execution
- Resource limits and quotas
- Network isolation
- Filesystem restrictions

### Cryptography

- Ed25519 node identity keys
- TLS for all network communications
- Signature verification for jobs
- Encrypted data storage

## Contributing

1. **Code Style**: Follow Rust conventions with `rustfmt`
2. **Testing**: Write unit and integration tests
3. **Documentation**: Document all public APIs
4. **Performance**: Profile and optimize critical paths
5. **Security**: Follow secure coding practices

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [libp2p Documentation](https://docs.libp2p.io/)
- [Docker Documentation](https://docs.docker.com/)
- [CUDA Programming Guide](https://docs.nvidia.com/cuda/)
