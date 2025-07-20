# Smart Contracts Deep Dive

Welcome to the engine room of Ciro Network. Our smart contracts, built on **Starknet** with **Cairo**, are the transparent, immutable heart of our decentralized AI compute marketplace. This document provides a technical overview for developers, auditors, and curious minds.

---

## 📜 **Deployed Contracts & Addresses**

| Contract Name         | Purpose                                 | Testnet Address (Sepolia)                                         | Status        |
|----------------------|-----------------------------------------|-------------------------------------------------------------------|--------------|
| **CIRO Token**       | ERC20 governance token                  | `0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8` | ✅ Deployed   |
| **CDC Pool**         | Compute rewards, worker registry        | *(please provide)*                                                | ✅ Deployed   |
| **Job Manager**      | Job orchestration, payment, settlement  | *(please provide)*                                                | ✅ Deployed   |
| **Governance Treasury** | DAO, multi-sig, timelock             | *(please provide)*                                                | ✅ Deployed   |
| **Linear Vesting**   | Team, private, seed vesting             | *(please provide)*                                                | ✅ Deployed   |
| **Milestone Vesting**| Advisor, KPI-based vesting              | *(please provide)*                                                | ✅ Deployed   |
| **Burn Manager**     | Revenue sharing, token burn             | *(please provide)*                                                | ✅ Deployed   |

> **Note:** Mainnet addresses will be published after security audits and community validation. For the latest addresses, see [docs.ciro.network/contracts](https://docs.ciro.network/contracts).

---

## 🏛️ **Core Architecture: A Three-Pillar System**

Our on-chain infrastructure is built on three core pillars that work in concert to manage the lifecycle of a compute job:

1.  **`JobManager.cairo`**: The central coordinator. It handles job submissions, worker assignments, state transitions, and payment settlements. Think of it as the network's universal remote control.
2.  **`CDC_Pool.cairo`** (Compute Data & Consensus Pool): The resource and consensus hub. This contract manages worker registration, staking, reputation, and the crucial task of selecting the best worker for a given job.
3.  **`CIRO_Token.cairo`**: The economic engine. An ERC20-compliant token that powers payments, staking, rewards, and governance on the network.

![Contract Architecture](https://via.placeholder.com/800x400.png?text=JobManager+%3C-%3E+CDC_Pool+%3C-%3E+CIRO_Token)
*A high-level view of contract interactions.*

---

## 🔬 **Pillar 1: `JobManager.cairo` - The Orchestrator**

The `JobManager` is where the journey of every compute task begins and ends. It's a finite state machine that meticulously tracks each job through its lifecycle.

### **Key Responsibilities:**

-   **Job Submission (`submit_ai_job`)**:
    -   A `client` submits a `JobSpec` (detailing the AI model, inputs, and requirements) and locks `payment` in the contract.
    -   A unique `JobId` is generated.
    -   An on-chain event `JobSubmitted` is emitted for indexing and transparency.

-   **State Management**:
    -   The contract tracks the state of each job: `Pending`, `Assigned`, `Completed`, `Failed`.
    -   The `job_states` mapping (`Map<JobId, JobState>`) provides a canonical, on-chain record of every job's status.

-   **Worker Assignment**:
    -   The `JobManager` calls out to the `CDC_Pool` to select the most suitable, high-reputation worker for the job.
    -   Once a `worker` is selected, the job state is updated to `Assigned`.

-   **Verification & Completion (`complete_job`)**:
    -   After off-chain computation, the assigned `worker` submits the `JobResult`.
    -   Depending on the `VerificationMethod` specified in the `JobSpec`, the contract will trigger the appropriate on-chain verification (e.g., ZK-proof verification).
    -   Upon successful verification, the state moves to `Completed`.

-   **Payment Settlement (`release_payment`)**:
    -   Once a job is `Completed`, the `JobManager` facilitates the transfer of funds.
    -   It uses its `IERC20Dispatcher` to send the `payment` from the locked funds to the `worker`, minus a small `platform_fee_bps` which is sent to the `treasury`.

### **Core Storage Mappings:**

The `JobManager` relies on a set of `Map` structures to store all critical data on-chain:

-   `job_specs: Map<JobId, JobSpec>`: The detailed specification for each job.
-   `job_clients: Map<JobId, ContractAddress>`: Who submitted the job.
-   `job_workers: Map<JobId, ContractAddress>`: Who is executing the job.
-   `job_payments: Map<JobId, u256>`: The payment amount locked for the job.

```cairo
// Simplified Storage from JobManager.cairo
#[storage]
struct Storage {
    // ...
    next_job_id: u256,
    job_states: Map<felt252, JobState>,
    job_clients: Map<felt252, ContractAddress>,
    job_workers: Map<felt252, ContractAddress>,
    job_payments: Map<felt252, u256>,
    // ...
}
```

---

## 🤝 **Pillar 2: `CDC_Pool.cairo` - The Trust Layer**

If the `JobManager` is the brain, the `CDC_Pool` is the heart, pumping trust and reputation throughout the network. It ensures that only honest and capable workers are assigned to jobs.

### **Key Responsibilities:**

-   **Worker Registration & Staking**:
    -   GPU providers register as workers by staking `CIRO` tokens, signaling their commitment to the network.
    -   Their hardware capabilities and specifications are stored on-chain.

-   **Reputation & Slashing**:
    -   The pool maintains a reputation score for each worker based on performance (successful jobs, uptime, etc.).
    -   Malicious or faulty workers can have their stake "slashed" (confiscated) as a penalty, creating a strong economic disincentive against bad behavior.

-   **Worker Selection Algorithm**:
    -   When the `JobManager` requests a worker, the `CDC_Pool` runs its sophisticated selection algorithm.
    -   This algorithm considers:
        -   **Reputation Score**: Prioritizes trusted workers.
        -   **Stake Size**: Higher stake signals more skin-in-the-game.
        -   **Hardware Match**: Ensures the worker meets the `JobSpec`'s requirements.
        -   **Randomness**: Prevents centralization and provides fairness.

---

## 💸 **Pillar 3: `CIRO_Token.cairo` - The Economic Fuel**

The `CIRO` token is the lifeblood of the network, a standard ERC20 token supercharged with utility.

### **Core Utilities:**

-   **Payment for Compute**: The primary medium of exchange for AI jobs.
-   **Staking for Security**: Workers stake `CIRO` to participate and earn rewards.
-   **Governance**: `CIRO` holders can vote on protocol upgrades and treasury allocations.
-   **Incentives**: A portion of network fees is used for community grants and ecosystem development.

---

## 🌊 **The Job Lifecycle: An On-Chain Journey**

Let's trace a single AI job from creation to completion:

1.  **Submission**: A user calls `submit_ai_job` on `JobManager`, locking `CIRO` tokens.
2.  **Selection**: `JobManager` requests a worker from `CDC_Pool`.
3.  **Assignment**: `CDC_Pool` selects the best worker and informs `JobManager`.
4.  **Execution**: The worker performs the AI computation off-chain.
5.  **Completion & Verification**: The worker submits the result and ZK proof to `JobManager`. The proof is verified on-chain.
6.  **Settlement**: `JobManager` calls `CIRO_Token`'s `transfer` function to pay the worker and the treasury.
7.  **Reputation Update**: `JobManager` informs `CDC_Pool` of the successful job, which updates the worker's reputation score.

This entire process is transparent, verifiable, and governed by immutable code on Starknet, creating a truly trustless marketplace for AI compute.

---

## 🛡️ Upgradeability & Contract Management

Ciro contracts are designed for long-term security and flexibility:
- **Upgradeable Patterns:** We use UUPS and Diamond proxy patterns for safe upgrades, with all changes gated by DAO governance and timelocks.
- **Multi-Sig Controls:** Critical functions (upgrades, treasury, emergency pause) require multi-signature approval from trusted council members.
- **Timelocks:** All upgrades and treasury actions are subject to configurable delays, giving the community time to review and react.
- **Audit Trail:** Every upgrade, parameter change, and critical action is logged on-chain for transparency.

---

## 🌉 Multichain & Bridging Strategy

Ciro is built for a multichain world:
- **Starknet as the Hub:** All core logic and settlement happens on Starknet for speed, security, and ZK verifiability.
- **Bridges:** We deploy bridge contracts to Ethereum, Polygon, and other L1s/L2s, enabling users to settle jobs and stake on their preferred chain.
- **Cross-Chain Proofs:** ZK-ML proofs and job receipts can be verified on any supported chain, unlocking new use cases in DeFi, gaming, and beyond.
- **Future-Proofing:** Contracts are modular and upgradeable, ready to support new chains and standards as the ecosystem evolves.

---

**For the latest contract addresses, ABI files, and deployment scripts, visit our [GitHub](https://github.com/Ciro-AI-Labs/ciro-network/tree/main/cairo-contracts) or join our [Discord](https://discord.gg/ciro-network) for real-time updates.**
