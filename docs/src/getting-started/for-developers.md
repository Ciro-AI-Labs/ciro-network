# Getting Started for Developers

Welcome, builder! This guide will walk you through everything you need to start building on top of the Ciro Network. We'll cover setting up your environment, interacting with our smart contracts, and submitting your first AI compute job.

---

## 🌐 **Multichain Architecture Overview**

Ciro Network is built with a **multichain-first approach**—while our core compute coordination happens on Starknet, we support cross-chain settlements and staking across multiple ecosystems.

### **Supported Networks**

| Network | Purpose | Status |
|---------|---------|--------|
| **Starknet** | Core compute coordination, job management | ✅ Live |
| **Ethereum** | Cross-chain settlements, institutional staking | 🚧 Coming Soon |
| **Polygon** | Low-cost settlements, retail staking | 🚧 Coming Soon |
| **Arbitrum** | Bridge settlements, DeFi integrations | 🚧 Coming Soon |
| **Base** | Consumer app settlements | 🔄 Planned |

### **Cross-Chain Settlement Options**

Choose the chain that best fits your use case:

- **High-value enterprise jobs**: Settle on Ethereum mainnet for maximum security
- **High-frequency applications**: Use Polygon for fast, cheap settlements  
- **DeFi integrations**: Leverage Arbitrum's ecosystem
- **Consumer apps**: Utilize Base for seamless UX

> 💡 **How it works**: Submit jobs on Starknet, receive results with cryptographic proofs, then settle payments on your preferred chain using our cross-chain bridge infrastructure.

---

## 🛠️ **1. Environment Setup**

Before you can interact with Ciro, you'll need a few essential tools for Starknet development.

### **Prerequisites:**

-   **Starkli**: The command-line interface for Starknet.
    ```bash
    curl -L https://raw.githubusercontent.com/xac-inc/starkli/main/install.sh | sh
    ```
-   **Scarb**: The Cairo package manager.
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
    ```
-   **A Starknet Wallet**: We recommend Argent or Braavos.

### **Optional: Multi-Chain Wallet Setup**

For cross-chain settlements and staking:
- **MetaMask** or **Coinbase Wallet** for Ethereum/L2s
- **WalletConnect** integration for seamless multi-chain UX

---

## 🚀 **2. Your First Interaction: Connecting to the Network**

Let's start by making a simple read call to the `JobManager` contract to verify your connection.

First, set up your shell environment with the Ciro Network contract addresses (Testnet):

```bash
# Ciro Network Testnet Addresses
export CIRO_JOB_MANAGER="0x0..."
export CIRO_TOKEN="0x0..."

# Your Starknet Account (replace with your actual address)
export STARKNET_ACCOUNT="0x0..."
```

Now, let's query the `JobManager` for the total number of jobs processed on the network:

```bash
starkli call $CIRO_JOB_MANAGER get_total_jobs
```

If successful, you'll see a response like `[ 1234 ]`, indicating the total number of jobs. Congratulations, you're connected!

---

## 🤖 **3. Submitting Your First AI Job**

Now for the exciting part. We're going to submit a request to the network to run an AI inference job. In this example, we'll use a pre-registered image recognition model.

### **Step A: Approve Token Transfer**

First, you need to approve the `JobManager` contract to spend your `CIRO` tokens for the job payment.

```bash
# Approve the JobManager to spend 10 CIRO tokens
starkli invoke $CIRO_TOKEN approve $CIRO_JOB_MANAGER 10000000000000000000
```

### **Step B: Prepare the Job Specification**

In a real-world scenario, you would construct a `JobSpec` struct with all the details of your job. For this example, we'll use a simplified command-line interaction.

### **Step C: Call `submit_ai_job`**

Now, we'll call the `submit_ai_job` function on the `JobManager`. This function takes the `JobSpec` and the `payment` amount as arguments.

```bash
# Pseudo-code for submitting a job
starkli invoke $CIRO_JOB_MANAGER submit_ai_job \
    --job-type "inference" \
    --model-id "image_recognition_v1" \
    --input-hash "0x1a2b3c..." \
    --payment 10000000000000000000 # 10 CIRO
```
*(Note: The actual command will involve passing a struct, which is more complex. See our SDK for a simpler way to do this.)*

When you send this transaction, you'll receive a `transaction_hash`. You can track its progress on a Starknet explorer like Starkscan. Once the transaction is confirmed, the `JobSubmitted` event will be emitted, and your job is officially on the network!

---

## 💰 **4. Cross-Chain Settlement Options**

Once your job completes, you have multiple settlement options:

### **Same-Chain Settlement (Default)**
Results and payments stay on Starknet—fastest and most cost-effective.

### **Cross-Chain Settlement**
Bridge results to your preferred chain:

```bash
# Example: Bridge settlement to Polygon
starkli invoke $CIRO_JOB_MANAGER bridge_settlement \
    --job-id 1235 \
    --target-chain "polygon" \
    --recipient-address "0x..." \
    --settlement-token "USDC"
```

### **Enterprise Multi-Chain Workflow**
For high-value enterprise applications:

1. **Submit job** on Starknet (fast, verifiable)
2. **Receive results** with ZK proofs
3. **Settle payment** on Ethereum mainnet (maximum security)
4. **Integrate results** into your application

> 🔗 **Cross-chain fees**: Settlement bridging costs 0.1-0.5% depending on target chain and amount.

---

## 📊 **5. Checking Job Status and Retrieving Results**

You can query the `JobManager` to check the status of your job using the `JobId` you received.

```bash
# Query the state of job with ID 1235
starkli call $CIRO_JOB_MANAGER get_job_state 1235
```

The state will transition from `Pending` -> `Assigned` -> `Completed`.

Once the job is `Completed`, the result (e.g., the classification from the image recognition model) will be available. In a real application, your off-chain service would listen for the `JobCompleted` event and then fetch the result from the worker's specified output location.

### **Cross-Chain Result Verification**

Results include cryptographic proofs that can be verified on any chain:

```bash
# Verify result proof on target chain
starkli call $CIRO_PROOF_VERIFIER verify_job_result \
    --job-id 1235 \
    --proof-data "0x..." \
    --public-inputs "0x..."
```

---

## 🔗 **Multi-Chain Staking & Delegation**

### **Staking Options**

Choose where to stake your CIRO tokens based on your preferences:

| Chain | Min Stake | APY Range | Benefits |
|-------|-----------|-----------|----------|
| **Starknet** | 1,000 CIRO | 12-18% | Native governance, highest rewards |
| **Ethereum** | 10,000 CIRO | 8-12% | Institutional grade, maximum security |
| **Polygon** | 500 CIRO | 10-15% | Low fees, retail-friendly |

### **Cross-Chain Delegation**

Delegate your stake to high-performing workers across chains:

```bash
# Delegate to a worker on different chain
ciro-cli delegate \
    --amount 5000 \
    --worker-id "worker_123" \
    --source-chain "ethereum" \
    --target-chain "starknet"
```

---

## SDKs and Tooling

While interacting directly with the contracts via CLI is great for understanding the fundamentals, we provide SDKs to make building on Ciro much easier.

-   [**Ciro.js**](./sdks/ciro-js.md): A JavaScript/TypeScript library for web and Node.js applications.
-   [**Ciro.py**](./sdks/ciro-py.md): A Python SDK for backend services and data science workflows.
-   [**Ciro Multi-Chain SDK**](./sdks/ciro-multichain.md): Unified SDK for cross-chain operations.

These SDKs handle the complexities of struct serialization, event parsing, cross-chain bridging, and interaction with the contracts, letting you focus on your application logic.

## 🚀 **What's Next?**

You've successfully submitted your first AI job to a decentralized compute network! Here are some ideas for your next steps:

-   **Explore our pre-registered AI models**: See what's available for you to use out-of-the-box.
-   **Register your own model**: Learn how to add your own AI models to the network for others to use.
-   **Build a simple dApp**: Create a web interface that uses Ciro for its AI-powered features.
-   **Try cross-chain settlements**: Experiment with bridging results to different chains.
-   **Set up multi-chain staking**: Optimize your staking strategy across multiple networks.
-   **Dive deeper into the tech**: Read the "Smart Contracts Deep Dive" to understand the full power of our system.

Welcome to the community, and happy building!
