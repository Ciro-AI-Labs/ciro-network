'use client'

import { useState, useEffect } from 'react'
import { Card, Badge, Container, Grid } from '@/components/ui'

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
  signup_count: number
  approved_count: number
  avg_time_on_site: number
  avg_form_fill_time: number
  mobile_users: number
  desktop_users: number
}

interface MarketingData {
  marketing_channel: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  signup_count: number
  approved_count: number
  avg_time_on_site: number
  avg_page_views: number
  avg_form_fill_time: number
  abandoned_forms: number
}

export default function WaitlistAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [geographical, setGeographical] = useState<GeographicalData[]>([])
  const [marketing, setMarketing] = useState<MarketingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data from API endpoints
      const [analyticsRes, geographicalRes, marketingRes] = await Promise.all([
        fetch('/api/admin/waitlist/analytics'),
        fetch('/api/admin/waitlist/geographical'),
        fetch('/api/admin/waitlist/marketing')
      ])

      if (!analyticsRes.ok || !geographicalRes.ok || !marketingRes.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const [analyticsData, geographicalData, marketingData] = await Promise.all([
        analyticsRes.json(),
        geographicalRes.json(),
        marketingRes.json()
      ])

      setAnalytics(analyticsData)
      setGeographical(geographicalData)
      setMarketing(marketingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0s'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <Container>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Container>
    )
  }

  const latestData = analytics[0] || {}
  const totalSignups = latestData.total_signups || 0

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Waitlist Analytics Dashboard</h1>
        
        {/* Overview Cards */}
        <Grid cols={4} gap={6} className="mb-8">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSignups}</div>
              <div className="text-sm text-gray-600">Total Signups</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{latestData.approved_count || 0}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{latestData.pending_count || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{latestData.rejected_count || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </Card>
        </Grid>

        {/* User Types */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Types</h2>
          <Grid cols={4} gap={4}>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.developers || 0}</div>
              <div className="text-sm text-gray-600">Developers</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.developers || 0, totalSignups)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.artists || 0}</div>
              <div className="text-sm text-gray-600">Artists/Creators</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.artists || 0, totalSignups)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.studios || 0}</div>
              <div className="text-sm text-gray-600">Studios/Agencies</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.studios || 0, totalSignups)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.compute_providers || 0}</div>
              <div className="text-sm text-gray-600">Compute Providers</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.compute_providers || 0, totalSignups)}
              </div>
            </div>
          </Grid>
        </Card>

        {/* Device Types */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Device Types</h2>
          <Grid cols={3} gap={4}>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.desktop_users || 0}</div>
              <div className="text-sm text-gray-600">Desktop</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.desktop_users || 0, totalSignups)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.mobile_users || 0}</div>
              <div className="text-sm text-gray-600">Mobile</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.mobile_users || 0, totalSignups)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.tablet_users || 0}</div>
              <div className="text-sm text-gray-600">Tablet</div>
              <div className="text-xs text-gray-500">
                {formatPercentage(latestData.tablet_users || 0, totalSignups)}
              </div>
            </div>
          </Grid>
        </Card>

        {/* Marketing Channels */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Marketing Channels</h2>
          <Grid cols={5} gap={4}>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.organic_traffic || 0}</div>
              <div className="text-sm text-gray-600">Organic</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.paid_traffic || 0}</div>
              <div className="text-sm text-gray-600">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.social_traffic || 0}</div>
              <div className="text-sm text-gray-600">Social</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.email_traffic || 0}</div>
              <div className="text-sm text-gray-600">Email</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{latestData.direct_traffic || 0}</div>
              <div className="text-sm text-gray-600">Direct</div>
            </div>
          </Grid>
        </Card>

        {/* Engagement Metrics */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
          <Grid cols={3} gap={4}>
            <div className="text-center">
              <div className="text-lg font-semibold">{formatTime(latestData.avg_time_on_site || 0)}</div>
              <div className="text-sm text-gray-600">Avg Time on Site</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{(latestData.avg_page_views || 0).toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Page Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{formatTime(latestData.avg_form_fill_time || 0)}</div>
              <div className="text-sm text-gray-600">Avg Form Fill Time</div>
            </div>
          </Grid>
        </Card>

        {/* Geographical Data */}
        {geographical.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Top Locations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Country</th>
                    <th className="text-left py-2">Region</th>
                    <th className="text-left py-2">City</th>
                    <th className="text-right py-2">Signups</th>
                    <th className="text-right py-2">Approved</th>
                    <th className="text-right py-2">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {geographical.slice(0, 10).map((location, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{location.country}</td>
                      <td className="py-2">{location.region}</td>
                      <td className="py-2">{location.city}</td>
                      <td className="text-right py-2">{location.signup_count}</td>
                      <td className="text-right py-2">{location.approved_count}</td>
                      <td className="text-right py-2">{formatTime(location.avg_time_on_site)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Marketing Performance */}
        {marketing.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Marketing Channel Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Channel</th>
                    <th className="text-left py-2">Source</th>
                    <th className="text-left py-2">Campaign</th>
                    <th className="text-right py-2">Signups</th>
                    <th className="text-right py-2">Approved</th>
                    <th className="text-right py-2">Avg Time</th>
                    <th className="text-right py-2">Abandoned</th>
                  </tr>
                </thead>
                <tbody>
                  {marketing.slice(0, 10).map((channel, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <Badge variant={channel.marketing_channel === 'organic' ? 'default' : 'secondary'}>
                          {channel.marketing_channel}
                        </Badge>
                      </td>
                      <td className="py-2">{channel.utm_source || '-'}</td>
                      <td className="py-2">{channel.utm_campaign || '-'}</td>
                      <td className="text-right py-2">{channel.signup_count}</td>
                      <td className="text-right py-2">{channel.approved_count}</td>
                      <td className="text-right py-2">{formatTime(channel.avg_time_on_site)}</td>
                      <td className="text-right py-2">{channel.abandoned_forms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Container>
  )
} 