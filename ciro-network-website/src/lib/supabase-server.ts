// Conditional Supabase client that only loads when needed
const supabaseUrl = 'https://lzgxtrefdbalpzmuoduf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only log and throw errors in development or when the key is actually needed
const isDevelopment = process.env.NODE_ENV === 'development'

if (isDevelopment) {
  console.log('Supabase Server Config:', {
    url: supabaseUrl,
    hasKey: !!supabaseServiceKey,
    keyLength: supabaseServiceKey?.length || 0
  })
}

// Create a conditional client that only throws when actually used
let supabaseServer: any = null

async function getSupabaseServer() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable for server operations')
  }
  
  if (!supabaseServer) {
    // Dynamic import to avoid build-time resolution
    const { createClient } = await import('@supabase/supabase-js')
    supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  return supabaseServer
}

// Export the getter function instead of the client directly
export { getSupabaseServer }

// Enhanced waitlist entry interface
export interface WaitlistEntry {
  // Basic information
  name: string;
  email: string;
  company?: string;
  user_type: string;
  compute_type?: string;
  looking_for?: string;
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  
  // Enhanced Analytics Fields
  // Geographical Information
  ip_address?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  
  // User Behavior Analytics
  time_on_site_seconds?: number;
  page_views_count?: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  
  // Device and Browser Information
  user_agent?: string;
  browser?: string;
  browser_version?: string;
  operating_system?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  screen_resolution?: string;
  language?: string;
  
  // Session Information
  session_id?: string;
  first_visit_at?: Date;
  last_activity_at?: Date;
  
  // Form Interaction Analytics
  form_start_time?: Date;
  form_completion_time?: Date;
  form_fill_duration_seconds?: number;
  form_abandoned_count?: number;
  
  // Additional Context
  source_page?: string;
  entry_point?: string;
  marketing_channel?: 'organic' | 'paid' | 'social' | 'email' | 'direct';
}

// Server-side functions that use the service role key
export async function addWaitlistEntryServer(entry: WaitlistEntry) {
  const supabase = await getSupabaseServer()
  
  const { data, error } = await supabase
    .from('waitlist')
    .insert([entry])
    .select()
  
  if (error) {
    console.error('Error adding waitlist entry:', error)
    throw new Error(`Failed to add waitlist entry: ${error.message}`)
  }
  
  return data?.[0]
}

export async function getWaitlistEntriesServer() {
  const supabase = await getSupabaseServer()
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching waitlist entries:', error)
    throw new Error(`Failed to fetch waitlist entries: ${error.message}`)
  }
  
  return data || []
}

export async function updateWaitlistStatusServer(id: number, status: 'pending' | 'approved' | 'rejected', notes?: string) {
  const supabase = await getSupabaseServer()
  
  const updateData: any = { status }
  if (notes !== undefined) {
    updateData.notes = notes
  }
  
  const { data, error } = await supabase
    .from('waitlist')
    .update(updateData)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error updating waitlist status:', error)
    throw new Error(`Failed to update waitlist status: ${error.message}`)
  }
  
  return data?.[0]
}

export async function getWaitlistAnalytics() {
  const supabase = await getSupabaseServer()
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
  
  if (error) {
    console.error('Error fetching analytics data:', error)
    throw new Error(`Failed to fetch analytics data: ${error.message}`)
  }
  
  return data || []
}

export async function getGeographicalAnalytics() {
  const supabase = await getSupabaseServer()
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('country, region, city, ip_address')
  
  if (error) {
    console.error('Error fetching geographical data:', error)
    throw new Error(`Failed to fetch geographical data: ${error.message}`)
  }
  
  return data || []
}

export async function getMarketingAnalytics() {
  const supabase = await getSupabaseServer()
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, marketing_channel')
  
  if (error) {
    console.error('Error fetching marketing data:', error)
    throw new Error(`Failed to fetch marketing data: ${error.message}`)
  }
  
  return data || []
}

export function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return undefined
} 