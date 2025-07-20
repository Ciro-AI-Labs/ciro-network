import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzgxtrefdbalpzmuoduf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('Environment variables:', {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_KEY: process.env.SUPABASE_KEY
  })
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for TypeScript
export interface WaitlistEntry {
  id?: number
  name: string
  email: string
  company?: string
  user_type: string
  compute_type?: string
  looking_for?: string
  created_at?: string
  status?: 'pending' | 'approved' | 'rejected'
  notes?: string
}

// Waitlist management functions
export async function addWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([entry])
    .select()

  if (error) {
    console.error('Error adding waitlist entry:', error)
    throw error
  }

  return data?.[0]
}

export async function getWaitlistEntries() {
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching waitlist entries:', error)
    throw error
  }

  return data
}

export async function updateWaitlistStatus(id: number, status: 'pending' | 'approved' | 'rejected', notes?: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .update({ status, notes })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating waitlist status:', error)
    throw error
  }

  return data?.[0]
} 