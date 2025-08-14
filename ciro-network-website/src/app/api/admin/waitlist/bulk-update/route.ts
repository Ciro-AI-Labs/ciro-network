import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const body = await request.json()
    const { entryIds, status } = body

    // Validate inputs
    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: 'entryIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    // Update all entries
    const { data, error } = await supabase
      .from('waitlist')
      .update({ status })
      .in('id', entryIds)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update entries' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully updated ${data?.length || 0} entries`,
        updatedCount: data?.length || 0,
        data
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 