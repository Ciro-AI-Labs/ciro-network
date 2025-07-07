### “CIRO Distributed Compute Layer” (CDC)

_A Starknet-native marketplace for AI/ML inference that feeds CIRO’s real-time
context engine_

---

## 1 | What we’ll tell the Starknet Foundation

> **Problem** – Running Kafka streams, LLMs and CV models is compute-hungry.
> Starknet dApps, games and DeFi protocols all need low-latency AI but can’t
> afford centralised GPU bills. **Solution** – **CDC** turns spare GPUs into a
> **trust-minimised render farm**. Jobs are posted and settled on Starknet;
> workers supply proofs (hash attestation first, ZK-ML later) and earn CIRO
> tokens. The same network powers CIRO’s “chat with your world” UX.

This is core **public infrastructure**, not just an app, so it fits the
Foundation’s Growth-Grant rubric (up to ≈ \$1 M). ([starknet.io][1])

---

## 2 | Architecture at a glance

```
          ┌─────────┐      Job + funds          ┌────────────┐
UI / CLI ─► JobMgr  ├──────────────────────────►│  CDC Pool  │ (Cairo 1 contract)
          └─────────┘  result + proof + sig     └────────────┘
                               ▲                        │
                               │                        │ payout
                               │                        ▼
                      ┌────────────────┐     attestation/ZK-ML
Data / Game stream ──►│  Coordinator   │◄────────┐  ┌──────────┐
(Kafka topic)         └────────────────┘         │  │  Worker  │
                             │                  …   │  Node    │ (Docker, GPU)
                             ▼                      └──────────┘
                   ClickHouse + RAG         (workers stake → can be slashed)
```

- **JobMgr (Cairo)** – escrow, staking, slashing, on-chain registry of model
  hashes.
- **Coordinator (Rust)** – listens to Kafka, packages inference jobs, dispatches
  to workers, submits on-chain receipts.
- **Worker Node (Docker)** – runs the model, signs result, can later add
  **Orion/Giza** proof for verifiable ML. ([github.com][2])
- **Paymaster add-on** – lets IoT devices or games post jobs **gas-free**
  (account-abstraction track).
- Everything MIT-licensed; devs can fork the SDK to build their own AI dApps.

---

## 3 | Three-phase grant roadmap

| Phase                 | Months | Deliverables (all open source)                                                                                                                                 | Grant ask   | Starknet value                                    |
| --------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| **Seed: “Bootstrap”** | 0-3    | • Cairo JobMgr v0<br>• Rust Coordinator + simple hash-attestation flow<br>• Worker reference image (CPU)<br>• Dev-doc site & tests                             | **\$75 k**  | First decentralised compute escrow on Starknet    |
| **Tooling: “Scale”**  | 4-7    | • GPU-capable worker<br>• Paymaster for gasless IoT/game jobs<br>• Dashboard for network stats                                                                 | **\$250 k** | Unlocks AA UX & high-TPS consumption of compute   |
| **Growth: “Prove”**   | 8-15   | • Giza/Orion ZK-ML integration (proof of ResNet inference) ([starknet.io][3]) <br>• Slashing based on invalid proofs<br>• Cross-rollup bridge (Herodotus / L3) | **\$650 k** | Flagship zkML infra; positions Starknet as AI hub |

Total ≃ **\$1 M** – aligned with Foundation caps.

---

## 4 | Bootcamp Day-1 deliverable (28 day sprint)

| Day | Output                                                                                       | Proof                 |
| --- | -------------------------------------------------------------------------------------------- | --------------------- |
| 7   | Repo `/cdc/` with Cairo JobMgr skeleton + unit tests                                         | GitHub link, CI green |
| 14  | CPU worker executes SHA-256 job, submits receipt, gets paid in test STRK                     | Voyager tx hash       |
| 21  | CIRO Desktop connects wallet, posts inference job via chat (`/run sentiment "Hello world"`). | Loom clip             |
| 28  | Grafana board shows live job queue, worker earnings; Medium dev-log published.               | Public URL            |

> _This single path shows Starknet-only focus, but naturally expands into DePIN
> compute for the broader CIRO vision._

---

## 5 | Why this is credible for you

- **Kafka & Flink** already in CIRO → Coordinator slot is 90 % code you know.
- Your **CV/LLM models** become the first workloads – instant dog-fooding.
- **Incentive design** is defensible: workers stake, get slashed, earn—classic
  DePIN.

---

## 6 | Immediate next steps

1. **Confirm Phase-1 scope** (JobMgr + Coordinator + CPU worker).
2. I draft the **grant application** (exec summary, milestones, budget).
3. Spin up **Scarb + Cargo** skeleton and push to your repo (ready for Cursor).

Just say “let’s draft” or “show me the repo scaffold,” and we’ll move.

[1]: https://www.starknet.io/grants/?utm_source=chatgpt.com 'Starknet Grants'
[2]:
  https://github.com/gizatechxyz/orion?utm_source=chatgpt.com
  'gizatechxyz/orion: ONNX Runtime in Cairo 1.0 for verifiable ML ...'
[3]:
  https://www.starknet.io/verifiable-ai-agents/?utm_source=chatgpt.com
  'AI Portal | Starknet'

Below is a **tighter, punch-piercing rewrite**—same backbone, sharper voice,
more depth. Feel free to lift any section verbatim for the grant deck or
airtable form.

---

## 🚀 “CIRO Distributed Compute Layer” (CDC)

_A Starknet-native marketplace that turns idle GPUs into a censorship-resistant
AI powerhouse—fueling CIRO’s real-time context engine and every dApp that craves
low-latency inference._

---

### 1 | Narrative for the Starknet Foundation

> **The Pain** – Kafka fire-hoses, LLMs, and computer-vision models devour
> compute. Starknet games, DeFi protocols, and AI agents all need nanosecond
> answers but can’t bankroll centralized GPU farms. **Our Answer** – **CDC** is
> a _trust-minimized render farm on Starknet._ Any dApp posts an inference job;
> distributed workers stake STRK, deliver results (hash attestations first,
> ZK-ML proofs next), and earn **CIRO credits**. The same mesh keeps CIRO’s
> “chat with your world” experience real-time, affordable, and verifiable.

That’s pure **public infrastructure**—exactly what the Growth-Grant track funds
(US \$25 K → \$1 M, no equity) ([starknet.io][1]).

---

### 2 | Architecture in one glance

```
          ┌────────────┐  job + funds      ┌─────────────┐
User / dApp ─► JobMgr  ├───────────────────►│  CDC Pool   │ (Cairo 1)
          └────────────┘  proof + sig       └─────────────┘
                 ▲                                  │ payout
                 │                                  ▼
        ┌─────────────────┐        attest/ZK-ML ┌──────────────┐
Kafka ► │  Coordinator 🦀 │◄──────────────┐   ┌──► Worker Node │
stream   (Rust)           │               │   │   (Docker + GPU / CPU)
        └─────────────────┘               …   └──────────────┘
                   │  ClickHouse→RAG                 (staked ⇒ slashable)
                   ▼
            CIRO chat / dashboards
```

| Piece                    | Role                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- |
| **JobMgr (Cairo)**       | Escrow, staking, slashing, registry of model hashes                          |
| **Coordinator (Rust)**   | Batches Kafka events → jobs, routes to workers, writes receipts on-chain     |
| **Worker Node (Docker)** | Runs model, signs result, later attaches **Orion/Giza** ZK proof             |
| **Paymaster Add-on**     | Lets IoT devices & game clients post jobs _gas-free_ via account-abstraction |

All MIT-licensed; devs can fork and fork again.

---

### 3 | Three-phase grant trajectory

| Phase                  | Time    | Open-sourced Deliverables                                                                                                           | Grant Ask   | Value to Starknet                                |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **Seed – “Bootstrap”** | 0-3 mo  | • Cairo JobMgr v0<br>• Rust Coordinator + SHA-256 attestation flow<br>• CPU worker image<br>• Dev-docs & CI                         | **\$75 K**  | First decentralized compute escrow on Starknet   |
| **Tooling – “Scale”**  | 4-7 mo  | • GPU worker w/ CUDA<br>• Paymaster for gas-free IoT & games<br>• Grafana + explorer for network stats                              | **\$250 K** | Mass-adoption UX; high-TPS compute consumer      |
| **Growth – “Prove”**   | 8-15 mo | • ZK-ML integration (Giza / Orion) proving ResNet inference<br>• On-chain slashing for invalid proofs<br>• Bridge to L3 / Herodotus | **\$650 K** | Flagship zk-ML infra; cements Starknet as AI hub |

**Total ask:** **≈ \$1 M**—the Growth-Grant ceiling ([starknet.io][1]).

---

### 4 | Bootcamp-Day Sprint (28 days)

| Day    | Milestone                                                                 | Proof           |
| ------ | ------------------------------------------------------------------------- | --------------- |
| **7**  | `/cdc/` repo with JobMgr scaffolding + unit tests                         | GitHub CI green |
| **14** | CPU worker executes SHA-256, paid in test STRK                            | Voyager tx hash |
| **21** | CIRO Desktop: wallet connect → `/run sentiment "Hello world"` job submits | Loom clip       |
| **28** | Grafana board: live queue, worker earnings + Medium dev-log               | Public URL      |

_Four weeks = Starknet on-chain, real compute, real payout._

---

### 5 | Why you can pull this off

- **Kafka & Flink** already hum inside CIRO → Coordinator is 90 % copy-paste.
- Your own **CV / LLM models** become _alpha workloads_—instant dog-food.
- **Stake / slash economics** are battle-tested in DePIN; we’re just porting to
  Cairo.

---

### 6 | Immediate actions

1. Lock Phase-1 scope (JobMgr + Coordinator + CPU worker).
2. I draft the full grant application (executive summary, milestones, budget).
3. Spin up **Scarb + Cargo** skeleton and open the PR (ready for Cursor).

Say **“draft it”** or **“push the scaffold”** and we start.


### Naming the public repo

| Option            | Pros                                                                                                                                                                     | Cons                                                                                                                    | Good slug       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Ciro Network**  | • Signals a _live, economic network_ of nodes, not just specs.<br>• Matches DePIN & distributed-compute narrative.<br>• Easiest for future token (“CIRO Network Token”). | • “Network” is broad—could be read as telecom or infra provider.                                                        | `ciro-network`  |
| **Ciro Protocol** | • Implies a formal, modular spec—appeals to low-level devs & auditors.<br>• Leaves room to run _Ciro Network_ as a separate deployment later.                            | • Sounds narrower, less community-driven.<br>• “Protocol” repos often hold only smart-contract code, not orchestrators. | `ciro-protocol` |
| **Ciro Compute**  | • Instantly tells newcomers what the repo offers: compute layer.<br>• Leaves brand space for _Ciro Network_ (token / marketplace UI) and _Ciro Core_ (SaaS).             | • Drops the broader “context” vision.<br>• Slightly generic—might need “ai” suffix.                                     | `ciro-compute`  |
| **CDC-Starknet**  | • Descriptive; great for grants (“this is the Starknet fork”).<br>• Lets you later house EVM or Solana variants in sibling repos.                                        | • Lacks brand punch.<br>• Harder to market beyond dev circles.                                                          | `cdc-starknet`  |

---

#### Recommendation

1. **Public, OSS repo:** **`ciro-network`** _Why?_ Conveys a living ecosystem of
   nodes; easy to extend (e.g., `ciro-network/ui`, `ciro-network/contracts`,
   `ciro-network/coordinator`). It also aligns with DePIN/token language you’ll
   need for investors.

2. **Internal mono-repo alias:** keep `ciro-core` (current analytics SaaS)
   separate. Under `/ciro-network` you can nest:

```
ciro-network/
  contracts/      # Cairo 1 JobMgr, Paymaster
  coordinator/    # Rust code
  workers/        # Dockerfiles, ONNX models
  docs/           # spec, grant deliverables
```

3. **If you ever split protocol vs deployment:**
   - `ciro-protocol` → specs + contracts
   - `ciro-network` → live node code + bootstrap scripts

But for the grant and early community traction, **`ciro-network` gives you the
broadest runway**.

---

Let me know and I’ll scaffold the repo with that name.
