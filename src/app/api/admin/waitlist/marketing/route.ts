import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get waitlist entries with marketing data
    const { data: waitlistEntries, error } = await supabaseServer
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching marketing data:', error)
      return NextResponse.json({ error: 'Failed to fetch marketing data' }, { status: 500 })
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return NextResponse.json([])
    }

    // Group entries by marketing channel and UTM parameters
    const marketingData = waitlistEntries.reduce((acc, entry) => {
      const marketingChannel = entry.marketing_channel || 'direct'
      const utmSource = entry.utm_source || 'unknown'
      const utmMedium = entry.utm_medium || 'unknown'
      const utmCampaign = entry.utm_campaign || 'unknown'
      
      const key = `${marketingChannel}-${utmSource}-${utmMedium}-${utmCampaign}`
      
      if (!acc[key]) {
        acc[key] = {
          marketing_channel: marketingChannel,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          signup_count: 0,
          approved_count: 0,
          avg_time_on_site: 0,
          avg_page_views: 0,
          avg_form_fill_time: 0,
          abandoned_forms: 0,
          total_time_on_site: 0,
          total_page_views: 0,
          total_form_fill_time: 0,
          time_on_site_count: 0,
          page_views_count: 0,
          form_fill_count: 0
        }
      }
      
      acc[key].signup_count += 1
      
      if (entry.status === 'approved') {
        acc[key].approved_count += 1
      }
      
      if (entry.time_on_site_seconds) {
        acc[key].total_time_on_site += entry.time_on_site_seconds
        acc[key].time_on_site_count += 1
      }
      
      if (entry.page_views_count) {
        acc[key].total_page_views += entry.page_views_count
        acc[key].page_views_count += 1
      }
      
      if (entry.form_fill_duration_seconds) {
        acc[key].total_form_fill_time += entry.form_fill_duration_seconds
        acc[key].form_fill_count += 1
      }
      
      // Count abandoned forms (entries with form start time but no completion time)
      if (entry.form_start_time && !entry.form_completion_time) {
        acc[key].abandoned_forms += 1
      }
      
      return acc
    }, {} as Record<string, any>)

    // Group by marketing channel only for dashboard display
    const channelData = waitlistEntries.reduce((acc, entry) => {
      const channel = entry.marketing_channel || 'direct'
      
      if (!acc[channel]) {
        acc[channel] = 0
      }
      acc[channel] += 1
      return acc
    }, {} as Record<string, number>)

    // Calculate percentages
    const total = waitlistEntries.length
    const formattedData = Object.entries(channelData).map(([source, count]) => ({
      source,
      count: count as number,
      percentage: total > 0 ? Math.round((count as number / total) * 100) : 0,
      conversion_rate: 0 // TODO: Calculate conversion rate
    }))

    // Sort by count descending
    formattedData.sort((a, b) => (b.count as number) - (a.count as number))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Marketing API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 