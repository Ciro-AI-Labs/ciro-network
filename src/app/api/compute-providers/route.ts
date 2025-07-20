import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ciro.network'
const TO_EMAIL = process.env.TO_EMAIL || 'compute@ciro.network'

interface ComputeProviderApplication {
  name: string
  email: string
  company: string
  title?: string
  computeType: string[]
  hardwareSpecs?: object
  totalCapacity: string
  availableCapacity?: string
  location: string
  dataCenterTier?: string
  networkBandwidth?: string
  uptimeSla?: number
  securityCertifications?: string[]
  complianceStandards?: string[]
  yearsInOperation?: number
  previousClients?: string
  pricingModel?: string
  pricingRange?: string
  minimumCommitment?: string
  apiCapabilities?: string[]
  containerSupport?: boolean
  kubernetesSupport?: boolean
  dockerSupport?: boolean
  customImageSupport?: boolean
  monitoringTools?: string[]
  managementInterface?: string
  supportLevel?: string
  insuranceCoverage?: string
  liabilityLimits?: string
  contractFlexibility?: string
  paymentTerms?: string
  analytics?: {
    ipAddress?: string
    country?: string
    region?: string
    city?: string
    userAgent?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
}

// Send email notification
async function sendComputeProviderNotification(application: ComputeProviderApplication) {
  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'your_sendgrid_key') {
    console.warn('SendGrid API key not configured, skipping email notification')
    return
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a202c; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
        New Compute Provider Application - CIRO Network
      </h2>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Contact Information</h3>
        <p><strong>Name:</strong> ${application.name}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Company:</strong> ${application.company}</p>
        ${application.title ? `<p><strong>Title:</strong> ${application.title}</p>` : ''}
        <p><strong>Location:</strong> ${application.location}</p>
      </div>

      <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Technical Capabilities</h3>
        <p><strong>Compute Types:</strong> ${application.computeType.join(', ')}</p>
        <p><strong>Total Capacity:</strong> ${application.totalCapacity}</p>
        ${application.availableCapacity ? `<p><strong>Available Capacity:</strong> ${application.availableCapacity}</p>` : ''}
        ${application.dataCenterTier ? `<p><strong>Data Center Tier:</strong> ${application.dataCenterTier}</p>` : ''}
        ${application.networkBandwidth ? `<p><strong>Network Bandwidth:</strong> ${application.networkBandwidth}</p>` : ''}
        ${application.uptimeSla ? `<p><strong>Uptime SLA:</strong> ${application.uptimeSla}%</p>` : ''}
      </div>

      ${application.securityCertifications && application.securityCertifications.length > 0 ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Security & Compliance</h3>
          <p><strong>Security Certifications:</strong> ${application.securityCertifications.join(', ')}</p>
          ${application.complianceStandards && application.complianceStandards.length > 0 ? `<p><strong>Compliance Standards:</strong> ${application.complianceStandards.join(', ')}</p>` : ''}
        </div>
      ` : ''}

      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Business Information</h3>
        ${application.yearsInOperation ? `<p><strong>Years in Operation:</strong> ${application.yearsInOperation}</p>` : ''}
        ${application.pricingModel ? `<p><strong>Pricing Model:</strong> ${application.pricingModel}</p>` : ''}
        ${application.pricingRange ? `<p><strong>Pricing Range:</strong> ${application.pricingRange}</p>` : ''}
        ${application.minimumCommitment ? `<p><strong>Minimum Commitment:</strong> ${application.minimumCommitment}</p>` : ''}
        ${application.supportLevel ? `<p><strong>Support Level:</strong> ${application.supportLevel}</p>` : ''}
      </div>

      ${application.previousClients ? `
        <div style="background: #fdf4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Previous Clients</h3>
          <p style="white-space: pre-wrap;">${application.previousClients}</p>
        </div>
      ` : ''}

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Technical Integration</h3>
        ${application.containerSupport ? '<p>✅ Container Support</p>' : '<p>❌ Container Support</p>'}
        ${application.kubernetesSupport ? '<p>✅ Kubernetes Support</p>' : '<p>❌ Kubernetes Support</p>'}
        ${application.dockerSupport ? '<p>✅ Docker Support</p>' : '<p>❌ Docker Support</p>'}
        ${application.customImageSupport ? '<p>✅ Custom Image Support</p>' : '<p>❌ Custom Image Support</p>'}
        ${application.apiCapabilities && application.apiCapabilities.length > 0 ? `<p><strong>API Capabilities:</strong> ${application.apiCapabilities.join(', ')}</p>` : ''}
        ${application.monitoringTools && application.monitoringTools.length > 0 ? `<p><strong>Monitoring Tools:</strong> ${application.monitoringTools.join(', ')}</p>` : ''}
      </div>

      ${application.hardwareSpecs ? `
        <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Hardware Specifications</h3>
          <pre style="background: #e6fffa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(application.hardwareSpecs, null, 2)}</pre>
        </div>
      ` : ''}

      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #64748b;">
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        ${application.analytics?.country ? `<p><strong>Geographic Location:</strong> ${application.analytics.city ? application.analytics.city + ', ' : ''}${application.analytics.region ? application.analytics.region + ', ' : ''}${application.analytics.country}</p>` : ''}
        ${application.analytics?.referrer ? `<p><strong>Referrer:</strong> ${application.analytics.referrer}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" 
           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View in Admin Dashboard
        </a>
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: TO_EMAIL }],
            subject: `New Compute Provider Application: ${application.company} - ${application.computeType.join(', ')}`,
          },
        ],
        from: { email: FROM_EMAIL, name: 'CIRO Network Compute' },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid API error:', response.status, errorText)
    }
  } catch (error) {
    console.error('Error sending compute provider notification email:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ComputeProviderApplication = await request.json()

    // Basic validation
    if (!body.name || !body.email || !body.company || !body.computeType || body.computeType.length === 0 || !body.totalCapacity || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, company, computeType, totalCapacity, and location are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Prepare data for database
    const applicationData = {
      name: body.name,
      email: body.email,
      company: body.company,
      title: body.title,
      compute_type: body.computeType,
      hardware_specs: body.hardwareSpecs,
      total_capacity: body.totalCapacity,
      available_capacity: body.availableCapacity,
      location: body.location,
      data_center_tier: body.dataCenterTier,
      network_bandwidth: body.networkBandwidth,
      uptime_sla: body.uptimeSla,
      security_certifications: body.securityCertifications,
      compliance_standards: body.complianceStandards,
      years_in_operation: body.yearsInOperation,
      previous_clients: body.previousClients,
      pricing_model: body.pricingModel,
      pricing_range: body.pricingRange,
      minimum_commitment: body.minimumCommitment,
      api_capabilities: body.apiCapabilities,
      container_support: body.containerSupport || false,
      kubernetes_support: body.kubernetesSupport || false,
      docker_support: body.dockerSupport || false,
      custom_image_support: body.customImageSupport || false,
      monitoring_tools: body.monitoringTools,
      management_interface: body.managementInterface,
      support_level: body.supportLevel,
      insurance_coverage: body.insuranceCoverage,
      liability_limits: body.liabilityLimits,
      contract_flexibility: body.contractFlexibility,
      payment_terms: body.paymentTerms,
      
      // Analytics data
      ip_address: clientIP,
      country: body.analytics?.country,
      region: body.analytics?.region,
      city: body.analytics?.city,
      user_agent: userAgent,
      referrer: body.analytics?.referrer,
      utm_source: body.analytics?.utmSource,
      utm_medium: body.analytics?.utmMedium,
      utm_campaign: body.analytics?.utmCampaign,
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('compute_provider_applications')
      .insert([applicationData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save compute provider application' },
        { status: 500 }
      )
    }

    // Send notification email
    await sendComputeProviderNotification(body)

    return NextResponse.json(
      { 
        message: 'Compute provider application submitted successfully',
        id: data[0]?.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Compute provider application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const computeType = searchParams.get('computeType')
    
    let query = supabase
      .from('compute_provider_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (computeType) {
      query = query.contains('compute_type', [computeType])
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch compute provider applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ applications: data })

  } catch (error) {
    console.error('Compute provider applications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 