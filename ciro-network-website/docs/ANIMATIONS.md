# 🎬 Animation Guide

This document outlines the animation specifications, performance guidelines, and implementation patterns for the Ciro Network website.

## Animation Philosophy

### Core Principles
1. **Performance First**: Every animation must maintain 60fps on mid-range devices
2. **Meaningful Motion**: Animations should enhance understanding, not just decoration
3. **Accessibility**: Respect `prefers-reduced-motion` settings
4. **Consistent Timing**: Use standardized easing curves and durations

### Visual Language
- **Futuristic & Technical**: Clean, precise movements that reflect AI compute precision
- **Industrial Heritage**: Mechanical and systematic animations reflecting factory origins
- **Network Energy**: Flowing, connected movements showing distributed systems
- **Trust & Verification**: Solid, confident animations that build credibility

## Animation Types

### 1. Hero GPU Lattice Animation

#### Concept
A WebGL-powered visualization of 1000+ GPU instances arranged in a 3D lattice that responds to real network activity.

#### Technical Specifications
```typescript
interface GPULatticeConfig {
  instances: 1000
  gridSize: { x: 10, y: 10, z: 10 }
  animationStates: 'idle' | 'processing' | 'morphing' | 'error'
  frameRate: 60
  renderDistance: 500
  lodLevels: 3
}

// Performance targets
const PERFORMANCE_TARGETS = {
  frameTime: 16.67, // 60fps
  drawCalls: 15,    // Maximum draw calls per frame
  triangles: 50000, // Maximum triangle count
  memoryUsage: 100  // Maximum GPU memory in MB
}
```

#### Animation States
- **Idle**: Gentle floating motion with subtle pulsing
- **Processing**: Highlighted instances with energy flow effects
- **Morphing**: Transition between lattice and blockchain structure
- **Error**: Red pulsing for failed jobs or network issues

#### Implementation
```typescript
const GPULattice: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  
  useFrame((state) => {
    if (meshRef.current) {
      updateInstancePositions(state.clock.elapsedTime, animationState)
    }
  })
  
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <instancedMesh ref={meshRef} args={[geometry, material, 1000]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#0066FF" />
      </instancedMesh>
    </Canvas>
  )
}
```

### 2. Scroll-Triggered Section Animations

#### GSAP ScrollTrigger Implementation
```typescript
const useSectionAnimation = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        scrub: 1
      }
    })
    
    timeline
      .from('.section-title', { 
        y: 100, 
        opacity: 0, 
        duration: 1,
        ease: "power3.out" 
      })
      .from('.section-content', { 
        y: 50, 
        opacity: 0, 
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out" 
      }, "-=0.5")
    
    return () => timeline.kill()
  }, [ref])
}
```

### 3. Tokenomics Flow Animation

#### SVG Path Animation
```typescript
const TokenFlowAnimation: React.FC = () => {
  const pathRef = useRef<SVGPathElement>(null)
  
  useEffect(() => {
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength()
      
      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
      })
      
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 1
      })
    }
  }, [])
  
  return (
    <svg viewBox="0 0 800 400">
      <path
        ref={pathRef}
        d="M50,200 Q200,50 400,200 T750,200"
        stroke="#00FF88"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  )
}
```

### 4. Number Counter Animations

#### Smooth Number Transitions
```typescript
const useCounterAnimation = (target: number, duration: number = 2) => {
  const [current, setCurrent] = useState(0)
  const nodeRef = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    
    const animation = gsap.to({ value: 0 }, {
      value: target,
      duration,
      ease: "power2.out",
      onUpdate: function() {
        setCurrent(Math.floor(this.targets()[0].value))
      }
    })
    
    return () => animation.kill()
  }, [target, duration])
  
  return { current, ref: nodeRef }
}
```

### 5. Interactive Hover Effects

#### Micro-Interactions
```typescript
const InteractiveCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      rotationY: 5,
      z: 50,
      duration: 0.3,
      ease: "power2.out"
    })
  }
  
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      rotationY: 0,
      z: 0,
      duration: 0.3,
      ease: "power2.out"
    })
  }
  
  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="transform-gpu will-change-transform"
    >
      Card Content
    </div>
  )
}
```

## Performance Optimization

### WebGL Optimization
```typescript
// Instanced rendering for multiple objects
const OptimizedGPUGrid: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  // Use geometry instancing for performance
  const geometry = useMemo(() => new THREE.BoxGeometry(0.1, 0.1, 0.1), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x0066ff }), [])
  
  // Update only visible instances
  const updateVisibleInstances = useCallback((camera: THREE.Camera) => {
    if (!meshRef.current) return
    
    const frustum = new THREE.Frustum()
    frustum.setFromProjectionMatrix(camera.projectionMatrix)
    
    for (let i = 0; i < 1000; i++) {
      const position = getInstancePosition(i)
      const visible = frustum.containsPoint(position)
      
      if (visible) {
        updateInstanceMatrix(i, position)
      }
    }
  }, [])
  
  return (
    <instancedMesh ref={meshRef} args={[geometry, material, 1000]} />
  )
}
```

### CSS Animation Optimization
```css
/* GPU acceleration hints */
.gpu-optimized {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Efficient animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
```

### JavaScript Performance
```typescript
// Use RAF for smooth animations
const useAnimationFrame = (callback: (time: number) => void) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callback(deltaTime)
      }
      
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }
    
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [callback])
}

// Throttle expensive operations
const useThrottledAnimation = (callback: () => void, delay: number) => {
  const lastRun = useRef(Date.now())
  
  return useCallback(() => {
    if (Date.now() - lastRun.current >= delay) {
      callback()
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}
```

## Accessibility Considerations

### Reduced Motion Support
```typescript
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return reducedMotion
}

// Animation wrapper with reduced motion support
const AccessibleAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reducedMotion = useReducedMotion()
  
  if (reducedMotion) {
    return <div className="no-animation">{children}</div>
  }
  
  return <div className="with-animation">{children}</div>
}
```

### Focus Management
```typescript
const useFocusManagement = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      // Ensure focus is visible during tab navigation
      document.body.classList.add('keyboard-navigation')
    }
  }, [])
  
  const handleMouseDown = useCallback(() => {
    // Hide focus outlines during mouse interaction
    document.body.classList.remove('keyboard-navigation')
  }, [])
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleKeyDown, handleMouseDown])
}
```

## Animation Library

### Reusable Animation Components
```typescript
// Fade In Animation
export const FadeIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
}> = ({ children, delay = 0, duration = 0.6 }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration,
          delay,
          ease: "power2.out" 
        }
      )
    }
  }, [delay, duration])
  
  return <div ref={ref}>{children}</div>
}

// Scale On Hover
export const ScaleOnHover: React.FC<{
  children: React.ReactNode
  scale?: number
}> = ({ children, scale = 1.05 }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  const handleMouseEnter = () => {
    gsap.to(ref.current, { scale, duration: 0.2, ease: "power2.out" })
  }
  
  const handleMouseLeave = () => {
    gsap.to(ref.current, { scale: 1, duration: 0.2, ease: "power2.out" })
  }
  
  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="transform-gpu"
    >
      {children}
    </div>
  )
}
```

## Testing Animations

### Performance Testing
```typescript
// Animation performance monitor
const useAnimationPerformance = () => {
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  
  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      
      if (currentTime - lastTime.current >= 1000) {
        setFps(frameCount.current)
        frameCount.current = 0
        lastTime.current = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    measureFPS()
  }, [])
  
  return fps
}

// Visual regression testing
describe('Animation Components', () => {
  it('should render GPU lattice correctly', async () => {
    const component = render(<GPULattice />)
    
    // Wait for WebGL initialization
    await waitFor(() => {
      expect(component.container.querySelector('canvas')).toBeInTheDocument()
    })
    
    // Take screenshot for visual regression
    await percySnapshot('GPU Lattice - Initial State')
  })
})
```

## Animation Guidelines

### Do's
- ✅ Use hardware acceleration (transform3d, will-change)
- ✅ Animate transform and opacity properties
- ✅ Provide meaningful feedback for user interactions
- ✅ Use consistent easing curves
- ✅ Implement loading states for complex animations
- ✅ Test on low-end devices

### Don'ts
- ❌ Animate layout properties (width, height, top, left)
- ❌ Create infinite loops without purpose
- ❌ Ignore reduced motion preferences
- ❌ Use motion as the only way to convey information
- ❌ Overwhelm users with too many simultaneous animations
- ❌ Sacrifice performance for visual appeal

---

This animation system ensures the Ciro Network website provides a delightful, performant, and accessible animated experience that enhances the user's understanding of the platform. 