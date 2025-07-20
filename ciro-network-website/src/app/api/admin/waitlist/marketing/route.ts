import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    // Get all waitlist entries with marketing data
    const { data: waitlistEntries, error } = await supabase
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

    // Define types
    interface WaitlistEntry {
      id: string
      email: string
      marketing_channel?: string
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      created_at: string
      [key: string]: any
    }

    interface MarketingData {
      [channel: string]: {
        count: number
        percentage: number
        sources: { [source: string]: number }
        mediums: { [medium: string]: number }
        campaigns: { [campaign: string]: number }
      }
    }

    // Group entries by marketing channel and UTM parameters
    const marketingData = waitlistEntries.reduce((acc: MarketingData, entry: WaitlistEntry) => {
      const marketingChannel = entry.marketing_channel || 'direct'
      const utmSource = entry.utm_source || 'unknown'
      const utmMedium = entry.utm_medium || 'unknown'
      const utmCampaign = entry.utm_campaign || 'unknown'
      
      if (!acc[marketingChannel]) {
        acc[marketingChannel] = {
          count: 0,
          percentage: 0,
          sources: {},
          mediums: {},
          campaigns: {}
        }
      }
      
      acc[marketingChannel].count++
      
      // Track UTM sources
      if (!acc[marketingChannel].sources[utmSource]) {
        acc[marketingChannel].sources[utmSource] = 0
      }
      acc[marketingChannel].sources[utmSource]++
      
      // Track UTM mediums
      if (!acc[marketingChannel].mediums[utmMedium]) {
        acc[marketingChannel].mediums[utmMedium] = 0
      }
      acc[marketingChannel].mediums[utmMedium]++
      
      // Track UTM campaigns
      if (!acc[marketingChannel].campaigns[utmCampaign]) {
        acc[marketingChannel].campaigns[utmCampaign] = 0
      }
      acc[marketingChannel].campaigns[utmCampaign]++
      
      return acc
    }, {} as MarketingData)

    // Calculate percentages
    const totalEntries = waitlistEntries.length
    Object.keys(marketingData).forEach(channel => {
      marketingData[channel].percentage = Math.round((marketingData[channel].count / totalEntries) * 100)
    })

    // Convert to array format for easier frontend consumption
    const formattedMarketingData = Object.entries(marketingData).map(([channel, data]) => {
      const channelInfo = data as { count: number; percentage: number; sources: { [source: string]: number }; mediums: { [medium: string]: number }; campaigns: { [campaign: string]: number } }
      return {
        channel,
        count: channelInfo.count,
        percentage: channelInfo.percentage,
        topSources: Object.entries(channelInfo.sources)
          .map(([source, count]) => ({ source, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topMediums: Object.entries(channelInfo.mediums)
          .map(([medium, count]) => ({ medium, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topCampaigns: Object.entries(channelInfo.campaigns)
          .map(([campaign, count]) => ({ campaign, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      }
    }).sort((a, b) => b.count - a.count)

    return NextResponse.json(formattedMarketingData)

  } catch (error) {
    console.error('Marketing API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 