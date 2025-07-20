# Quick Start Guide

Get up and running with Ciro Network in under 10 minutes. This guide will walk you through submitting your first AI compute job and seeing the 70% cost savings in action.

## 🎯 What You'll Achieve

By the end of this guide, you'll have:
- ✅ **Submitted your first AI inference job** to the Ciro Network
- ✅ **Seen real-time ZK verification** of your computation 
- ✅ **Experienced hybrid infrastructure** (on-prem + network + cloud)
- ✅ **Measured actual cost savings** vs traditional cloud providers

## 🏭 Choose Your Path

### **For Industrial Organizations**
**Best for:** Manufacturing plants, oil & gas facilities, mining operations
**Use case:** 24/7 monitoring, safety systems, predictive maintenance

👉 **[Industrial Quick Start →](../enterprise/quick-start.md)**

### **For Developers & Startups** 
**Best for:** AI applications, gaming, DeFi protocols  
**Use case:** Real-time inference, cost optimization, verifiable AI

👉 **Continue below**

### **For GPU Providers**
**Best for:** Miners, data centers, enthusiasts with idle GPUs
**Use case:** Monetize spare capacity, earn CIRO tokens

👉 **[GPU Provider Guide →](../user-guides/gpu-providers.md)**

---

## 🚀 Developer Quick Start

### **Prerequisites**

**Required:**
- Computer with internet connection
- Basic terminal/command line knowledge

**Recommended:**
- Docker installed (for local testing)
- GPU available (for higher earnings as provider)

### **Step 1: Get Test Tokens**

```bash
# Get Starknet Sepolia testnet tokens
curl -X POST https://faucet.ciro.network/request \
  -d '{"address": "YOUR_WALLET_ADDRESS"}'

# Verify balance
curl https://api.ciro.network/balance/YOUR_WALLET_ADDRESS
```

### **Step 2: Submit Your First Job**

Choose your preferred method:

**Option A: Web Interface (Easiest)**
1. Visit [app.ciro.network](https://app.ciro.network)
2. Connect your Starknet wallet
3. Click "New Compute Job"
4. Select "AI Inference" → "Image Classification"
5. Upload a sample image
6. Submit job and watch real-time processing

**Option B: CLI (Developers)**
```bash
# Install Ciro CLI
npm install -g @ciro/cli

# Submit image classification job
ciro job submit \
  --type ai-inference \
  --model resnet50 \
  --input ./sample-image.jpg \
  --verify-zk \
  --max-cost 0.05
```

**Option C: REST API (Integration)**
```bash
curl -X POST https://api.ciro.network/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "ai_inference", 
    "model": "resnet50",
    "input_data": "base64_encoded_image",
    "verification": "zk_proof",
    "max_reward_usdc": 5
  }'
```

### **Step 3: Monitor Your Job**

**Watch Real-Time Progress:**
```bash
# Get job status
ciro job status JOB_ID

# Stream live updates  
ciro job watch JOB_ID
```

**What You'll See:**
```
✅ Job submitted to network
⏳ Matching with available GPU worker
🔄 Processing on worker node (Detroit, USA)
🔐 Generating ZK proof of computation
✅ Result verified and returned
💰 Payment processed: $0.02 (vs $0.10 AWS equivalent)
```

### **Step 4: Verify the Results**

**Check Computation Proof:**
```bash
# Download ZK proof
ciro proof download JOB_ID proof.json

# Verify proof locally
ciro proof verify proof.json
# ✅ Proof valid: Computation verified independently
```

**Compare Costs:**
```bash
# Get cost breakdown
ciro job cost-analysis JOB_ID

# Example output:
# Ciro Network: $0.02
# AWS SageMaker: $0.08  
# Google Cloud AI: $0.10
# Your savings: 75%
```

## 🎉 Congratulations!

You've successfully:
- ✅ **Submitted AI compute job** to decentralized network
- ✅ **Verified computation** with ZK cryptographic proof
- ✅ **Saved 70%+** compared to traditional cloud providers
- ✅ **Experienced** enterprise-grade AI infrastructure

## 🔄 Next Steps

### **For Production Use**
- **[Enterprise Deployment →](../enterprise/overview.md)** - Hybrid infrastructure setup
- **[Cost Calculator →](../enterprise/cost-savings.md)** - Model your actual savings
- **[Compliance Guide →](../enterprise/compliance.md)** - Regulatory requirements

### **For Integration**  
- **[API Documentation →](../api-reference/rest-apis.md)** - Complete API reference
- **[SDK Reference →](../api-reference/sdks.md)** - Language-specific libraries
- **[Examples →](../case-studies/manufacturing.md)** - Real-world implementations

### **For Contributing**
- **[Run a GPU Worker →](../user-guides/gpu-providers.md)** - Earn CIRO tokens
- **[Development Setup →](../development/setup.md)** - Contribute to the codebase
- **[Join Community →](../resources/community.md)** - Discord, forums, support

## 💡 Pro Tips

### **Optimize Your Jobs**
- **Batch similar requests** to reduce per-job overhead
- **Use appropriate verification levels** (statistical sampling vs full ZK proofs)
- **Schedule non-urgent jobs** during off-peak hours for better pricing
- **Leverage geographic distribution** by specifying preferred regions

### **Monitor Performance**
- **Set up alerts** for job completion and failures
- **Track cost savings** over time with built-in analytics
- **Compare providers** using our cost analysis tools
- **Optimize job parameters** based on historical performance

### **Enterprise Features**
- **Volume discounts** available for high-usage organizations
- **Dedicated support** for production deployments
- **Custom SLAs** for mission-critical applications
- **White-label options** for platform integrators

## 🆘 Need Help?

**Common Issues:**
- **Job stuck in queue?** Check network capacity and increase max reward
- **Verification failing?** Ensure input data format matches model requirements  
- **High costs?** Optimize job parameters or try different time windows
- **Slow results?** Specify geographic preferences for lower latency

**Get Support:**
- 📚 **[FAQ →](../resources/faq.md)** - Common questions and solutions
- 💬 **[Discord Community](https://discord.gg/ciro)** - Real-time help from experts
- 📧 **[Enterprise Support](mailto:enterprise@ciro.network)** - Dedicated assistance
- 🐛 **[Report Issues](https://github.com/Ciro-AI-Labs/ciro-network/issues)** - Bug reports and feature requests

---

**Ready for production?** Schedule a [consultation call](https://calendly.com/ciro-network/consultation) with our industrial AI specialists to design your hybrid infrastructure strategy.
