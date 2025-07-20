 'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, Shield, Network, Cpu, Zap, Globe, Lock, TrendingUp, Users, Award, 
  ArrowRight, CheckCircle, Menu, X, ExternalLink, Copy, Coins, Flame, 
  Building, Clock, Target, Code, Layers, ChevronDown, ChevronUp, GitBranch,
  DollarSign, Percent, Calendar, TrendingDown, BarChart3, PieChart,
  Wallet, Vote, Timer, Repeat, Activity
} from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import MathFormula from '@/components/MathFormula';
import PartnershipInquiryForm from '@/components/PartnershipInquiryForm';
import ComputeProviderForm from '@/components/ComputeProviderForm';

const tokenomicsData = {
  totalSupply: "1,000,000,000",
  initialCirculating: "50,000,000",
  contractAddress: "0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8",
  network: "Starknet Sepolia",
  decimals: 18
};

const distributionData = [
  { category: "Private Sale", percentage: 15, amount: "150M", description: "Strategic investors and partners", color: "bg-purple-500" },
  { category: "Public Sale", percentage: 10, amount: "100M", description: "Community token sale", color: "bg-blue-500" },
  { category: "Team & Advisors", percentage: 20, amount: "200M", description: "4-year vesting with 1-year cliff", color: "bg-green-500" },
  { category: "Foundation", percentage: 15, amount: "150M", description: "Ecosystem development fund", color: "bg-orange-500" },
  { category: "Community Rewards", percentage: 25, amount: "250M", description: "Staking, mining, and incentives", color: "bg-cosmic-cyan" },
  { category: "Liquidity & Treasury", percentage: 10, amount: "100M", description: "DEX liquidity and reserves", color: "bg-pink-500" },
  { category: "Research & Development", percentage: 5, amount: "50M", description: "Protocol development", color: "bg-yellow-500" }
];

const stakingTiers = [
  { tier: "Basic", usdAmount: "$100", ciroAmount: "~200 CIRO", allocation: "1.0x", bonus: "5%", description: "Entry level compute provider" },
  { tier: "Premium", usdAmount: "$500", ciroAmount: "~1K CIRO", allocation: "1.2x", bonus: "10%", description: "Serious commitment level" },
  { tier: "Enterprise", usdAmount: "$2,500", ciroAmount: "~5K CIRO", allocation: "1.5x", bonus: "15%", description: "Business tier operations" },
  { tier: "Infrastructure", usdAmount: "$10,000", ciroAmount: "~20K CIRO", allocation: "2.0x", bonus: "25%", description: "Data center operators" },
  { tier: "Fleet", usdAmount: "$50,000", ciroAmount: "~100K CIRO", allocation: "2.5x", bonus: "30%", description: "Fleet operators" },
  { tier: "Datacenter", usdAmount: "$100,000", ciroAmount: "~200K CIRO", allocation: "3.0x", bonus: "35%", description: "Major operators" },
  { tier: "Hyperscale", usdAmount: "$250,000", ciroAmount: "~500K CIRO", allocation: "4.0x", bonus: "40%", description: "Hyperscale providers" },
  { tier: "Institutional", usdAmount: "$500,000", ciroAmount: "~1M CIRO", allocation: "5.0x", bonus: "50%", description: "Institutional grade" }
];

const roadmapPhases = [
  {
    phase: "Phase 1: Private",
    period: "Q4 2024 - Q2 2025",
    status: "current",
    description: "Private funding and core team building",
    milestones: [
      "Private sale completion",
      "Core team expansion",
      "Smart contract development",
      "Testnet preparation"
    ]
  },
  {
    phase: "Phase 2: Testnet",
    period: "Q3 2025",
    status: "upcoming",
    description: "Public testnet launch and community building",
    milestones: [
      "Testnet deployment",
      "Worker node onboarding",
      "Community incentives program",
      "Bug bounty launch"
    ]
  },
  {
    phase: "Phase 3: Mainnet",
    period: "Q4 2025",
    status: "planned",
    description: "Mainnet launch and token distribution",
    milestones: [
      "Mainnet deployment",
      "Token generation event",
      "DEX listings",
      "Governance activation"
    ]
  },
  {
    phase: "Phase 4: Scale",
    period: "2026+",
    status: "planned",
    description: "Ecosystem expansion and multichain deployment",
    milestones: [
      "Multichain integration",
      "Enterprise partnerships",
      "Advanced AI features",
      "Global expansion"
    ]
  }
];

export default function TokenomicsPage() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isPartnershipFormOpen, setIsPartnershipFormOpen] = useState(false);
  const [isComputeProviderFormOpen, setIsComputeProviderFormOpen] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(tokenomicsData.contractAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'distribution', label: 'Distribution', icon: BarChart3 },
    { id: 'staking', label: 'Staking Tiers', icon: Layers },
    { id: 'mechanics', label: 'Token Mechanics', icon: Cpu },
    { id: 'roadmap', label: 'Roadmap', icon: Calendar },
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'multichain', label: 'Multichain', icon: GitBranch }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cosmic-cyan/30 border-t-cosmic-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
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
                <Coins className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Tokenomics</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-3">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button 
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-cosmic-cyan/20 text-cosmic-cyan border-l-2 border-cosmic-cyan' 
                          : 'hover:text-cosmic-cyan hover:bg-cosmic-cyan/10'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-sm font-medium">Private Phase Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-cosmic-cyan to-purple-400 bg-clip-text text-transparent">
            CIRO Tokenomics
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Decentralized compute infrastructure powered by innovative tokenomics and Cairo smart contracts
          </p>
        </div>

        {/* Private Phase Banner */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-400">We're Currently in Private Phase</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                CIRO Network is actively building our core infrastructure and forming strategic partnerships. 
                We're working with select institutions, compute providers, and strategic investors to establish 
                the foundation for the world's first verifiable AI compute network.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Collaboration Opportunities</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Strategic partnerships
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Compute provider onboarding
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Research collaborations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Enterprise pilot programs
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Get Involved</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsPartnershipFormOpen(true)}
                      className="block w-full bg-purple-600 hover:bg-purple-700 transition-colors px-4 py-2 rounded-lg text-center text-sm font-medium"
                    >
                      Partnership Inquiries
                    </button>
                    <button 
                      onClick={() => setIsComputeProviderFormOpen(true)}
                      className="block w-full bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-lg text-center text-sm font-medium"
                    >
                      Compute Providers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-gray-900 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-cosmic-cyan text-black' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Coins className="w-8 h-8 text-cosmic-cyan" />
                    <div>
                      <h3 className="font-semibold text-white">Total Supply</h3>
                      <p className="text-2xl font-bold text-cosmic-cyan">{tokenomicsData.totalSupply}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Fixed supply, no inflation</p>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-8 h-8 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-white">Initial Circulating</h3>
                      <p className="text-2xl font-bold text-green-400">{tokenomicsData.initialCirculating}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">5% of total supply at launch</p>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Flame className="w-8 h-8 text-red-400" />
                    <div>
                      <h3 className="font-semibold text-white">Burn Mechanism</h3>
                      <p className="text-2xl font-bold text-red-400">Active</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Deflationary pressure via burns</p>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Vote className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Governance</h3>
                      <p className="text-2xl font-bold text-purple-400">DAO</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Complete on-chain governance</p>
                </div>
              </div>

              {/* Contract Information */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-white">Smart Contract</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400">Contract Address</p>
                      <code className="text-cosmic-cyan font-mono text-sm break-all">
                        {tokenomicsData.contractAddress}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyAddress}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <a
                        href={`https://sepolia.starkscan.co/token/${tokenomicsData.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-cosmic-cyan hover:bg-cosmic-cyan/80 text-black rounded-lg transition-colors"
                        title="View on StarkScan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Network</p>
                      <p className="text-white font-medium">{tokenomicsData.network}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Decimals</p>
                      <p className="text-white font-medium">{tokenomicsData.decimals}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Symbol</p>
                      <p className="text-white font-medium">CIRO</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Standard</p>
                      <p className="text-white font-medium">ERC-20</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ecosystem Architecture */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Token Ecosystem Architecture</h3>
                <MermaidDiagram
                  chart={`graph TD
    CIRO[CIRO Token ERC-20]
    CDC[CDC Pool - Staking & Validation]
    JOB[Job Manager - Compute Marketplace]
    LINEAR[Linear Vesting - Team/Investor Distribution]
    MILESTONE[Milestone Vesting - Performance-Based]
    BURN[Burn Manager - Deflationary Mechanisms]
    TREASURY[Governance Treasury - Complete DAO]
    
    CIRO --> CDC
    CIRO --> JOB
    CIRO --> LINEAR
    CIRO --> MILESTONE
    CIRO --> BURN
    CIRO --> TREASURY
    
    CDC --> JOB
    JOB --> BURN
    TREASURY --> BURN
    
    classDef token fill:#00d4ff,stroke:#00d4ff,stroke-width:2px,color:#000
    classDef contract fill:#7c3aed,stroke:#8b5cf6,stroke-width:2px,color:#fff
    classDef mechanism fill:#dc2626,stroke:#ef4444,stroke-width:2px,color:#fff
    
    class CIRO token
    class CDC,JOB,LINEAR,MILESTONE contract
    class BURN,TREASURY mechanism`}
                />
              </div>
            </div>
          )}

          {/* Distribution Tab */}
          {activeTab === 'distribution' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-6 text-white">Token Distribution</h3>
                  <div className="space-y-4">
                    {distributionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 ${item.color} rounded`}></div>
                          <span className="text-white font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{item.percentage}%</div>
                          <div className="text-gray-400 text-sm">{item.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution Details */}
                <div className="space-y-4">
                  {distributionData.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 ${item.color} rounded`}></div>
                        <h4 className="font-semibold text-white">{item.category}</h4>
                        <span className="text-cosmic-cyan font-bold">{item.percentage}%</span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vesting Schedule */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Vesting Schedule</h3>
                <MermaidDiagram
                  chart={`gantt
    title Token Release Schedule
    dateFormat  YYYY-MM-DD
    axisFormat  %Y
    
    section Public Sale
    Immediate Release    :done, public, 2025-01-01, 2025-01-31
    
    section Team & Advisors
    1-Year Cliff         :cliff, 2025-01-01, 2026-01-01
    3-Year Linear Vest   :vest, 2026-01-01, 2029-01-01
    
    section Foundation
    6-Month Cliff        :cliff2, 2025-01-01, 2025-07-01
    2-Year Linear Vest   :vest2, 2025-07-01, 2027-07-01
    
    section Community
    Immediate Start      :done, comm, 2025-01-01, 2025-01-31
    4-Year Distribution  :comm2, 2025-01-01, 2029-01-01`}
                />
              </div>
            </div>
          )}

          {/* Staking Tiers Tab */}
          {activeTab === 'staking' && (
            <div className="space-y-8">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Worker Staking Tiers</h3>
                <p className="text-gray-400 mb-6">
                  CIRO Network uses USD-denominated staking tiers to ensure fair participation regardless of token price volatility. 
                  Higher stakes unlock better job allocation priority and performance bonuses.
                </p>
                <div className="grid gap-4">
                  {stakingTiers.map((tier, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cosmic-cyan/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedTier(expandedTier === index ? null : index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-cosmic-cyan to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{tier.tier}</h4>
                            <p className="text-gray-400 text-sm">{tier.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-cosmic-cyan font-bold">{tier.usdAmount}</p>
                            <p className="text-gray-400 text-sm">{tier.ciroAmount}</p>
                          </div>
                          {expandedTier === index ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {expandedTier === index && (
                        <div className="mt-4 pt-4 border-t border-gray-700 grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-white mb-2">Benefits</h5>
                            <ul className="space-y-1 text-sm text-gray-300">
                              <li>• Job allocation priority: {tier.allocation}</li>
                              <li>• Performance bonus: {tier.bonus}</li>
                              <li>• Priority support access</li>
                              <li>• Advanced analytics dashboard</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-white mb-2">Requirements</h5>
                            <ul className="space-y-1 text-sm text-gray-300">
                              <li>• Minimum stake: {tier.usdAmount} USD</li>
                              <li>• Hardware verification required</li>
                              <li>• 99% uptime SLA</li>
                              <li>• KYC compliance for enterprise+</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Token Mechanics Tab */}
          {activeTab === 'mechanics' && (
            <div className="space-y-8">
              {/* Burn Mechanisms */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
                  <Flame className="w-6 h-6 text-red-400" />
                  Deflationary Burn Mechanisms
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">Revenue Burns</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Percentage of network revenue automatically burned to reduce supply.
                      </p>
                      <MathFormula 
                        formula="Burn_{revenue} = Revenue \times BurnRate_{percentage}"
                        inline={false}
                      />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">Market Buybacks</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Treasury-funded buybacks during favorable market conditions.
                      </p>
                      <MathFormula 
                        formula="Buyback_{amount} = TreasuryAllocation \times PriceThreshold"
                        inline={false}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">Worker Penalties</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Slashed tokens from misbehaving workers are permanently burned.
                      </p>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Downtime violations: 1-5% stake</li>
                        <li>• Invalid computations: 5-25% stake</li>
                        <li>• Malicious behavior: 100% stake</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">Governance Burns</h4>
                      <p className="text-gray-300 text-sm">
                        Community-voted emergency burns for supply adjustment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Economic Model */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Economic Model</h3>
                <MermaidDiagram
                  chart={`graph LR
    subgraph REVENUE[Revenue Sources]
        JOBS[Job Fees]
        STORAGE[Storage Fees]
        BANDWIDTH[Bandwidth Fees]
        PREMIUM[Premium Services]
    end
    
    subgraph DISTRIBUTION[Fee Distribution]
        WORKERS[70% - Workers]
        TREASURY[20% - Treasury]
        BURN[10% - Burn]
    end
    
    subgraph TREASURY_USE[Treasury Usage]
        DEV[Development 40%]
        MARKETING[Marketing 30%]
        BUYBACK[Buybacks 20%]
        RESERVE[Reserve 10%]
    end
    
    JOBS --> DISTRIBUTION
    STORAGE --> DISTRIBUTION
    BANDWIDTH --> DISTRIBUTION
    PREMIUM --> DISTRIBUTION
    
    DISTRIBUTION --> WORKERS
    DISTRIBUTION --> TREASURY
    DISTRIBUTION --> BURN
    
    TREASURY --> TREASURY_USE
    
    classDef revenue fill:#059669,stroke:#10b981,stroke-width:2px,color:#fff
    classDef distribution fill:#7c3aed,stroke:#8b5cf6,stroke-width:2px,color:#fff
    classDef usage fill:#dc2626,stroke:#ef4444,stroke-width:2px,color:#fff
    
    class JOBS,STORAGE,BANDWIDTH,PREMIUM revenue
    class WORKERS,TREASURY,BURN distribution
    class DEV,MARKETING,BUYBACK,RESERVE usage`}
                />
              </div>
            </div>
          )}

          {/* Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <div className="space-y-8">
              <div className="space-y-6">
                {roadmapPhases.map((phase, index) => (
                  <div key={index} className="relative">
                    {index < roadmapPhases.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-cosmic-cyan to-transparent"></div>
                    )}
                    
                    <div className="flex gap-6 items-start">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0 ${
                        phase.status === 'current' ? 'bg-cosmic-cyan' :
                        phase.status === 'upcoming' ? 'bg-green-400' :
                        'bg-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-900 rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-xl font-semibold ${
                            phase.status === 'current' ? 'text-cosmic-cyan' :
                            phase.status === 'upcoming' ? 'text-green-400' :
                            'text-gray-400'
                          }`}>
                            {phase.phase}
                          </h3>
                          <span className="text-gray-400 text-sm">{phase.period}</span>
                        </div>
                        <p className="text-gray-300 mb-4">{phase.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          {phase.milestones.map((milestone, mIndex) => (
                            <div key={mIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`w-4 h-4 ${
                                phase.status === 'current' ? 'text-cosmic-cyan' :
                                phase.status === 'upcoming' ? 'text-green-400' :
                                'text-gray-400'
                              }`} />
                              <span className="text-gray-300">{milestone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Tab */}
          {activeTab === 'technical' && (
            <div className="space-y-8">
              {/* Why Cairo Section */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
                  <Code className="w-6 h-6 text-cosmic-cyan" />
                  Why Cairo & Starknet?
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-cosmic-cyan mb-3">Cairo Language Benefits</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Native ZK Support:</strong> Built specifically for zero-knowledge proof generation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Verifiable Computation:</strong> Every computation can be cryptographically verified</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>STARK Proofs:</strong> Scalable, transparent, and post-quantum secure</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Memory Safety:</strong> Prevents common smart contract vulnerabilities</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cosmic-cyan mb-3">Starknet Advantages</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Massive Scalability:</strong> 100,000+ TPS with low fees</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy by Default:</strong> Private computation without revealing data</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Ethereum Security:</strong> Inherits Ethereum's security guarantees</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Developer Experience:</strong> Rich tooling and Cairo ecosystem</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Smart Contract Architecture */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Smart Contract Architecture</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cosmic-cyan mb-2">Core Contracts</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li><strong>CIRO Token:</strong> ERC-20 with governance features</li>
                        <li><strong>CDC Pool:</strong> Worker staking and validation</li>
                        <li><strong>Job Manager:</strong> Compute marketplace logic</li>
                        <li><strong>Governance Treasury:</strong> DAO with timelock</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cosmic-cyan mb-2">Vesting System</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li><strong>Linear Vesting:</strong> Team and investor schedules</li>
                        <li><strong>Milestone Vesting:</strong> Performance-based releases</li>
                        <li><strong>Treasury Timelock:</strong> Governance-controlled delays</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cosmic-cyan mb-2">Economic Mechanisms</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li><strong>Burn Manager:</strong> Automated token burning</li>
                        <li><strong>Fee Distribution:</strong> Revenue sharing logic</li>
                        <li><strong>Penalty System:</strong> Slashing for misbehavior</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cosmic-cyan mb-2">Security Features</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li><strong>Role-Based Access:</strong> Granular permissions</li>
                        <li><strong>Emergency Pause:</strong> Circuit breaker mechanisms</li>
                        <li><strong>Upgrade Governance:</strong> Community-controlled upgrades</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZK-ML Integration */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">ZK-ML Integration</h3>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    CIRO Network leverages Cairo's native zero-knowledge capabilities to enable verifiable AI computation. 
                    This is crucial for enterprise adoption where computation integrity is paramount.
                  </p>
                  <MermaidDiagram
                    chart={`graph TD
    CLIENT[Client Submits Job]
    WORKER[Worker Executes AI Model]
    PROOF[Generate ZK Proof]
    VERIFY[Verify Proof On-Chain]
    REWARD[Distribute Rewards]
    
    CLIENT --> WORKER
    WORKER --> PROOF
    PROOF --> VERIFY
    VERIFY --> REWARD
    
    subgraph CAIRO[Cairo VM]
        PROOF
    end
    
    subgraph STARKNET[Starknet L2]
        VERIFY
        REWARD
    end
    
    classDef client fill:#059669,stroke:#10b981,stroke-width:2px,color:#fff
    classDef worker fill:#7c3aed,stroke:#8b5cf6,stroke-width:2px,color:#fff
    classDef zk fill:#dc2626,stroke:#ef4444,stroke-width:2px,color:#fff
    
    class CLIENT client
    class WORKER worker
    class PROOF,VERIFY,REWARD zk`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Multichain Tab */}
          {activeTab === 'multichain' && (
            <div className="space-y-8">
              {/* Multichain Strategy */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
                  <GitBranch className="w-6 h-6 text-cosmic-cyan" />
                  Multichain Strategy
                </h3>
                <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed">
                    While CIRO Network is built on Starknet for its superior ZK capabilities, we recognize the importance 
                    of multichain interoperability for maximum ecosystem reach and liquidity.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cosmic-cyan mb-3">Phase 1: Starknet Native</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Primary deployment on Starknet mainnet</li>
                        <li>• Full ZK-ML capabilities</li>
                        <li>• Native governance and staking</li>
                        <li>• Optimal gas efficiency for compute jobs</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-3">Phase 2: Ethereum Bridge</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Official Starknet ↔ Ethereum bridge</li>
                        <li>• Wrapped CIRO tokens on Ethereum</li>
                        <li>• Access to Ethereum DeFi ecosystem</li>
                        <li>• Enhanced liquidity options</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-400 mb-3">Phase 3: Strategic Expansions</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Polygon deployment for lower fees</li>
                        <li>• Arbitrum for Ethereum L2 coverage</li>
                        <li>• Cross-chain governance mechanisms</li>
                        <li>• Unified compute job routing</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-400 mb-3">Phase 4: Ecosystem Integration</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Cross-chain compute orchestration</li>
                        <li>• Universal worker registration</li>
                        <li>• Multi-chain liquidity aggregation</li>
                        <li>• Seamless user experience</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Technical Implementation</h3>
                <MermaidDiagram
                  chart={`graph TB
    subgraph STARKNET[Starknet - Primary Chain]
        CIRO_NATIVE[CIRO Token Native]
        CDC_POOL[CDC Pool]
        JOB_MGR[Job Manager]
        GOVERNANCE[Governance]
    end
    
    subgraph ETHEREUM[Ethereum Mainnet]
        BRIDGE_ETH[Starknet Bridge]
        CIRO_WRAPPED[Wrapped CIRO]
        DEFI[DeFi Integrations]
    end
    
    subgraph POLYGON[Polygon]
        BRIDGE_POLY[Polygon Bridge]
        CIRO_POLY[CIRO Polygon]
        CHEAP_OPS[Low-Cost Operations]
    end
    
    subgraph ARBITRUM[Arbitrum]
        BRIDGE_ARB[Arbitrum Bridge]
        CIRO_ARB[CIRO Arbitrum]
        L2_DEFI[L2 DeFi]
    end
    
    CIRO_NATIVE --> BRIDGE_ETH
    BRIDGE_ETH --> CIRO_WRAPPED
    CIRO_WRAPPED --> DEFI
    
    CIRO_NATIVE --> BRIDGE_POLY
    BRIDGE_POLY --> CIRO_POLY
    
    CIRO_NATIVE --> BRIDGE_ARB
    BRIDGE_ARB --> CIRO_ARB
    
    classDef primary fill:#00d4ff,stroke:#00d4ff,stroke-width:2px,color:#000
    classDef secondary fill:#7c3aed,stroke:#8b5cf6,stroke-width:2px,color:#fff
    classDef bridge fill:#059669,stroke:#10b981,stroke-width:2px,color:#fff
    
    class CIRO_NATIVE,CDC_POOL,JOB_MGR,GOVERNANCE primary
    class CIRO_WRAPPED,CIRO_POLY,CIRO_ARB secondary
    class BRIDGE_ETH,BRIDGE_POLY,BRIDGE_ARB bridge`}
                />
              </div>

              {/* Why Start with Starknet */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6 text-white">Why Start with Starknet?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cosmic-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">ZK-Native</h4>
                    <p className="text-gray-400 text-sm">
                      Built for zero-knowledge proofs from the ground up, 
                      essential for verifiable AI computation.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Scalability</h4>
                    <p className="text-gray-400 text-sm">
                      Massive throughput with minimal fees, 
                      perfect for high-frequency compute jobs.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-black" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Privacy</h4>
                    <p className="text-gray-400 text-sm">
                      Computation privacy without revealing 
                      sensitive data or model parameters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partnership Inquiry Form Modal */}
      <PartnershipInquiryForm 
        isOpen={isPartnershipFormOpen}
        onClose={() => setIsPartnershipFormOpen(false)}
      />

      {/* Compute Provider Form Modal */}
      <ComputeProviderForm 
        isOpen={isComputeProviderFormOpen}
        onClose={() => setIsComputeProviderFormOpen(false)}
      />
    </div>
  );
}