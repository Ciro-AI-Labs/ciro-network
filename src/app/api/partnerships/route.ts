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
const TO_EMAIL = process.env.TO_EMAIL || 'partnerships@ciro.network'

interface PartnershipInquiry {
  name: string
  email: string
  company: string
  title?: string
  partnershipType: string
  organizationSize?: string
  projectDescription: string
  expectedComputeNeeds?: string
  timeline?: string
  budgetRange?: string
  technicalRequirements?: string
  complianceRequirements?: string
  phone?: string
  preferredContactMethod?: string
  meetingPreference?: string
  timezone?: string
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
async function sendPartnershipNotification(inquiry: PartnershipInquiry) {
  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'your_sendgrid_key') {
    console.warn('SendGrid API key not configured, skipping email notification')
    return
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a202c; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
        New Partnership Inquiry - CIRO Network
      </h2>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Contact Information</h3>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Company:</strong> ${inquiry.company}</p>
        ${inquiry.title ? `<p><strong>Title:</strong> ${inquiry.title}</p>` : ''}
        ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
        ${inquiry.timezone ? `<p><strong>Timezone:</strong> ${inquiry.timezone}</p>` : ''}
      </div>

      <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Partnership Details</h3>
        <p><strong>Partnership Type:</strong> ${inquiry.partnershipType}</p>
        ${inquiry.organizationSize ? `<p><strong>Organization Size:</strong> ${inquiry.organizationSize}</p>` : ''}
        ${inquiry.timeline ? `<p><strong>Timeline:</strong> ${inquiry.timeline}</p>` : ''}
        ${inquiry.budgetRange ? `<p><strong>Budget Range:</strong> ${inquiry.budgetRange}</p>` : ''}
        ${inquiry.preferredContactMethod ? `<p><strong>Preferred Contact:</strong> ${inquiry.preferredContactMethod}</p>` : ''}
        ${inquiry.meetingPreference ? `<p><strong>Meeting Preference:</strong> ${inquiry.meetingPreference}</p>` : ''}
      </div>

      <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Project Description</h3>
        <p style="white-space: pre-wrap;">${inquiry.projectDescription}</p>
      </div>

      ${inquiry.expectedComputeNeeds ? `
        <div style="background: #fffaf0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Expected Compute Needs</h3>
          <p style="white-space: pre-wrap;">${inquiry.expectedComputeNeeds}</p>
        </div>
      ` : ''}

      ${inquiry.technicalRequirements ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Technical Requirements</h3>
          <p style="white-space: pre-wrap;">${inquiry.technicalRequirements}</p>
        </div>
      ` : ''}

      ${inquiry.complianceRequirements ? `
        <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Compliance Requirements</h3>
          <p style="white-space: pre-wrap;">${inquiry.complianceRequirements}</p>
        </div>
      ` : ''}

      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #64748b;">
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        ${inquiry.analytics?.country ? `<p><strong>Location:</strong> ${inquiry.analytics.city ? inquiry.analytics.city + ', ' : ''}${inquiry.analytics.region ? inquiry.analytics.region + ', ' : ''}${inquiry.analytics.country}</p>` : ''}
        ${inquiry.analytics?.referrer ? `<p><strong>Referrer:</strong> ${inquiry.analytics.referrer}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" 
           style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
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
            subject: `New Partnership Inquiry: ${inquiry.partnershipType} - ${inquiry.company}`,
          },
        ],
        from: { email: FROM_EMAIL, name: 'CIRO Network Partnerships' },
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
    console.error('Error sending partnership notification email:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PartnershipInquiry = await request.json()

    // Basic validation
    if (!body.name || !body.email || !body.company || !body.partnershipType || !body.projectDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, company, partnershipType, and projectDescription are required' },
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
    const inquiryData = {
      name: body.name,
      email: body.email,
      company: body.company,
      title: body.title,
      partnership_type: body.partnershipType,
      organization_size: body.organizationSize,
      project_description: body.projectDescription,
      expected_compute_needs: body.expectedComputeNeeds,
      timeline: body.timeline,
      budget_range: body.budgetRange,
      technical_requirements: body.technicalRequirements,
      compliance_requirements: body.complianceRequirements,
      phone: body.phone,
      preferred_contact_method: body.preferredContactMethod || 'email',
      meeting_preference: body.meetingPreference,
      timezone: body.timezone,
      
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
      .from('partnership_inquiries')
      .insert([inquiryData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save partnership inquiry' },
        { status: 500 }
      )
    }

    // Send notification email
    await sendPartnershipNotification(body)

    return NextResponse.json(
      { 
        message: 'Partnership inquiry submitted successfully',
        id: data[0]?.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Partnership inquiry submission error:', error)
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
    
    let query = supabase
      .from('partnership_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnership inquiries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ inquiries: data })

  } catch (error) {
    console.error('Partnership inquiries fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 