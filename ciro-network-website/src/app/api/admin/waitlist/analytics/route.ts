import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    // Get waitlist entries
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch waitlist data' },
        { status: 500 }
      )
    }

    if (!waitlistEntries) {
      return NextResponse.json(
        { error: 'No waitlist data found' },
        { status: 404 }
      )
    }

    // Define the type for waitlist entries
    interface WaitlistEntry {
      id: string
      email: string
      status: string
      created_at: string
      interest_level?: string
      expertise_level?: string
      location?: string
      [key: string]: any
    }

    // Calculate analytics with proper typing
    const totalSignups = waitlistEntries.length
    const pendingCount = waitlistEntries.filter((entry: WaitlistEntry) => entry.status === 'pending').length
    const approvedCount = waitlistEntries.filter((entry: WaitlistEntry) => entry.status === 'approved').length
    const rejectedCount = waitlistEntries.filter((entry: WaitlistEntry) => entry.status === 'rejected').length

    // Get entries from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentSignups = waitlistEntries.filter((entry: WaitlistEntry) => 
      new Date(entry.created_at) >= thirtyDaysAgo
    ).length

    // Interest level breakdown
    const interestLevels = waitlistEntries.reduce((acc: Record<string, number>, entry: WaitlistEntry) => {
      const level = entry.interest_level || 'unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})

    // Expertise level breakdown
    const expertiseLevels = waitlistEntries.reduce((acc: Record<string, number>, entry: WaitlistEntry) => {
      const level = entry.expertise_level || 'unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})

    // Location breakdown (top 10)
    const locationCounts = waitlistEntries.reduce((acc: Record<string, number>, entry: WaitlistEntry) => {
      const location = entry.location || 'unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})
    
    const topLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .reduce((acc: Record<string, number>, [location, count]) => {
        acc[location] = count as number
        return acc
      }, {})

    // Daily signups for the last 30 days
    const dailySignups = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = waitlistEntries.filter((entry: WaitlistEntry) => 
        entry.created_at.startsWith(dateStr)
      ).length
      
      dailySignups.push({
        date: dateStr,
        count
      })
    }

    const analytics = {
      overview: {
        totalSignups,
        pendingCount,
        approvedCount,
        rejectedCount,
        recentSignups
      },
      demographics: {
        interestLevels,
        expertiseLevels,
        topLocations
      },
      trends: {
        dailySignups
      }
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 