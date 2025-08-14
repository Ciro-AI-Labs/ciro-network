'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  ArrowUpRight,
  Cpu, 
  Shield, 
  Network, 
  Brain, 
  Atom, 
  Rocket, 
  BookOpen, 
  FileText, 
  Coins,
  CheckCircle,
  Star,
  Code,
  Palette,
  Clock,
  TrendingUp
} from 'lucide-react'
import { 
  Zap, 
  Building,
  Server,
  MessageCircle,
  Twitter,
  Instagram
} from 'lucide-react'
import Image from 'next/image'
import IsometricFactory from '@/components/ui/IsometricFactory'
import CookieConsent from '@/components/CookieConsent'

// Extend Window interface for analytics consent
declare global {
  interface Window {
    enableAnalytics?: boolean
  }
}

// Analytics tracking interface
interface UserAnalytics {
  // Geographical Information
  ipAddress?: string
  country?: string
  region?: string
  city?: string
  timezone?: string
  latitude?: number
  longitude?: number
  
  // User Behavior Analytics
  timeOnSiteSeconds?: number
  pageViewsCount?: number
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  
  // Device and Browser Information
  userAgent?: string
  browser?: string
  browserVersion?: string
  operatingSystem?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  screenResolution?: string
  language?: string
  
  // Session Information
  sessionId?: string
  firstVisitAt?: string
  lastVisitAt?: string
  
  // Form Interaction Analytics
  formStartTime?: string
  formCompletionTime?: string
  formFillDurationSeconds?: number
  formAbandonmentCount?: number
  formFieldInteractions?: { [key: string]: number }
  
  // Marketing Context
  sourcePage?: string
  entryPoint?: string
  marketingChannel?: string
}

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [waitlistStep, setWaitlistStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showStickyButton, setShowStickyButton] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '',
    computeType: '',
    lookingFor: '',
    company: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Analytics tracking state
  const [analytics, setAnalytics] = useState<UserAnalytics>({})
  const sessionStartTime = useRef<number>(Date.now())
  const formStartTime = useRef<number | null>(null)
  const pageViewCount = useRef<number>(1)
  const formFieldInteractions = useRef<{[key: string]: number}>({})
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Initialize analytics tracking
  useEffect(() => {
    const preferences = localStorage.getItem('cookie-preferences')
    
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences)
        window.enableAnalytics = parsed.analytics || false
        window.enableMarketing = parsed.marketing || false
        window.enablePreferences = parsed.preferences || false
        
        if (parsed.analytics) {
          initializeAnalytics()
          trackPageView()
          
          // Track time on site
          const timeTracker = setInterval(() => {
            setAnalytics(prev => ({
              ...prev,
              timeOnSiteSeconds: Math.floor((Date.now() - sessionStartTime.current) / 1000)
            }))
          }, 1000)
          
          return () => clearInterval(timeTracker)
        }
      } catch (error) {
        console.warn('Error parsing cookie preferences:', error)
      }
    }
  }, [])

  // Listen for cookie preference changes
  useEffect(() => {
    const handlePreferencesChanged = (event: CustomEvent) => {
      const preferences = event.detail
      window.enableAnalytics = preferences.analytics
      window.enableMarketing = preferences.marketing
      window.enablePreferences = preferences.preferences
      
      if (preferences.analytics) {
        initializeAnalytics()
        trackPageView()
        
        // Start time tracking
        const timeTracker = setInterval(() => {
          setAnalytics(prev => ({
            ...prev,
            timeOnSiteSeconds: Math.floor((Date.now() - sessionStartTime.current) / 1000)
          }))
        }, 1000)
        
        return () => clearInterval(timeTracker)
      } else {
        // Clear analytics data if analytics is disabled
        setAnalytics({})
      }
    }

    window.addEventListener('cookie-preferences-changed', handlePreferencesChanged as EventListener)

    return () => {
      window.removeEventListener('cookie-preferences-changed', handlePreferencesChanged as EventListener)
    }
  }, [])

  // Initialize analytics data
  const initializeAnalytics = async () => {
    // Get geographical data first
    const geoData = await getGeographicalData()
    
    // Get marketing channel
    const marketingChannel = getMarketingChannel()
    
    const newAnalytics: UserAnalytics = {
      // Session information
      sessionId: sessionId.current,
      firstVisitAt: new Date().toISOString(),
      lastVisitAt: new Date().toISOString(),
      
      // Device and browser information
      userAgent: navigator.userAgent,
      browser: getBrowserInfo(),
      browserVersion: getBrowserVersion(),
      operatingSystem: getOperatingSystem(),
      deviceType: getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      
      // Geographical data
      ...geoData,
      
      // Marketing channel (already set by getMarketingChannel function)
      
      // Initial page view
      pageViewsCount: 1,
      timeOnSiteSeconds: 0,
      
      // Form interaction tracking
      formFieldInteractions: {},
      
      // Marketing context
      sourcePage: document.referrer || 'direct',
      entryPoint: window.location.pathname,
      marketingChannel: getMarketingChannel()
    }
    
    setAnalytics(newAnalytics)
    
    // Get geographical information
    try {
      const geoData = await getGeographicalData()
      setAnalytics(prev => ({ ...prev, ...geoData }))
    } catch (error) {
      console.warn('Failed to get geographical data:', error)
    }
  }

  // Track page view
  const trackPageView = () => {
    pageViewCount.current += 1
    setAnalytics(prev => ({
      ...prev,
      pageViewsCount: pageViewCount.current,
      lastVisitAt: new Date().toISOString()
    }))
  }

  // Track form field interaction
  const trackFieldInteraction = (fieldName: string) => {
    formFieldInteractions.current[fieldName] = (formFieldInteractions.current[fieldName] || 0) + 1
    setAnalytics(prev => ({
      ...prev,
      formFieldInteractions: { ...formFieldInteractions.current }
    }))
  }

  // Start form tracking when waitlist opens
  useEffect(() => {
    if (isWaitlistOpen && !formStartTime.current) {
      formStartTime.current = Date.now()
      setAnalytics(prev => ({
        ...prev,
        formStartTime: new Date().toISOString()
      }))
    }
  }, [isWaitlistOpen])

  // Utility functions for analytics
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  const getBrowserVersion = () => {
    const userAgent = navigator.userAgent
    const match = userAgent.match(/(chrome|firefox|safari|edge)\/(\d+)/i)
    return match ? match[2] : 'Unknown'
  }

  const getOperatingSystem = () => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const userAgent = navigator.userAgent
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  const getMarketingChannel = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const utmSource = urlParams.get('utm_source')
    const utmMedium = urlParams.get('utm_medium')
    const utmCampaign = urlParams.get('utm_campaign')
    const utmTerm = urlParams.get('utm_term')
    const utmContent = urlParams.get('utm_content')
    const referrer = document.referrer
    
    // Update analytics with UTM parameters
    setAnalytics(prev => ({
      ...prev,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      utmTerm: utmTerm || undefined,
      utmContent: utmContent || undefined
    }))
    
    if (utmSource && utmMedium) {
      return `${utmSource}-${utmMedium}`
    }
    if (referrer.includes('google')) return 'organic-search'
    if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social-media'
    if (referrer.includes('linkedin')) return 'linkedin'
    if (referrer.includes('twitter')) return 'twitter'
    if (referrer.includes('youtube')) return 'youtube'
    if (referrer.includes('email')) return 'email'
    if (referrer) return 'referral'
    return 'direct'
  }

  const getGeographicalData = async (): Promise<Partial<UserAnalytics>> => {
    const preferences = localStorage.getItem('cookie-preferences')
    
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences)
        // Don't collect geographical data if analytics is not enabled
        if (!parsed.analytics) {
          console.log('Analytics not enabled, skipping geographical data')
          return {}
        }
      } catch (error) {
        console.warn('Error parsing cookie preferences:', error)
        return {}
      }
    } else {
      // No preferences set, don't collect data
      console.log('No cookie preferences found, skipping geographical data')
      return {}
    }
    
    try {
      // Try multiple IP geolocation services as fallbacks
      const services = [
        'https://ipinfo.io/json',
        'https://api.ipify.org?format=json'
      ]
      
      let geoData: Partial<UserAnalytics> = {}
      
      for (const service of services) {
        try {
          const response = await fetch(service, { 
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          })
          
          if (!response.ok) {
            continue
          }
          
          const data = await response.json()
          
          if (service.includes('ipinfo.io')) {
            geoData = {
              ipAddress: data.ip,
              country: data.country,
              region: data.region,
              city: data.city,
              timezone: data.timezone,
              latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : undefined,
              longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : undefined
            }
          } else if (service.includes('ipify.org')) {
            geoData = {
              ipAddress: data.ip
            }
          }
          
          if (geoData.country || geoData.ipAddress) {
            break
          }
        } catch (serviceError) {
          continue
        }
      }
      
      return geoData
    } catch (error) {
      console.error('All geographical data services failed:', error)
      return {}
    }
  }

  const menuItems = [
    { name: 'Products', href: '/coming-soon', hasDropdown: false },
    { name: 'Solutions', href: '/coming-soon', hasDropdown: false },
    { name: 'Documentation', href: '/coming-soon', hasDropdown: true },
    { name: 'About', href: 'https://www.ciroai.us/', hasDropdown: false }
  ]

  const productsDropdown = [
    {
      title: 'AI Compute Nodes',
      description: 'Distributed GPU computing for AI workloads',
      icon: Cpu,
      href: '/coming-soon'
    },
    {
      title: 'Zero-Knowledge Proofs',
      description: 'Cryptographic verification for computations',
      icon: Shield,
      href: '/coming-soon'
    },
    {
      title: 'Decentralized Network',
      description: 'Peer-to-peer compute infrastructure',
      icon: Network,
      href: '/coming-soon'
    }
  ]

  const solutionsDropdown = [
    {
      title: 'Enterprise AI',
      description: 'Scalable AI infrastructure for enterprises',
      icon: Brain,
      href: '/coming-soon'
    },
    {
      title: 'Research & Development',
      description: 'High-performance computing for research',
      icon: Atom,
      href: '/coming-soon'
    },
    {
      title: 'Startup Accelerator',
      description: 'Affordable compute for growing companies',
      icon: Rocket,
      href: '/coming-soon'
    }
  ]

  const documentationDropdown = [
    {
      title: 'Knowledge Base',
      description: 'Complete documentation and guides',
      icon: BookOpen,
      href: 'https://docs.ciro.network'
    },
    {
      title: 'The Manifesto',
      description: 'Technical protocol specification',
      icon: FileText,
      href: '/protected?next=%2Fmanifesto'
    },
    {
      title: 'Tokenomics',
      description: 'Token economics and distribution',
      icon: Coins,
      href: '/protected?next=%2Ftokenomics'
    }
  ]



  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    
    if (!formData.userType) {
      newErrors.userType = 'Please select your user type'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleWaitlistSubmit = async () => {
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const preferences = localStorage.getItem('cookie-preferences')
      
      // Calculate form completion analytics
      const formCompletionTime = new Date().toISOString()
      const formFillDuration = formStartTime.current 
        ? Math.floor((Date.now() - formStartTime.current) / 1000)
        : 0
      
      // Always try to get geographical data
      let geoData: Partial<UserAnalytics> = {}
      if (!analytics.country) {
        geoData = await getGeographicalData()
      }
      
      const finalAnalytics = {
        ...analytics,
        ...geoData,
        formCompletionTime,
        formFillDurationSeconds: formFillDuration,
        timeOnSiteSeconds: Math.floor((Date.now() - sessionStartTime.current) / 1000)
      }
      
      // Analytics data ready for submission
      
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          analytics: finalAnalytics
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit waitlist')
      }

      // Move to welcome screen
      setWaitlistStep(4)
    } catch (error) {
      console.error('Waitlist submission error:', error)
      alert('Failed to submit waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetWaitlist = () => {
    setWaitlistStep(1)
    setFormData({
      name: '',
      email: '',
      userType: '',
      computeType: '',
      lookingFor: '',
      company: ''
    })
    setErrors({})
    setIsSubmitting(false)
    setIsWaitlistOpen(false)
    
    // Reset form tracking
    formStartTime.current = null
    formFieldInteractions.current = {}
  }

  // Track scroll for sticky button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 800 // Show after hero section
      setShowStickyButton(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="galactic-bg min-h-screen overflow-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Beautiful Galactic Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 cosmic-glass border-b border-cosmic-cyan/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3"
            >
              <div className="relative w-80 h-20 flex items-end pb-1">
                <img
                  src="/images/Ciro White Full Logo.svg?v=8"
                  alt="Ciro Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    // Fallback to text if image fails
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xl font-bold text-white">Ciro</span>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center space-x-8"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="relative group"
                >
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-white/80 hover:text-cosmic-cyan transition-colors duration-300 font-medium flex items-center gap-1"
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </a>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cosmic-cyan to-nebula-pink group-hover:w-full transition-all duration-300"></div>
                  
                  {/* Documentation Dropdown */}
                  {item.hasDropdown && item.name === 'Documentation' && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-black/20 backdrop-blur-2xl border border-cosmic-cyan/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                      {/* Glass Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-cyan/5 to-purple-500/5 rounded-xl"></div>
                      {/* Border Glow */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cosmic-cyan/20 via-purple-500/20 to-cosmic-cyan/20 opacity-50"></div>
                      
                      <div className="relative p-4 space-y-3">
                        {documentationDropdown.map((dropdownItem, idx) => (
                          <a
                            key={dropdownItem.title}
                            href={dropdownItem.href}
                            target={dropdownItem.href.startsWith('http') ? '_blank' : undefined}
                            rel={dropdownItem.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-cosmic-cyan/20 transition-all duration-200 group/item relative overflow-hidden"
                          >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cosmic-cyan/10 to-purple-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></div>
                            
                            <dropdownItem.icon className="w-5 h-5 text-cosmic-cyan mt-0.5 flex-shrink-0 relative z-10" />
                            <div className="relative z-10">
                              <h4 className="text-white font-medium text-sm group-hover/item:text-cosmic-cyan transition-colors duration-200">
                                {dropdownItem.title}
                              </h4>
                              <p className="text-white/70 text-xs mt-1 group-hover/item:text-white/90 transition-colors duration-200">
                                {dropdownItem.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden lg:flex items-center space-x-4"
            >

              <button 
                onClick={() => setIsWaitlistOpen(true)}
                className="cosmic-button px-6 py-2 rounded-lg text-sm font-semibold"
              >
                Join Waitlist
              </button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden bg-black/60 backdrop-blur-3xl p-2 rounded-lg border border-cosmic-cyan/40"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-black/60 backdrop-blur-3xl border-t border-cosmic-cyan/40 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {menuItems.map((item) => (
              <div key={item.name}>
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block text-white/80 hover:text-cosmic-cyan transition-colors duration-300 font-medium py-2"
                >
                  {item.name}
                </a>
                
                {/* Mobile Documentation Dropdown */}
                {item.hasDropdown && item.name === 'Documentation' && (
                  <div className="ml-4 mt-2 space-y-2 border-l border-cosmic-cyan/30 pl-4 bg-black/10 backdrop-blur-sm rounded-r-lg p-3">
                    {documentationDropdown.map((dropdownItem) => (
                      <a
                        key={dropdownItem.title}
                        href={dropdownItem.href}
                        target={dropdownItem.href.startsWith('http') ? '_blank' : undefined}
                        rel={dropdownItem.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-2 text-white/70 hover:text-cosmic-cyan transition-all duration-200 text-sm py-2 px-2 rounded-lg hover:bg-white/5"
                      >
                        <dropdownItem.icon className="w-4 h-4" />
                        {dropdownItem.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-3">
              <button 
                onClick={() => setIsWaitlistOpen(true)}
                className="w-full cosmic-button py-3 rounded-lg font-semibold"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Professional Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32">
        <div className="math-grid absolute inset-0 opacity-20"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Professional Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Professional Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <a 
                  href="/protected?next=%2Fmanifesto"
                  className="inline-flex items-center gap-2 cosmic-glass px-4 py-2 rounded-full text-sm hover:bg-cosmic-cyan/10 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-aurora-green rounded-full animate-pulse"></div>
                  <span className="text-white/80">Manifesto</span>
                  <ArrowUpRight className="w-4 h-4 text-cosmic-cyan" />
                </a>
                <a 
                  href="/protected?next=%2Ftokenomics"
                  className="inline-flex items-center gap-2 cosmic-glass px-4 py-2 rounded-full text-sm hover:bg-purple-500/10 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-white/80">Tokenomics</span>
                  <ArrowUpRight className="w-4 h-4 text-purple-400" />
                </a>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                  <span className="text-fractal">Verifiable</span>
                  <br />
                  <span className="text-white">AI Compute</span>
                  <br />
                  <span className="text-stellar">Infrastructure</span>
                </h1>
              </motion.div>

              {/* Professional Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-4"
              >
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                  Industrial-grade distributed computing with cryptographic verification for enterprise AI workloads.
                </p>
                <p className="text-lg text-cosmic-cyan/80">
                  Zero-knowledge proofs meet distributed GPU networks
                </p>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-aurora-green" />
                  <span className="text-sm">SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-aurora-green" />
                  <span className="text-sm">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-aurora-green" />
                  <span className="text-sm">Global Network</span>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex justify-start pt-4"
              >
                <button 
                  onClick={() => setIsWaitlistOpen(true)}
                  className="cosmic-button px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cosmic-cyan via-nebula-pink to-cosmic-cyan animate-pulse"></div>
                  <span>🚀 Join Testnet Waitlist</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Urgency Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="text-center"
              >
                <p className="text-sm text-cosmic-cyan/80 animate-pulse">
                  ⚡ Testnet Q3 2025 • Secure Your Early Access Now
                </p>
              </motion.div>


            </motion.div>

            {/* Right: Three.js Isometric Factory */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="relative h-[700px]"
            >
              <IsometricFactory />
            </motion.div>
          </div>
        </div>

        {/* Floating Mathematical Elements */}
        <div className="absolute top-1/4 left-1/4 cosmic-float">
          <span className="text-4xl text-cosmic-cyan/20">∑</span>
        </div>
        <div className="absolute top-3/4 right-1/4 cosmic-float" style={{ animationDelay: '2s' }}>
          <span className="text-4xl text-nebula-pink/20">∫</span>
        </div>
        <div className="absolute top-1/2 left-1/6 cosmic-float" style={{ animationDelay: '4s' }}>
          <span className="text-4xl text-aurora-green/20">∞</span>
        </div>
        <div className="absolute bottom-1/4 right-1/6 cosmic-float" style={{ animationDelay: '1s' }}>
          <span className="text-4xl text-stellar-yellow/20">π</span>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 relative">
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="text-white/60 text-sm mb-8">Trusted by innovators across the globe</p>
            
            {/* Early Access Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-cyan mb-2">500+</div>
                <div className="text-sm text-white/60">Early Access List</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-nebula-pink mb-2">15</div>
                <div className="text-sm text-white/60">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-aurora-green mb-2">Q3</div>
                <div className="text-sm text-white/60">2025 Launch</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stellar-yellow mb-2">24/7</div>
                <div className="text-sm text-white/60">Support</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="cosmic-glass p-6 rounded-xl border border-cosmic-cyan/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cosmic-cyan to-nebula-pink rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Alex Chen</div>
                    <div className="text-sm text-white/60">AI Research Lead</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm italic">
                  "The technology behind CIRO is incredible. Zero-knowledge proofs at this scale will be game-changing."
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="cosmic-glass p-6 rounded-xl border border-nebula-pink/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-nebula-pink to-aurora-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Maria Rodriguez</div>
                    <div className="text-sm text-white/60">CTO, TechFlow</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm italic">
                  "Finally, a compute network that's thinking beyond the hype. Can't wait for the Q3 testnet launch."
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="cosmic-glass p-6 rounded-xl border border-aurora-green/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-aurora-green to-stellar-yellow rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">David Kim</div>
                    <div className="text-sm text-white/60">ML Engineer</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm italic">
                  "Love the vision and roadmap. Already on the waitlist for early access - this is the future."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Features Section */}
      <section className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">
              Enterprise-Grade AI Infrastructure
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built for the most demanding AI workloads with cryptographic security and global distribution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="cosmic-glass p-8 rounded-2xl text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 fractal-pulse bg-gradient-to-br from-cosmic-cyan to-nebula-pink rounded-full flex items-center justify-center">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-cosmic-cyan">Distributed Computing</h3>
              <p className="text-white/70 mb-4">
                Harness the power of distributed GPU networks for AI workloads
              </p>
              <div className="text-sm text-white/50">
                • Global node distribution<br/>
                • Automatic load balancing<br/>
                • Real-time scaling
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="cosmic-glass p-8 rounded-2xl text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 fractal-pulse bg-gradient-to-br from-nebula-pink to-aurora-green rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-nebula-pink">Zero-Knowledge Proofs</h3>
              <p className="text-white/70 mb-4">
                Cryptographically verify AI computations without revealing data
              </p>
              <div className="text-sm text-white/50">
                • End-to-end encryption<br/>
                • Verifiable computation<br/>
                • Privacy-preserving AI
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="cosmic-glass p-8 rounded-2xl text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 fractal-pulse bg-gradient-to-br from-aurora-green to-stellar-yellow rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-aurora-green">Industrial Grade</h3>
              <p className="text-white/70 mb-4">
                Built for real-world manufacturing and industrial applications
              </p>
              <div className="text-sm text-white/50">
                • 99.9% uptime SLA<br/>
                • 24/7 support<br/>
                • Enterprise integrations
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section - Aspirational & Marketing Focused */}
      <section id="products" className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">
              The Future of AI Compute
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Join the revolution that's democratizing AI infrastructure. From individual creators to enterprise giants, everyone deserves access to the world's most powerful computing resources.
            </p>
          </motion.div>

          {/* Vision Section */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold mb-4 text-cosmic-cyan">A Network for Every Need</h3>
              <p className="text-lg text-white/70">
                We're building specialized networks that will power the next generation of AI innovation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enterprise Network */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cosmic-glass p-8 rounded-2xl group relative overflow-hidden border-2 border-cyan-400/60 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-400/20">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-3 text-cyan-400">Enterprise Network</h4>
                  <p className="text-white/70 mb-4">
                    Where Fortune 500 companies train their next breakthrough AI models
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>Industrial-grade reliability</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>Global infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>Zero-knowledge security</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>24/7 dedicated support</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-cyan-400 mb-1">Coming Soon</div>
                    <div className="text-sm text-white/60">Join the waitlist for early access</div>
                  </div>
                </div>
              </motion.div>

              {/* Research Network */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cosmic-glass p-8 rounded-2xl group relative overflow-hidden border-2 border-purple-400/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-400/20">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-3 text-purple-400">Research Network</h4>
                  <p className="text-white/70 mb-4">
                    Where breakthrough discoveries happen and the impossible becomes possible
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Cutting-edge hardware</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Academic partnerships</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Open research access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Collaborative environment</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-400 mb-1">Coming Soon</div>
                    <div className="text-sm text-white/60">Join the waitlist for early access</div>
                  </div>
                </div>
              </motion.div>

              {/* Creator Network */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cosmic-glass p-8 rounded-2xl group relative overflow-hidden border-2 border-orange-400/60 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-400/20">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-3 text-orange-400">Creator Network</h4>
                  <p className="text-white/70 mb-4">
                    Where artists, developers, and creators bring their wildest ideas to life
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <span>Affordable access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <span>Creative tools integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <span>Community-driven</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <span>Innovation-first</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-400 mb-1">Coming Soon</div>
                    <div className="text-sm text-white/60">Join the waitlist for early access</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Provider Vision - Join the Revolution */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Join the Revolution</h3>
              <p className="text-lg text-white/70">
                Be part of something bigger. Help us build the world's most powerful distributed computing network.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Vision Statement */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="cosmic-glass p-8 rounded-2xl border-2 border-yellow-400/60 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300"
              >
                <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">The Vision</h4>
                
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-lg border-2 border-cyan-400/60 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">1M+</div>
                    <div className="text-lg text-white/80 mb-1">GPUs Connected</div>
                    <div className="text-sm text-white/60">Our target for the first year</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-cyan-400/20">
                        <span className="text-white font-bold text-xs">1</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-cyan-400 mb-1">Democratize AI Access</h5>
                        <p className="text-white/70 text-sm">Make powerful AI computing available to everyone, everywhere</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-purple-400/20">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-purple-400 mb-1">Reward Contributors</h5>
                        <p className="text-white/70 text-sm">Fair compensation for those who power the network</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-orange-400/20">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-400 mb-1">Accelerate Innovation</h5>
                        <p className="text-white/70 text-sm">Enable breakthroughs that were previously impossible</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Benefits & Impact */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Why Join the Movement?</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-cyan-400/20 hover:scale-110 transition-transform duration-300">
                        <Rocket className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-cyan-400 mb-1">Be Part of History</h5>
                        <p className="text-white/70 text-sm">Help build the infrastructure that powers the AI revolution</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-purple-400/20 hover:scale-110 transition-transform duration-300">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-purple-400 mb-1">Earn While You Sleep</h5>
                        <p className="text-white/70 text-sm">Turn your idle hardware into a revenue stream</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-orange-400/20 hover:scale-110 transition-transform duration-300">
                        <Network className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-400 mb-1">Join a Global Community</h5>
                        <p className="text-white/70 text-sm">Connect with innovators and creators worldwide</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-green-400/20 hover:scale-110 transition-transform duration-300">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-400 mb-1">Privacy-First Design</h5>
                        <p className="text-white/70 text-sm">Your data stays yours with zero-knowledge proofs</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">The Impact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-black/40 rounded-lg border-2 border-cyan-400/60 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300">
                      <div className="text-2xl font-bold text-cyan-400">10x</div>
                      <div className="text-sm text-white/60">Faster AI Development</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg border-2 border-purple-400/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300">
                      <div className="text-2xl font-bold text-purple-400">90%</div>
                      <div className="text-sm text-white/60">Cost Reduction</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg border-2 border-green-400/60 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300">
                      <div className="text-2xl font-bold text-green-400">100%</div>
                      <div className="text-sm text-white/60">Decentralized</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg border-2 border-orange-400/60 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300">
                      <div className="text-2xl font-bold text-orange-400">24/7</div>
                      <div className="text-sm text-white/60">Global Access</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="cosmic-glass p-12 rounded-2xl border-2 border-orange-400/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-400 animate-pulse"></div>
              
              <div className="inline-flex items-center gap-2 bg-orange-400/20 px-4 py-2 rounded-full text-sm mb-6">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-orange-400 font-semibold">🚀 TESTNET Q3 2025</span>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 text-white">Ready to Shape the Future?</h3>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Don't wait for tomorrow's AI revolution. Secure your spot in the Q3 2025 testnet launch.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setIsWaitlistOpen(true)}
                  className="cosmic-button px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-500/20 animate-pulse"></div>
                  <span>🔥 Join Testnet Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                </button>
              </div>
              
              <div className="mt-6 text-sm text-orange-400/80">
                🚀 Q3 2025 launch • Limited early access spots
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">
              Solutions for Every Scale
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              From startups to enterprises, CIRO Network provides the compute infrastructure to power your AI innovations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="cosmic-glass p-8 rounded-xl border border-cosmic-cyan/30"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-cyan to-blue-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">Enterprise AI</h3>
              <p className="text-white/70 text-center mb-6 leading-relaxed">
                Scale your AI infrastructure with enterprise-grade security, compliance, and performance guarantees.
              </p>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  SOC 2 Type II Compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  99.9% Uptime SLA
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  24/7 Dedicated Support
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="cosmic-glass p-8 rounded-xl border border-purple-500/30"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Atom className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">Research & Development</h3>
              <p className="text-white/70 text-center mb-6 leading-relaxed">
                Accelerate your research with high-performance computing and collaborative tools for breakthrough discoveries.
              </p>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Academic Pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Collaborative Workspaces
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Open Source Integration
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="cosmic-glass p-8 rounded-xl border border-green-500/30"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">Startup Acceleration</h3>
              <p className="text-white/70 text-center mb-6 leading-relaxed">
                Get started quickly with affordable compute resources and flexible scaling as your startup grows.
              </p>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Pay-As-You-Scale Pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Developer-Friendly APIs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Community Support
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">
                Built for the Future
              </h2>
              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                CIRO Network is more than just compute infrastructure. We're building the foundation for a new era of 
                verifiable AI that enterprises can trust and researchers can rely on.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cosmic-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-cosmic-cyan" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Privacy-First Architecture</h3>
                    <p className="text-white/60 text-sm">
                      Zero-knowledge proofs ensure your data and models remain private while computation is verifiable.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Network className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Global Network</h3>
                    <p className="text-white/60 text-sm">
                      Distributed compute nodes across multiple continents ensure low latency and high availability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sustainable Technology</h3>
                    <p className="text-white/60 text-sm">
                      Efficient resource utilization and renewable energy integration for environmentally conscious computing.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:text-right"
            >
              <div className="bg-gradient-to-br from-cosmic-cyan/10 to-purple-500/10 rounded-2xl p-8 border border-cosmic-cyan/20">
                <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  To democratize access to verifiable AI compute infrastructure, enabling innovation while maintaining 
                  the highest standards of privacy, security, and transparency.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-cosmic-cyan mb-2">500+</div>
                    <div className="text-sm text-white/60">Early Adopters</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400 mb-2">15</div>
                    <div className="text-sm text-white/60">Countries</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">Q3</div>
                    <div className="text-sm text-white/60">2025 Launch</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                    <div className="text-sm text-white/60">Support</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="documentation" className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">
              Documentation & Resources
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything you need to understand, integrate, and build with CIRO Network.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="cosmic-glass p-8 rounded-xl border border-cosmic-cyan/30 group cursor-pointer"
              onClick={() => window.open(process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3000', '_blank')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-cyan to-blue-500 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center group-hover:text-cosmic-cyan transition-colors">Knowledge Base</h3>
              <p className="text-white/70 text-center leading-relaxed">
                Complete technical documentation, API references, and step-by-step integration guides.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="cosmic-glass p-8 rounded-xl border border-purple-500/30 group cursor-pointer"
              onClick={() => window.location.href = '/manifesto'}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center group-hover:text-purple-400 transition-colors">The Manifesto</h3>
              <p className="text-white/70 text-center leading-relaxed">
                Deep dive into our technical architecture, protocol specifications, and vision for verifiable AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="cosmic-glass p-8 rounded-xl border border-green-500/30 group cursor-pointer"
              onClick={() => window.location.href = '/protected?next=%2Ftokenomics'}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center group-hover:text-green-400 transition-colors">Tokenomics</h3>
              <p className="text-white/70 text-center leading-relaxed">
                Comprehensive overview of CIRO token economics, distribution, and governance mechanisms.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tokenomics content intentionally removed from landing page */}
      {/* <section id="tokenomics" className="py-20 relative"> */}
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Removed public token messaging on landing */}
            {/*
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">The Power of $CIRO</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">More than just a token. $CIRO is the governance, reward, and incentive mechanism that powers the world's most advanced distributed AI network.</p>
            */}
          </motion.div>

          {/* Token Overview */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              {/* Removed tokenomics headline and claims from landing */}
              {/* Removed badges entirely */}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Total Supply */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="cosmic-glass p-6 rounded-2xl text-center border-2 border-cyan-400/60 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-400/20">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-cyan-400 mb-2">1B CIRO</div>
                <div className="text-sm text-white/60">Maximum Supply Cap</div>
              </motion.div>

              {/* Initial Circulating */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="cosmic-glass p-6 rounded-2xl text-center border-2 border-purple-400/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-400/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-2">50M CIRO</div>
                <div className="text-sm text-white/60">Initial Circulating</div>
              </motion.div>

              {/* Target Returns */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="cosmic-glass p-6 rounded-2xl text-center border-2 border-emerald-400/60 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-400/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-2">50x-200x</div>
                <div className="text-sm text-white/60">Target Returns</div>
              </motion.div>

              {/* Burn Rate */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="cosmic-glass p-6 rounded-2xl text-center border-2 border-red-400/60 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-400/20">
                  <Atom className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-red-400 mb-2">70%</div>
                <div className="text-sm text-white/60">Revenue Burn Rate</div>
              </motion.div>
            </div>

            {/* Live Smart Contracts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold mb-2 text-blue-400">🚀 Live Smart Contracts</h4>
                <p className="text-white/70">Production-ready contracts with a multi-chain roadmap</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-600/50">
                  <h5 className="font-bold text-white mb-2">CIRO Token</h5>
                  <code className="text-xs text-blue-400 block mb-2 break-all">
                    0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8
                  </code>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">ERC-20</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Governance</span>
                  </div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-gray-600/50">
                  <h5 className="font-bold text-white mb-2">Burn Manager</h5>
                  <code className="text-xs text-blue-400 block mb-2 break-all">
                    0x070d665978b7275e5f4cea991d9508bc32b592f6244d1303a22f5c22bdc89ea5
                  </code>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Burns</span>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Buybacks</span>
                  </div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-gray-600/50">
                  <h5 className="font-bold text-white mb-2">CDC Pool</h5>
                  <code className="text-xs text-blue-400 block mb-2 break-all">
                    0x05f73c551dbfda890090c8ee89858992dfeea9794a63ad83e6b1706e9836aeba
                  </code>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Staking</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Rewards</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="/protected?next=%2Ftokenomics" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Governance Power */}
          <div className="mb-20">
                          <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Emergency Multisig Governance</h3>
                <p className="text-lg text-white/70">
                  Decentralized governance with emergency multisig council for rapid response capabilities.
                </p>
              </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Governance Tiers */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="cosmic-glass p-6 rounded-2xl border-2 border-yellow-400/60">
                  <h4 className="text-xl font-bold mb-4 text-yellow-400">Emergency Multisig Council</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-cyan-400/40">
                      <div>
                        <div className="font-semibold text-white">Staker-Elected Seats</div>
                        <div className="text-sm text-white/60">Community representatives</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-400">3/7</div>
                        <div className="text-sm text-white/60">Majority</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-purple-400/40">
                      <div>
                        <div className="font-semibold text-white">External Guardians</div>
                        <div className="text-sm text-white/60">Independent oversight</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-400">3/7</div>
                        <div className="text-sm text-white/60">Balance</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-emerald-400/40">
                      <div>
                        <div className="font-semibold text-white">Core Team Rep</div>
                        <div className="text-sm text-white/60">Technical expertise</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">1/7</div>
                        <div className="text-sm text-white/60">Advisory</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cosmic-glass p-6 rounded-2xl border-2 border-orange-400/60">
                  <h4 className="text-xl font-bold mb-4 text-orange-400">Proposal Thresholds</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Parameter Changes</span>
                      <span className="text-cyan-400 font-semibold">60% Threshold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Treasury Allocation</span>
                      <span className="text-purple-400 font-semibold">67% Threshold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Protocol Upgrades</span>
                      <span className="text-emerald-400 font-semibold">75% Threshold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Emergency Actions</span>
                      <span className="text-yellow-400 font-semibold">90% Threshold</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Governance Features */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-2xl font-bold mb-6 text-stellar-yellow">Governance Features</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cosmic-cyan to-nebula-pink rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Multi-tier Voting</h5>
                        <p className="text-white/70 text-sm">Different proposal types require different levels of consensus</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-nebula-pink to-aurora-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Emergency Council</h5>
                        <p className="text-white/70 text-sm">Rapid response capability for critical situations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-aurora-green to-stellar-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Timelock Security</h5>
                        <p className="text-white/70 text-sm">Delayed execution prevents rushed decisions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-stellar-yellow to-cosmic-cyan rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Network className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Quorum Requirements</h5>
                        <p className="text-white/70 text-sm">Ensures meaningful participation in decisions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cosmic-glass p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-yellow-400">Key Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Emergency Response</span>
                      <span className="text-red-400 font-semibold">24-72h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Timelock Protection</span>
                      <span className="text-orange-400 font-semibold">7+ Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Smart Contract Control</span>
                      <span className="text-cyan-400 font-semibold">Multi-sig</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Upgrade Process</span>
                      <span className="text-purple-400 font-semibold">Progressive</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Reward Program & Incentives */}
          <div className="mb-20">
                          <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h3 className="text-3xl font-bold mb-4 text-emerald-400">Staking & Rewards</h3>
                <p className="text-lg text-white/70">
                  Secure the network and earn rewards through our comprehensive staking program.
                </p>
              </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Staking Tiers */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="cosmic-glass p-8 rounded-2xl border-2 border-cyan-400/60"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-cyan-400">CDC Pool Staking</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Security Collateral</span>
                    <span className="text-cyan-400 font-semibold">Variable APY</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Network Security</span>
                    <span className="text-purple-400 font-semibold">Rewards</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Job Assignment</span>
                    <span className="text-emerald-400 font-semibold">Weighted Priority</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Slashing Protection</span>
                    <span className="text-yellow-400 font-semibold">Progressive</span>
                  </div>
                </div>
                <p className="text-sm text-white/60">
                  Higher stakes earn proportionally more rewards and priority job allocation
                </p>
              </motion.div>

              {/* Return Projections */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="cosmic-glass p-8 rounded-2xl border-2 border-green-400/60"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-green-400">Return Projections</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Target 50x-200x returns over 5-7 years</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Based on TAM penetration models</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Conservative revenue growth assumptions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Built-in burn mechanisms drive scarcity</span>
                  </div>
                </div>
                <p className="text-sm text-white/60">
                  Mathematical framework designed for sustainable long-term growth
                </p>
              </motion.div>

              {/* Advanced Burn Mechanism */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="cosmic-glass p-8 rounded-2xl border-2 border-red-400/60"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Atom className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-red-400">70% Revenue Burn</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-red-400" />
                    <span>70% of all network revenue burned automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-red-400" />
                    <span>Weekly Dutch auctions minimize market impact</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-red-400" />
                    <span>Protocol-owned liquidity for price stability</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-red-400" />
                    <span>Burns from Foundation pool protect circulating supply</span>
                  </div>
                </div>
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                  <p className="text-xs text-red-300">
                    <strong>Mathematical Framework:</strong> S(t+1) = S(t) × (1 + r_inf(t)) - B(t)
                    <br />
                    Dynamic supply evolution with governance-controlled burn rates
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Algorithmic Advantages */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold mb-4 text-cosmic-cyan">Why Our Algorithms Win</h3>
              <p className="text-lg text-white/70">
                Advanced mathematical models that optimize for efficiency, security, and fairness
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Algorithmic Features */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-2xl font-bold mb-6 text-cosmic-cyan">Mathematical Superiority</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cosmic-cyan to-nebula-pink rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Zero-Knowledge Proofs</h5>
                        <p className="text-white/70 text-sm">Cryptographic verification without revealing computation details</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-nebula-pink to-aurora-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Network className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Dynamic Load Balancing</h5>
                        <p className="text-white/70 text-sm">Real-time optimization of compute resource allocation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-aurora-green to-stellar-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Reputation Scoring</h5>
                        <p className="text-white/70 text-sm">Multi-dimensional performance evaluation system</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-stellar-yellow to-cosmic-cyan rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Gas Optimization</h5>
                        <p className="text-white/70 text-sm">Efficient smart contract operations reduce costs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Technical Advantages */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="cosmic-glass p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-cosmic-cyan">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-cosmic-cyan">99.9%</div>
                      <div className="text-sm text-white/60">Uptime SLA</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-nebula-pink">10x</div>
                      <div className="text-sm text-white/60">Faster Execution</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-aurora-green">90%</div>
                      <div className="text-sm text-white/60">Cost Reduction</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-stellar-yellow">100%</div>
                      <div className="text-sm text-white/60">Verifiable</div>
                    </div>
                  </div>
                </div>

                <div className="cosmic-glass p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-cosmic-cyan">Security Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Rate Limiting</span>
                      <span className="text-cosmic-cyan font-semibold">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Large Transfer Delays</span>
                      <span className="text-nebula-pink font-semibold">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Emergency Pause</span>
                      <span className="text-aurora-green font-semibold">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Multi-sig Council</span>
                      <span className="text-stellar-yellow font-semibold">✓</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="cosmic-glass p-12 rounded-2xl border-2 border-yellow-400/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse"></div>
              
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full text-sm mb-6">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 font-semibold">💎 EARLY ACCESS</span>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 text-white">Ready to Own the Future?</h3>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Don't just watch the AI revolution – be part of building it. Secure early access to the Q3 2025 testnet.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setIsWaitlistOpen(true)}
                  className="cosmic-button px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse"></div>
                  <span className="relative">⚡ Claim Your Spot</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      {/* </section> */}

      {/* Multichain Architecture Section */}
      <section id="architecture" className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-fractal">
              Built for Multi-Chain
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Leveraging the most advanced Layer 2 scaling solution with multichain interoperability and Bitcoin settlements for the future of decentralized AI compute.
            </p>
          </motion.div>

          {/* Multi-Chain Advantages */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold mb-4 text-cosmic-cyan">Why Multi-Chain?</h3>
              <p className="text-lg text-white/70">
                The most advanced Layer 2 scaling solution for enterprise-grade applications
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Zero-Knowledge Proofs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cosmic-glass p-8 rounded-2xl group relative overflow-hidden border-2 border-cyan-400/60 hover:border-cyan-400 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-cyan/10 to-nebula-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-3 text-cyan-400">Zero-Knowledge Proofs</h4>
                  <p className="text-white/70 mb-4">
                    Cryptographic verification that ensures computation integrity without revealing sensitive data
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>Privacy-preserving AI computations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>Mathematical proof of correctness</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>No data exposure to third parties</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Scalability */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cosmic-glass p-8 rounded-2xl group relative overflow-hidden border-2 border-purple-400/60 hover:border-purple-400 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-nebula-pink/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-3 text-purple-400">Infinite Scalability</h4>
                  <p className="text-white/70 mb-4">
                    Process millions of AI computations with minimal gas costs and instant finality
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>1000x cheaper than Ethereum</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>Instant transaction finality</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>Unlimited throughput potential</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cairo Language */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cosmic-glass p-8 rounded-2xl group relative overflow-hidden border-2 border-emerald-400/60 hover:border-emerald-400 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-aurora-green/10 to-stellar-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-3 text-emerald-400">Cairo Language</h4>
                  <p className="text-white/70 mb-4">
                    Purpose-built programming language for zero-knowledge proofs and smart contracts
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>ZK-native programming</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>Mathematical precision</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-aurora-green" />
                      <span>Formal verification ready</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Multichain Interoperability */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold mb-4 text-stellar-yellow">Multichain Interoperability</h3>
              <p className="text-lg text-white/70">
                Seamlessly operate across multiple blockchains with unified governance and rewards
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Chain Network */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="cosmic-glass p-8 rounded-2xl">
                  <h4 className="text-2xl font-bold mb-6 text-stellar-yellow">Supported Networks</h4>
                  <div className="space-y-4">
                                         <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border-2 border-cyan-400">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">S</span>
                         </div>
                         <div>
                           <div className="font-semibold text-white">Starknet</div>
                           <div className="text-sm text-white/60">Primary Layer 2</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-cyan-400 font-semibold">Testnet</div>
                         <div className="text-xs text-white/60">Live Testing</div>
                       </div>
                     </div>
                    
                                         <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border-2 border-purple-400">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">E</span>
                         </div>
                         <div>
                           <div className="font-semibold text-white">Ethereum</div>
                           <div className="text-sm text-white/60">Settlement Layer</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-purple-400 font-semibold">Coming Soon</div>
                         <div className="text-xs text-white/60">Q2 2026</div>
                       </div>
                     </div>
                    
                                         <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border-2 border-emerald-400">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-yellow-500 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">B</span>
                         </div>
                         <div>
                           <div className="font-semibold text-white">Bitcoin</div>
                           <div className="text-sm text-white/60">Settlement Layer</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-emerald-400 font-semibold">Coming Soon</div>
                         <div className="text-xs text-white/60">Q4 2026</div>
                       </div>
                     </div>
                    
                                         <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border-2 border-indigo-400">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">P</span>
                         </div>
                         <div>
                           <div className="font-semibold text-white">Polygon</div>
                           <div className="text-sm text-white/60">EVM Compatible</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-indigo-400 font-semibold">Coming Soon</div>
                         <div className="text-xs text-white/60">Q4 2026</div>
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border-2 border-orange-400/60">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">S</span>
                         </div>
                         <div>
                           <div className="font-semibold text-white">Solana</div>
                           <div className="text-sm text-white/60">High Performance</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-orange-400 font-semibold">Coming Soon</div>
                         <div className="text-xs text-white/60">Q2 2026</div>
                       </div>
                     </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Interoperability Benefits */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-2xl font-bold mb-6 text-stellar-yellow">Cross-Chain Benefits</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cosmic-cyan to-nebula-pink rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Network className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Unified Governance</h5>
                        <p className="text-white/70 text-sm">Vote on proposals across all connected networks with a single token</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-nebula-pink to-aurora-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Cross-Chain Rewards</h5>
                        <p className="text-white/70 text-sm">Earn rewards on any supported network and claim them anywhere</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-aurora-green to-stellar-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Enhanced Security</h5>
                        <p className="text-white/70 text-sm">Leverage the security of multiple blockchains simultaneously</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-stellar-yellow to-cosmic-cyan rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">Optimal Routing</h5>
                        <p className="text-white/70 text-sm">Automatic selection of the best network for each transaction</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cosmic-glass p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-stellar-yellow">Network Statistics</h4>
                                     <div className="grid grid-cols-2 gap-4">
                     <div className="text-center p-4 bg-black/40 rounded-lg">
                       <div className="text-2xl font-bold text-cosmic-cyan">5+</div>
                       <div className="text-sm text-white/60">Networks</div>
                     </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-nebula-pink">100%</div>
                      <div className="text-sm text-white/60">Interoperable</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-aurora-green">24/7</div>
                      <div className="text-sm text-white/60">Bridge Status</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl font-bold text-stellar-yellow">0</div>
                      <div className="text-sm text-white/60">Bridge Failures</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bitcoin Settlements */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">Bitcoin Settlements</h3>
              <p className="text-lg text-white/70">
                The first distributed AI network with native Bitcoin integration for ultimate decentralization
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Bitcoin Integration */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="cosmic-glass p-8 rounded-2xl border-2 border-orange-400/60 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300">
                  <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">Bitcoin Integration</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-orange-400/20 hover:scale-110 transition-transform duration-300">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-400 mb-1">Native BTC Payments</h5>
                        <p className="text-white/70 text-sm">Pay for AI compute directly with Bitcoin</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-yellow-500/20 hover:scale-110 transition-transform duration-300">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-yellow-500 mb-1">BTC Rewards</h5>
                        <p className="text-white/70 text-sm">Earn Bitcoin for providing compute resources</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-orange-500/20 hover:scale-110 transition-transform duration-300">
                        <Network className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-500 mb-1">Lightning Network</h5>
                        <p className="text-white/70 text-sm">Instant micro-payments for small computations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-yellow-400/20 hover:scale-110 transition-transform duration-300">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-yellow-400 mb-1">Atomic Swaps</h5>
                        <p className="text-white/70 text-sm">Trustless conversion between BTC and CIRO</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cosmic-glass p-6 rounded-2xl border-2 border-yellow-400/60 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300">
                  <h4 className="text-xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Bitcoin Bridge Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Settlement Time</span>
                      <span className="text-orange-400 font-semibold">~10 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Minimum Amount</span>
                      <span className="text-yellow-500 font-semibold">0.001 BTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Bridge Fee</span>
                      <span className="text-orange-500 font-semibold">0.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Security Model</span>
                      <span className="text-yellow-400 font-semibold">Multi-sig</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Technical Architecture */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">Technical Architecture</h4>
                  <div className="space-y-4">
                    <div className="cosmic-glass p-6 rounded-2xl border-2 border-orange-400/60 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300">
                      <h5 className="font-semibold text-orange-400 mb-3">Starknet → Bitcoin Bridge</h5>
                      <div className="space-y-2 text-sm text-white/70">
                        <div>• ZK-proofs for BTC state verification</div>
                        <div>• Multi-signature security for bridge operations</div>
                        <div>• Real-time BTC price oracle integration</div>
                        <div>• Automatic settlement execution</div>
                      </div>
                    </div>
                    
                    <div className="cosmic-glass p-6 rounded-2xl border-2 border-yellow-500/60 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
                      <h5 className="font-semibold text-yellow-500 mb-3">Lightning Network Integration</h5>
                      <div className="space-y-2 text-sm text-white/70">
                        <div>• Instant micro-payments for small jobs</div>
                        <div>• Channel management for high-frequency transactions</div>
                        <div>• Automatic channel rebalancing</div>
                        <div>• Fee optimization algorithms</div>
                      </div>
                    </div>
                    
                    <div className="cosmic-glass p-6 rounded-2xl border-2 border-orange-500/60 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                      <h5 className="font-semibold text-orange-500 mb-3">Atomic Swap Protocol</h5>
                      <div className="space-y-2 text-sm text-white/70">
                        <div>• Trustless BTC ↔ CIRO conversion</div>
                        <div>• Time-locked smart contracts</div>
                        <div>• Price discovery through AMM</div>
                        <div>• Slippage protection mechanisms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="cosmic-glass p-12 rounded-2xl border-2 border-cosmic-cyan/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cosmic-cyan via-nebula-pink to-aurora-green animate-pulse"></div>
              
              <div className="inline-flex items-center gap-2 bg-aurora-green/20 px-4 py-2 rounded-full text-sm mb-6">
                <div className="w-2 h-2 bg-aurora-green rounded-full animate-pulse"></div>
                <span className="text-aurora-green font-semibold">🚀 TESTNET Q3 2025</span>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 text-white">Secure Your Early Access</h3>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Be among the first to experience the future of AI compute. Limited early access spots for Q3 launch.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setIsWaitlistOpen(true)}
                  className="cosmic-button px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cosmic-cyan/20 to-nebula-pink/20 animate-pulse"></div>
                  <span className="relative">🚀 Get Early Access</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                </button>
              </div>
              
              <div className="mt-6 text-sm text-cosmic-cyan/80">
                ⏰ Limited spots • Join 500+ on the early access waitlist
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - Conversion Focused */}
      <section className="py-20 relative">
        <div className="math-grid absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-nebula-pink">Ready to Join? We've Got Answers</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything you need to know about joining the testnet and becoming an early adopter
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="cosmic-glass p-8 rounded-xl border-2 border-nebula-pink/60 hover:border-nebula-pink hover:shadow-lg hover:shadow-nebula-pink/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-nebula-pink to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Is the testnet free?</h3>
              </div>
              <p className="text-white/70 mb-4">
                <strong className="text-nebula-pink">100% Free!</strong> The testnet will be completely free to join when it launches in Q3 2025. We're looking for feedback and early adopters to help us perfect the network.
              </p>
              <div className="text-sm text-nebula-pink/80">
                💎 Bonus: Early participants may receive future benefits
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="cosmic-glass p-8 rounded-xl border-2 border-aurora-green/60 hover:border-aurora-green hover:shadow-lg hover:shadow-aurora-green/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-aurora-green to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-white">What do I need?</h3>
              </div>
              <p className="text-white/70 mb-4">
                <strong className="text-aurora-green">Just join the waitlist!</strong> We'll notify you when testnet launches in Q3 2025 and guide you through everything. No technical expertise required, though we welcome developers and GPU providers.
              </p>
              <div className="text-sm text-aurora-green/80">
                🚀 We'll handle all the setup when it's time
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="cosmic-glass p-8 rounded-xl border-2 border-stellar-yellow/60 hover:border-stellar-yellow hover:shadow-lg hover:shadow-stellar-yellow/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-stellar-yellow to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⏰</span>
                </div>
                <h3 className="text-xl font-semibold text-white">When is testnet?</h3>
              </div>
              <p className="text-white/70 mb-4">
                <strong className="text-stellar-yellow">Q3 2025</strong> for testnet launch. Early participants will help shape the network and get priority access when we expand.
              </p>
              <div className="text-sm text-stellar-yellow/80">
                🎯 Early access = Better opportunities
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="cosmic-glass p-8 rounded-xl border-2 border-orange-400/60 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Is my data secure?</h3>
              </div>
              <p className="text-white/70 mb-4">
                <strong className="text-orange-400">Bank-level security.</strong> We use zero-knowledge proofs to verify computations without exposing your data. Your privacy is our #1 priority.
              </p>
              <div className="text-sm text-orange-400/80">
                🛡️ Zero-knowledge = Zero exposure
              </div>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <div className="cosmic-glass p-8 rounded-2xl border-2 border-cosmic-cyan/60 relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cosmic-cyan via-nebula-pink to-aurora-green animate-pulse"></div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">Still have questions?</h3>
              <p className="text-white/70 mb-6">
                Join the early access list and get direct access to our team. We're here to help every step of the way.
              </p>
              
              <button 
                onClick={() => setIsWaitlistOpen(true)}
                className="cosmic-button px-8 py-4 rounded-lg text-lg font-semibold flex items-center mx-auto gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cosmic-cyan/20 to-nebula-pink/20 animate-pulse"></div>
                <span className="relative">🎯 Join Testnet & Ask Away</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
              </button>
              
                              <div className="mt-4 text-sm text-cosmic-cyan/80">
                  Join 500+ on early access list • Get updates directly from the team
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Modal */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsWaitlistOpen(false)}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-black/70 backdrop-blur-3xl rounded-2xl border border-cosmic-cyan/40 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsWaitlistOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Step 1: Tell us about yourself */}
            {waitlistStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
                  <p className="text-white/70">Help us understand how you'll use CIRO Network</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: 'Developer', label: 'Developer', icon: Code, desc: 'Building applications and software' },
                    { id: 'Artist/Creator', label: 'Artist/Creator', icon: Palette, desc: 'Creating digital art, content, or media' },
                    { id: 'Studio/Agency', label: 'Studio/Agency', icon: Building, desc: 'Creative studio or agency' },
                    { id: 'Compute Provider', label: 'Compute Provider', icon: Server, desc: 'Have GPUs to share with the network' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        trackFieldInteraction('userType')
                        setFormData({...formData, userType: type.id})
                        setWaitlistStep(2)
                      }}
                      className={`w-full p-4 rounded-lg border transition-all text-left ${
                        formData.userType === type.id 
                          ? 'bg-cosmic-cyan/20 border-cosmic-cyan' 
                          : 'bg-black/40 border-cosmic-cyan/30 hover:border-cosmic-cyan/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <type.icon className="w-6 h-6 text-cosmic-cyan mt-1" />
                        <div>
                          <h3 className="font-semibold text-white">{type.label}</h3>
                          <p className="text-sm text-white/60">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {errors.userType && (
                  <p className="text-red-400 text-sm text-center">{errors.userType}</p>
                )}
              </div>
            )}

            {/* Step 2: Basic Information */}
            {waitlistStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Your Information</h2>
                  <p className="text-white/70">Tell us how to reach you</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      onFocus={() => trackFieldInteraction('name')}
                      className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white placeholder-white/50 focus:outline-none ${
                        errors.name ? 'border-red-400' : 'border-cosmic-cyan/30 focus:border-cosmic-cyan'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onFocus={() => trackFieldInteraction('email')}
                      className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white placeholder-white/50 focus:outline-none ${
                        errors.email ? 'border-red-400' : 'border-cosmic-cyan/30 focus:border-cosmic-cyan'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Company (Optional)</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      onFocus={() => trackFieldInteraction('company')}
                      className="w-full px-4 py-3 bg-black/40 border border-cosmic-cyan/30 rounded-lg text-white placeholder-white/50 focus:border-cosmic-cyan focus:outline-none"
                      placeholder="Company or organization"
                    />
                  </div>
                  
                  {/* Show compute type selection for compute providers */}
                  {formData.userType === 'Compute Provider' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">What type of compute?</label>
                      <div className="space-y-2">
                        {[
                          'Consumer GPUs (RTX 4090, etc.)',
                          'Professional GPUs (RTX A6000, etc.)',
                          'Data Center GPUs (H100, A100, etc.)',
                          'Cloud Infrastructure',
                          'Mixed/Multiple Types'
                        ].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              trackFieldInteraction('computeType')
                              setFormData({...formData, computeType: type})
                            }}
                            className={`w-full p-3 rounded-lg border transition-all text-left ${
                              formData.computeType === type 
                                ? 'bg-cosmic-cyan/20 border-cosmic-cyan' 
                                : 'bg-black/40 border-cosmic-cyan/30 hover:border-cosmic-cyan/60'
                            }`}
                          >
                            <span className="text-white text-sm">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setWaitlistStep(1)}
                    className="flex-1 bg-white/10 border border-white/20 py-3 rounded-lg font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleWaitlistSubmit}
                    disabled={isSubmitting}
                    className="flex-1 cosmic-button py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Join Waitlist'
                    )}
                  </button>
                </div>
              </div>
            )}



            {/* Step 4: Welcome Screen */}
            {waitlistStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cosmic-cyan via-nebula-pink to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-cosmic-cyan to-nebula-pink rounded-full opacity-20 blur-xl animate-ping"></div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3">Welcome to CIRO! 🚀</h2>
                  <p className="text-white/80 text-lg mb-2">You're officially on the waitlist!</p>
                  <p className="text-white/60">We'll notify you as soon as we launch. In the meantime, join our community!</p>
                </div>
                
                <div className="space-y-4">
                  <a
                    href="https://discord.gg/PhAX4XWwnH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3C45A5] py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Join Discord Community
                  </a>
                  
                  <a
                    href="https://x.com/cironetw0rk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-[#1DA1F2] to-[#1A91DA] hover:from-[#1A91DA] hover:to-[#1681BF] py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Twitter className="w-5 h-5" />
                    Follow on X
                  </a>
                  
                  <a
                    href="https://instagram.com/cironetwork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-[#E4405F] via-[#5B51D8] to-[#833AB4] hover:from-[#D63384] hover:via-[#4C44C1] hover:to-[#6A4C93] py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Instagram className="w-5 h-5" />
                    Follow on Instagram
                  </a>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={resetWaitlist}
                    className="w-full bg-white/10 border border-white/20 py-3 rounded-lg font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Sticky Floating CTA Button */}
      <AnimatePresence>
        {showStickyButton && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="cosmic-button px-6 py-3 rounded-full text-lg font-semibold flex items-center gap-3 group shadow-2xl hover:shadow-cosmic-cyan/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-3 h-3 bg-aurora-green rounded-full animate-pulse"></div>
              <span>Join Testnet</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </main>
  )
} 