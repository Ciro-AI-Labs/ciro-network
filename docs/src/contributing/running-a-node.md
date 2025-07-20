# Running a Worker Node

Welcome to the Ciro Network! 🌟

Running a worker node is one of the most impactful ways to contribute to our decentralized computing network. Whether you're a GPU owner looking to earn rewards, a developer wanting to test the network, or a community member helping to build the future of AI computing, this guide will help you get started.

## 🤝 Why Run a Worker Node?

### **For GPU Owners**
- **Earn CIRO tokens** by providing compute power
- **Monetize your hardware** when you're not using it
- **Support AI research** and development
- **Join a global network** of compute providers

### **For Developers**
- **Test the network** and understand how it works
- **Contribute to development** by running test nodes
- **Debug issues** and improve the system
- **Build applications** that use the network

### **For Community Members**
- **Learn about decentralized computing**
- **Support the project** by providing infrastructure
- **Help test new features** and improvements
- **Contribute to network health** and reliability

## 🖥️ Hardware Requirements

### **Minimum Requirements**
- **CPU**: 4+ cores (Intel i5/AMD Ryzen 5 or better)
- **RAM**: 8GB DDR4
- **Storage**: 50GB SSD
- **Network**: 10 Mbps upload/download
- **OS**: Linux (Ubuntu 20.04+), Windows 10+, or macOS 10.15+

### **Recommended for AI Workloads**
- **GPU**: NVIDIA RTX 3060 or better (8GB+ VRAM)
- **CPU**: 8+ cores (Intel i7/AMD Ryzen 7 or better)
- **RAM**: 16GB+ DDR4
- **Storage**: 100GB+ NVMe SSD
- **Network**: 100 Mbps upload/download

### **Enterprise/Data Center**
- **GPU**: Multiple NVIDIA A100, H100, or RTX 4090
- **CPU**: 16+ cores with high clock speeds
- **RAM**: 64GB+ ECC DDR4/DDR5
- **Storage**: 1TB+ NVMe SSD with high IOPS
- **Network**: 1 Gbps+ with low latency
- **Cooling**: Proper thermal management for sustained GPU workloads

## 🚀 Getting Started

### **Option 1: Desktop Application (Recommended)**

The easiest way to run a worker node is using our cross-platform desktop application:

1. **Download the App**
   - Visit [ciro.network/download](https://ciro.network/download)
   - Download for your operating system (Windows, macOS, Linux)

2. **Install and Setup**
   ```bash
   # Extract and run the installer
   # Follow the guided setup process
   # Connect your wallet (Starknet)
   # Configure your hardware settings
   ```

3. **Start Contributing**
   - The app automatically detects your GPU
   - Configure your preferences and limits
   - Start earning CIRO tokens immediately

### **Option 2: Command Line (Advanced)**

For developers and advanced users who want more control:

#### **Prerequisites**
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install system dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev

# Install Docker (for containerized workloads)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### **Build and Run**
```bash
# Clone the repository
git clone https://github.com/ciro-network/ciro-network.git
cd ciro-network/rust-node

# Build the worker node
cargo build --release

# Create configuration file
cp environment.example .env
# Edit .env with your settings

# Run the worker node
cargo run --bin ciro-worker
```

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in your project directory:

```bash
# ===== Worker Node Configuration =====
WORKER_ID=worker-001
WORKER_NAME=My CIRO Worker
WORKER_GPU_COUNT=1
WORKER_GPU_MEMORY=8192  # 8GB in MB
WORKER_MAX_CONCURRENT_JOBS=3
WORKER_STAKE_AMOUNT=100000000000000000000  # 100 CIRO tokens

# ===== Blockchain Configuration =====
STARKNET_RPC_URL=https://alpha-sepolia.starknet.io
STARKNET_NETWORK=sepolia-testnet
STARKNET_ACCOUNT_ADDRESS=0x123...
STARKNET_PRIVATE_KEY=0x456...

# ===== P2P Network Configuration =====
P2P_LISTEN_ADDRESS=/ip4/0.0.0.0/tcp/4001
P2P_EXTERNAL_ADDRESS=/ip4/your-public-ip/tcp/4001

# ===== AI/ML Configuration =====
OLLAMA_HOST=http://localhost:11434
HUGGINGFACE_TOKEN=hf_your_token_here
COMPUTE_TIMEOUT=300
MAX_MEMORY_GB=8
MAX_GPU_MEMORY_GB=16

# ===== Monitoring Configuration =====
RUST_LOG=info
```

### **Hardware Configuration**

#### **GPU Settings**
```bash
# Check your GPU capabilities
nvidia-smi  # For NVIDIA GPUs
rocm-smi   # For AMD GPUs

# Configure GPU memory limits
export CUDA_VISIBLE_DEVICES=0  # Use first GPU
export GPU_MEMORY_LIMIT=8192   # 8GB limit
```

#### **System Optimization**
```bash
# Enable performance mode (Ubuntu)
sudo cpupower frequency-set -g performance

# Optimize for GPU workloads
echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Increase file descriptor limits
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf
```

## 🔧 Advanced Setup

### **Docker Deployment**

For containerized deployment:

```bash
# Build the Docker image
docker build -t ciro-worker .

# Run with environment variables
docker run -d \
  --name ciro-worker \
  --gpus all \
  -p 4001:4001 \
  -v /var/lib/ciro:/data \
  --env-file .env \
  ciro-worker
```

### **Systemd Service (Linux)**

Create a systemd service for automatic startup:

```bash
# Create service file
sudo tee /etc/systemd/system/ciro-worker.service << EOF
[Unit]
Description=CIRO Network Worker Node
After=network.target

[Service]
Type=simple
User=ciro
WorkingDirectory=/opt/ciro-worker
ExecStart=/opt/ciro-worker/ciro-worker
Restart=always
RestartSec=10
Environment=RUST_LOG=info

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable ciro-worker
sudo systemctl start ciro-worker
```

### **Monitoring with Prometheus**

Set up monitoring for your worker node:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ciro-worker'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
```

## 📊 Monitoring Your Node

### **Health Checks**

Monitor your node's health:

```bash
# Check node status
curl http://localhost:8080/health

# View worker statistics
curl http://localhost:8080/workers/stats

# Check job completion rates
curl http://localhost:8080/jobs/stats
```

### **Performance Metrics**

Track key performance indicators:

- **GPU Utilization**: Monitor GPU usage and temperature
- **Job Completion Rate**: Track successful vs failed jobs
- **Earnings**: Monitor CIRO token rewards
- **Network Connectivity**: Check P2P connection status
- **System Resources**: Monitor CPU, memory, and disk usage

### **Logs and Debugging**

Enable detailed logging:

```bash
# Set log level
export RUST_LOG=debug

# View real-time logs
tail -f /var/log/ciro-worker.log

# Check for errors
grep ERROR /var/log/ciro-worker.log
```

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. GPU Not Detected**
```bash
# Check GPU drivers
nvidia-smi  # Should show your GPU

# Install NVIDIA drivers if needed
sudo apt install nvidia-driver-535

# Verify CUDA installation
nvcc --version
```

#### **2. Network Connection Issues**
```bash
# Check firewall settings
sudo ufw status

# Open required ports
sudo ufw allow 4001/tcp  # P2P networking
sudo ufw allow 8080/tcp  # API endpoint

# Test connectivity
curl -I https://alpha-sepolia.starknet.io
```

#### **3. Blockchain Connection Problems**
```bash
# Verify Starknet configuration
echo $STARKNET_RPC_URL
echo $STARKNET_ACCOUNT_ADDRESS

# Check account balance
curl -X POST $STARKNET_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"starknet_getBalance","params":{"block_id":"latest","contract_address":"'$STARKNET_ACCOUNT_ADDRESS'"},"id":1}'
```

#### **4. Performance Issues**
```bash
# Monitor system resources
htop
nvidia-smi -l 1

# Check for memory leaks
valgrind --tool=memcheck ./ciro-worker

# Optimize for your hardware
# Adjust WORKER_MAX_CONCURRENT_JOBS based on your system
```

### **Getting Help**

If you encounter issues:

1. **Check the logs**: Look for error messages in the logs
2. **Search existing issues**: Check our [GitHub issues](https://github.com/ciro-network/ciro-network/issues)
3. **Join our Discord**: Get help from the community
4. **Create a bug report**: Use our [bug report template](/contributing/bugs/)

## 💰 Earning and Rewards

### **How Rewards Work**

- **Job Completion**: Earn CIRO tokens for each completed job
- **Quality Bonuses**: Higher rewards for high-quality results
- **Reliability Bonuses**: Consistent workers earn more
- **Staking Rewards**: Stake CIRO tokens to earn additional rewards

### **Optimizing Earnings**

- **Maintain High Uptime**: Keep your node running consistently
- **Provide Quality Results**: Ensure accurate and timely job completion
- **Stake CIRO Tokens**: Increase your earning potential
- **Monitor Performance**: Optimize your hardware configuration

### **Withdrawing Rewards**

```bash
# Check your balance
curl http://localhost:8080/wallet/balance

# Withdraw to your wallet
curl -X POST http://localhost:8080/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount": "100000000000000000000"}'
```

## 🔒 Security Best Practices

### **Wallet Security**
- **Use a dedicated wallet** for your worker node
- **Keep private keys secure** and never share them
- **Use hardware wallets** for large amounts
- **Regular backups** of your wallet configuration

### **System Security**
- **Keep software updated** with the latest security patches
- **Use strong passwords** and enable 2FA where possible
- **Monitor for suspicious activity** in your logs
- **Isolate your worker node** on a separate network if possible

### **Network Security**
- **Configure firewalls** to only allow necessary traffic
- **Use VPN** for additional security if needed
- **Monitor network traffic** for unusual patterns
- **Regular security audits** of your setup

## 🚀 Scaling Your Operation

### **Multiple Nodes**

Run multiple worker nodes for increased earnings:

```bash
# Create separate configurations for each node
cp .env .env.worker-1
cp .env .env.worker-2

# Edit each configuration with unique settings
# WORKER_ID=worker-001
# WORKER_ID=worker-002

# Run multiple instances
cargo run --bin ciro-worker -- --config .env.worker-1 &
cargo run --bin ciro-worker -- --config .env.worker-2 &
```

### **Load Balancing**

For high-performance setups:

```bash
# Use a load balancer for multiple GPUs
export CUDA_VISIBLE_DEVICES=0,1,2,3

# Configure job distribution
export WORKER_MAX_CONCURRENT_JOBS=12  # 3 jobs per GPU
```

### **Data Center Deployment**

For enterprise-scale operations:

- **Use container orchestration** (Kubernetes, Docker Swarm)
- **Implement monitoring** (Prometheus, Grafana)
- **Set up alerting** for system issues
- **Use dedicated hardware** for optimal performance

## 📚 Next Steps

Ready to dive deeper? Check out these resources:

- **[Technical Overview](/tech/overview/)** - Understand the network architecture
- **[Smart Contracts](/tech/contracts/)** - Learn about the blockchain integration
- **[Tokenomics](/tokenomics/)** - Understand the economic model
- **[Contributing Guide](/contributing/guide/)** - Other ways to contribute
- **[Community Guidelines](/contributing/community/)** - Join our community

---

**Thank you for helping build the future of decentralized computing!** 🌟

Your worker node contributes to making AI computing accessible to everyone. Every job you complete helps researchers, developers, and organizations around the world.

*Questions? Need help? Join our [Discord](https://discord.gg/ciro-network) or check our [documentation](/docs/).*
