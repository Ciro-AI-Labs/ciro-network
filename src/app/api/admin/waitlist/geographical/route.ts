import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get waitlist entries with geographical data
    const supabase = getSupabaseServer()
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist')
      .select('*')
      .not('country', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching geographical data:', error)
      return NextResponse.json({ error: 'Failed to fetch geographical data' }, { status: 500 })
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return NextResponse.json([])
    }

    // Group entries by country for dashboard display
    const countryData = waitlistEntries.reduce((acc, entry) => {
      const country = entry.country || 'Unknown'
      
      if (!acc[country]) {
        acc[country] = 0
      }
      acc[country] += 1
      return acc
    }, {} as Record<string, number>)

    // Calculate percentages
    const total = waitlistEntries.length
    const formattedData = Object.entries(countryData).map(([country, count]) => ({
      country,
      region: '', // Not used in dashboard
      city: '', // Not used in dashboard
      count: count as number,
      percentage: total > 0 ? Math.round((count as number / total) * 100) : 0
    }))

    // Sort by count descending
    formattedData.sort((a, b) => (b.count as number) - (a.count as number))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Geographical API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 