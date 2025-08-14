import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    }
    
    console.log('Environment check:', envCheck)
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable',
        envCheck
      }, { status: 500 })
    }
    
    // Try to import and test Supabase
    try {
      const { getSupabaseServer } = await import('@/lib/supabase-server')
      
      // Test a simple query
      const supabase = await getSupabaseServer()
      const { data, error } = await supabase
        .from('waitlist')
        .select('count')
        .limit(1)
      
      if (error) {
        return NextResponse.json({
          error: 'Supabase query failed',
          details: error.message,
          envCheck
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Supabase connection working',
        data,
        envCheck
      })
      
    } catch (importError) {
      return NextResponse.json({
        error: 'Failed to import Supabase',
        details: importError instanceof Error ? importError.message : 'Unknown error',
        envCheck
      }, { status: 500 })
    }
    
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 