# 🌐 Ciro Network Website

**Beautiful, animated marketing website for Ciro Network - The future of verifiable AI compute**

> A decentralized, verifiable AI compute infrastructure built for the real world. Born on the factory floor, trusted by industry, powered by community.

## 🎯 Project Vision

This website will serve as the primary gateway for millions of users worldwide to discover, understand, and engage with Ciro Network. Our goal is to create an immersive, animated experience that communicates the power of ZK-verified AI compute while driving conversion across multiple user personas.

### Target Audiences
- **GPU Providers**: Individuals and organizations with spare compute capacity
- **Developers**: AI/ML engineers and blockchain developers
- **Industrial Customers**: Manufacturing, oil & gas, mining operations
- **Investors**: VCs, crypto funds, and strategic partners
- **Community**: Contributors, researchers, and enthusiasts

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend:
├── Next.js 14 + React 18 + TypeScript
├── Tailwind CSS + shadcn/ui components
├── Framer Motion + GSAP for animations
├── Three.js + React Three Fiber for WebGL
└── Lottie React for SVG animations

Blockchain Integration:
├── @starknet-react for wallet connections
├── starknet.js for contract interactions
├── GraphQL subgraph for event data
└── Real-time WebSocket feeds

Performance & Hosting:
├── Vercel Edge Network deployment
├── Next.js ISR for dynamic content
├── Lighthouse CI for performance monitoring
└── Playwright for E2E testing
```

### Performance Targets
- **LCP**: <1.5s (homepage), <2.5s (complex pages)
- **CLS**: <0.1 (critical for animations)
- **FID**: <100ms (user interactions)
- **Lighthouse**: 95+ (Performance, Accessibility, SEO)

## 📁 Project Structure

```
ciro-network-website/
├── README.md                    # This file
├── ARCHITECTURE.md              # Technical architecture docs
├── ANIMATION_GUIDE.md           # Animation specifications
├── CONTENT_STRATEGY.md          # Content guidelines
├── package.json                 # Dependencies
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── 
├── public/                      # Static assets
│   ├── images/                  # Optimized images
│   ├── animations/              # Lottie files
│   ├── models/                  # 3D models
│   └── icons/                   # SVG icons
│
├── src/                         # Source code
│   ├── app/                     # Next.js 14 app router
│   │   ├── (pages)/            # Route groups
│   │   ├── api/                # API routes
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   │
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── animations/         # Animation components
│   │   ├── blockchain/         # Web3 components
│   │   ├── charts/             # Data visualization
│   │   └── sections/           # Page sections
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useContract.ts      # Contract interactions
│   │   ├── useAnimation.ts     # Animation controls
│   │   └── useMetrics.ts       # Live data fetching
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── contract-abis/      # Contract ABIs
│   │   ├── animations/         # Animation configs
│   │   ├── blockchain.ts       # Starknet setup
│   │   └── utils.ts            # General utilities
│   │
│   ├── styles/                  # Additional styles
│   │   ├── animations.css      # Animation keyframes
│   │   └── components.css      # Component styles
│   │
│   └── types/                   # TypeScript definitions
│       ├── contracts.ts        # Contract types
│       ├── animations.ts       # Animation types
│       └── global.ts           # Global types
│
├── docs/                        # Documentation
│   ├── SETUP.md                # Development setup
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── ANIMATIONS.md           # Animation specifications
│   ├── BLOCKCHAIN.md           # Blockchain integration
│   └── CONTENT.md              # Content guidelines
│
├── tests/                       # Test files
│   ├── e2e/                    # Playwright E2E tests
│   ├── unit/                   # Jest unit tests
│   └── performance/            # Lighthouse tests
│
└── scripts/                     # Build and deployment scripts
    ├── build.sh                # Production build
    ├── deploy.sh               # Deployment script
    └── optimize.sh             # Asset optimization
```

## 🎨 Design System

### Color Palette
```css
/* Ciro Network Brand Colors */
:root {
  /* Primary - Electric Blue */
  --ciro-primary: #0066FF;
  --ciro-primary-dark: #0052CC;
  --ciro-primary-light: #3385FF;
  
  /* Secondary - Neon Green */
  --ciro-secondary: #00FF88;
  --ciro-secondary-dark: #00CC6A;
  --ciro-secondary-light: #33FFAA;
  
  /* Accent - Violet */
  --ciro-accent: #8B5CF6;
  --ciro-accent-dark: #7C3AED;
  --ciro-accent-light: #A78BFA;
  
  /* Neutral - Dark Theme */
  --ciro-dark: #0A0A0A;
  --ciro-dark-surface: #141414;
  --ciro-dark-border: #2A2A2A;
  
  /* Text */
  --ciro-text-primary: #FFFFFF;
  --ciro-text-secondary: #B3B3B3;
  --ciro-text-tertiary: #666666;
}
```

### Typography
- **Headlines**: Inter Bold (futuristic, clean)
- **Body**: Inter Regular (readable, professional)
- **Code**: JetBrains Mono (technical content)

### Animation Principles
- **Performance First**: 60fps on mid-range devices
- **Meaningful Motion**: Every animation serves a purpose
- **Accessibility**: Respect `prefers-reduced-motion`
- **Progressive Enhancement**: Core content accessible without JS

## 🚀 Key Features

### 1. Hero GPU Lattice Animation
- WebGL scene with 1000+ animated GPU cubes
- Real-time job allocation visualization
- Morphing between GPU grid and blockchain structure
- Interactive cost savings calculator

### 2. Live Blockchain Data Integration
- Real-time metrics from CIRO token contract
- Active jobs from CDC Pool events
- Staking and governance participation data
- Network performance dashboards

### 3. Interactive Tokenomics Visualization
- Animated supply and burn tracking
- Staking rewards calculator
- Governance voting simulation
- Economic projections and modeling

### 4. Industrial Case Study Showcases
- 3D factory environment simulations
- Before/after cost comparisons
- ROI calculators for different industries
- Compliance verification demonstrations

### 5. Developer Ecosystem Hub
- Live API playground with Monaco editor
- Smart contract explorer
- SDK documentation and examples
- Community contributor tracking

## 📊 Success Metrics

### Technical Performance
- **Core Web Vitals**: Meet Google's standards
- **Animation Performance**: Maintain 60fps
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Top 3 ranking for "decentralized AI compute"

### User Engagement
- **Conversion Rate**: 15% explore docs, 5% connect wallet
- **Session Quality**: 3+ minutes average, 40% return rate
- **Interactive Features**: 80% use calculators/demos
- **Developer Adoption**: 100+ SDK downloads/month

### Business Impact
- **Lead Generation**: 100+ qualified industrial leads/month
- **Community Growth**: 1000+ active members
- **Media Coverage**: 50+ articles and mentions
- **Investment Interest**: 10+ serious inquiries

## 🛠️ Development Workflow

### Getting Started
```bash
# Clone and setup
git clone https://github.com/Ciro-AI-Labs/ciro-network
cd ciro-network/ciro-network-website

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development Guidelines
1. **Component First**: Build reusable, composable components
2. **Performance Monitoring**: Use Lighthouse CI on every PR
3. **Accessibility Testing**: Run axe-core on all components
4. **Animation Performance**: Profile with Chrome DevTools
5. **Cross-Browser Testing**: Support last 2 versions of major browsers

## 🔗 Integration Points

### Blockchain Contracts
- **CIRO Token**: Live supply, burn, and governance data
- **CDC Pool**: Worker registrations and job statistics
- **Job Manager**: Active jobs and performance metrics
- **Governance**: Proposal tracking and voting

### External APIs
- **Starknet RPC**: Contract state and events
- **GraphQL Subgraph**: Aggregated blockchain data
- **IPFS**: Decentralized content storage
- **Analytics**: Custom metrics and user behavior

## 📈 Launch Strategy

### Phase 1: Foundation (Weeks 1-3)
- Design system and component library
- Core animation framework
- Basic blockchain integration

### Phase 2: Core Pages (Weeks 4-7)
- Hero landing page with GPU lattice
- Architecture and technical documentation
- Tokenomics dashboard and calculators
- Developer ecosystem hub

### Phase 3: Enhancement (Weeks 8-10)
- Advanced interactive features
- Performance optimization
- Accessibility compliance
- Launch preparation

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](../CONTRIBUTING.md) for details on:
- Code standards and review process
- Animation and design guidelines
- Content creation and documentation
- Testing and quality assurance

## 📄 License

This project is licensed under the Business Source License 1.1 (BSL-1.1). See [LICENSE-BSL](../LICENSE-BSL) for details.

---

**Built with ❤️ by the Ciro Network community**

*Democratizing AI compute, one GPU at a time.* 