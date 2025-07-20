// SendGrid integration for waitlist management
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

interface WaitlistSubmission {
  name: string
  email: string
  company?: string
  userType: string
  computeType?: string
  lookingFor?: string
  analytics?: {
    country?: string
    deviceType?: string
    marketingChannel?: string
    timeOnSite?: number
    pageViews?: number
    formFillTime?: number
  }
}

export async function sendWaitlistNotification(submission: WaitlistSubmission) {
  const {
    name,
    email,
    company,
    userType,
    computeType,
    lookingFor,
    analytics
  } = submission

  // Email to you (admin notification)
  const adminEmail = {
    to: process.env.SENDGRID_FROM_EMAIL!,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `🎉 New Waitlist Signup: ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Waitlist Signup</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #495057; margin-bottom: 5px; }
            .value { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
            .badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .analytics-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
            .analytics-item { background: white; padding: 10px; border-radius: 6px; text-align: center; }
            .analytics-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .analytics-value { font-weight: 600; color: #333; }
            .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Waitlist Signup!</h1>
              <p>Someone just joined the CIRO Network waitlist</p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">Email</div>
                <div class="value">${email}</div>
              </div>
              
              ${company ? `
                <div class="field">
                  <div class="label">Company</div>
                  <div class="value">${company}</div>
                </div>
              ` : ''}
              
              <div class="field">
                <div class="label">User Type</div>
                <div class="value">
                  <span class="badge">${userType}</span>
                </div>
              </div>
              
              ${computeType ? `
                <div class="field">
                  <div class="label">Compute Type</div>
                  <div class="value">${computeType}</div>
                </div>
              ` : ''}
              
              <div class="field">
                <div class="label">Signup Time</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
              
              ${analytics ? `
                <div class="analytics-section">
                  <h3 style="margin-top: 0; color: #1976d2;">📊 User Analytics</h3>
                  <div class="analytics-grid">
                    ${analytics.country ? `
                      <div class="analytics-item">
                        <div class="analytics-label">Location</div>
                        <div class="analytics-value">${analytics.country}</div>
                      </div>
                    ` : ''}
                    ${analytics.deviceType ? `
                      <div class="analytics-item">
                        <div class="analytics-label">Device</div>
                        <div class="analytics-value">${analytics.deviceType}</div>
                      </div>
                    ` : ''}
                    ${analytics.marketingChannel ? `
                      <div class="analytics-item">
                        <div class="analytics-label">Channel</div>
                        <div class="analytics-value">${analytics.marketingChannel}</div>
                      </div>
                    ` : ''}
                    ${analytics.timeOnSite ? `
                      <div class="analytics-item">
                        <div class="analytics-label">Time on Site</div>
                        <div class="analytics-value">${Math.floor(analytics.timeOnSite / 60)}m ${analytics.timeOnSite % 60}s</div>
                      </div>
                    ` : ''}
                    ${analytics.pageViews ? `
                      <div class="analytics-item">
                        <div class="analytics-label">Page Views</div>
                        <div class="analytics-value">${analytics.pageViews}</div>
                      </div>
                    ` : ''}
                    ${analytics.formFillTime ? `
                      <div class="analytics-item">
                        <div class="analytics-label">Form Fill Time</div>
                        <div class="analytics-value">${analytics.formFillTime}s</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>This email was sent from the CIRO Network waitlist form</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Welcome email to the user
  const welcomeEmail = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Welcome to CIRO Network! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CIRO Network</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; background: linear-gradient(45deg, #00d4ff, #ff6b6b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { padding: 40px 30px; }
            .welcome-text { font-size: 18px; color: #495057; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
            .social-links { text-align: center; margin: 30px 0; }
            .social-button { display: inline-block; margin: 5px; padding: 12px 20px; border-radius: 6px; text-decoration: none; color: white; font-weight: 600; }
            .discord { background: #5865F2; }
            .twitter { background: #1DA1F2; }
            .instagram { background: linear-gradient(45deg, #E4405F, #5B51D8); }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
            .highlight { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CIRO Network</div>
              <h1>Welcome to the Future of AI Compute! 🚀</h1>
              <p>You're now on the exclusive waitlist for the next generation of distributed computing</p>
            </div>
            
            <div class="content">
              <div class="welcome-text">
                <p>Hi ${name},</p>
                <p>Welcome to <strong>CIRO Network</strong>! You've just joined an exclusive community of innovators, developers, and compute providers who are building the future of AI infrastructure.</p>
              </div>
              
              <div class="highlight">
                <h2>🎯 What's Next?</h2>
                <p>We'll notify you as soon as we launch, giving you early access to:</p>
                <ul style="text-align: left; display: inline-block;">
                  <li>Distributed GPU computing network</li>
                  <li>Zero-knowledge proof verification</li>
                  <li>Earn rewards by sharing your compute</li>
                </ul>
              </div>
              
              <div class="social-links">
                <h3>Join Our Community</h3>
                <p>Connect with other members and stay updated on our progress:</p>
                
                <a href="https://discord.gg/ciro" class="social-button discord">Join Discord</a>
                <a href="https://twitter.com/cironetwork" class="social-button twitter">Follow on Twitter</a>
                <a href="https://instagram.com/cironetwork" class="social-button instagram">Follow on Instagram</a>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ciro.network" class="cta-button">Visit Our Website</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Thanks for joining the revolution!</p>
              <p><strong>CIRO Network Team</strong></p>
              <p style="font-size: 12px; margin-top: 20px;">
                You received this email because you signed up for the CIRO Network waitlist.<br>
                If you didn't sign up, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  try {
    // Send both emails
    await Promise.all([
      sgMail.send(adminEmail),
      sgMail.send(welcomeEmail)
    ])
    
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error }
  }
} 