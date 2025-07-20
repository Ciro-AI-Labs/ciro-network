'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Globe, 
  Clock, 
  TrendingUp, 
  Monitor, 
  MapPin, 
  BarChart3, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  CheckSquare,
  Square
} from 'lucide-react'

interface AnalyticsData {
  total_signups: number
  pending_count: number
  approved_count: number
  rejected_count: number
  developers: number
  artists: number
  studios: number
  compute_providers: number
  with_location: number
  unique_countries: number
  unique_cities: number
  desktop_users: number
  mobile_users: number
  tablet_users: number
  organic_traffic: number
  paid_traffic: number
  social_traffic: number
  email_traffic: number
  direct_traffic: number
  avg_time_on_site: number
  avg_page_views: number
  avg_form_fill_time: number
  signup_date: string
}

interface GeographicalData {
  country: string
  region: string
  city: string
  count: number
  percentage: number
}

interface MarketingData {
  source: string
  count: number
  percentage: number
  conversion_rate: number
}

interface DeviceData {
  device_type: string
  count: number
  percentage: number
}

interface WaitlistEntry {
  id: number
  name: string
  email: string
  company?: string
  user_type: string
  compute_type?: string
  looking_for?: string
  status: string
  created_at: string
  country?: string
  city?: string
  device_type?: string
  time_on_site_seconds?: number
  page_views_count?: number
  marketing_channel?: string
  utm_source?: string
  utm_medium?: string
  form_fill_duration_seconds?: number
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [geographicalData, setGeographicalData] = useState<GeographicalData[]>([])
  const [marketingData, setMarketingData] = useState<MarketingData[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchAnalyticsData = async () => {
    try {
      const [analyticsRes, geographicalRes, marketingRes, waitlistRes] = await Promise.all([
        fetch('/api/admin/waitlist/analytics'),
        fetch('/api/admin/waitlist/geographical'),
        fetch('/api/admin/waitlist/marketing'),
        fetch('/api/admin/waitlist')
      ])

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (geographicalRes.ok) setGeographicalData(await geographicalRes.json())
      if (marketingRes.ok) setMarketingData(await marketingRes.json())
      if (waitlistRes.ok) setWaitlistEntries(await waitlistRes.json())
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const calculateDeviceStats = (entries: WaitlistEntry[]): DeviceData[] => {
    const deviceCounts: { [key: string]: number } = {}
    const total = entries.length

    entries.forEach(entry => {
      const deviceType = entry.device_type || 'unknown'
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1
    })

    return Object.entries(deviceCounts).map(([device_type, count]) => ({
      device_type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
  }

  const deviceData = calculateDeviceStats(waitlistEntries)

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.company && entry.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === 'all' || entry.status === filter
    return matchesSearch && matchesFilter
  })

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'User Type', 'Status', 'Location', 'Device', 'Time on Site', 'Marketing Channel', 'Date'],
      ...filteredEntries.map(entry => [
        entry.name,
        entry.email,
        entry.company || '',
        entry.user_type,
        entry.status,
        entry.city && entry.country ? `${entry.city}, ${entry.country}` : 'Unknown',
        entry.device_type || 'Unknown',
        entry.time_on_site_seconds ? `${Math.round(entry.time_on_site_seconds / 60)}m` : 'N/A',
        entry.marketing_channel || 'Unknown',
        new Date(entry.created_at).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-entries-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const updateEntryStatus = async (entryId: number, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/waitlist/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setWaitlistEntries(prev => 
          prev.map(entry => 
            entry.id === entryId 
              ? { ...entry, status: newStatus }
              : entry
          )
        )
        
        // Refresh analytics data
        await fetchAnalyticsData()
      } else {
        console.error('Failed to update entry status')
      }
    } catch (error) {
      console.error('Error updating entry status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const updateBulkStatus = async (newStatus: string) => {
    if (selectedEntries.size === 0) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/waitlist/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          entryIds: Array.from(selectedEntries),
          status: newStatus 
        }),
      })

      if (response.ok) {
        // Update local state
        setWaitlistEntries(prev => 
          prev.map(entry => 
            selectedEntries.has(entry.id)
              ? { ...entry, status: newStatus }
              : entry
          )
        )
        
        // Clear selection
        setSelectedEntries(new Set())
        
        // Refresh analytics data
        await fetchAnalyticsData()
      } else {
        console.error('Failed to update bulk entries')
      }
    } catch (error) {
      console.error('Error updating bulk entries:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleEntrySelection = (entryId: number) => {
    const newSelection = new Set(selectedEntries)
    if (newSelection.has(entryId)) {
      newSelection.delete(entryId)
    } else {
      newSelection.add(entryId)
    }
    setSelectedEntries(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set())
    } else {
      setSelectedEntries(new Set(filteredEntries.map(entry => entry.id)))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Waitlist Analytics Dashboard</h1>
          <p className="text-white/60">Comprehensive analytics and user insights</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Signups</p>
                <p className="text-3xl font-bold text-white">{analytics?.total_signups || 0}</p>
              </div>
              <Users className="w-8 h-8 text-cosmic-cyan" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Countries</p>
                <p className="text-3xl font-bold text-white">{analytics?.unique_countries || 0}</p>
              </div>
              <Globe className="w-8 h-8 text-cosmic-cyan" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Avg Time on Site</p>
                <p className="text-3xl font-bold text-white">{analytics?.avg_time_on_site ? `${Math.round(analytics.avg_time_on_site / 60)}m` : '0m'}</p>
              </div>
              <Clock className="w-8 h-8 text-cosmic-cyan" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{analytics?.total_signups ? Math.round((analytics.approved_count / analytics.total_signups) * 100) : 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cosmic-cyan" />
            </div>
          </motion.div>
        </div>

        {/* Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Types */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-cyan" />
              User Types
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Developers</span>
                <span className="text-white font-semibold">{analytics?.developers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Artists/Creators</span>
                <span className="text-white font-semibold">{analytics?.artists || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Studios/Agencies</span>
                <span className="text-white font-semibold">{analytics?.studios || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Compute Providers</span>
                <span className="text-white font-semibold">{analytics?.compute_providers || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Device Types */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cosmic-cyan" />
              Device Types
            </h3>
            <div className="space-y-3">
              {deviceData.map((device, index) => (
                <div key={`device-${device.device_type}-${index}`} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 capitalize">{device.device_type}</span>
                  </div>
                  <span className="text-white font-semibold">{device.count} ({device.percentage}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Geographical and Marketing Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cosmic-cyan" />
              Top Countries
            </h3>
            <div className="space-y-3">
              {geographicalData.slice(0, 5).map((country, index) => (
                <div key={`country-${country.country}-${index}`} className="flex justify-between items-center">
                  <span className="text-white/80">{country.country}</span>
                  <span className="text-white font-semibold">{country.count} ({country.percentage}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Marketing Channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cosmic-glass rounded-xl p-6 border border-cosmic-cyan/30"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cosmic-cyan" />
              Marketing Channels
            </h3>
            <div className="space-y-3">
              {marketingData.slice(0, 5).map((channel, index) => (
                <div key={`channel-${channel.source}-${index}`} className="flex justify-between items-center">
                  <span className="text-white/80 capitalize">{channel.source?.replace('-', ' ') || channel.source || 'Unknown'}</span>
                  <span className="text-white font-semibold">{channel.count} ({channel.percentage}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Waitlist Entries Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cosmic-glass rounded-xl border border-cosmic-cyan/30 overflow-hidden"
        >
          <div className="p-6 border-b border-cosmic-cyan/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-semibold text-white">Waitlist Entries</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 bg-black/40 border border-cosmic-cyan/30 rounded-lg text-white placeholder-white/50 focus:border-cosmic-cyan focus:outline-none"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 bg-black/40 border border-cosmic-cyan/30 rounded-lg text-white focus:border-cosmic-cyan focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                {/* Bulk Actions */}
                {selectedEntries.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBulkStatus('approved')}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve ({selectedEntries.size})
                    </button>
                    <button
                      onClick={() => updateBulkStatus('rejected')}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject ({selectedEntries.size})
                    </button>
                  </div>
                )}
                
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-cosmic-cyan/20 border border-cosmic-cyan/40 text-cosmic-cyan rounded-lg hover:bg-cosmic-cyan/30 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={fetchAnalyticsData}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    <button
                      onClick={toggleAllSelection}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      {selectedEntries.size === filteredEntries.length ? (
                        <CheckSquare className="w-4 h-4 text-cosmic-cyan" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Time on Site</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-cyan/10">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEntrySelection(entry.id)}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        {selectedEntries.has(entry.id) ? (
                          <CheckSquare className="w-4 h-4 text-cosmic-cyan" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{entry.name}</div>
                        {entry.company && (
                          <div className="text-sm text-white/60">{entry.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{entry.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-cosmic-cyan/20 text-cosmic-cyan">
                        {entry.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {entry.city && entry.country ? `${entry.city}, ${entry.country}` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 capitalize">
                      {entry.device_type || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {entry.time_on_site_seconds ? `${Math.round(entry.time_on_site_seconds / 60)}m` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        entry.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {entry.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateEntryStatus(entry.id, 'approved')}
                              disabled={isUpdating}
                              className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateEntryStatus(entry.id, 'rejected')}
                              disabled={isUpdating}
                              className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {entry.status === 'approved' && (
                          <button
                            onClick={() => updateEntryStatus(entry.id, 'rejected')}
                            disabled={isUpdating}
                            className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {entry.status === 'rejected' && (
                          <button
                            onClick={() => updateEntryStatus(entry.id, 'approved')}
                            disabled={isUpdating}
                            className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 