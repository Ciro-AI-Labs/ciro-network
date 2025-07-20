# Ciro Network Architecture

```mermaid
graph TB
    subgraph "Starknet Blockchain"
        JM[JobManager Contract]
        CDC[CDC Pool Contract]
        CT[CIRO Token Contract]
        PV[ProofVerifier Contract]
    end
    
    subgraph "Client Layer"
        CA[Client Applications]
        API[API Gateway]
        SDK[Ciro SDK]
    end
    
    subgraph "Orchestration Layer"
        COORD[Coordinator]
        KAFKA[Kafka Queue]
        P2P[P2P Network]
    end
    
    subgraph "Worker Network"
        W1[Worker Node 1<br/>GPU: RTX 4090<br/>Stake: $500]
        W2[Worker Node 2<br/>GPU: H100<br/>Stake: $10K]
        W3[Worker Node 3<br/>GPU: A6000<br/>Stake: $2.5K]
    end
    
    subgraph "Verification Layer"
        ZK[ZK Proof Generation]
        GIZA[Giza/Orion zkML]
        CONSENSUS[Multi-Party Consensus]
    end
    
    CA --> API
    API --> SDK
    SDK --> JM
    JM --> CDC
    JM --> CT
    CDC --> COORD
    COORD --> KAFKA
    KAFKA --> P2P
    P2P --> W1
    P2P --> W2  
    P2P --> W3
    W1 --> ZK
    W2 --> ZK
    W3 --> ZK
    ZK --> GIZA
    GIZA --> CONSENSUS
    CONSENSUS --> PV
    PV --> JM
    
    style JM fill:#8B5CF6
    style CDC fill:#06B6D4
    style CT fill:#10B981
    style PV fill:#F59E0B
    style ZK fill:#EF4444
```

## Mathematical Model

**Network Efficiency Formula:**
```
η = (∑ᵢ Cᵢ × Uᵢ × Rᵢ) / (∑ᵢ Cᵢ × Pᵢ)

Where:
η = Network efficiency
Cᵢ = Compute capacity of worker i
Uᵢ = Utilization rate of worker i
Rᵢ = Reliability score of worker i  
Pᵢ = Power consumption of worker i
```

**Economic Security Bound:**
```
S = min(∑ᵢ sᵢ, k × max(rⱼ))

Where:
S = Total economic security
sᵢ = Stake of worker i
k = Slashing multiplier
rⱼ = Reward for job j
``` 