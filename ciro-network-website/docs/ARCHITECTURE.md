# 🏗️ Technical Architecture

This document outlines the technical architecture, design decisions, and implementation details for the Ciro Network website.

## Overview

The Ciro Network website is built as a high-performance, animated marketing site that integrates live blockchain data while maintaining exceptional user experience across all devices and connection speeds.

## Architecture Principles

### 1. Performance First
- **Target**: 95+ Lighthouse scores across all categories
- **Core Web Vitals**: LCP <1.5s, CLS <0.1, FID <100ms
- **Animation Performance**: Maintain 60fps on mid-range devices
- **Progressive Enhancement**: Core content accessible without JavaScript

### 2. Accessibility & Inclusion
- **WCAG 2.1 AA Compliance**: All content accessible to users with disabilities
- **Internationalization**: Multi-language support for global audience
- **Reduced Motion**: Respect user preferences for motion
- **Keyboard Navigation**: Full keyboard accessibility

### 3. Scalability & Maintainability
- **Component-Driven Development**: Reusable, composable components
- **Type Safety**: Full TypeScript coverage
- **Testing Strategy**: Unit, integration, and E2E testing
- **Documentation**: Comprehensive docs for all components

## Technology Stack

### Frontend Framework
```typescript
// Next.js 14 with App Router
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ciro Network - Verifiable AI Compute',
  description: 'Decentralized AI compute infrastructure...'
}

// Server and Client Components
'use client' // For interactive components
'use server' // For server-side logic
```

### Styling & Design System
```css
/* Tailwind CSS with Custom Design Tokens */
module.exports = {
  theme: {
    extend: {
      colors: {
        ciro: {
          primary: '#0066FF',
          secondary: '#00FF88',
          accent: '#8B5CF6',
        }
      },
      animation: {
        'gpu-pulse': 'gpu-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'lattice-morph': 'lattice-morph 8s ease-in-out infinite',
      }
    }
  }
}
```

### Animation Libraries
```typescript
// Three.js for WebGL scenes
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { InstancedMesh, useRef } from 'react'

// GSAP for timeline animations
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Framer Motion for React animations
import { motion, useScroll, useTransform } from 'framer-motion'
```

### Blockchain Integration
```typescript
// Starknet React for wallet connections
import { StarknetConfig, publicProvider } from '@starknet-react/core'
import { Chain, mainnet, sepolia } from '@starknet-react/chains'

// Contract interactions
import { Contract, RpcProvider } from 'starknet'
import { CIRO_TOKEN_ABI, CDC_POOL_ABI } from '@/lib/contract-abis'

// Real-time data fetching
import { useQuery, useSubscription } from '@apollo/client'
```

## Component Architecture

### Design System Components
```
src/components/ui/
├── Button/                  # Primary CTA buttons
├── Card/                    # Content cards
├── Modal/                   # Overlay modals
├── Input/                   # Form inputs
├── Chart/                   # Data visualization
└── Animation/               # Reusable animations
```

### Feature Components
```
src/components/
├── sections/               # Page sections
│   ├── Hero/              # Hero sections
│   ├── Features/          # Feature showcases
│   ├── Testimonials/      # Social proof
│   └── CTA/               # Call-to-action
├── animations/            # Complex animations
│   ├── GPULattice/        # WebGL GPU visualization
│   ├── TokenFlow/         # Tokenomics animation
│   └── NetworkMap/        # Geographic visualization
├── blockchain/            # Web3 components
│   ├── WalletConnect/     # Wallet integration
│   ├── ContractReader/    # Contract data display
│   └── TransactionStatus/ # TX status tracking
└── charts/                # Data visualization
    ├── SupplyChart/       # Token supply charts
    ├── NetworkMetrics/    # Performance metrics
    └── CostComparison/    # Cost calculators
```

## Animation System

### WebGL Rendering Pipeline
```typescript
// GPU Lattice Animation
interface GPULatticeProps {
  count: number;        // Number of GPU instances
  animation: 'idle' | 'processing' | 'morphing';
  onJobAllocation: (gpuId: string) => void;
}

const GPULattice: React.FC<GPULatticeProps> = ({ count, animation }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Update instance matrices for animation
      updateGPUPositions(state.clock.elapsedTime)
    }
  })
  
  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]}>
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### GSAP Timeline System
```typescript
// Scroll-triggered animations
const useScrollAnimation = (trigger: RefObject<HTMLElement>) => {
  useEffect(() => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: trigger.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
        toggleActions: "play none none reverse"
      }
    })
    
    timeline
      .from('.feature-card', { y: 100, opacity: 0, stagger: 0.2 })
      .to('.feature-icon', { rotation: 360, duration: 1 })
    
    return () => timeline.kill()
  }, [trigger])
}
```

### Performance Optimization
```typescript
// Intersection Observer for lazy loading
const useIntersectionObserver = (callback: () => void) => {
  const observer = useMemo(
    () => new IntersectionObserver(
      ([entry]) => entry.isIntersecting && callback(),
      { threshold: 0.1 }
    ),
    [callback]
  )
  
  return observer
}

// GPU memory management
const useGPUMemoryManager = () => {
  useEffect(() => {
    return () => {
      // Cleanup WebGL resources
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])
}
```

## Data Architecture

### State Management
```typescript
// Zustand for global state
interface AppState {
  walletConnected: boolean
  networkMetrics: NetworkMetrics
  userPreferences: UserPreferences
  animationSettings: AnimationSettings
}

const useAppStore = create<AppState>((set) => ({
  walletConnected: false,
  setWalletConnected: (connected) => set({ walletConnected: connected }),
  // ... other state methods
}))
```

### Blockchain Data Flow
```typescript
// Contract data fetching
const useContractData = (contractAddress: string, method: string) => {
  return useQuery(GET_CONTRACT_DATA, {
    variables: { contractAddress, method },
    pollInterval: 30000, // Refresh every 30 seconds
    errorPolicy: 'cache-and-network'
  })
}

// Real-time event listening
const useContractEvents = (contractAddress: string, eventName: string) => {
  return useSubscription(WATCH_CONTRACT_EVENTS, {
    variables: { contractAddress, eventName },
    onData: ({ data }) => {
      // Handle real-time events
      updateNetworkMetrics(data.event)
    }
  })
}
```

### Caching Strategy
```typescript
// Next.js ISR for dynamic content
export const revalidate = 60 // Revalidate every minute

// React Query for client-side caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
})

// Service Worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

## Performance Optimization

### Code Splitting
```typescript
// Route-based code splitting
const LazyArchitecture = lazy(() => import('./pages/Architecture'))
const LazyTokenomics = lazy(() => import('./pages/Tokenomics'))

// Component-based code splitting
const LazyGPULattice = lazy(() => import('./animations/GPULattice'))

// Bundle analysis
// Use webpack-bundle-analyzer for optimization
```

### Asset Optimization
```typescript
// Image optimization
import Image from 'next/image'

<Image
  src="/hero-background.webp"
  alt="Ciro Network Hero"
  width={1920}
  height={1080}
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Font optimization
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

### Animation Performance
```typescript
// RAF-based animation loops
const useAnimationFrame = (callback: (time: number) => void) => {
  const requestRef = useRef<number>()
  
  useEffect(() => {
    const animate = (time: number) => {
      callback(time)
      requestRef.current = requestAnimationFrame(animate)
    }
    
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [callback])
}

// GPU acceleration hints
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

## Security Considerations

### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      connect-src 'self' wss: https: *.starknet.io;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### Wallet Security
```typescript
// Secure wallet connections
const connectWallet = async () => {
  try {
    const wallet = await connect({
      modalMode: 'canAsk',
      modalTheme: 'dark'
    })
    
    // Verify wallet connection
    if (wallet.isConnected) {
      const account = wallet.account
      // Additional security checks
    }
  } catch (error) {
    console.error('Wallet connection failed:', error)
  }
}
```

## Testing Strategy

### Unit Testing
```typescript
// Jest + React Testing Library
import { render, screen } from '@testing-library/react'
import { GPULattice } from '../GPULattice'

describe('GPULattice', () => {
  it('renders correct number of GPU instances', () => {
    render(<GPULattice count={100} animation="idle" />)
    // Test WebGL rendering
  })
})
```

### E2E Testing
```typescript
// Playwright tests
import { test, expect } from '@playwright/test'

test('homepage loads and animations work', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero-title')).toBeVisible()
  
  // Test WebGL animation
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  
  // Test wallet connection
  await page.click('[data-testid="connect-wallet"]')
  await expect(page.locator('.wallet-modal')).toBeVisible()
})
```

### Performance Testing
```typescript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/architecture'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    }
  }
}
```

## Deployment Architecture

### Vercel Edge Network
```typescript
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "edge"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Environment Configuration
```typescript
// Environment variables
NEXT_PUBLIC_STARKNET_CHAIN_ID=mainnet
NEXT_PUBLIC_RPC_URL=https://starknet-mainnet.public.blastapi.io
NEXT_PUBLIC_GRAPH_URL=https://api.thegraph.com/subgraphs/name/ciro/mainnet
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X

// Runtime configuration
const config = {
  chainId: process.env.NEXT_PUBLIC_STARKNET_CHAIN_ID,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  graphUrl: process.env.NEXT_PUBLIC_GRAPH_URL
}
```

## Monitoring & Analytics

### Performance Monitoring
```typescript
// Real User Monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)

// Error tracking
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1
})
```

### User Analytics
```typescript
// Custom analytics events
const trackEvent = (eventName: string, properties: object) => {
  if (typeof window !== 'undefined') {
    gtag('event', eventName, properties)
  }
}

// User journey tracking
trackEvent('wallet_connected', { chain: 'starknet' })
trackEvent('calculator_used', { type: 'cost_comparison' })
trackEvent('docs_viewed', { section: 'api_reference' })
```

---

This architecture ensures the Ciro Network website delivers an exceptional user experience while maintaining high performance, accessibility, and security standards. 