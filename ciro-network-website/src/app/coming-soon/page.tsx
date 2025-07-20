'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Rocket, 
  ArrowRight, 
  ArrowUpRight,
  Cpu, 
  Shield, 
  Network, 
  Brain, 
  Atom, 
  BookOpen, 
  FileText, 
  Coins,
  CheckCircle,
  Star,
  Code,
  Palette,
  Calendar,
  Zap,
  Building,
  Server,
  MessageCircle,
  Twitter,
  Instagram,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import Image from 'next/image';
import CookieConsent from '@/components/CookieConsent';

export default function ComingSoonPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const features = [
    {
      icon: Cpu,
      title: 'AI Compute Nodes',
      description: 'Distributed GPU computing for AI workloads',
      status: 'In Development'
    },
    {
      icon: Shield,
      title: 'Zero-Knowledge Proofs',
      description: 'Cryptographic verification for computations',
      status: 'In Development'
    },
    {
      icon: Network,
      title: 'Network Infrastructure',
      description: 'Global distributed computing network',
      status: 'In Development'
    },
    {
      icon: Brain,
      title: 'Enterprise AI',
      description: 'Scalable AI infrastructure for enterprises',
      status: 'Coming Soon'
    },
    {
      icon: Atom,
      title: 'Research & Development',
      description: 'High-performance computing for research',
      status: 'Coming Soon'
    },
    {
      icon: Rocket,
      title: 'Startup Acceleration',
      description: 'Cost-effective AI compute for startups',
      status: 'Coming Soon'
    }
  ];

  const timeline = [
    {
      phase: 'Phase 1: Foundation',
      period: 'Q4 2024 - Q2 2025',
      status: 'In Progress',
      description: 'Core infrastructure development and team building',
      items: ['Smart contract development', 'Core team expansion', 'Testnet preparation']
    },
    {
      phase: 'Phase 2: Testnet',
      period: 'Q3 2025',
      status: 'Coming Soon',
      description: 'Public testnet launch and community building',
      items: ['Testnet deployment', 'Worker node onboarding', 'Community incentives']
    },
    {
      phase: 'Phase 3: Mainnet',
      period: 'Q4 2025',
      status: 'Planned',
      description: 'Mainnet launch and token distribution',
      items: ['Mainnet deployment', 'Token generation event', 'DEX listings']
    }
  ];

  return (
    <main className="galactic-bg min-h-screen overflow-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cosmic-cyan/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-nebula-pink/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-aurora-green/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-stellar-blue/50 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-cosmic-cyan/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <a href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/Ciro White Full Logo.svg"
                  alt="Ciro Network"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
              </a>
            </motion.div>

            {/* Navigation Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center space-x-8"
            >
              <a href="/" className="text-white/80 hover:text-cosmic-cyan transition-colors duration-300 font-medium">
                Home
              </a>
              <a href="/tokenomics" className="text-white/80 hover:text-cosmic-cyan transition-colors duration-300 font-medium">
                Tokenomics
              </a>
              <a href="/manifesto" className="text-white/80 hover:text-cosmic-cyan transition-colors duration-300 font-medium">
                Manifesto
              </a>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden lg:flex items-center space-x-4"
            >
              <a 
                href="/"
                className="cosmic-button px-6 py-2 rounded-lg text-sm font-semibold"
              >
                Back to Home
              </a>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32">
        <div className="math-grid absolute inset-0 opacity-20"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 cosmic-glass px-6 py-3 rounded-full text-sm"
            >
              <div className="w-2 h-2 bg-cosmic-cyan rounded-full animate-pulse"></div>
              <span className="text-white/80">Under Development</span>
              <Clock className="w-4 h-4 text-cosmic-cyan" />
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                <span className="text-fractal">Coming</span>
                <br />
                <span className="text-white">Soon</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                We're building the future of decentralized AI compute infrastructure. 
                Our team is working hard to bring you verifiable, scalable, and secure computing.
              </p>
              <p className="text-lg text-cosmic-cyan/80">
                Expected Launch: Q3 2025
              </p>
            </motion.div>

            {/* Progress Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-aurora-green" />
                <span className="text-sm">Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-aurora-green" />
                <span className="text-sm">Core Infrastructure</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-5 h-5 text-cosmic-cyan" />
                <span className="text-sm">Testnet Development</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
            >
              <a 
                href="/"
                className="cosmic-button px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cosmic-cyan via-nebula-pink to-cosmic-cyan animate-pulse"></div>
                <span>🚀 Back to Home</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/tokenomics"
                className="cosmic-glass px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 hover:bg-cosmic-cyan/10 transition-colors"
              >
                <span>📊 View Tokenomics</span>
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">What We're</span>
              <br />
              <span className="text-cosmic-cyan">Building</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our comprehensive suite of decentralized computing solutions designed for the AI era
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="cosmic-glass p-6 rounded-xl border border-cosmic-cyan/20 hover:border-cosmic-cyan/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cosmic-cyan/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-cosmic-cyan" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.status === 'In Development' 
                        ? 'bg-cosmic-cyan/20 text-cosmic-cyan' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">Development</span>
              <br />
              <span className="text-cosmic-cyan">Timeline</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our roadmap to building the future of decentralized AI compute
            </p>
          </motion.div>

          <div className="space-y-8">
            {timeline.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row gap-8 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      phase.status === 'In Progress' 
                        ? 'bg-cosmic-cyan/20 text-cosmic-cyan' 
                        : phase.status === 'Coming Soon'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {phase.status === 'In Progress' ? (
                        <Zap className="w-6 h-6" />
                      ) : phase.status === 'Coming Soon' ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <Calendar className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{phase.phase}</h3>
                      <p className="text-cosmic-cyan font-medium">{phase.period}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-lg leading-relaxed">
                    {phase.description}
                  </p>
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-white/60">
                        <div className="w-1.5 h-1.5 bg-cosmic-cyan rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="cosmic-glass p-8 rounded-xl border border-cosmic-cyan/20">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        phase.status === 'In Progress' 
                          ? 'bg-cosmic-cyan/20 text-cosmic-cyan' 
                          : phase.status === 'Coming Soon'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {phase.status === 'In Progress' ? (
                          <Rocket className="w-8 h-8" />
                        ) : phase.status === 'Coming Soon' ? (
                          <Clock className="w-8 h-8" />
                        ) : (
                          <Calendar className="w-8 h-8" />
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">{phase.status}</h4>
                      <p className="text-white/60 text-sm">
                        {phase.status === 'In Progress' 
                          ? 'Currently being developed' 
                          : phase.status === 'Coming Soon'
                          ? 'Scheduled for development'
                          : 'Planned for future'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="galactic-bg border-t border-cosmic-cyan/20 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center gap-4">
              <a
                href="https://github.com/Ciro-AI-Labs/ciro-network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-cosmic-cyan transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/cironetw0rk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-cosmic-cyan transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/cirolabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-cosmic-cyan transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Ciro Network. Building the future of decentralized AI compute.
            </p>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </main>
  );
} 