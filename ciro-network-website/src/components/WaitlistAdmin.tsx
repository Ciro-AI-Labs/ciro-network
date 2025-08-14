'use client'

import { useState, useEffect } from 'react'
import type { WaitlistEntry } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, Mail, Building, User, Server, Code, Palette } from 'lucide-react'

export default function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/admin/waitlist')
      if (!response.ok) throw new Error('Failed to fetch entries')
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (!response.ok) throw new Error('Failed to update status')
      await loadEntries() // Reload the list
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const filteredEntries = entries.filter(entry => 
    filter === 'all' ? true : entry.status === filter
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'Developer': return <Code className="w-4 h-4" />
      case 'Artist/Creator': return <Palette className="w-4 h-4" />
      case 'Studio/Agency': return <Building className="w-4 h-4" />
      case 'Compute Provider': return <Server className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cosmic-cyan"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-cosmic-cyan">Waitlist Admin</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 backdrop-blur-2xl border border-cosmic-cyan/30 rounded-lg p-4">
            <div className="text-2xl font-bold">{entries.length}</div>
            <div className="text-sm text-gray-400">Total Signups</div>
          </div>
          <div className="bg-black/40 backdrop-blur-2xl border border-cosmic-cyan/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-500">
              {entries.filter(e => e.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-black/40 backdrop-blur-2xl border border-cosmic-cyan/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-500">
              {entries.filter(e => e.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="bg-black/40 backdrop-blur-2xl border border-cosmic-cyan/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-500">
              {entries.filter(e => e.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filter === status
                  ? 'bg-cosmic-cyan text-black border-cosmic-cyan'
                  : 'border-cosmic-cyan/30 text-white hover:border-cosmic-cyan'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-black/40 backdrop-blur-2xl border border-cosmic-cyan/30 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getUserTypeIcon(entry.user_type)}
                    <h3 className="text-xl font-semibold">{entry.name}</h3>
                    {getStatusIcon(entry.status || 'pending')}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{entry.email}</span>
                    </div>
                    
                    {entry.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{entry.company}</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-400">User Type:</span> {entry.user_type}
                    </div>
                    
                    {entry.compute_type && (
                      <div>
                        <span className="text-gray-400">Compute:</span> {entry.compute_type}
                      </div>
                    )}
                  </div>
                  
                  {entry.looking_for && (
                    <div className="mt-3 p-3 bg-black/20 rounded border border-cosmic-cyan/20">
                      <span className="text-gray-400">Looking for:</span> {entry.looking_for}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Joined: {new Date(entry.created_at!).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleStatusUpdate(entry.id!, 'approved')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(entry.id!, 'rejected')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No entries found for the selected filter.
          </div>
        )}
      </div>
    </div>
  )
} 