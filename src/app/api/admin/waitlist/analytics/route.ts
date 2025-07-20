import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get analytics data from the waitlist table
    const { getSupabaseServer } = await import('@/lib/supabase-server')
    const supabase = getSupabaseServer()
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching waitlist data:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return NextResponse.json([{
        total_signups: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        developers: 0,
        artists: 0,
        studios: 0,
        compute_providers: 0,
        with_location: 0,
        unique_countries: 0,
        unique_cities: 0,
        desktop_users: 0,
        mobile_users: 0,
        tablet_users: 0,
        organic_traffic: 0,
        paid_traffic: 0,
        social_traffic: 0,
        email_traffic: 0,
        direct_traffic: 0,
        avg_time_on_site: 0,
        avg_page_views: 0,
        avg_form_fill_time: 0,
        signup_date: new Date().toISOString().split('T')[0]
      }])
    }

    // Calculate analytics
    const totalSignups = waitlistEntries.length
    const pendingCount = waitlistEntries.filter(entry => entry.status === 'pending').length
    const approvedCount = waitlistEntries.filter(entry => entry.status === 'approved').length
    const rejectedCount = waitlistEntries.filter(entry => entry.status === 'rejected').length

    // User types
    const developers = waitlistEntries.filter(entry => entry.user_type === 'Developer').length
    const artists = waitlistEntries.filter(entry => entry.user_type === 'Artist/Creator').length
    const studios = waitlistEntries.filter(entry => entry.user_type === 'Studio/Agency').length
    const computeProviders = waitlistEntries.filter(entry => entry.user_type === 'Compute Provider').length

    // Location data
    const withLocation = waitlistEntries.filter(entry => entry.country || entry.city).length
    const uniqueCountries = new Set(waitlistEntries.filter(entry => entry.country).map(entry => entry.country)).size
    const uniqueCities = new Set(waitlistEntries.filter(entry => entry.city).map(entry => entry.city)).size

    // Device types
    const desktopUsers = waitlistEntries.filter(entry => entry.device_type === 'desktop').length
    const mobileUsers = waitlistEntries.filter(entry => entry.device_type === 'mobile').length
    const tabletUsers = waitlistEntries.filter(entry => entry.device_type === 'tablet').length

    // Marketing channels
    const organicTraffic = waitlistEntries.filter(entry => entry.marketing_channel === 'organic-search').length
    const paidTraffic = waitlistEntries.filter(entry => entry.marketing_channel?.includes('paid')).length
    const socialTraffic = waitlistEntries.filter(entry => 
      entry.marketing_channel === 'social-media' || 
      entry.marketing_channel === 'linkedin' || 
      entry.marketing_channel === 'twitter' || 
      entry.marketing_channel === 'youtube'
    ).length
    const emailTraffic = waitlistEntries.filter(entry => entry.marketing_channel === 'email').length
    const directTraffic = waitlistEntries.filter(entry => entry.marketing_channel === 'direct').length

    // Average metrics
    const avgTimeOnSite = waitlistEntries
      .filter(entry => entry.time_on_site_seconds)
      .reduce((sum, entry) => sum + (entry.time_on_site_seconds || 0), 0) / 
      waitlistEntries.filter(entry => entry.time_on_site_seconds).length || 0

    const avgPageViews = waitlistEntries
      .filter(entry => entry.page_views_count)
      .reduce((sum, entry) => sum + (entry.page_views_count || 0), 0) / 
      waitlistEntries.filter(entry => entry.page_views_count).length || 0

    const avgFormFillTime = waitlistEntries
      .filter(entry => entry.form_fill_duration_seconds)
      .reduce((sum, entry) => sum + (entry.form_fill_duration_seconds || 0), 0) / 
      waitlistEntries.filter(entry => entry.form_fill_duration_seconds).length || 0

    // Group by date for time series
    const entriesByDate = waitlistEntries.reduce((acc, entry) => {
      const date = new Date(entry.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry)
      return acc
    }, {} as Record<string, typeof waitlistEntries>)

    // Create analytics data for each date
    const analyticsData = Object.entries(entriesByDate).map(([date, entries]) => {
      const typedEntries = entries as typeof waitlistEntries
      const dateTotalSignups = typedEntries.length
      const datePendingCount = typedEntries.filter(entry => entry.status === 'pending').length
      const dateApprovedCount = typedEntries.filter(entry => entry.status === 'approved').length
      const dateRejectedCount = typedEntries.filter(entry => entry.status === 'rejected').length

      return {
        total_signups: dateTotalSignups,
        pending_count: datePendingCount,
        approved_count: dateApprovedCount,
        rejected_count: dateRejectedCount,
        developers: typedEntries.filter(entry => entry.user_type === 'Developer').length,
        artists: typedEntries.filter(entry => entry.user_type === 'Artist/Creator').length,
        studios: typedEntries.filter(entry => entry.user_type === 'Studio/Agency').length,
        compute_providers: typedEntries.filter(entry => entry.user_type === 'Compute Provider').length,
        with_location: typedEntries.filter(entry => entry.country || entry.city).length,
        unique_countries: new Set(typedEntries.filter(entry => entry.country).map(entry => entry.country)).size,
        unique_cities: new Set(typedEntries.filter(entry => entry.city).map(entry => entry.city)).size,
        desktop_users: typedEntries.filter(entry => entry.device_type === 'desktop').length,
        mobile_users: typedEntries.filter(entry => entry.device_type === 'mobile').length,
        tablet_users: typedEntries.filter(entry => entry.device_type === 'tablet').length,
        organic_traffic: typedEntries.filter(entry => entry.marketing_channel === 'organic-search').length,
        paid_traffic: typedEntries.filter(entry => entry.marketing_channel?.includes('paid')).length,
        social_traffic: typedEntries.filter(entry => 
          entry.marketing_channel === 'social-media' || 
          entry.marketing_channel === 'linkedin' || 
          entry.marketing_channel === 'twitter' || 
          entry.marketing_channel === 'youtube'
        ).length,
        email_traffic: typedEntries.filter(entry => entry.marketing_channel === 'email').length,
        direct_traffic: typedEntries.filter(entry => entry.marketing_channel === 'direct').length,
        avg_time_on_site: typedEntries
          .filter(entry => entry.time_on_site_seconds)
          .reduce((sum, entry) => sum + (entry.time_on_site_seconds || 0), 0) / 
          typedEntries.filter(entry => entry.time_on_site_seconds).length || 0,
        avg_page_views: typedEntries
          .filter(entry => entry.page_views_count)
          .reduce((sum, entry) => sum + (entry.page_views_count || 0), 0) / 
          typedEntries.filter(entry => entry.page_views_count).length || 0,
        avg_form_fill_time: typedEntries
          .filter(entry => entry.form_fill_duration_seconds)
          .reduce((sum, entry) => sum + (entry.form_fill_duration_seconds || 0), 0) / 
          typedEntries.filter(entry => entry.form_fill_duration_seconds).length || 0,
        signup_date: date
      }
    })

    // Return the overall analytics (first entry) for the dashboard
    return NextResponse.json({
      total_signups: totalSignups,
      pending_count: pendingCount,
      approved_count: approvedCount,
      rejected_count: rejectedCount,
      developers: developers,
      artists: artists,
      studios: studios,
      compute_providers: computeProviders,
      with_location: withLocation,
      unique_countries: uniqueCountries,
      unique_cities: uniqueCities,
      desktop_users: desktopUsers,
      mobile_users: mobileUsers,
      tablet_users: tabletUsers,
      organic_traffic: organicTraffic,
      paid_traffic: paidTraffic,
      social_traffic: socialTraffic,
      email_traffic: emailTraffic,
      direct_traffic: directTraffic,
      avg_time_on_site: avgTimeOnSite,
      avg_page_views: avgPageViews,
      avg_form_fill_time: avgFormFillTime,
      signup_date: new Date().toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 