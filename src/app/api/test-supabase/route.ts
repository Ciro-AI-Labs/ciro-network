import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyLength: process.env.SUPABASE_KEY?.length || 0
    }
    
    console.log('Environment check:', envCheck)
    
    if (!process.env.SUPABASE_KEY) {
      return NextResponse.json({
        error: 'Missing SUPABASE_KEY environment variable',
        envCheck
      }, { status: 500 })
    }
    
    // Try to import and test Supabase
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      // Test a simple query
      const { data, error } = await supabaseServer
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