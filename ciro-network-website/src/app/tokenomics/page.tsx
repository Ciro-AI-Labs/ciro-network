'use client';

import React from 'react';

export default function TokenomicsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Tokenomics Overview
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              High-level overview of token design, distribution, and governance mechanics.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              {/* badges removed on public page */}
            </div>
          </div>
        </div>
      </section>

      {/* Deployed Smart Contracts */}
      <section className="py-16 px-6 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              🚀 Live Smart Contracts
            </span>
          </h2>
          <p className="text-center text-gray-300 mb-12 text-lg">
            Successfully tested on testnets with a multi-chain roadmap - Ready for mainnet launch
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "CIRO Token",
                address: "0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8",
                classHash: "0x04c34ceab2c8127d01a3f894a2aa3f7c0ffbd5fb1f1ae91b19d478c1955bad70",
                features: ["ERC-20 Compatible", "Minting/Burning", "Governance Integration", "Dynamic Supply"],
                status: "✅ DEPLOYED"
              },
              {
                name: "CDC Pool",
                address: "0x05f73c551dbfda890090c8ee89858992dfeea9794a63ad83e6b1706e9836aeba",
                classHash: "0x05d9e1c8839eae6fbdbb756ed73a8f5d9d1533e4283e1d0445b0b00252e06fb5",
                features: ["Worker Staking", "Slashing Mechanisms", "Reward Distribution", "Reputation System"],
                status: "✅ DEPLOYED"
              },
              {
                name: "Job Manager",
                address: "0x00bf025663b8a7c7e43393f082b10afe66bd9ddb06fb5e521e3adbcf693094bd",
                classHash: "0x0197378e15788f4822dbce9f05b4fda8376a09ab6f1a408515bd1e9226e40b4d",
                features: ["Job Orchestration", "Payment Processing", "Worker Assignment", "Lifecycle Management"],
                status: "✅ DEPLOYED"
              },
              {
                name: "Governance Treasury",
                address: "0x00b8d816d8a909d7320c442b22d378d87bd41b3008b46b1cce56fc94d0e4a4be",
                features: ["DAO Treasury", "Proposal Execution", "Fund Management", "Security Budget"],
                status: "✅ DEPLOYED"
              },
              {
                name: "Linear Vesting",
                address: "0x00a8c57c46ba8ed81e2e1f4e421e26d5b8a1e3bb0b59f66b1d3a3b2b3d65e9da",
                features: ["Team Vesting", "Cliff Periods", "Linear Release", "Emergency Controls"],
                status: "✅ DEPLOYED"
              },
              {
                name: "Burn Manager",
                address: "0x070d665978b7275e5f4cea991d9508bc32b592f6244d1303a22f5c22bdc89ea5",
                features: ["Revenue Burns", "Buyback Execution", "Market Impact Minimization", "Deflationary Mechanics"],
                status: "✅ DEPLOYED"
              }
            ].map((contract, index) => (
              <div key={index} className="bg-black/40 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{contract.name}</h3>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    {contract.status}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Contract Address:</p>
                  <code className="text-xs text-blue-400 bg-gray-800 p-2 rounded block break-all">
                    {contract.address}
                  </code>
                </div>
                {contract.classHash && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Class Hash:</p>
                    <code className="text-xs text-purple-400 bg-gray-800 p-2 rounded block break-all">
                      {contract.classHash}
                    </code>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {contract.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">
              🔗 View smart contracts on supported explorers (multi-chain roadmap)
            </p>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-400 text-sm">
                <strong>⚡ Mainnet Ready:</strong> All contracts successfully tested and deployed. 
                Comprehensive integration testing completed. Ready for production launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Supply & Distribution */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              💎 Token Supply & Distribution
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Supply Information */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-yellow-400">🪙 Supply Mechanics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Maximum Supply Cap</span>
                  <span className="text-white font-bold">1,000,000,000 CIRO</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Initial Circulating</span>
                  <span className="text-green-400 font-bold">50,000,000 CIRO</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Current Status</span>
                  <span className="text-blue-400 font-bold">Minted & Deployed</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Remaining to Mint</span>
                  <span className="text-purple-400 font-bold">950,000,000 CIRO</span>
                </div>
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Smart Contract Control:</strong> All future minting controlled by governance-approved smart contracts with mathematical precision and security guarantees.
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-orange-400">📊 Token Allocation</h3>
              <div className="space-y-3">
                {[
                  { category: "Ecosystem/Rewards", tokens: "300M", percentage: "30%", color: "bg-green-500" },
                  { category: "Foundation/Treasury", tokens: "180M", percentage: "18%", color: "bg-blue-500" },
                  { category: "Team", tokens: "150M", percentage: "15%", color: "bg-purple-500" },
                  { category: "Private Sale", tokens: "75M", percentage: "7.5%", color: "bg-red-500" },
                  { category: "Development", tokens: "70M", percentage: "7%", color: "bg-gray-500" },
                  { category: "Public Sale", tokens: "50M", percentage: "5%", color: "bg-yellow-500" },
                  { category: "Strategic Round", tokens: "50M", percentage: "5%", color: "bg-pink-500" },
                  { category: "Seed Round", tokens: "50M", percentage: "5%", color: "bg-cyan-500" },
                  { category: "Liquidity/Market", tokens: "50M", percentage: "5%", color: "bg-orange-500" },
                  { category: "Advisors", tokens: "25M", percentage: "2.5%", color: "bg-indigo-500" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-4 h-4 ${item.color} rounded`}></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{item.category}</span>
                      <div className="text-right">
                        <span className="text-white font-bold text-sm">{item.tokens}</span>
                        <span className="text-gray-400 text-xs ml-2">({item.percentage})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Structure */}
      <section className="py-16 px-6 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              💰 Fundraising Structure
            </span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-black/40 border border-gray-700 rounded-xl overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-bold">Round</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Tokens</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Price</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Raise Amount</th>
                  <th className="px-6 py-4 text-left text-white font-bold">FDV</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Timeline</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Vesting</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    round: "Seed",
                    tokens: "50M",
                    price: "$0.01",
                    raise: "$500K",
                    fdv: "$10M",
                    timeline: "Month 0-3",
                    vesting: "6-mo cliff &rarr; 18-mo linear",
                    multiplier: "1x"
                  },
                  {
                    round: "Private",
                    tokens: "75M",
                    price: "$0.05",
                    raise: "$3.75M",
                    fdv: "$50M",
                    timeline: "Month 6-12",
                    vesting: "12-mo cliff &rarr; 24-mo linear",
                    multiplier: "5x"
                  },
                  {
                    round: "Strategic",
                    tokens: "50M",
                    price: "$0.10",
                    raise: "$5M",
                    fdv: "$100M",
                    timeline: "Month 12-15",
                    vesting: "3-mo cliff &rarr; 12-mo linear",
                    multiplier: "2x"
                  },
                  {
                    round: "Public",
                    tokens: "50M",
                    price: "$0.20",
                    raise: "$10M",
                    fdv: "$200M",
                    timeline: "Month 15-18 (TGE)",
                    vesting: "25% TGE, 6-mo linear",
                    multiplier: "2x"
                  }
                ].map((round, index) => (
                  <tr key={index} className="border-t border-gray-700 hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{round.round}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {round.multiplier}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{round.tokens}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">{round.price}</td>
                    <td className="px-6 py-4 text-yellow-400 font-bold">{round.raise}</td>
                    <td className="px-6 py-4 text-purple-400 font-bold">{round.fdv}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{round.timeline}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{round.vesting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="text-green-400 font-bold text-lg mb-2">Total Funds Raised: $19.25M</h4>
              <p className="text-green-300 text-sm">
                Smooth progression curve (1x &rarr; 5x &rarr; 2x &rarr; 2x) provides manageable steps for investors 
                while maintaining sustainable growth trajectory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Burn Mechanics */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              🔥 Advanced Burn Mechanics
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Mathematical Models */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-red-400">🧮 Mathematical Framework</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-2">Dynamic Supply Evolution</h4>
                  <code className="text-cyan-400 text-sm bg-black/50 p-2 rounded block">
                    S(t+1) = S(t) × (1 + r_inf(t)) - B(t)
                  </code>
                  <p className="text-gray-400 text-xs mt-2">
                    Where r_inf(t) is adaptive inflation rate based on network security requirements
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-2">Adaptive Inflation Rate</h4>
                  <code className="text-cyan-400 text-sm bg-black/50 p-2 rounded block">
                    r_inf(t) = max(r_min, SecurityBudget_USD / (S(t) × P(t)))
                  </code>
                  <p className="text-gray-400 text-xs mt-2">
                    Inflation adjusts to maintain $2M minimum security budget
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-2">Revenue Burn Function</h4>
                  <code className="text-cyan-400 text-sm bg-black/50 p-2 rounded block">
                    B_revenue(t) = min(R(t) × burn_rate, max_burn_per_period)
                  </code>
                  <p className="text-gray-400 text-xs mt-2">
                    Percentage of network revenue automatically burned with safety caps
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-2">Buyback Burn Mechanism</h4>
                  <code className="text-cyan-400 text-sm bg-black/50 p-2 rounded block">
                    B_buyback(t) = Treasury_ETH(t) / P_CIRO(t)
                  </code>
                  <p className="text-gray-400 text-xs mt-2">
                    Treasury ETH converted to CIRO and permanently burned
                  </p>
                </div>
              </div>
            </div>

            {/* Burn Implementation */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-orange-400">⚙️ Implementation Details</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Weekly Dutch Auctions
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Minimize market impact through time-distributed burn execution via professional market makers
                  </p>
                </div>
                
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    70% Revenue Pipeline
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Automatic STRK/USD &rarr; CIRO &rarr; burn pipeline ensures consistent deflationary pressure
                  </p>
                </div>
                
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Protocol-Owned Liquidity
                  </h4>
                  <p className="text-gray-300 text-sm">
                    $4M POL target provides 8-week burn buffer with 1% maximum slippage protection
                  </p>
                </div>
                
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Circuit Breakers
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Dynamic auction throttling if &gt;60% daily volatility (no trading halts - just slower burns)
                  </p>
                </div>
                
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Governance Controls
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Maximum &plusmn;15% burn rate changes per 30-day epoch with emergency override capabilities
                  </p>
                </div>
              </div>
              
              <div className="mt-6 bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <h4 className="text-red-400 font-bold mb-2">🎯 Burn Source Priority</h4>
                <p className="text-red-300 text-sm">
                  All scheduled burns draw EXCLUSIVELY from Foundation/Treasury pool (180M tokens). 
                  This protects circulating supply while maintaining deflationary pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Framework */}
      <section className="py-16 px-6 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🗳️ Governance Framework
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Emergency Multisig */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">Emergency Multisig Council</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Staker-Elected Seats</span>
                  <span className="text-white font-bold">3/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">External Guardians</span>
                  <span className="text-white font-bold">3/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Core Team Rep</span>
                  <span className="text-white font-bold">1/7</span>
                </div>
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
                  <p className="text-yellow-400 text-xs">
                    Emergency powers only for Level-3+ incidents (security threats, exploits)
                  </p>
                </div>
              </div>
            </div>

            {/* Proposal Types */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-pink-400">Proposal Thresholds</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Treasury Allocation</span>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">67%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Protocol Upgrades</span>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">75%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Parameter Changes</span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">60%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Emergency Actions</span>
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">90%</span>
                </div>
              </div>
            </div>

            {/* Voting Power */}
            <div className="bg-black/40 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-cyan-400">Voting Power Structure</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Power</span>
                  <span className="text-white">1 CIRO = 1 vote</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Long-term Holders</span>
                  <span className="text-yellow-400">1.5x multiplier</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Participants</span>
                  <span className="text-green-400">2x multiplier</span>
                </div>
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                  <p className="text-blue-400 text-xs">
                    Delegation supported • Timelock for execution • Annual multisig review
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Projections */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              📈 Return Projections & Benchmarks
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                scenario: "Conservative",
                multiplier: "50x-75x",
                timeline: "3-5 years",
                price: "$1.00 - $1.50",
                description: "Based on Render Network's proven performance trajectory",
                color: "from-green-400 to-green-600"
              },
              {
                scenario: "Aggressive",
                multiplier: "100x-150x",
                timeline: "2-4 years",
                price: "$2.00 - $3.00",
                description: "Market leadership in verifiable AI compute sector",
                color: "from-yellow-400 to-orange-500"
              },
              {
                scenario: "Moonshot",
                multiplier: "200x+",
                timeline: "5+ years",
                price: "$4.00+",
                description: "Dominant infrastructure for global AI economy",
                color: "from-purple-400 to-pink-500"
              }
            ].map((projection, index) => (
              <div key={index} className="bg-black/40 border border-gray-700 rounded-xl p-6 hover:border-gray-500 transition-colors">
                <div className={`bg-gradient-to-r ${projection.color} text-white text-center py-2 rounded-lg mb-4`}>
                  <h3 className="text-lg font-bold">{projection.scenario}</h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-white mb-2">{projection.multiplier}</div>
                  <div className="text-gray-400 text-sm">{projection.timeline}</div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-yellow-400">{projection.price}</div>
                  <div className="text-gray-500 text-xs">Target Price Range</div>
                </div>
                <p className="text-gray-300 text-sm text-center">{projection.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-blue-400 text-center">📊 Competitive Benchmarks</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="text-white font-bold mb-2">Render Network (RNDR)</h4>
                <p className="text-green-400 text-xl font-bold">59x - 247x</p>
                <p className="text-gray-400 text-sm">Proven DePIN performance</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-2">Akash Network (AKT)</h4>
                <p className="text-yellow-400 text-xl font-bold">12x - 85x</p>
                <p className="text-gray-400 text-sm">Decentralized compute</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-2">CIRO Target</h4>
                <p className="text-purple-400 text-xl font-bold">50x - 200x</p>
                <p className="text-gray-400 text-sm">Verifiable AI compute</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 px-6 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              🛡️ Security & Compliance
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-black/40 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-red-400">🔒 Security Guarantees</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">$2M Annual Security Budget</h4>
                    <p className="text-gray-400 text-sm">Guaranteed minimum with auto-rebalancing mechanisms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">5-Level Threat Response</h4>
                    <p className="text-gray-400 text-sm">Comprehensive emergency response system with escalation protocols</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">Advanced Monitoring</h4>
                    <p className="text-gray-400 text-sm">Circuit breaker mechanisms and real-time threat detection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">Smart Contract Audits</h4>
                    <p className="text-gray-400 text-sm">Multiple professional audits and formal verification</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-purple-400">⚖️ Regulatory Compliance</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">Governance-Controlled Supply</h4>
                    <p className="text-gray-400 text-sm">Prevents "unlimited discretion" regulatory concerns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">Safety-Limited Parameters</h4>
                    <p className="text-gray-400 text-sm">Maximum &plusmn;10%/&plusmn;15% change caps per epoch</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">Decentralization Framework</h4>
                    <p className="text-gray-400 text-sm">Progressive decentralization with external guardians</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-bold">Whale-Friendly Structure</h4>
                    <p className="text-gray-400 text-sm">Institutional participation frameworks and compliance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Join the Future of Verifiable AI
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            CIRO Network represents a paradigm shift in AI infrastructure. 
            With production-ready smart contracts and market-tested tokenomics, 
            we're building the foundation for trustless artificial intelligence.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
              <h3 className="text-green-400 font-bold mb-2">✅ Contracts Deployed</h3>
              <p className="text-gray-300 text-sm">All 6 core contracts tested and ready with a multi-chain strategy</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
              <h3 className="text-blue-400 font-bold mb-2">🔒 Security Audited</h3>
              <p className="text-gray-300 text-sm">Professional audits and comprehensive testing completed</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6">
              <h3 className="text-purple-400 font-bold mb-2">🚀 Mainnet Ready</h3>
              <p className="text-gray-300 text-sm">Production deployment ready with 95% completion</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/manifesto" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
            >
              Read Full Manifesto
            </a>
            <a 
              href="https://sepolia.starkscan.co/contract/0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 border border-gray-600 text-white px-8 py-3 rounded-lg font-bold hover:border-gray-400 transition-all duration-300"
            >
              View Live Contracts
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}