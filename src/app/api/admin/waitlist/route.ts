import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get all waitlist entries with analytics data
    const { getSupabaseServer } = await import('@/lib/supabase-server')
    const supabase = getSupabaseServer()
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching waitlist entries:', error)
      return NextResponse.json({ error: 'Failed to fetch waitlist entries' }, { status: 500 })
    }

    if (!waitlistEntries) {
      return NextResponse.json([])
    }

    // Transform the data to match the frontend interface
    const transformedEntries = waitlistEntries.map(entry => ({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      company: entry.company,
      user_type: entry.user_type,
      compute_type: entry.compute_type,
      looking_for: entry.looking_for,
      status: entry.status,
      created_at: entry.created_at,
      country: entry.country,
      city: entry.city,
      device_type: entry.device_type,
      time_on_site_seconds: entry.time_on_site_seconds,
      page_views_count: entry.page_views_count,
      marketing_channel: entry.marketing_channel,
      utm_source: entry.utm_source,
      utm_medium: entry.utm_medium,
      form_fill_duration_seconds: entry.form_fill_duration_seconds
    }))

    return NextResponse.json(transformedEntries)
  } catch (error) {
    console.error('Error in waitlist entries API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update the waitlist entry status
    const { getSupabaseServer } = await import('@/lib/supabase-server')
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('waitlist')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating waitlist status:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in waitlist status update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

 