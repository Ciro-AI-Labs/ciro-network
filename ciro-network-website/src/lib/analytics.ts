// Analytics utility library for tracking user behavior and collecting geographical data

export interface UserAnalytics {
  // Geographical Information
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  
  // User Behavior Analytics
  timeOnSiteSeconds?: number;
  pageViewsCount?: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Device and Browser Information
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  operatingSystem?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  screenResolution?: string;
  language?: string;
  
  // Session Information
  sessionId?: string;
  firstVisitAt?: Date;
  lastActivityAt?: Date;
  
  // Form Interaction Analytics
  formStartTime?: Date;
  formCompletionTime?: Date;
  formFillDurationSeconds?: number;
  formAbandonedCount?: number;
  
  // Additional Context
  sourcePage?: string;
  entryPoint?: string;
  marketingChannel?: 'organic' | 'paid' | 'social' | 'email' | 'direct';
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
  language: string;
}

export interface UTMData {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

class AnalyticsTracker {
  private sessionStartTime: number;
  private pageViews: number = 0;
  private formStartTime?: number;
  private analytics: UserAnalytics = {};

  constructor() {
    this.sessionStartTime = Date.now();
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    // Get device information
    this.analytics.deviceType = this.getDeviceType();
    this.analytics.browser = this.getBrowser();
    this.analytics.browserVersion = this.getBrowserVersion();
    this.analytics.operatingSystem = this.getOperatingSystem();
    this.analytics.screenResolution = this.getScreenResolution();
    this.analytics.language = navigator.language;
    this.analytics.userAgent = navigator.userAgent;
    
    // Get UTM parameters
    const utmData = this.getUTMParameters();
    this.analytics.utmSource = utmData.source;
    this.analytics.utmMedium = utmData.medium;
    this.analytics.utmCampaign = utmData.campaign;
    this.analytics.utmTerm = utmData.term;
    this.analytics.utmContent = utmData.content;
    
    // Get referrer
    this.analytics.referrer = document.referrer;
    
    // Set marketing channel
    this.analytics.marketingChannel = this.determineMarketingChannel();
    
    // Set entry point
    this.analytics.entryPoint = this.getEntryPoint();
    
    // Set source page
    this.analytics.sourcePage = window.location.pathname;
    
    // Initialize session
    this.analytics.sessionId = this.generateSessionId();
    this.analytics.firstVisitAt = new Date();
    this.analytics.lastActivityAt = new Date();
    
    // Track page view
    this.trackPageView();
    
    // Set up activity tracking
    this.setupActivityTracking();
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    const browser = this.getBrowser();
    
    if (browser === 'Chrome') {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return match ? match[1] : '';
    }
    if (browser === 'Firefox') {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return match ? match[1] : '';
    }
    if (browser === 'Safari') {
      const match = userAgent.match(/Version\/(\d+)/);
      return match ? match[1] : '';
    }
    if (browser === 'Edge') {
      const match = userAgent.match(/Edge\/(\d+)/);
      return match ? match[1] : '';
    }
    
    return '';
  }

  private getOperatingSystem(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  private getScreenResolution(): string {
    return `${screen.width}x${screen.height}`;
  }

  private getUTMParameters(): UTMData {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
    };
  }

  private determineMarketingChannel(): 'organic' | 'paid' | 'social' | 'email' | 'direct' {
    const utmMedium = this.analytics.utmMedium?.toLowerCase();
    const referrer = this.analytics.referrer?.toLowerCase();
    
    if (utmMedium) {
      if (utmMedium.includes('cpc') || utmMedium.includes('paid')) return 'paid';
      if (utmMedium.includes('social')) return 'social';
      if (utmMedium.includes('email')) return 'email';
    }
    
    if (referrer) {
      if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('yahoo')) {
        return this.analytics.utmSource ? 'paid' : 'organic';
      }
      if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('linkedin')) {
        return 'social';
      }
      if (referrer.includes('mail') || referrer.includes('email')) {
        return 'email';
      }
    }
    
    return 'direct';
  }

  private getEntryPoint(): string {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') return 'homepage';
    if (path.includes('pricing')) return 'pricing';
    if (path.includes('docs')) return 'docs';
    if (path.includes('blog')) return 'blog';
    if (path.includes('about')) return 'about';
    if (path.includes('contact')) return 'contact';
    
    return 'other';
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private setupActivityTracking() {
    // Update last activity on user interaction
    const updateActivity = () => {
      this.analytics.lastActivityAt = new Date();
    };

    // Track various user activities
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.analytics.lastActivityAt = new Date();
      }
    });
  }

  public trackPageView() {
    this.pageViews++;
    this.analytics.pageViewsCount = this.pageViews;
    this.analytics.lastActivityAt = new Date();
  }

  public startFormTracking() {
    this.formStartTime = Date.now();
    this.analytics.formStartTime = new Date();
  }

  public completeFormTracking() {
    if (this.formStartTime) {
      this.analytics.formCompletionTime = new Date();
      this.analytics.formFillDurationSeconds = Math.floor((Date.now() - this.formStartTime) / 1000);
    }
  }

  public abandonFormTracking() {
    this.analytics.formAbandonedCount = (this.analytics.formAbandonedCount || 0) + 1;
  }

  public async getGeographicalData(): Promise<Partial<UserAnalytics>> {
    try {
      // Try to get location from IP using a free geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ipAddress: data.ip,
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } catch (error) {
      console.warn('Failed to get geographical data:', error);
      return {};
    }
  }

  public getAnalytics(): UserAnalytics {
    // Calculate time on site
    this.analytics.timeOnSiteSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    
    return { ...this.analytics };
  }

  public async getCompleteAnalytics(): Promise<UserAnalytics> {
    const geographicalData = await this.getGeographicalData();
    const currentAnalytics = this.getAnalytics();
    
    return {
      ...currentAnalytics,
      ...geographicalData,
    };
  }
}

// Create a singleton instance
let analyticsTracker: AnalyticsTracker | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!analyticsTracker) {
    analyticsTracker = new AnalyticsTracker();
  }
  return analyticsTracker;
}

// Export utility functions for easy use
export function trackPageView() {
  getAnalyticsTracker().trackPageView();
}

export function startFormTracking() {
  getAnalyticsTracker().startFormTracking();
}

export function completeFormTracking() {
  getAnalyticsTracker().completeFormTracking();
}

export function abandonFormTracking() {
  getAnalyticsTracker().abandonFormTracking();
}

export async function getCompleteAnalytics(): Promise<UserAnalytics> {
  return getAnalyticsTracker().getCompleteAnalytics();
} 