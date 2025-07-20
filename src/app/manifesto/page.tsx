'use client';

import React, { useState } from 'react';
import { Brain, Shield, Network, Cpu, Zap, Globe, Lock, TrendingUp, Users, Award, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import MathFormula from '@/components/MathFormula';

const sections = [
  'Executive Summary',
  'Vision & Philosophy',
  'Technical Architecture', 
  'Compute Types & Capabilities',
  'Job Types & Workloads',
  'Creative & Artistic Computing',
  'ZK Proof Generation',
  'Scientific Computing',
  'Job Matching & Transportation',
  'Encryption & Security Model',
  'Scalability Architecture',
  'Multichain Integration',
  'Orderbook & Liquidity',
  'Burn Mechanics',
  'Mathematical Foundations',
  'Physical Principles',
  'Tokenomics',
  'Competitive Analysis',
  'Network Effects',
  'Roadmap',
  'References',
];

export default function ManifestoPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg p-3 text-white hover:bg-gray-800 transition-colors"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-6 pb-4 border-b border-gray-800">
              <div className="w-8 h-8 bg-gradient-to-r from-cosmic-cyan to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Manifesto</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-3">
                {sections.map((section) => (
                  <li key={section}>
                    <a 
                      href={`#${section.replace(/\s+/g, '-').toLowerCase()}`} 
                      className="block text-sm hover:text-cosmic-cyan transition-colors font-medium py-2 border-l-2 border-transparent hover:border-cosmic-cyan pl-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {section}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border-t border-gray-800">
              <a 
                href="/" 
                className="flex items-center gap-2 text-cosmic-cyan hover:text-blue-400 transition-colors text-sm font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Side Navigation */}
      <nav className="md:w-64 w-full md:sticky md:top-0 md:h-screen z-10 bg-black/80 backdrop-blur-sm border-r border-gray-800 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-6 pb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cosmic-cyan to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Manifesto</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <ul className="space-y-3">
              {sections.map((section) => (
                <li key={section}>
                  <a 
                    href={`#${section.replace(/\s+/g, '-').toLowerCase()}`} 
                    className="block text-sm hover:text-cosmic-cyan transition-colors font-medium py-1 border-l-2 border-transparent hover:border-cosmic-cyan pl-3"
                  >
                    {section}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 max-w-5xl mx-auto w-full">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cosmic-cyan/10 border border-cosmic-cyan/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-cosmic-cyan" />
            <span className="text-cosmic-cyan text-sm font-medium">Technical Whitepaper v3.1</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-cosmic-cyan to-blue-400 bg-clip-text text-transparent">
            CIRO Network Manifesto
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The Future of Verifiable AI Compute: A Decentralized Infrastructure for Trustless Artificial Intelligence
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Global Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Zero-Knowledge Proofs</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Cryptographic Security</span>
            </div>
          </div>
        </div>

        {/* Section: Executive Summary */}
        <section id="executive-summary" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-cosmic-cyan to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Executive Summary</h2>
          </div>
          
          <div className="bg-gradient-to-r from-cosmic-cyan/5 to-blue-500/5 border border-cosmic-cyan/20 rounded-xl p-8 mb-8">
            <p className="text-lg text-gray-200 leading-relaxed mb-4">
              <strong className="text-cosmic-cyan">CIRO Network</strong> represents a paradigm shift in artificial intelligence infrastructure, introducing the world's first <em>verifiable compute layer</em> that enables trustless AI operations at planetary scale.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By combining zero-knowledge cryptography, decentralized worker nodes, and economic incentive mechanisms, CIRO solves the fundamental trust problem in AI compute while delivering unprecedented scalability, security, and cost efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-cosmic-cyan" />
                <h3 className="text-lg font-semibold">Trust Layer</h3>
              </div>
              <p className="text-gray-400 text-sm">Zero-knowledge proofs ensure computational integrity without revealing sensitive data or models.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Network className="w-6 h-6 text-cosmic-cyan" />
                <h3 className="text-lg font-semibold">Scale Layer</h3>
              </div>
              <p className="text-gray-400 text-sm">Distributed compute nodes provide unlimited horizontal scaling for any AI workload.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Cpu className="w-6 h-6 text-cosmic-cyan" />
                <h3 className="text-lg font-semibold">Economic Layer</h3>
              </div>
              <p className="text-gray-400 text-sm">Market-driven pricing and tokenized incentives optimize resource allocation and cost efficiency.</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Key Innovations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Verifiable AI Compute</h4>
                  <p className="text-gray-400 text-sm">First protocol to enable cryptographically verifiable AI inference and training</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Privacy-Preserving ML</h4>
                  <p className="text-gray-400 text-sm">Execute AI models without exposing training data or model parameters</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Elastic Scaling</h4>
                  <p className="text-gray-400 text-sm">Dynamically allocate compute resources based on real-time demand</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Economic Sustainability</h4>
                  <p className="text-gray-400 text-sm">Self-regulating economy with deflationary token mechanics</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Vision & Philosophy */}
        <section id="vision-&-philosophy" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Vision & Philosophy</h2>
          </div>

          <div className="prose prose-lg prose-gray max-w-none">
            <blockquote className="border-l-4 border-cosmic-cyan bg-cosmic-cyan/5 p-6 rounded-r-lg mb-8">
              <p className="text-lg italic text-gray-200 mb-2">
                "The future of artificial intelligence lies not in centralized control, but in decentralized trust."
              </p>
              <footer className="text-cosmic-cyan">— CIRO Network Foundation</footer>
            </blockquote>

            <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">The Trust Problem in AI</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Today's AI infrastructure suffers from fundamental trust asymmetries. Users must trust centralized providers with sensitive data, 
              model weights, and computational integrity. This creates systemic risks: data breaches, model theft, censorship, and 
              single points of failure that can paralyze entire AI ecosystems.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Our Philosophical Foundation</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Decentralization</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  No single entity should control the infrastructure that powers human intelligence augmentation. 
                  CIRO distributes compute, governance, and economic value across a global network of participants.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Verifiability</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every computation must be cryptographically provable. Trust is replaced with mathematical certainty, 
                  enabling secure AI operations even in adversarial environments.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Privacy</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Data and models remain private by default. Zero-knowledge proofs enable computation on encrypted data 
                  without ever exposing sensitive information to compute providers.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Accessibility</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI compute should be accessible to everyone, not just tech giants. CIRO democratizes access to 
                  high-performance infrastructure through market-driven pricing and permissionless participation.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">The CIRO Vision</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We envision a future where artificial intelligence development is:
            </p>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-cosmic-cyan mt-0.5 flex-shrink-0" />
                <span><strong>Trustless:</strong> Cryptographic proofs eliminate the need to trust centralized providers</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-cosmic-cyan mt-0.5 flex-shrink-0" />
                <span><strong>Borderless:</strong> Global compute resources accessible to anyone, anywhere</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-cosmic-cyan mt-0.5 flex-shrink-0" />
                <span><strong>Censorship-resistant:</strong> No central authority can block or manipulate AI workloads</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-cosmic-cyan mt-0.5 flex-shrink-0" />
                <span><strong>Economically efficient:</strong> Market mechanisms optimize resource allocation and pricing</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section: Technical Architecture */}
        <section id="technical-architecture" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Technical Architecture</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's technical architecture consists of four primary layers that work in concert to deliver verifiable, 
            scalable, and secure AI compute. Each layer is designed with cryptographic guarantees and economic incentives 
            to ensure optimal performance and security.
          </p>

          {/* Architecture Diagram */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">System Architecture</h3>
            <MermaidDiagram
              chart={`flowchart TD
    API[CIRO API Gateway]
    SDK[Client SDKs]
    UI[Web Interface]
    
    JM[Job Manager]
    VM[Verification Manager]
    IM[Incentive Manager]
    GM[Governance Manager]
    
    WN1[GPU Clusters]
    WN2[CPU Farms]
    WN3[AI Accelerators]
    WN4[Edge Devices]
    
    ZK[ZK Proof Generator]
    VV[Proof Validators]
    CS[Consensus Engine]
    
    TOKEN[CIRO Token]
    STAKE[Staking Pools]
    REWARD[Reward System]
    BURN[Burn Mechanisms]
    
    API --> JM
    SDK --> JM
    UI --> API
    
    JM --> WN1
    JM --> WN2
    JM --> WN3
    JM --> WN4
    
    WN1 --> ZK
    WN2 --> ZK
    WN3 --> ZK
    WN4 --> ZK
    
    ZK --> VV
    VV --> CS
    CS --> VM
    
    VM --> IM
    IM --> REWARD
    REWARD --> TOKEN
    TOKEN --> STAKE
    STAKE --> WN1
    
    GM --> TOKEN
    TOKEN --> BURN
    
    classDef appLayer fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef protocolLayer fill:#7c3aed,stroke:#8b5cf6,stroke-width:2px,color:#fff
    classDef computeLayer fill:#059669,stroke:#10b981,stroke-width:2px,color:#fff
    classDef verificationLayer fill:#dc2626,stroke:#ef4444,stroke-width:2px,color:#fff
    classDef economicLayer fill:#ea580c,stroke:#f97316,stroke-width:2px,color:#fff
    
    class API,SDK,UI appLayer
    class JM,VM,IM,GM protocolLayer
    class WN1,WN2,WN3,WN4 computeLayer
    class ZK,VV,CS verificationLayer
    class TOKEN,STAKE,REWARD,BURN economicLayer`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Layer 1: Verification Layer</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                The foundation of trust in CIRO Network. Uses advanced zero-knowledge proof systems to verify computational integrity.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• STARK-based proof generation for scalability</li>
                <li>• Recursive proof composition for complex computations</li>
                <li>• Hardware-accelerated verification</li>
                <li>• Fraud proof mechanisms for dispute resolution</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Layer 2: Compute Layer</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Distributed network of compute providers offering specialized AI hardware and software capabilities.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• GPU clusters for parallel training</li>
                <li>• Specialized AI accelerators (TPUs, FPGAs)</li>
                <li>• Edge computing nodes for low-latency inference</li>
                <li>• Secure enclaves for confidential computing</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Layer 3: Protocol Layer</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Smart contract infrastructure managing job orchestration, resource allocation, and network coordination.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Job scheduling and load balancing</li>
                <li>• Resource discovery and matching</li>
                <li>• Payment and settlement systems</li>
                <li>• Reputation and slashing mechanisms</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border border-orange-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-400">Layer 4: Economic Layer</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Token-based incentive system aligning participant interests and ensuring sustainable network growth.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Dynamic pricing based on supply and demand</li>
                <li>• Staking requirements for compute providers</li>
                <li>• Reward distribution mechanisms</li>
                <li>• Governance token for protocol decisions</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Key Technical Innovations</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-cosmic-cyan pl-4">
                <h4 className="font-semibold text-white">Recursive Zero-Knowledge Proofs</h4>
                <p className="text-gray-400 text-sm">
                  Novel application of recursive STARKs to verify arbitrarily complex AI computations while maintaining constant verification time.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-semibold text-white">Homomorphic Encryption Integration</h4>
                <p className="text-gray-400 text-sm">
                  Seamless integration with FHE schemes enabling computation on encrypted data without performance degradation.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <h4 className="font-semibold text-white">Adaptive Resource Allocation</h4>
                <p className="text-gray-400 text-sm">
                  ML-powered system that predicts compute demand and preemptively allocates resources for optimal performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Compute Types & Capabilities */}
        <section id="compute-types-&-capabilities" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Compute Types & Capabilities</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network supports a diverse range of compute workloads, from high-performance GPU clusters to specialized AI accelerators, 
            and edge computing nodes for low-latency applications.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">GPU Clusters</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                High-performance GPU clusters for AI training and inference, optimized for parallel processing and memory bandwidth.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• NVIDIA A100, V100, P4000</li>
                <li>• 100+ GPUs per cluster</li>
                <li>• 100+ TFlops/s of FP32 performance</li>
                <li>• 100+ GB/s of memory bandwidth</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Specialized AI Accelerators</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Custom hardware accelerators (TPUs, FPGAs) for specific AI workloads, offering unparalleled performance and efficiency.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Google TPU v4, v5</li>
                <li>• Xilinx VU9P, Alveo U250</li>
                <li>• 100+ TFlops/s of FP32 performance</li>
                <li>• 100+ GB/s of memory bandwidth</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Edge Computing</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Edge nodes for low-latency, high-bandwidth applications, enabling real-time AI processing and data analysis.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• NVIDIA Jetson, Intel NUC</li>
                <li>• 100+ TFlops/s of FP32 performance</li>
                <li>• 100+ GB/s of memory bandwidth</li>
                <li>• Secure enclaves for confidential computing</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-orange-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Hybrid Architectures</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Combination of cloud and edge resources for optimal performance and cost efficiency.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• GPU clusters + Edge nodes for latency-sensitive tasks</li>
                <li>• TPUs + GPU clusters for high-throughput AI training</li>
                <li>• Custom ASICs for specific AI applications</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Capabilities</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-400 mb-2">AI Training</h5>
                <p className="text-gray-400 text-xs">
                  Large-scale neural network training, including image classification, object detection, and language models.
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">AI Inference</h5>
                <p className="text-gray-400 text-xs">
                  Real-time, low-latency AI model inference for applications like speech recognition, object tracking, and fraud detection.
                </p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-purple-400 mb-2">Data Processing</h5>
                <p className="text-gray-400 text-xs">
                  High-speed data ingestion, transformation, and analysis for real-time monitoring and decision-making.
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-orange-400 mb-2">Edge Intelligence</h5>
                <p className="text-gray-400 text-xs">
                  AI models deployed directly on edge devices for autonomous decision-making and local processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Job Types & Workloads */}
        <section id="job-types-&-workloads" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Job Types & Workloads</h2>
          </div>

                     <p className="text-gray-300 leading-relaxed mb-8">
             CIRO Network supports the full spectrum of compute-intensive workloads that benefit from verifiable execution, 
             ranging from AI training and creative rendering to zero-knowledge proof generation and scientific simulations. 
             Our platform democratizes access to high-performance computing across all industries.
           </p>

                     <div className="grid md:grid-cols-2 gap-8 mb-8">
             <div className="bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border border-yellow-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-yellow-400">AI & Machine Learning</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Neural network training, inference, and model optimization across all AI domains.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Large language model training (100B+ params)</li>
                 <li>• Computer vision (object detection, segmentation)</li>
                 <li>• Real-time inference and deployment</li>
                 <li>• Federated learning across networks</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-purple-400">Creative & Rendering</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 High-performance creative computing for digital artists, filmmakers, and content creators.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• 3D rendering and animation (Blender, Maya)</li>
                 <li>• Video processing and encoding (4K/8K)</li>
                 <li>• Procedural content generation</li>
                 <li>• Real-time ray tracing and VFX</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-green-400">Cryptographic Computing</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Zero-knowledge proof generation, blockchain validation, and advanced cryptographic operations.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• STARK/SNARK proof generation</li>
                 <li>• Blockchain consensus and validation</li>
                 <li>• Homomorphic encryption operations</li>
                 <li>• Multi-party computation (MPC)</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-red-900/20 to-pink-800/20 border border-red-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-red-400">Scientific Computing</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 High-performance computing for research, simulation, and complex mathematical modeling.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Molecular dynamics simulations</li>
                 <li>• Climate and weather modeling</li>
                 <li>• Financial risk analysis and modeling</li>
                 <li>• Computational fluid dynamics (CFD)</li>
               </ul>
             </div>
           </div>

                     <div className="bg-gray-900 rounded-xl p-6">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Workload Characteristics</h3>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-blue-400 mb-2">Computational Intensity</h5>
                 <p className="text-gray-400 text-xs">
                   High-throughput workloads: 10-1000+ TFlops/s depending on task complexity
                 </p>
               </div>
               <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-green-400 mb-2">Memory Requirements</h5>
                 <p className="text-gray-400 text-xs">
                   From 8GB (rendering) to 1TB+ (large-scale training/simulation)
                 </p>
               </div>
               <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-purple-400 mb-2">Latency Sensitivity</h5>
                 <p className="text-gray-400 text-xs">
                   Real-time (10ms), Interactive (100ms), Batch (hours/days)
                 </p>
               </div>
               <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-orange-400 mb-2">Verification Complexity</h5>
                 <p className="text-gray-400 text-xs">
                   ZK proofs (high), Rendering (medium), AI inference (variable)
                 </p>
               </div>
             </div>
           </div>
         </section>

         {/* Section: Creative & Artistic Computing */}
         <section id="creative-&-artistic-computing" className="mb-20 scroll-mt-24">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
               <Award className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-4xl font-bold">Creative & Artistic Computing</h2>
           </div>

           <p className="text-gray-300 leading-relaxed mb-8">
             CIRO Network revolutionizes creative computing by providing verifiable, cost-effective access to high-performance 
             rendering and content creation resources. Artists, filmmakers, and creators can now access enterprise-grade 
             infrastructure without the traditional barriers.
           </p>

           <div className="grid md:grid-cols-2 gap-8 mb-8">
             <div className="bg-gradient-to-br from-pink-900/20 to-purple-800/20 border border-pink-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-pink-400">3D Rendering & Animation</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Distributed rendering for animation studios, architects, and 3D artists using industry-standard tools.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Blender Cycles & EEVEE rendering</li>
                 <li>• Autodesk Maya & 3ds Max support</li>
                 <li>• Cinema 4D and Houdini workflows</li>
                 <li>• Real-time ray tracing with RTX/RDNA</li>
                 <li>• Distributed frame rendering (1000+ nodes)</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-purple-400">Video Processing & Encoding</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 High-throughput video processing, encoding, and post-production workflows for content creators.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• 4K/8K video encoding (H.264, H.265, AV1)</li>
                 <li>• Real-time video effects and compositing</li>
                 <li>• Adobe After Effects & Premiere workflows</li>
                 <li>• DaVinci Resolve color grading</li>
                 <li>• Live streaming transcoding</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border border-blue-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-blue-400">Game Development & Assets</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Procedural content generation, asset optimization, and game engine computations.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Unreal Engine lightmap baking</li>
                 <li>• Unity batch processing</li>
                 <li>• Procedural terrain generation</li>
                 <li>• Texture synthesis and optimization</li>
                 <li>• Physics simulation pre-computation</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-cyan-900/20 to-teal-800/20 border border-cyan-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-cyan-400">Digital Art & NFTs</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 AI-powered art generation, style transfer, and large-scale digital art creation.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Stable Diffusion & DALL-E workflows</li>
                 <li>• Style transfer algorithms</li>
                 <li>• Large-scale NFT collection generation</li>
                 <li>• Generative art algorithms</li>
                 <li>• Image upscaling and enhancement</li>
               </ul>
             </div>
           </div>

           {/* Creative Computing Economics */}
           <div className="bg-gray-900 rounded-xl p-6 mb-8">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Cost Comparison: CIRO vs Traditional Render Farms</h3>
             <div className="grid md:grid-cols-3 gap-6">
               <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-4">
                 <h4 className="font-semibold text-pink-400 mb-2">CIRO Network</h4>
                 <ul className="text-gray-300 text-sm space-y-1">
                   <li>• $0.10-2.00/hour per GPU</li>
                   <li>• Pay-per-use pricing</li>
                   <li>• No setup fees</li>
                   <li>• Verifiable output quality</li>
                   <li>• Global resource pool</li>
                 </ul>
               </div>
               <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                 <h4 className="font-semibold text-orange-400 mb-2">Traditional Render Farms</h4>
                 <ul className="text-gray-400 text-sm space-y-1">
                   <li>• $2.00-15.00/hour per GPU</li>
                   <li>• Minimum commitment fees</li>
                   <li>• Setup and management costs</li>
                   <li>• Trust-based quality</li>
                   <li>• Limited geographic options</li>
                 </ul>
               </div>
               <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                 <h4 className="font-semibold text-green-400 mb-2">Savings Potential</h4>
                 <ul className="text-gray-300 text-sm space-y-1">
                   <li>• <strong>70-90% cost reduction</strong></li>
                   <li>• No vendor lock-in</li>
                   <li>• Instant scalability</li>
                   <li>• Cryptographic guarantees</li>
                   <li>• Censorship resistance</li>
                 </ul>
               </div>
             </div>
           </div>

           {/* Creative Workflow Diagram */}
           <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Verifiable Creative Workflow</h3>
           <MermaidDiagram
             chart={`graph TD
    subgraph "Content Creation"
        CA[Creative Asset/Scene]
        UP[Upload Encrypted Files]
        JC[Job Configuration]
        QS[Quality Settings]
    end
    
    subgraph "Distributed Rendering"
        JS[Job Splitting]
        WA[Worker Assignment]
        PR[Parallel Rendering]
        QC[Quality Verification]
    end
    
    subgraph "Verification & Assembly"
        ZK[ZK Proof Generation]
        FV[Frame Verification]
        AS[Asset Assembly]
        DL[Delivery & Payment]
    end
    
    subgraph "Creative Tools"
        BL[Blender]
        MA[Maya/3ds Max]
        AE[After Effects]
        UV[Unreal Engine]
    end
    
    CA --> UP
    UP --> JC
    JC --> QS
    QS --> JS
    
    JS --> WA
    WA --> PR
    PR --> QC
    QC --> ZK
    
    ZK --> FV
    FV --> AS
    AS --> DL
    
    BL --> CA
    MA --> CA
    AE --> CA
    UV --> CA
    
    style PR fill:#ff6b9d
    style ZK fill:#4ecdc4
    style DL fill:#96ceb4
`}
           />
         </section>

         {/* Section: ZK Proof Generation */}
         <section id="zk-proof-generation" className="mb-20 scroll-mt-24">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
               <Lock className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-4xl font-bold">ZK Proof Generation</h2>
           </div>

           <p className="text-gray-300 leading-relaxed mb-8">
             Zero-knowledge proof generation is one of the most compute-intensive operations in modern cryptography. 
             CIRO Network provides specialized infrastructure for efficient, verifiable ZK proof generation at scale, 
             enabling privacy-preserving applications across blockchain and enterprise systems.
           </p>

           <div className="grid md:grid-cols-2 gap-8 mb-8">
             <div className="bg-gradient-to-br from-indigo-900/20 to-blue-800/20 border border-indigo-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-indigo-400">STARK Proof Generation</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Scalable Transparent Arguments of Knowledge for large-scale verifiable computation.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Cairo program execution proofs</li>
                 <li>• StarkNet transaction batching</li>
                 <li>• Recursive proof composition</li>
                 <li>• Custom circuit optimization</li>
                 <li>• Parallel witness generation</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-blue-900/20 to-purple-800/20 border border-blue-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-blue-400">SNARK Systems</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Succinct Non-Interactive Arguments of Knowledge for efficient privacy-preserving protocols.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Groth16 & PLONK proof systems</li>
                 <li>• zk-SNARKs for privacy coins</li>
                 <li>• Circom circuit compilation</li>
                 <li>• Trusted setup ceremonies</li>
                 <li>• Universal setup systems (PLONK)</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-purple-900/20 to-pink-800/20 border border-purple-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-purple-400">Specialized Applications</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Domain-specific ZK proof generation for various blockchain and enterprise use cases.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Privacy-preserving DeFi protocols</li>
                 <li>• Blockchain rollup verification</li>
                 <li>• Identity verification systems</li>
                 <li>• Supply chain provenance</li>
                 <li>• Confidential voting systems</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-pink-900/20 to-red-800/20 border border-pink-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-pink-400">Performance Optimization</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Advanced optimization techniques for reducing proof generation time and computational costs.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Hardware acceleration (GPU/FPGA)</li>
                 <li>• Parallel circuit evaluation</li>
                 <li>• Memory optimization strategies</li>
                 <li>• Batch proof generation</li>
                 <li>• Circuit-specific optimizations</li>
               </ul>
             </div>
           </div>

           {/* ZK Proof Generation Mathematics */}
           <div className="bg-gray-900 rounded-xl p-6 mb-8">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">ZK Proof Complexity Analysis</h3>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <h4 className="font-semibold text-white mb-3">Prover Complexity</h4>
                 <div className="bg-black/50 rounded-lg p-4 mb-4">
                   <div className="mb-2 text-cosmic-cyan">STARK Prover Time:</div>
                   <MathFormula formula={`T_{prove} = O(C \\log^2 C)`} />
                   <div className="text-gray-400 text-xs mt-2">
                     Where C is the number of constraints in the arithmetic circuit
                   </div>
                 </div>
                 <div className="bg-black/50 rounded-lg p-4">
                   <div className="mb-2 text-cosmic-cyan">Memory Requirements:</div>
                   <MathFormula formula={`M_{prove} = O(C \\log C)`} />
                   <div className="text-gray-400 text-xs mt-2">
                     Linear in circuit size with logarithmic overhead
                   </div>
                 </div>
               </div>
               <div>
                 <h4 className="font-semibold text-white mb-3">Verification Efficiency</h4>
                 <div className="bg-black/50 rounded-lg p-4 mb-4">
                   <div className="mb-2 text-cosmic-cyan">Verification Time:</div>
                   <MathFormula formula={`T_{verify} = O(\\log^2 C)`} />
                   <div className="text-gray-400 text-xs mt-2">
                     Polylogarithmic verification independent of computation size
                   </div>
                 </div>
                 <div className="bg-black/50 rounded-lg p-4">
                   <div className="mb-2 text-cosmic-cyan">Proof Size:</div>
                   <MathFormula formula={`|\\pi| = O(\\log^2 C)`} />
                   <div className="text-gray-400 text-xs mt-2">
                     Compact proofs growing slowly with circuit complexity
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* ZK Proof Generation Workflow */}
           <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">ZK Proof Generation Pipeline</h3>
           <MermaidDiagram
             chart={`graph TD
    subgraph "Circuit Design"
        CD[Circuit Definition]
        CO[Constraint Optimization]
        CS[Circuit Compilation]
    end
    
    subgraph "Witness Generation"
        WI[Witness Input]
        WC[Witness Computation]
        WV[Witness Validation]
    end
    
    subgraph "Proof Generation"
        PG[Prover Assignment]
        PC[Parallel Computation]
        PA[Proof Assembly]
        PV[Proof Verification]
    end
    
    subgraph "Optimization Layers"
        HW[Hardware Acceleration]
        BA[Batch Processing]
        CA[Circuit Caching]
        MO[Memory Optimization]
    end
    
    CD --> CO
    CO --> CS
    CS --> WI
    
    WI --> WC
    WC --> WV
    WV --> PG
    
    PG --> PC
    PC --> PA
    PA --> PV
    
    HW --> PC
    BA --> PC
    CA --> CO
    MO --> PC
    
    style PC fill:#4ecdc4
    style PA fill:#45b7d1
    style PV fill:#96ceb4
`}
           />
         </section>

         {/* Section: Scientific Computing */}
         <section id="scientific-computing" className="mb-20 scroll-mt-24">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
               <Globe className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-4xl font-bold">Scientific Computing</h2>
           </div>

           <p className="text-gray-300 leading-relaxed mb-8">
             CIRO Network provides researchers, scientists, and institutions with access to high-performance computing 
             resources for complex simulations, modeling, and analysis. Our verifiable compute ensures reproducible 
             scientific results while dramatically reducing costs.
           </p>

           <div className="grid md:grid-cols-2 gap-8 mb-8">
             <div className="bg-gradient-to-br from-emerald-900/20 to-green-800/20 border border-emerald-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-emerald-400">Molecular Dynamics</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Large-scale molecular simulations for drug discovery, materials science, and biochemical research.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• GROMACS & AMBER simulations</li>
                 <li>• Protein folding studies</li>
                 <li>• Drug-target interaction modeling</li>
                 <li>• Materials property prediction</li>
                 <li>• Membrane dynamics simulation</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-green-400">Climate & Weather Modeling</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 High-resolution climate simulations and weather prediction models for environmental research.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Global circulation models (GCMs)</li>
                 <li>• Weather forecasting systems</li>
                 <li>• Climate change projections</li>
                 <li>• Atmospheric chemistry modeling</li>
                 <li>• Oceanographic simulations</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-teal-900/20 to-blue-800/20 border border-teal-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-teal-400">Computational Fluid Dynamics</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Advanced fluid flow simulations for aerospace, automotive, and engineering applications.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• OpenFOAM & ANSYS Fluent workflows</li>
                 <li>• Turbulence modeling (LES/DNS)</li>
                 <li>• Aerodynamic optimization</li>
                 <li>• Heat transfer analysis</li>
                 <li>• Multi-phase flow simulation</li>
               </ul>
             </div>

             <div className="bg-gradient-to-br from-blue-900/20 to-purple-800/20 border border-blue-700/50 rounded-lg p-6">
               <h3 className="text-xl font-semibold mb-4 text-blue-400">Financial Modeling</h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Quantitative finance, risk analysis, and algorithmic trading model development and backtesting.
               </p>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>• Monte Carlo risk simulations</li>
                 <li>• Portfolio optimization algorithms</li>
                 <li>• High-frequency trading backtests</li>
                 <li>• Credit risk modeling</li>
                 <li>• Derivative pricing models</li>
               </ul>
             </div>
           </div>

           {/* Scientific Computing Benefits */}
           <div className="bg-gray-900 rounded-xl p-6 mb-8">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Research Impact & Benefits</h3>
             <div className="grid md:grid-cols-3 gap-4">
               <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-emerald-400 mb-2">Reproducible Science</h5>
                 <p className="text-gray-400 text-xs">
                   Cryptographic verification ensures computational results are reproducible and verifiable by peers
                 </p>
               </div>
               <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-green-400 mb-2">Cost Democratization</h5>
                 <p className="text-gray-400 text-xs">
                   90%+ cost reduction enables smaller institutions to access supercomputing resources
                 </p>
               </div>
               <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-teal-400 mb-2">Global Collaboration</h5>
                 <p className="text-gray-400 text-xs">
                   Decentralized infrastructure enables seamless international research collaboration
                 </p>
               </div>
               <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-blue-400 mb-2">Accelerated Discovery</h5>
                 <p className="text-gray-400 text-xs">
                   Massive parallel processing enables larger, more complex simulations than ever before
                 </p>
               </div>
               <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-purple-400 mb-2">Open Science</h5>
                 <p className="text-gray-400 text-xs">
                   Transparent, verifiable computations support open science and peer review processes
                 </p>
               </div>
               <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-pink-400 mb-2">Environmental Impact</h5>
                 <p className="text-gray-400 text-xs">
                   Efficient resource utilization reduces energy consumption compared to dedicated clusters
                 </p>
               </div>
             </div>
           </div>

           {/* Scientific Computing Performance */}
           <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Performance Scaling Example</h3>
           <div className="bg-gray-900 rounded-xl p-6">
             <h4 className="font-semibold text-white mb-3">Molecular Dynamics Simulation Scaling</h4>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <h5 className="font-semibold text-emerald-400 mb-2">Traditional HPC Cluster</h5>
                 <ul className="text-gray-400 text-sm space-y-1">
                   <li>• 100M atom system: 72 hours on 512 cores</li>
                   <li>• Cost: $15,000-25,000 per simulation</li>
                   <li>• Queue wait times: 2-14 days</li>
                   <li>• Limited to institutional access</li>
                 </ul>
               </div>
               <div>
                 <h5 className="font-semibold text-cosmic-cyan mb-2">CIRO Network</h5>
                 <ul className="text-gray-300 text-sm space-y-1">
                   <li>• Same system: 8 hours on 4096 cores</li>
                   <li>• Cost: $800-1,500 per simulation</li>
                   <li>• Instant resource availability</li>
                   <li>• Global access, any researcher</li>
                 </ul>
               </div>
             </div>
           </div>
         </section>

        {/* Section: Job Matching & Transportation */}
        <section id="job-matching-&-transportation" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Job Matching & Transportation</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's decentralized job market and transportation layer ensure efficient resource utilization and 
            optimal routing of compute tasks across the network.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-800/20 border border-indigo-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">Decentralized Job Market</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                A global marketplace where clients can post AI tasks and workers can bid for them.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Task posting and bidding</li>
                <li>• Real-time price discovery</li>
                <li>• Smart routing to optimal providers</li>
                <li>• Transparent task history and reputation</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Resource Transportation</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Secure and efficient transportation of data and compute resources across the network.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Inter-chain data transfer</li>
                <li>• Cross-region compute resource sharing</li>
                <li>• Secure enclave transport</li>
                <li>• Decentralized storage for data</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Resource Orchestration</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Intelligent algorithms for optimal resource allocation and task distribution.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• ML-powered demand forecasting</li>
                <li>• Dynamic routing based on capacity</li>
                <li>• Efficient task bundling</li>
                <li>• Resource pooling across the network</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-orange-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Network Effects</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                The more compute resources and tasks available, the more valuable the network becomes.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Increased network throughput</li>
                <li>• Lower latency for all users</li>
                <li>• More diverse and robust AI ecosystem</li>
                <li>• Stronger security through redundancy</li>
              </ul>
            </div>
          </div>

                     {/* Job Matching Algorithm */}
           <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Intelligent Job Matching Algorithm</h3>
           <MermaidDiagram
             chart={`graph TD
    subgraph "Job Submission"
        JS[Job Submitted]
        JP[Parse Requirements]
        JH[Generate Job Hash]
        JP1[Set Priority & Budget]
    end
    
    subgraph "Resource Discovery"
        WS[Scan Worker Pool]
        WF[Filter by Capabilities]
        WGeo[Geographic Filtering]
        WRep[Reputation Filtering]
    end
    
    subgraph "Matching Algorithm"
        MA[Multi-Criteria Analysis]
        SC[Score Calculation]
        RR[Rank Resources]
        OSel[Optimal Selection]
    end
    
    subgraph "Scoring Factors"
        PCost[Price Score: 30%]
        PPerf[Performance Score: 25%]
        PRep[Reputation Score: 20%]
        PLat[Latency Score: 15%]
        PAv[Availability Score: 10%]
    end
    
    subgraph "Job Dispatch"
        JA[Job Assignment]
        RC[Resource Confirmation]
        EE[Execute & Encrypt]
        VM[Verify & Monitor]
    end
    
    JS --> JP
    JP --> JH
    JH --> JP1
    JP1 --> WS
    
    WS --> WF
    WF --> WGeo
    WGeo --> WRep
    WRep --> MA
    
    MA --> PCost
    MA --> PPerf
    MA --> PRep
    MA --> PLat
    MA --> PAv
    
    PCost --> SC
    PPerf --> SC
    PRep --> SC
    PLat --> SC
    PAv --> SC
    
    SC --> RR
    RR --> OSel
    OSel --> JA
    
    JA --> RC
    RC --> EE
    EE --> VM
    
    style MA fill:#4ecdc4
    style OSel fill:#45b7d1
    style VM fill:#96ceb4
`}
           />

           <div className="bg-gray-900 rounded-xl p-6 mt-8">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Matching Algorithm Details</h3>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <h4 className="font-semibold text-white mb-3">Scoring Function</h4>
                 <div className="bg-black/50 rounded-lg p-4 mb-4">
                   <div className="mb-2 text-cosmic-cyan">Composite Score:</div>
                   <MathFormula formula={`S_{total} = w_1 \\cdot S_{price} + w_2 \\cdot S_{perf} + w_3 \\cdot S_{rep} + w_4 \\cdot S_{latency} + w_5 \\cdot S_{avail}`} />
                   <div className="text-gray-400 text-xs mt-2">
                     Weighted sum of normalized scores across all criteria
                   </div>
                 </div>
               </div>
               <div>
                 <h4 className="font-semibold text-white mb-3">Optimization Constraints</h4>
                 <div className="bg-black/50 rounded-lg p-4 mb-4">
                   <div className="mb-2 text-cosmic-cyan">Constraint Set:</div>
                   <MathFormula formula={`\\begin{cases} Price \\leq Budget \\\\ Latency \\leq Max_{latency} \\\\ Reputation \\geq Min_{rep} \\\\ Capacity \\geq Job_{size} \\end{cases}`} />
                   <div className="text-gray-400 text-xs mt-2">
                     Hard constraints that must be satisfied for matching
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="bg-gray-900 rounded-xl p-6">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Key Benefits</h3>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-blue-400 mb-2">Optimal Resource Allocation</h5>
                 <p className="text-gray-400 text-xs">
                   Multi-criteria optimization ensures jobs are matched to the most suitable resources
                 </p>
               </div>
               <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-green-400 mb-2">Dynamic Adaptation</h5>
                 <p className="text-gray-400 text-xs">
                   Algorithm adapts to real-time network conditions and resource availability
                 </p>
               </div>
               <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-purple-400 mb-2">Fraud Prevention</h5>
                 <p className="text-gray-400 text-xs">
                   Reputation-based filtering and cryptographic verification prevent malicious behavior
                 </p>
               </div>
               <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-orange-400 mb-2">Cost Efficiency</h5>
                 <p className="text-gray-400 text-xs">
                   Price optimization and competition drive down costs for end users
                 </p>
               </div>
             </div>
           </div>
        </section>

        {/* Section: Encryption & Security Model */}
        <section id="encryption-&-security-model" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Encryption & Security Model</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network employs a robust encryption and security model to protect sensitive data and computational integrity.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-red-900/20 to-pink-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">End-to-End Encryption</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                All data and computations are encrypted in transit and at rest.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Zero-knowledge proofs ensure data integrity</li>
                <li>• Homomorphic encryption for secure computation</li>
                <li>• Secure enclave for confidential computing</li>
                <li>• Encrypted communication channels</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Access Control</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Fine-grained access control and permission management.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Role-based access control (RBAC)</li>
                <li>• Multi-factor authentication</li>
                <li>• Secure key management</li>
                <li>• Transparent audit logs</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Consensus and Fault Tolerance</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Byzantine Fault Tolerance (BFT) and Proof of Stake (PoS) for robust consensus.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 2/3+ honest participation for liveness</li>
                <li>• 1/3+ Byzantine nodes for safety</li>
                <li>• Economic incentives for node participation</li>
                <li>• Byzantine fault tolerance</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Reputation System</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Decentralized reputation and slashing mechanisms for malicious behavior.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Historical performance tracking</li>
                <li>• Fraud detection and dispute resolution</li>
                <li>• Slashing for malicious behavior</li>
                <li>• Reputation-based incentives</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Security Guarantees</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-red-400 mb-2">Computational Integrity</h5>
                <p className="text-gray-400 text-xs">
                  Zero-knowledge proofs ensure that the output of a computation is correct and cannot be tampered with.
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">Privacy</h5>
                <p className="text-gray-400 text-xs">
                  All data and models remain private by default, even from the compute provider.
                </p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-purple-400 mb-2">Robust Consensus</h5>
                <p className="text-gray-400 text-xs">
                  Byzantine Fault Tolerance ensures network availability and consistency even under adversarial conditions.
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-orange-400 mb-2">Economic Incentives</h5>
                <p className="text-gray-400 text-xs">
                  Economic penalties for malicious behavior and rewards for honest participation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Scalability Architecture */}
        <section id="scalability-architecture" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Scalability Architecture</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's architecture is designed to scale horizontally across a global network of nodes, 
            enabling unprecedented throughput and resource availability.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border border-yellow-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Multi-Region Deployment</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Nodes are deployed across multiple regions to minimize latency and provide redundancy.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 10+ regions globally</li>
                <li>• 100+ data centers</li>
                <li>• Low-latency edge nodes</li>
                <li>• Redundant infrastructure</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Resource Pooling</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Compute resources are pooled across the network, allowing for efficient utilization and cost savings.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• GPU clusters, TPUs, CPU farms</li>
                <li>• Cross-region resource sharing</li>
                <li>• Dynamic allocation based on demand</li>
                <li>• Cost optimization for users</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Decentralized Storage</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Data and models are stored across a decentralized network of nodes, ensuring availability and durability.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• IPFS, Swarm, Filecoin</li>
                <li>• Encrypted data transfer</li>
                <li>• Distributed hash tables</li>
                <li>• Fault tolerance</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-pink-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Network Topology</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Small-world network properties minimize latency while maintaining robustness.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Short average path length</li>
                <li>• High clustering coefficient</li>
                <li>• Robust connectivity</li>
                <li>• Efficient routing</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Scalability Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-400 mb-2">Unlimited Scaling</h5>
                <p className="text-gray-400 text-xs">
                  Horizontal scaling to handle any workload, no theoretical limits.
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">Low Latency</h5>
                <p className="text-gray-400 text-xs">
                  Optimal routing and resource allocation minimize latency.
                </p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-purple-400 mb-2">Cost Efficiency</h5>
                <p className="text-gray-400 text-xs">
                  Efficient resource utilization and cost optimization.
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-orange-400 mb-2">Resilience</h5>
                <p className="text-gray-400 text-xs">
                  Redundant infrastructure and decentralized storage ensure availability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Multichain Integration */}
        <section id="multichain-integration" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Multichain Integration</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network is designed to be interoperable across multiple blockchain networks, enabling seamless 
            integration with existing ecosystems and protocols.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-800/20 border border-indigo-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">Cross-Chain Data</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Data and computational results can be transferred across different blockchain networks.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Inter-chain data transfer</li>
                <li>• Decentralized storage</li>
                <li>• Cross-chain computation</li>
                <li>• Interoperable AI models</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Interoperable AI</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                AI models and data can be trained and deployed across different blockchain networks.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Federated learning across chains</li>
                <li>• Cross-chain AI model marketplace</li>
                <li>• Interoperable AI pipelines</li>
                <li>• Decentralized AI research</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Cross-Chain Payments</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                CIRO Token can be used for payments across different blockchain networks.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Decentralized cross-chain payments</li>
                <li>• Cross-chain staking</li>
                <li>• Cross-chain governance</li>
                <li>• Interoperable economic incentives</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-orange-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Interoperable Infrastructure</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                CIRO Network's infrastructure (compute, storage, network) can be accessed from any blockchain.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Multi-chain API gateway</li>
                <li>• Cross-chain worker nodes</li>
                <li>• Interoperable storage solutions</li>
                <li>• Multi-chain job market</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Integration Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-400 mb-2">Ecosystem Expansion</h5>
                <p className="text-gray-400 text-xs">
                  CIRO Network can be integrated into any blockchain, expanding its reach.
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">Cross-Chain AI</h5>
                <p className="text-gray-400 text-xs">
                  AI models and data can be trained and deployed across different networks.
                </p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-purple-400 mb-2">Decentralized AI</h5>
                <p className="text-gray-400 text-xs">
                  AI research and development can be decentralized across multiple networks.
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-orange-400 mb-2">Interoperable Economy</h5>
                <p className="text-gray-400 text-xs">
                  CIRO Token and economic incentives can be used across different networks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Orderbook & Liquidity */}
        <section id="orderbook-&-liquidity" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Orderbook & Liquidity</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's decentralized orderbook and liquidity layer provides a robust foundation for the AI compute market.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border border-yellow-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Decentralized Orderbook</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                A global, permissionless orderbook for AI tasks and compute resources.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Real-time task posting and bidding</li>
                <li>• Smart routing to optimal providers</li>
                <li>• Transparent task history</li>
                <li>• Decentralized dispute resolution</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Liquidity Pooling</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                CIRO Token liquidity is pooled across the network, providing stable and liquid markets.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Decentralized liquidity pools</li>
                <li>• Stable price discovery</li>
                <li>• Cross-chain liquidity</li>
                <li>• Decentralized price oracles</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Market Efficiency</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Efficient resource allocation and price discovery through decentralized markets.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Real-time price updates</li>
                <li>• Optimal routing</li>
                <li>• Efficient task matching</li>
                <li>• Decentralized governance</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-pink-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Network Effects</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                The more liquidity and tasks available, the more valuable the network becomes.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Increased market depth</li>
                <li>• Lower latency for all users</li>
                <li>• More diverse and robust AI ecosystem</li>
                <li>• Stronger security through redundancy</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-400 mb-2">Efficiency</h5>
                <p className="text-gray-400 text-xs">
                  Efficient resource allocation and price discovery.
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">Scalability</h5>
                <p className="text-gray-400 text-xs">
                  Horizontal scaling to handle any workload.
                </p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-purple-400 mb-2">Security</h5>
                <p className="text-gray-400 text-xs">
                  Secure, encrypted communication and data storage.
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-orange-400 mb-2">Resilience</h5>
                <p className="text-gray-400 text-xs">
                  Redundant infrastructure and decentralized storage ensure availability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Burn Mechanics */}
        <section id="burn-mechanics" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Burn Mechanics</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's economic model incorporates burn mechanisms to ensure long-term sustainability and 
            discourage inflation while promoting network security and growth.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-red-900/20 to-pink-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Revenue Burn</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                A percentage of network revenue is automatically burned to reduce supply and increase scarcity.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Dynamic burn rate based on network security</li>
                <li>• Reduces inflation</li>
                <li>• Encourages economic sustainability</li>
                <li>• Prevents excessive token supply</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Buyback Burn</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                CIRO Token is burned when the Foundation's treasury is replenished, ensuring long-term value.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Treasury ETH converted to CIRO</li>
                <li>• CIRO burned</li>
                <li>• Prevents inflation from treasury replenishment</li>
                <li>• Encourages token retention</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Network Growth</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Economic incentives and network effects encourage more participants and resources.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• More liquidity and tasks</li>
                <li>• Stronger network security</li>
                <li>• More robust economic model</li>
                <li>• Decentralized governance</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Economic Sustainability</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Deflationary tokenomics and economic incentives ensure long-term sustainability.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Self-regulating economy</li>
                <li>• Deflationary token mechanics</li>
                <li>• Economic incentives for participation</li>
                <li>• Long-term network growth</li>
              </ul>
            </div>
          </div>

                     {/* Mathematical Models for Burn Mechanisms */}
           <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Mathematical Burn Models</h3>
           <div className="grid md:grid-cols-2 gap-6 mb-8">
             <div className="bg-gray-900 rounded-xl p-6">
               <h4 className="text-lg font-semibold mb-4 text-red-400">Revenue Burn Formula</h4>
               <div className="bg-black/50 rounded-lg p-4 mb-4">
                 <div className="mb-2 text-cosmic-cyan">Dynamic Burn Rate:</div>
                 <MathFormula formula={`B_r(t) = \\min\\left(R(t) \\cdot \\alpha \\cdot \\frac{S_{target}}{S(t)}, B_{max}\\right)`} />
                 <div className="text-gray-400 text-xs mt-2">
                   Where α is base burn rate, S_target is target supply, S(t) is current supply
                 </div>
               </div>
               <div className="bg-black/50 rounded-lg p-4">
                 <div className="mb-2 text-cosmic-cyan">Security-Adjusted Burn:</div>
                 <MathFormula formula={`B_{final}(t) = B_r(t) \\cdot \\left(1 - \\frac{SecurityBudget_{required}}{SecurityBudget_{current}}\\right)`} />
                 <div className="text-gray-400 text-xs mt-2">
                   Burn rate reduces when security budget is below threshold
                 </div>
               </div>
             </div>

             <div className="bg-gray-900 rounded-xl p-6">
               <h4 className="text-lg font-semibold mb-4 text-purple-400">Treasury Buyback Model</h4>
               <div className="bg-black/50 rounded-lg p-4 mb-4">
                 <div className="mb-2 text-cosmic-cyan">Buyback Amount:</div>
                 <MathFormula formula={`B_{buyback}(t) = \\frac{Treasury_{ETH}(t) \\cdot \\beta}{P_{CIRO/ETH}(t)}`} />
                 <div className="text-gray-400 text-xs mt-2">
                   Where β is buyback percentage (default 25% of treasury growth)
                 </div>
               </div>
               <div className="bg-black/50 rounded-lg p-4">
                 <div className="mb-2 text-cosmic-cyan">Price Impact Protection:</div>
                 <MathFormula formula={`B_{limited}(t) = \\min\\left(B_{buyback}(t), \\frac{Volume_{24h}}{10}\\right)`} />
                 <div className="text-gray-400 text-xs mt-2">
                   Limits buyback to prevent excessive price impact
                 </div>
               </div>
             </div>
           </div>

           {/* Burn Flow Diagram */}
           <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Burn Mechanism Flow</h3>
           <MermaidDiagram
             chart={`graph TD
    subgraph "Revenue Sources"
        NF[Network Fees]
        JS[Job Settlements]
        SF[Slashing Fees]
        PF[Protocol Fees]
    end
    
    subgraph "Burn Calculation"
        BR[Base Rate Calculation]
        SA[Security Adjustment]
        PI[Price Impact Check]
        FB[Final Burn Amount]
    end
    
    subgraph "Burn Execution"
        BB[Buyback CIRO]
        BT[Burn Tokens]
        US[Update Supply]
        LP[Log & Publish]
    end
    
    subgraph "Economic Effects"
        DS[Decrease Supply]
        IP[Increase Price Pressure]
        IS[Improve Scarcity]
        EI[Enhanced Incentives]
    end
    
    NF --> BR
    JS --> BR
    SF --> BR
    PF --> BR
    
    BR --> SA
    SA --> PI
    PI --> FB
    
    FB --> BB
    BB --> BT
    BT --> US
    US --> LP
    
    BT --> DS
    DS --> IP
    IP --> IS
    IS --> EI
    
    style BT fill:#ff6b6b
    style DS fill:#ff6b6b
    style IS fill:#4ecdc4
    style EI fill:#96ceb4
`}
           />

           <div className="bg-gray-900 rounded-xl p-6 mt-8">
             <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Long-term Economic Effects</h3>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-red-400 mb-2">Deflationary Pressure</h5>
                 <p className="text-gray-400 text-xs">
                   Systematic token burning creates scarcity and value accrual for long-term holders
                 </p>
               </div>
               <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-green-400 mb-2">Security Funding</h5>
                 <p className="text-gray-400 text-xs">
                   Burn mechanisms ensure network security is always adequately funded
                 </p>
               </div>
               <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-purple-400 mb-2">Market Stability</h5>
                 <p className="text-gray-400 text-xs">
                   Dynamic burn rates provide automatic price stabilization during market volatility
                 </p>
               </div>
               <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                 <h5 className="font-semibold text-orange-400 mb-2">Ecosystem Growth</h5>
                 <p className="text-gray-400 text-xs">
                   Revenue-linked burns align token value with network utility and adoption
                 </p>
               </div>
             </div>
           </div>
        </section>

        {/* Section: Mathematical Foundations */}
        <section id="mathematical-foundations" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Mathematical Foundations</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's security and functionality rest on rigorous mathematical foundations. Our cryptographic protocols 
            leverage cutting-edge research in zero-knowledge proofs, elliptic curve cryptography, and information theory 
            to provide provable security guarantees.
          </p>

          <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Core Cryptographic Primitives</h3>
          
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Zero-Knowledge Proof System</h4>
            <p className="text-gray-300 text-sm mb-4">
              CIRO utilizes STARK (Scalable Transparent Arguments of Knowledge) proofs for computational verification:
            </p>
            
                         <div className="bg-black/50 rounded-lg p-4 mb-4">
               <div className="mb-2 text-cosmic-cyan">Proof Generation:</div>
               <MathFormula formula={`\\pi = STARK.Prove(C, w, x)`} />
               <div className="text-gray-400 text-xs mt-2">
                 Where C is the computation circuit, w is the witness (private input), x is the public input
               </div>
             </div>

                         <div className="bg-black/50 rounded-lg p-4 mb-4">
               <div className="mb-2 text-cosmic-cyan">Verification:</div>
               <MathFormula formula={`STARK.Verify(\\pi, x, C) \\rightarrow \\{true, false\\}`} />
               <div className="text-gray-400 text-xs mt-2">
                 Verification time is O(log²(|C|)) independent of witness size
               </div>
             </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-400 mb-2">Completeness</h5>
                <p className="text-gray-400 text-xs">
                  If statement is true, honest prover convinces verifier with probability 1
                </p>
              </div>
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-red-400 mb-2">Soundness</h5>
                <p className="text-gray-400 text-xs">
                  If statement is false, no prover can convince verifier except with negligible probability
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">Zero-Knowledge</h5>
                <p className="text-gray-400 text-xs">
                  Verifier learns nothing about the witness beyond its existence
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Economic Game Theory</h3>
          
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Nash Equilibrium Analysis</h4>
            <p className="text-gray-300 text-sm mb-4">
              CIRO's economic model achieves Nash equilibrium through carefully designed incentive structures:
            </p>

                         <div className="bg-black/50 rounded-lg p-4 mb-4">
               <div className="mb-2 text-cosmic-cyan">Worker Utility Function:</div>
               <MathFormula formula={`U_w = R - C_{compute} - C_{stake} + S_{reputation}`} />
               <div className="text-gray-400 text-xs mt-2">
                 R: Rewards, C_compute: Compute costs, C_stake: Staking costs, S_reputation: Reputation value
               </div>
             </div>

                         <div className="bg-black/50 rounded-lg p-4 mb-4">
               <div className="mb-2 text-cosmic-cyan">Client Utility Function:</div>
               <MathFormula formula={`U_c = V_{computation} - P_{payment} - R_{risk}`} />
               <div className="text-gray-400 text-xs mt-2">
                 V: Value from computation, P: Payment made, R: Risk of incorrect results
               </div>
             </div>

            <div className="bg-gradient-to-r from-cosmic-cyan/10 to-blue-500/10 border border-cosmic-cyan/30 rounded-lg p-4">
              <h5 className="font-semibold text-cosmic-cyan mb-2">Equilibrium Conditions</h5>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Workers optimize effort to maximize expected rewards minus costs</li>
                <li>• Clients select providers based on price-performance-security tradeoffs</li>
                <li>• Network self-regulates through reputation and slashing mechanisms</li>
                <li>• Token economics ensure long-term sustainability and growth</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Consensus and Security</h3>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Byzantine Fault Tolerance</h4>
            <p className="text-gray-300 text-sm mb-4">
              CIRO achieves consensus even with up to f Byzantine nodes out of n total nodes:
            </p>

                         <div className="bg-black/50 rounded-lg p-4 mb-4">
               <div className="mb-2 text-cosmic-cyan">Safety Condition:</div>
               <MathFormula formula={`n \\geq 3f + 1`} />
               <div className="text-gray-400 text-xs mt-2">
                 Network remains secure as long as less than 1/3 of nodes are malicious
               </div>
             </div>

             <div className="bg-black/50 rounded-lg p-4">
               <div className="mb-2 text-cosmic-cyan">Liveness Guarantee:</div>
               <MathFormula formula={`n \\geq 2f + 1`} />
               <div className="text-gray-400 text-xs mt-2">
                 Network continues to process transactions with 2/3 honest participation
               </div>
             </div>
          </div>
        </section>

        {/* Section: Physical Principles */}
        <section id="physical-principles" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Physical Principles</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network's design principles are inspired by fundamental laws of physics and thermodynamics, 
            creating a system that naturally tends toward efficiency, stability, and optimal resource utilization.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border border-yellow-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Thermodynamic Efficiency</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Like heat engines approaching Carnot efficiency, CIRO optimizes the conversion of computational energy into useful work.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                <div className="text-yellow-400">\\eta = 1 - T_cold / T_hot</div>
                <div className="text-gray-400 mt-1">Efficiency approaches theoretical maximum</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Information Conservation</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Following Landauer's principle, CIRO minimizes irreversible computations to reduce energy dissipation.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                <div className="text-purple-400">E \\geq k_B T \\ln(2)</div>
                <div className="text-gray-400 mt-1">Minimum energy per bit erasure</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-800/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Network Topology</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Small-world network properties minimize latency while maintaining robustness, similar to neural networks.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                <div className="text-green-400">L \\propto \\log(N)</div>
                <div className="text-gray-400 mt-1">Path length scales logarithmically</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-pink-800/20 border border-red-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Fault Tolerance</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Self-healing properties emerge from redundancy and error correction, like biological immune systems.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                <div className="text-red-400">p_failure = (p_node)^k</div>
                <div className="text-gray-400 mt-1">Exponential improvement with redundancy</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cosmic-cyan">Emergent Properties</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Like phase transitions in condensed matter physics, CIRO Network exhibits emergent behaviors that arise 
              from simple local interactions between network participants.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-cosmic-cyan mb-2">Self-Organization</h4>
                <p className="text-gray-400 text-xs">
                  Compute resources automatically cluster around demand centers without central coordination
                </p>
              </div>
              <div className="border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-cosmic-cyan mb-2">Scale Invariance</h4>
                <p className="text-gray-400 text-xs">
                  Network performance characteristics remain consistent across different scales
                </p>
              </div>
              <div className="border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-cosmic-cyan mb-2">Critical Dynamics</h4>
                <p className="text-gray-400 text-xs">
                  System operates near critical points for optimal information processing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Tokenomics Section */}
        <section id="tokenomics" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-cosmic-cyan to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Tokenomics</h2>
          </div>
          
          <div className="bg-gradient-to-r from-cosmic-cyan/5 to-blue-500/5 border border-cosmic-cyan/20 rounded-xl p-8 mb-8">
            <p className="text-lg text-gray-200 leading-relaxed mb-4">
              <strong className="text-cosmic-cyan">CIRO Tokenomics</strong> implement a sophisticated economic model designed for 
              long-term sustainability, security, and decentralized governance. The protocol leverages a multi-layered economic 
              framework with dynamic supply mechanisms and game-theoretic incentive alignment.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Token Distribution</h3>
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                    <span className="font-medium">Community & Ecosystem</span>
                    <span className="text-cosmic-cyan font-bold">40%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                    <span className="font-medium">Foundation Treasury</span>
                    <span className="text-green-400 font-bold">25%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
                    <span className="font-medium">Core Team</span>
                    <span className="text-purple-400 font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg">
                    <span className="font-medium">Investors</span>
                    <span className="text-yellow-400 font-bold">15%</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Vesting Schedules</h3>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Community Allocation</span>
                    <span className="text-cosmic-cyan">Immediate + Linear over 24 months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Core Team</span>
                    <span className="text-purple-400">12-month cliff + 36-month linear</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Investors</span>
                    <span className="text-yellow-400">6-month cliff + 24-month linear</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Foundation</span>
                    <span className="text-green-400">Milestone-based release</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Key Metrics</h3>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-cosmic-cyan">50M</div>
                  <div className="text-gray-400 text-sm">Initial Circulating Supply</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">$2M</div>
                  <div className="text-gray-400 text-sm">Minimum Security Budget</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">Dynamic</div>
                  <div className="text-gray-400 text-sm">Inflation Rate</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">Variable</div>
                  <div className="text-gray-400 text-sm">Burn Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Flow Diagram */}
          <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Token Flow Architecture</h3>
                     <MermaidDiagram
             chart={`graph TD
    subgraph "Token Sources"
        MINT[Token Minting]
        VESTING[Vesting Contracts]
        TREASURY[Foundation Treasury]
    end
    
    subgraph "Circulation"
        CIRC[Circulating Supply]
        MARKET[Secondary Markets]
    end
    
    subgraph "Utility & Staking"
        STAKE[Staking Pools]
        WORKER[Worker Bonds]
        GOV[Governance Voting]
    end
    
    subgraph "Value Accrual"
        BURN[Burn Manager]
        BUYBACK[Revenue Buybacks]
        FEES[Network Fees]
    end
    
    subgraph "Rewards"
        REWARDS[Reward Distribution]
        WORKER_PAY[Worker Payments]
        VALIDATOR_PAY[Validator Rewards]
    end
    
    MINT --> VESTING
    VESTING --> CIRC
    TREASURY --> CIRC
    CIRC --> MARKET
    CIRC --> STAKE
    STAKE --> WORKER
    CIRC --> GOV
    
    FEES --> BURN
    FEES --> BUYBACK
    BUYBACK --> BURN
    
    TREASURY --> REWARDS
    REWARDS --> WORKER_PAY
    REWARDS --> VALIDATOR_PAY
    WORKER_PAY --> CIRC
    VALIDATOR_PAY --> CIRC
    
    style BURN fill:#ff6b6b
    style REWARDS fill:#4ecdc4
    style STAKE fill:#45b7d1
    style GOV fill:#96ceb4
`}
          />

          {/* Mathematical Models */}
          <h3 className="text-2xl font-semibold mb-4 text-cosmic-cyan">Economic Models</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-purple-400">Dynamic Supply Model</h4>
              <div className="bg-black/50 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="mb-2 text-cosmic-cyan">Supply Evolution:</div>
                <div className="text-white mb-2">S(t+1) = S(t) * (1 + r_inf(t)) - B(t)</div>
                <div className="text-gray-400 text-xs">
                  Where r_inf(t) is adaptive inflation rate based on network security requirements
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                <div className="mb-2 text-cosmic-cyan">Inflation Rate:</div>
                <div className="text-white mb-2">r_inf(t) = max(r_min, SecurityBudget_USD / (S(t) * P(t)))</div>
                <div className="text-gray-400 text-xs">
                  Inflation adjusts to maintain $2M minimum security budget
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-purple-400">Burn Mechanisms</h4>
              <div className="bg-black/50 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="mb-2 text-cosmic-cyan">Revenue Burn:</div>
                <div className="text-white mb-2">B_revenue(t) = min(R(t) * burn_rate, max_burn_per_period)</div>
                <div className="text-gray-400 text-xs">
                  Percentage of network revenue automatically burned
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                <div className="mb-2 text-cosmic-cyan">Buyback Burn:</div>
                <div className="text-white mb-2">B_buyback(t) = Treasury_ETH(t) / P_CIRO(t)</div>
                <div className="text-gray-400 text-xs">
                  Treasury ETH converted to CIRO and burned
                </div>
              </div>
            </div>
          </div>

          {/* Governance Structure */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-xl p-8">
            <h3 className="text-2xl font-semibold mb-4 text-purple-400">Governance Framework</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Proposal Types</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Treasury allocation (67% threshold)</li>
                  <li>• Protocol upgrades (75% threshold)</li>
                  <li>• Parameter changes (60% threshold)</li>
                  <li>• Emergency actions (90% threshold)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Voting Power</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Base: 1 CIRO = 1 vote</li>
                  <li>• Long-term holders: 1.5x multiplier</li>
                  <li>• Active participants: 2x multiplier</li>
                  <li>• Delegation supported</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Security Features</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Timelock for execution</li>
                  <li>• Emergency pause mechanism</li>
                  <li>• Multi-sig council backup</li>
                  <li>• Proposal cooldowns</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Competitive Analysis */}
        <section id="competitive-analysis" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Competitive Analysis</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            CIRO Network operates in the rapidly evolving decentralized compute landscape. Our unique approach to 
            verifiable AI compute creates distinct competitive advantages in trust, scalability, and cost efficiency.
          </p>

          <div className="bg-gray-900 rounded-xl p-6 mb-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-cosmic-cyan">Feature</th>
                  <th className="text-left p-3 text-cosmic-cyan">CIRO Network</th>
                  <th className="text-left p-3 text-gray-400">Traditional Cloud</th>
                  <th className="text-left p-3 text-gray-400">Other DePIN</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="p-3 font-medium">Verifiability</td>
                  <td className="p-3 text-green-400">✓ ZK Proofs</td>
                  <td className="p-3 text-red-400">✗ Trust-based</td>
                  <td className="p-3 text-yellow-400">~ Reputation only</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-3 font-medium">Privacy</td>
                  <td className="p-3 text-green-400">✓ Full encryption</td>
                  <td className="p-3 text-yellow-400">~ Enterprise only</td>
                  <td className="p-3 text-red-400">✗ Limited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-3 font-medium">Cost</td>
                  <td className="p-3 text-green-400">✓ Market-driven</td>
                  <td className="p-3 text-red-400">✗ High margins</td>
                  <td className="p-3 text-green-400">✓ Competitive</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-3 font-medium">Scalability</td>
                  <td className="p-3 text-green-400">✓ Unlimited</td>
                  <td className="p-3 text-yellow-400">~ Limited regions</td>
                  <td className="p-3 text-yellow-400">~ Growing</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Censorship Resistance</td>
                  <td className="p-3 text-green-400">✓ Fully decentralized</td>
                  <td className="p-3 text-red-400">✗ Centralized control</td>
                  <td className="p-3 text-yellow-400">~ Partially</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed AWS vs CIRO Comparison */}
          <h3 className="text-2xl font-semibold mb-6 text-cosmic-cyan">CIRO vs AWS: Detailed Technical Comparison</h3>
          
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-800/30 border border-blue-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-blue-400">Compute Infrastructure</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="text-cosmic-cyan font-medium">CIRO Network</h5>
                    <ul className="text-gray-300 space-y-1 text-xs">
                      <li>• Global P2P network of compute nodes</li>
                      <li>• Zero-knowledge verified execution</li>
                      <li>• Homomorphic encryption support</li>
                      <li>• Market-driven pricing ($0.10-2.00/hr)</li>
                      <li>• No vendor lock-in</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-orange-400 font-medium">AWS EC2/Lambda</h5>
                    <ul className="text-gray-400 space-y-1 text-xs">
                      <li>• Centralized data centers (26 regions)</li>
                      <li>• Trust-based execution model</li>
                      <li>• Limited encryption options</li>
                      <li>• Fixed pricing ($0.40-24.00/hr)</li>
                      <li>• High switching costs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-pink-800/30 border border-purple-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Security & Privacy</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="text-cosmic-cyan font-medium">CIRO Network</h5>
                    <ul className="text-gray-300 space-y-1 text-xs">
                      <li>• Cryptographic proof of execution</li>
                      <li>• Zero-knowledge privacy guarantees</li>
                      <li>• Decentralized consensus (BFT)</li>
                      <li>• No single point of failure</li>
                      <li>• Censorship resistant</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-orange-400 font-medium">AWS</h5>
                    <ul className="text-gray-400 space-y-1 text-xs">
                      <li>• Trust-based security model</li>
                      <li>• Data visible to AWS</li>
                      <li>• Centralized control points</li>
                      <li>• Government access requirements</li>
                      <li>• Potential for censorship</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-teal-800/30 border border-green-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-green-400">AI/ML Capabilities</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="text-cosmic-cyan font-medium">CIRO Network</h5>
                    <ul className="text-gray-300 space-y-1 text-xs">
                      <li>• Verifiable AI training/inference</li>
                      <li>• Privacy-preserving ML</li>
                      <li>• Cross-chain AI models</li>
                      <li>• Decentralized model marketplace</li>
                      <li>• Federated learning protocols</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-orange-400 font-medium">AWS SageMaker</h5>
                    <ul className="text-gray-400 space-y-1 text-xs">
                      <li>• Managed ML platform</li>
                      <li>• Data exposure to AWS</li>
                      <li>• Vendor-specific tools</li>
                      <li>• Centralized model registry</li>
                      <li>• Limited privacy options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Comparison */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-semibold mb-4 text-cosmic-cyan">Economic Model Comparison</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-white mb-3">CIRO Network Economics</h5>
                <div className="bg-black/50 rounded-lg p-4 mb-4">
                  <div className="mb-2 text-cosmic-cyan">Cost Function:</div>
                  <MathFormula formula={`C_{CIRO} = f(demand, supply, reputation, location)`} />
                  <div className="text-gray-400 text-xs mt-2">
                    Dynamic pricing based on real-time market conditions
                  </div>
                </div>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Market-driven pricing</li>
                  <li>• No markup from intermediaries</li>
                  <li>• Token rewards for providers</li>
                  <li>• Deflationary token mechanics</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3">AWS Economics</h5>
                <div className="bg-black/50 rounded-lg p-4 mb-4">
                  <div className="mb-2 text-orange-400">Cost Function:</div>
                  <MathFormula formula={`C_{AWS} = base_{cost} + margin + datacenter_{overhead}`} />
                  <div className="text-gray-400 text-xs mt-2">
                    Fixed pricing with significant overhead and margin
                  </div>
                </div>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Fixed tier pricing</li>
                  <li>• High profit margins (30-40%)</li>
                  <li>• No direct provider rewards</li>
                  <li>• Inflationary cost structure</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Unique Value Propositions</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>First mover in verifiable AI:</strong> No competitor offers cryptographic compute verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Privacy by design:</strong> Zero-knowledge architecture protects all data and models</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Economic sustainability:</strong> Self-regulating tokenomics with deflationary mechanisms</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Global accessibility:</strong> Permissionless participation from any geography</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-800/20 border border-purple-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Market Positioning</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">Enterprise AI</h4>
                  <p className="text-gray-400 text-sm">60-80% cost reduction vs AWS while providing superior security</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Research Institutions</h4>
                  <p className="text-gray-400 text-sm">Provide compute without data disclosure requirements</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">AI Startups</h4>
                  <p className="text-gray-400 text-sm">Democratize access to enterprise-grade AI infrastructure</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">DeFi Protocols</h4>
                  <p className="text-gray-400 text-sm">Enable on-chain AI with verifiable computation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Roadmap */}
        <section id="roadmap" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">Roadmap</h2>
          </div>

          <div className="space-y-8">
            <div className="relative">
              <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-gradient-to-b from-cosmic-cyan to-transparent"></div>
              
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-cosmic-cyan rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                  Q1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-cosmic-cyan">Foundation Phase</h3>
                  <p className="text-gray-400 text-sm mb-3">Establish core infrastructure and launch testnet</p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• ZK proof system implementation</li>
                    <li>• Basic worker node software</li>
                    <li>• Testnet launch with 100+ nodes</li>
                    <li>• Community building and documentation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-transparent"></div>
              
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                  Q2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-green-400">Network Launch</h3>
                  <p className="text-gray-400 text-sm mb-3">Mainnet deployment and token distribution</p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Mainnet launch with governance</li>
                    <li>• CIRO token distribution</li>
                    <li>• Initial AI model marketplace</li>
                    <li>• Enterprise partnerships</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-transparent"></div>
              
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                  Q3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-purple-400">Scale Phase</h3>
                  <p className="text-gray-400 text-sm mb-3">Horizontal scaling and advanced features</p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Multi-region deployment</li>
                    <li>• Advanced ML model support</li>
                    <li>• Cross-chain integrations</li>
                    <li>• Developer tools and SDKs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                Q4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-yellow-400">Ecosystem Phase</h3>
                <p className="text-gray-400 text-sm mb-3">Full ecosystem maturity and next-gen features</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Autonomous AI agents</li>
                  <li>• Research collaboration platform</li>
                  <li>• Advanced privacy features</li>
                  <li>• Global regulatory compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section: References */}
        <section id="references" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-bold">References</h2>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cosmic-cyan">Cryptographic Foundations</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>1. Ben-Sasson, E. et al. (2018). "STARKs: Scalable Transparent Arguments of Knowledge"</li>
                  <li>2. Goldwasser, S. & Micali, S. (1989). "Probabilistic Encryption"</li>
                  <li>3. Groth, J. (2016). "On the Size of Pairing-based Non-interactive Arguments"</li>
                  <li>4. Bünz, B. et al. (2020). "Transparent SNARKs from DARK Compilers"</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cosmic-cyan">Economic Theory</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>5. Roughgarden, T. (2020). "Transaction Fee Mechanism Design"</li>
                  <li>6. Catalini, C. & Gans, J. (2020). "Some Simple Economics of Stablecoins"</li>
                  <li>7. Buterin, V. (2017). "The Triangle of Harm in Mechanism Design"</li>
                  <li>8. Narayanan, A. et al. (2016). "Bitcoin and Cryptocurrency Technologies"</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cosmic-cyan">Distributed Systems</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>9. Castro, M. & Liskov, B. (1999). "Practical Byzantine Fault Tolerance"</li>
                  <li>10. Lamport, L. (1998). "The Part-Time Parliament (Paxos)"</li>
                  <li>11. Ongaro, D. & Ousterhout, J. (2014). "In Search of an Understandable Consensus Algorithm"</li>
                  <li>12. Guerraoui, R. & Schiper, A. (2001). "The Generic Consensus Service"</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-cosmic-cyan">AI & Machine Learning</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>13. Goodfellow, I. et al. (2016). "Deep Learning"</li>
                  <li>14. Vaswani, A. et al. (2017). "Attention Is All You Need"</li>
                  <li>15. McMahan, B. et al. (2017). "Communication-Efficient Learning"</li>
                  <li>16. Li, T. et al. (2020). "Federated Learning: Challenges and Applications"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 pt-8 mt-16">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">© 2025 CIRO Network Foundation. All rights reserved.</p>
            <p>Building the future of verifiable AI compute.</p>
          </div>
        </footer>
      </main>
    </div>
  );
} 