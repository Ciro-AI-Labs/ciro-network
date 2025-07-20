import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    // Get all waitlist entries with location data
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching geographical data:', error)
      return NextResponse.json({ error: 'Failed to fetch geographical data' }, { status: 500 })
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return NextResponse.json([])
    }

    // Define types
    interface WaitlistEntry {
      id: string
      email: string
      country?: string
      city?: string
      created_at: string
      [key: string]: any
    }

    interface CountryData {
      [country: string]: {
        count: number
        cities: { [city: string]: number }
        percentage: number
      }
    }

    // Group entries by country for dashboard display
    const countryData = waitlistEntries.reduce((acc: CountryData, entry: WaitlistEntry) => {
      const country = entry.country || 'Unknown'
      const city = entry.city || 'Unknown'
      
      if (!acc[country]) {
        acc[country] = {
          count: 0,
          cities: {},
          percentage: 0
        }
      }
      
      acc[country].count++
      
      if (!acc[country].cities[city]) {
        acc[country].cities[city] = 0
      }
      
      acc[country].cities[city]++
      
      return acc
    }, {} as CountryData)

    // Calculate percentages
    const totalEntries = waitlistEntries.length
    Object.keys(countryData).forEach(country => {
      countryData[country].percentage = Math.round((countryData[country].count / totalEntries) * 100)
    })

    // Convert to array format for easier frontend consumption
    const geographicalData = Object.entries(countryData).map(([country, data]) => {
      const countryInfo = data as { count: number; cities: { [city: string]: number }; percentage: number }
      return {
        country,
        count: countryInfo.count,
        percentage: countryInfo.percentage,
        cities: Object.entries(countryInfo.cities).map(([city, count]) => ({
          city,
          count: count as number
        })).sort((a, b) => (b.count as number) - (a.count as number))
      }
    }).sort((a, b) => b.count - a.count)

    return NextResponse.json(geographicalData)

  } catch (error) {
    console.error('Geographical API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 