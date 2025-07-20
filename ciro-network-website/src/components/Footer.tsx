"use client"

import { motion } from "framer-motion"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Shield, 
  Settings,
  ExternalLink,
  Heart,
  Cpu,
  Brain,
  Atom,
  Rocket,
  BookOpen,
  FileText,
  Coins,
  Network,
  MessageCircle
} from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const openCookiePreferences = () => {
    if (typeof window !== 'undefined' && window.openCookiePreferences) {
      window.openCookiePreferences()
    }
  }

  return (
    <footer className="galactic-bg border-t border-cosmic-cyan/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/Ciro White Full Logo.svg"
                  alt="Ciro Network"
                  width={320}
                  height={85}
                  className="h-20 w-auto"
                />
              </a>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Decentralized compute infrastructure for the next generation of AI and creative applications.
            </p>
            <div className="flex items-center gap-4">
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
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Products</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Cpu className="w-3 h-3" />
                  AI Compute Nodes
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Shield className="w-3 h-3" />
                  Zero-Knowledge Proofs
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Network className="w-3 h-3" />
                  Network Infrastructure
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Brain className="w-3 h-3" />
                  Enterprise AI
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Atom className="w-3 h-3" />
                  Research & Development
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Rocket className="w-3 h-3" />
                  Startup Acceleration
                </a>
              </li>
            </ul>
          </div>

          {/* Documentation */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Documentation</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://docs.ciro.network" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <BookOpen className="w-3 h-3" />
                  Knowledge Base
                </a>
              </li>
              <li>
                <a 
                  href="/manifesto" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" />
                  The Manifesto
                </a>
              </li>
              <li>
                <a 
                  href="/tokenomics" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Coins className="w-3 h-3" />
                  Tokenomics
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About & Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">About</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.ciroai.us/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Our Story
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm"
                >
                  Careers
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm"
                >
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Resources */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.gg/PhAX4XWwnH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <MessageCircle className="w-3 h-3" />
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="/coming-soon" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm"
                >
                  News
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/privacy" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Shield className="w-3 h-3" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/cookies" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <button
                  onClick={openCookiePreferences}
                  className="text-white/70 hover:text-cosmic-cyan transition-colors text-sm flex items-center gap-2"
                >
                  <Settings className="w-3 h-3" />
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-cosmic-cyan/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>© {currentYear} Ciro Network. Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for the decentralized future.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="/coming-soon" 
                className="text-white/60 hover:text-cosmic-cyan transition-colors"
              >
                Security
              </a>
              <a 
                href="/coming-soon" 
                className="text-white/60 hover:text-cosmic-cyan transition-colors"
              >
                Status
              </a>
              <a 
                href="/coming-soon" 
                className="text-white/60 hover:text-cosmic-cyan transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 