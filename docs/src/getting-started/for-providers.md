# ⚡ Welcome, GPU Providers!

**We’re so glad you’re here.** Whether you’re a seasoned miner, a gamer with spare hardware, or just curious about earning with your GPU, you belong in the Ciro community.

---

## 🌱 Our Story: Built for Real-World Needs

Ciro Network was born on the factory floor—not in a hackathon or a hype cycle. We saw firsthand how unpredictable cloud costs and limited access to high-end GPUs could hold back innovation. So we built Ciro: a decentralized compute network where anyone can contribute compute power and earn, no matter where they are.

---

## 🤔 What Does It Mean to Be a Provider?

As a GPU provider, you:
- **Earn $CIRO tokens** by running real AI jobs for global users
- **Choose your chain**: Stake and settle on Starknet, Ethereum, Polygon, and more
- **Help power the future** of open, verifiable AI
- **Join a global movement** for accessible, community-owned compute

No prior blockchain or AI experience required—just a compatible GPU and a willingness to learn!

---

## 🌐 Multichain Earning & Staking

Ciro is built for the multichain future. You can:
- **Stake on your preferred chain** (Starknet, Ethereum, Polygon)
- **Earn rewards and bonuses** based on your performance and chain
- **Bridge your earnings** to the ecosystem that fits your needs

| Chain      | Min Stake | APY Range | Best For                  |
|------------|-----------|-----------|---------------------------|
| Starknet   | 1K CIRO   | 12-18%    | Native rewards, governance|
| Ethereum   | 10K CIRO  | 8-12%     | Institutional security    |
| Polygon    | 500 CIRO  | 10-15%    | Low fees, retail-friendly |

---

## 🚀 Step-by-Step: Start Earning with Your GPU

### 🖥️ 1. Check Your Hardware
- **Minimum**: NVIDIA RTX 3080 / AMD RX 6800 XT, 10GB+ VRAM, 16GB RAM, 100GB SSD, 100 Mbps internet
- **Recommended**: H100/A100/4090, multiple GPUs, 1Gbps+ internet

### 📦 2. Install Ciro Worker
```bash
curl -fsSL https://install.ciro.network | sh
```
Or build from source:
```bash
git clone https://github.com/ciro-network/ciro-worker
cd ciro-worker
cargo build --release
```

### ⚙️ 3. Configure Your Worker
Create `config/worker.toml`:
```toml
[network]
starknet_rpc = "https://starknet-mainnet.public.blastapi.io"
coordinator_endpoint = "ws://coordinator.testnet.ciro.network"

[hardware]
gpu_ids = [0, 1]
max_jobs_concurrent = 4
enable_zkml = true

[economic]
min_stake = 1000
commission_rate = 0.05
auto_restake = true
```
Test your hardware:
```bash
ciro-worker check-hardware
```

### 🪙 4. Get CIRO Tokens & Stake
- Visit [faucet.testnet.ciro.network](https://faucet.testnet.ciro.network) for testnet tokens
- Stake on your preferred chain:
```bash
# Starknet (default, highest rewards)
ciro-worker stake --amount 1000 --duration 90d --chain starknet
# Ethereum (institutional)
ciro-worker stake --amount 10000 --duration 90d --chain ethereum
# Polygon (low minimum)
ciro-worker stake --amount 500 --duration 90d --chain polygon
```
Check your multi-chain stake:
```bash
ciro-worker status --all-chains
```

### 🚦 5. Start Earning
Start your worker:
```bash
ciro-worker start --daemon
```
Monitor your earnings:
```bash
ciro-worker dashboard
ciro-worker earnings --last-week
```

---

## 💰 Earning Expectations & Bonuses

| GPU Tier    | Hourly Rate | Monthly (24/7) | Annual (24/7) |
|-------------|-------------|----------------|---------------|
| RTX 3080    | $0.40-0.80  | $288-576       | $3,456-6,912  |
| RTX 4090    | $0.80-1.60  | $576-1,152     | $6,912-13,824 |
| A100        | $1.50-3.00  | $1,080-2,160   | $12,960-25,920|
| H100        | $2.20-4.50  | $1,584-3,240   | $19,008-38,880|

**Bonus Multipliers:**
- 🔐 zkML Jobs: +50% premium
- 🏆 High Uptime: +25% (>99% uptime)
- 🔥 Multi-GPU: +10% per additional GPU
- ⚡ Fast Response: +15% (sub-200ms)

**Network Fees:**
- 5-10% commission to coordinator
- Gas fees covered by requesters

---

## 🆘 Support & Community
- **Discord**: [discord.gg/ciro-network](https://discord.gg/ciro-network)
- **Docs**: [docs.ciro.network](https://docs.ciro.network)
- **GitHub**: [github.com/ciro-network](https://github.com/ciro-network)

**You’re not just earning—you’re helping build the future of open, verifiable AI. Welcome to the Ciro Network!**
