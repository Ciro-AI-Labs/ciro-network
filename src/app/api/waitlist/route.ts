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
const TO_EMAIL = process.env.TO_EMAIL || 'admin@ciro.network'

interface UserAnalytics {
  ipAddress?: string
  country?: string
  region?: string
  city?: string
  timezone?: string
  latitude?: number
  longitude?: number
  timeOnSiteSeconds?: number
  pageViewsCount?: number
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  userAgent?: string
  browser?: string
  browserVersion?: string
  operatingSystem?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  screenResolution?: string
  language?: string
  sessionId?: string
  firstVisitAt?: string
  lastVisitAt?: string
  formStartTime?: string
  formCompletionTime?: string
  formFillDurationSeconds?: number
  formAbandonmentCount?: number
  formFieldInteractions?: { [key: string]: number }
  sourcePage?: string
  entryPoint?: string
  marketingChannel?: string
}

interface WaitlistSubmission {
  name: string
  email: string
  userType: string
  computeType?: string
  lookingFor?: string
  company?: string
  analytics?: UserAnalytics
}

// Send email via SendGrid
async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'your_sendgrid_key') {
    console.warn('SendGrid API key not configured or invalid, skipping email')
    console.log('Would send email to:', to)
    console.log('Subject:', subject)
    return
  }

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
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: FROM_EMAIL, name: 'CIRO Network' },
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
      throw new Error(`SendGrid API error: ${response.status}`)
    }

    console.log('Email sent successfully to:', to)
  } catch (error) {
    console.error('Failed to send email:', error)
    // Don't throw error - just log it so form submission still works
    console.log('Email sending failed, but form submission will continue')
  }
}

// Send thank you email to user
async function sendThankYouEmail(userEmail: string, userName: string, userType: string) {
  const subject = 'Welcome to CIRO Network - Thank You for Joining Our Waitlist!'
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CIRO Network</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to CIRO Network!</h1>
          <p>Thank you for joining our revolutionary AI compute network</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName},</h2>
          
          <p>Thank you for your interest in <strong>CIRO Network</strong>! We're excited to have you join our waitlist as a <strong>${userType}</strong>.</p>
          
          <p>Our team is currently reviewing your submission and will get back to you within the next 24-48 hours with next steps and access information.</p>
          
          <h3>What happens next?</h3>
          <ul>
            <li>✅ Our team reviews your application</li>
            <li>✅ We'll send you detailed onboarding information</li>
            <li>✅ You'll get early access to our platform</li>
            <li>✅ Join our exclusive community of AI innovators</li>
          </ul>
          
          <p>In the meantime, you can:</p>
          <ul>
            <li>📖 Read our <a href="${process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3000'}">documentation</a></li>
            <li>🐦 Follow us on <a href="https://twitter.com/ciro_network">Twitter</a></li>
            <li>💬 Join our <a href="https://discord.gg/ciro">Discord community</a></li>
          </ul>
          
          <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>
          
          <p>Best regards,<br>
          <strong>The CIRO Network Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 CIRO Network. All rights reserved.</p>
          <p>This email was sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(userEmail, subject, htmlContent)
}

// Send notification email to admin
async function sendAdminNotification(submission: WaitlistSubmission) {
  const subject = `New Waitlist Submission: ${submission.name} (${submission.userType})`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Waitlist Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .analytics { background: #e8f4f8; padding: 15px; margin: 10px 0; border-radius: 5px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Waitlist Submission</h2>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="details">
          <h3>User Information</h3>
          <p><strong>Name:</strong> ${submission.name}</p>
          <p><strong>Email:</strong> ${submission.email}</p>
          <p><strong>User Type:</strong> ${submission.userType}</p>
          ${submission.company ? `<p><strong>Company:</strong> ${submission.company}</p>` : ''}
          ${submission.computeType ? `<p><strong>Compute Type:</strong> ${submission.computeType}</p>` : ''}
          ${submission.lookingFor ? `<p><strong>Looking For:</strong> ${submission.lookingFor}</p>` : ''}
        </div>
        
        ${submission.analytics ? `
        <div class="analytics">
          <h4>Analytics Data</h4>
          <p><strong>Location:</strong> ${submission.analytics.city || 'Unknown'}, ${submission.analytics.country || 'Unknown'}</p>
          <p><strong>Device:</strong> ${submission.analytics.deviceType || 'Unknown'}</p>
          <p><strong>Marketing Channel:</strong> ${submission.analytics.marketingChannel || 'Unknown'}</p>
          <p><strong>Time on Site:</strong> ${submission.analytics.timeOnSiteSeconds || 0}s</p>
          <p><strong>Browser:</strong> ${submission.analytics.browser || 'Unknown'} ${submission.analytics.browserVersion || ''}</p>
        </div>
        ` : ''}
        
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/admin">View in Admin Dashboard</a></p>
      </div>
    </body>
    </html>
  `

  await sendEmail(TO_EMAIL, subject, htmlContent)
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistSubmission = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Prepare analytics data
    const analytics = body.analytics || {}
    
    // Insert into database - only use columns that exist
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          name: body.name,
          email: body.email,
          company: body.company || null,
          user_type: body.userType,
          compute_type: body.computeType || null,
          looking_for: body.lookingFor || null,
          status: 'pending',
          country: analytics.country,
          city: analytics.city,
          device_type: analytics.deviceType,
          time_on_site_seconds: analytics.timeOnSiteSeconds,
          page_views_count: analytics.pageViewsCount,
          marketing_channel: analytics.marketingChannel,
          utm_source: analytics.utmSource,
          utm_medium: analytics.utmMedium,
          form_fill_duration_seconds: analytics.formFillDurationSeconds
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Send thank you email to user
    try {
      await sendThankYouEmail(body.email, body.name, body.userType)
    } catch (emailError) {
      console.error('Failed to send thank you email:', emailError)
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendAdminNotification(body)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Waitlist submission successful',
        id: data?.[0]?.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 