import { useEffect, useCallback } from 'react'
import { 
  getAnalyticsTracker, 
  startFormTracking, 
  completeFormTracking, 
  abandonFormTracking,
  getCompleteAnalytics,
  UserAnalytics 
} from '@/lib/analytics'

interface UseWaitlistAnalyticsOptions {
  formId?: string
  onAnalyticsReady?: (analytics: UserAnalytics) => void
}

export function useWaitlistAnalytics(options: UseWaitlistAnalyticsOptions = {}) {
  const { formId, onAnalyticsReady } = options

  // Initialize analytics tracking when component mounts
  useEffect(() => {
    const tracker = getAnalyticsTracker()
    
    // Start form tracking
    startFormTracking()
    
    // Set up form abandonment tracking
    const handleBeforeUnload = () => {
      abandonFormTracking()
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        abandonFormTracking()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Function to get complete analytics data
  const getAnalytics = useCallback(async (): Promise<UserAnalytics> => {
    const analytics = await getCompleteAnalytics()
    
    // Call the callback if provided
    if (onAnalyticsReady) {
      onAnalyticsReady(analytics)
    }
    
    return analytics
  }, [onAnalyticsReady])

  // Function to complete form tracking and get analytics
  const completeForm = useCallback(async (): Promise<UserAnalytics> => {
    completeFormTracking()
    return await getAnalytics()
  }, [getAnalytics])

  // Function to abandon form tracking
  const abandonForm = useCallback(() => {
    abandonFormTracking()
  }, [])

  return {
    getAnalytics,
    completeForm,
    abandonForm,
    startFormTracking,
  }
}

// Hook for tracking form field interactions
export function useFormFieldTracking() {
  const trackFieldFocus = useCallback((fieldName: string) => {
    // You can add additional field-specific tracking here
    console.log(`Field focused: ${fieldName}`)
  }, [])

  const trackFieldBlur = useCallback((fieldName: string, hasValue: boolean) => {
    // Track when users leave fields and whether they filled them
    console.log(`Field blurred: ${fieldName}, hasValue: ${hasValue}`)
  }, [])

  const trackFieldChange = useCallback((fieldName: string, value: string) => {
    // Track field changes (be careful with sensitive data)
    console.log(`Field changed: ${fieldName}, valueLength: ${value.length}`)
  }, [])

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
  }
}

// Hook for tracking form submission steps
export function useFormSubmissionTracking() {
  const trackFormStart = useCallback(() => {
    startFormTracking()
  }, [])

  const trackFormValidation = useCallback((isValid: boolean, errors: string[]) => {
    if (!isValid) {
      console.log('Form validation failed:', errors)
    }
  }, [])

  const trackFormSubmission = useCallback(async (formData: any) => {
    try {
      // Complete form tracking
      const analytics = await getCompleteAnalytics()
      
      // Prepare submission data with analytics
      const submissionData = {
        ...formData,
        analytics: {
          country: analytics.country,
          region: analytics.region,
          city: analytics.city,
          timezone: analytics.timezone,
          latitude: analytics.latitude,
          longitude: analytics.longitude,
          timeOnSiteSeconds: analytics.timeOnSiteSeconds,
          pageViewsCount: analytics.pageViewsCount,
          referrer: analytics.referrer,
          utmSource: analytics.utmSource,
          utmMedium: analytics.utmMedium,
          utmCampaign: analytics.utmCampaign,
          utmTerm: analytics.utmTerm,
          utmContent: analytics.utmContent,
          userAgent: analytics.userAgent,
          browser: analytics.browser,
          browserVersion: analytics.browserVersion,
          operatingSystem: analytics.operatingSystem,
          deviceType: analytics.deviceType,
          screenResolution: analytics.screenResolution,
          language: analytics.language,
          sessionId: analytics.sessionId,
          firstVisitAt: analytics.firstVisitAt?.toISOString(),
          lastActivityAt: analytics.lastActivityAt?.toISOString(),
          formStartTime: analytics.formStartTime?.toISOString(),
          formCompletionTime: analytics.formCompletionTime?.toISOString(),
          formFillDurationSeconds: analytics.formFillDurationSeconds,
          formAbandonedCount: analytics.formAbandonedCount,
          sourcePage: analytics.sourcePage,
          entryPoint: analytics.entryPoint,
          marketingChannel: analytics.marketingChannel,
        }
      }
      
      return submissionData
    } catch (error) {
      console.error('Error preparing form submission with analytics:', error)
      // Return form data without analytics if there's an error
      return formData
    }
  }, [])

  return {
    trackFormStart,
    trackFormValidation,
    trackFormSubmission,
  }
} 