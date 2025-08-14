import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

// Use server-side getter to avoid build-time failures

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    // Update the entry
    const supabase = await getSupabaseServer()
    const { data, error } = await supabase
      .from('waitlist')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update entry' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Entry updated successfully',
        data: data[0]
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 