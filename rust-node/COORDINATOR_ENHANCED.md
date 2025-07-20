# CIRO Network Enhanced Coordinator

## Overview

The CIRO Network Enhanced Coordinator is a production-ready, comprehensive coordination system for the CIRO Network decentralized compute platform. It integrates Kafka messaging, P2P networking, blockchain integration, and advanced monitoring capabilities to provide a robust and scalable solution for job distribution and worker management.

## Architecture

The enhanced coordinator consists of several interconnected components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Enhanced Coordinator                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Kafka     │  │   Network   │  │   Job       │       │
│  │ Coordinator │  │ Coordinator │  │ Processor   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Worker    │  │ Blockchain  │  │   Metrics   │       │
│  │  Manager    │  │Integration  │  │ Collector   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Enhanced Coordinator (`mod.rs`)
The main orchestrator that coordinates all components and provides a unified interface.

**Key Features:**
- Component lifecycle management
- Event processing and routing
- Health monitoring
- Graceful shutdown handling

### 2. Configuration System (`config.rs`)
Comprehensive configuration management supporting multiple environments.

**Features:**
- Environment-specific configurations (Development, Staging, Production, Test)
- Component-specific settings
- Security and logging configuration
- Metrics and monitoring settings

### 3. Blockchain Integration (`blockchain_integration.rs`)
Handles all interactions with deployed smart contracts.

**Features:**
- Job registration and completion
- Worker assignment and reputation tracking
- Transaction monitoring and confirmation
- Contract event processing
- Gas optimization

### 4. Job Processor (`job_processor.rs`)
Manages job lifecycle, scheduling, and execution coordination.

**Features:**
- Job submission and validation
- Priority-based scheduling
- Retry logic with exponential backoff
- Timeout monitoring
- Job statistics and metrics

### 5. Worker Manager (`worker_manager.rs`)
Handles worker registration, health monitoring, and capability management.

**Features:**
- Worker registration and authentication
- Health monitoring and load tracking
- Capability matching and worker selection
- Reputation management
- Geographic distribution

### 6. Network Coordinator (`network_coordinator.rs`)
Integrates with P2P networking for job distribution and peer discovery.

**Features:**
- Job announcement and bidding
- Peer discovery and management
- Network health monitoring
- Gossip protocol integration
- Geographic peer management

### 7. Kafka Coordinator (`kafka.rs`)
Handles message queuing and event streaming.

**Features:**
- Job intake and distribution
- Worker communication
- Result streaming
- Dead letter queue handling
- Message deduplication

### 8. Metrics Collector (`metrics.rs`)
Aggregates metrics from all components and provides monitoring capabilities.

**Features:**
- Component metrics collection
- Health monitoring
- Performance tracking
- Metrics export (Prometheus, Graphite, JSON)
- Historical data storage

## Quick Start

### 1. Generate Configuration

```bash
# Generate default configuration for development
cargo run --bin ciro-coordinator -- generate-config development config/coordinator.toml

# Generate configuration for production
cargo run --bin ciro-coordinator -- generate-config production config/coordinator.toml
```

### 2. Start the Coordinator

```bash
# Start with default configuration
cargo run --bin ciro-coordinator -- start

# Start with custom configuration
cargo run --bin ciro-coordinator -- start --config config/coordinator.toml --environment production
```

### 3. API Endpoints

The coordinator exposes a comprehensive REST API:

#### Health and Status
- `GET /health` - Health check
- `GET /status` - Coordinator status
- `GET /metrics` - Current metrics

#### Job Management
- `POST /jobs` - Submit a job
- `GET /jobs` - List active jobs
- `GET /jobs/{job_id}` - Get job details
- `DELETE /jobs/{job_id}` - Cancel a job
- `GET /jobs/{job_id}/status` - Get job status

#### Worker Management
- `POST /workers` - Register a worker
- `GET /workers` - List active workers
- `GET /workers/{worker_id}` - Get worker details
- `DELETE /workers/{worker_id}` - Unregister a worker
- `GET /workers/{worker_id}/health` - Get worker health

#### Network Management
- `GET /network/stats` - Network statistics
- `GET /network/peers` - Active peers
- `GET /network/health` - Network health

#### Blockchain Management
- `GET /blockchain/status` - Blockchain connection status
- `GET /blockchain/transactions` - Transaction information
- `GET /blockchain/metrics` - Blockchain metrics

#### Kafka Management
- `GET /kafka/status` - Kafka connection status
- `GET /kafka/stats` - Kafka statistics
- `GET /kafka/dead-letter-queue` - Dead letter queue size

## Configuration

### Environment-Specific Settings

The coordinator supports different configurations for various environments:

#### Development
- Debug logging enabled
- Metrics collection disabled
- Local database and Kafka
- Testnet blockchain connection

#### Staging
- Info logging
- Basic metrics collection
- Staging infrastructure
- Testnet blockchain connection

#### Production
- Warning/error logging only
- Full metrics and monitoring
- Production infrastructure
- Mainnet blockchain connection
- Authentication and authorization enabled

### Key Configuration Sections

#### Database
```toml
database_url = "postgresql://localhost/ciro"
```

#### Blockchain
```toml
[blockchain]
rpc_url = "https://starknet-sepolia.public.blastapi.io"
job_manager_address = "0x00bf025663b8a7c7e43393f082b10afe66bd9ddb06fb5e521e3adbcf693094bd"
```

#### Kafka
```toml
[kafka]
bootstrap_servers = ["localhost:9092"]
job_topic = "ciro.jobs"
worker_topic = "ciro.workers"
result_topic = "ciro.results"
```

#### Network
```toml
[network]
p2p_port = 8080
discovery_enabled = true
gossip_enabled = true
```

## Monitoring and Observability

### Metrics

The coordinator provides comprehensive metrics in multiple formats:

#### Prometheus Metrics
```bash
curl http://localhost:8080/metrics
```

#### JSON Metrics
```bash
curl http://localhost:8080/metrics | jq
```

### Health Checks

```bash
# Overall health
curl http://localhost:8080/health

# Component-specific health
curl http://localhost:8080/blockchain/status
curl http://localhost:8080/kafka/status
curl http://localhost:8080/network/health
```

### Logging

The coordinator uses structured logging with different levels:

```bash
# Development (debug level)
RUST_LOG=debug cargo run --bin ciro-coordinator -- start

# Production (warn level)
RUST_LOG=warn cargo run --bin ciro-coordinator -- start
```

## Integration with Deployed Contracts

The enhanced coordinator is designed to work with the deployed CIRO Network smart contracts:

### Job Manager Contract
- **Address**: `0x00bf025663b8a7c7e43393f082b10afe66bd9ddb06fb5e521e3adbcf693094bd`
- **Network**: Starknet Sepolia Testnet
- **Functions**: Job registration, completion, worker assignment, reward distribution

### Integration Points
1. **Job Registration**: Jobs are registered on-chain before distribution
2. **Worker Assignment**: Worker assignments are recorded on-chain
3. **Job Completion**: Results are submitted to the blockchain
4. **Reward Distribution**: Payments are processed through smart contracts

## Production Deployment

### Prerequisites
- PostgreSQL database
- Apache Kafka cluster
- Starknet RPC access
- Prometheus monitoring (optional)

### Docker Deployment
```bash
# Build the image
docker build -t ciro-coordinator .

# Run with configuration
docker run -d \
  --name ciro-coordinator \
  -p 8080:8080 \
  -v $(pwd)/config:/app/config \
  ciro-coordinator
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ciro-coordinator
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ciro-coordinator
  template:
    metadata:
      labels:
        app: ciro-coordinator
    spec:
      containers:
      - name: ciro-coordinator
        image: ciro-coordinator:latest
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: config
          mountPath: /app/config
      volumes:
      - name: config
        configMap:
          name: ciro-coordinator-config
```

## Development

### Building
```bash
# Build in release mode
cargo build --release

# Build with specific features
cargo build --release --features "metrics,prometheus"
```

### Testing
```bash
# Run all tests
cargo test

# Run specific component tests
cargo test --package ciro-worker --lib coordinator

# Run integration tests
cargo test --test integration
```

### Code Quality
```bash
# Run clippy
cargo clippy

# Run formatting
cargo fmt

# Run security audit
cargo audit
```

## Troubleshooting

### Common Issues

1. **Blockchain Connection Failed**
   - Check RPC URL configuration
   - Verify network connectivity
   - Ensure contract addresses are correct

2. **Kafka Connection Issues**
   - Verify Kafka cluster is running
   - Check bootstrap server configuration
   - Ensure topics exist

3. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check connection string
   - Ensure database exists

4. **Network Discovery Issues**
   - Check P2P port configuration
   - Verify firewall settings
   - Ensure discovery is enabled

### Debug Mode
```bash
# Enable debug logging
RUST_LOG=debug cargo run --bin ciro-coordinator -- start

# Enable trace logging for specific modules
RUST_LOG=ciro_worker::coordinator=trace cargo run --bin ciro-coordinator -- start
```

## Contributing

### Architecture Guidelines
1. **Component Isolation**: Each component should be self-contained
2. **Event-Driven**: Use events for inter-component communication
3. **Configuration-Driven**: All behavior should be configurable
4. **Observable**: Comprehensive logging and metrics
5. **Testable**: Unit and integration tests for all components

### Adding New Components
1. Create the component module in `src/coordinator/`
2. Add configuration structures in `config.rs`
3. Integrate with the main coordinator in `mod.rs`
4. Add API endpoints in `coordinator_main.rs`
5. Write comprehensive tests

## License

This project is licensed under the MIT License - see the LICENSE file for details. 