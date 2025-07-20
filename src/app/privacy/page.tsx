export default function PrivacyPolicy() {
  return (
    <div className="galactic-bg min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="cosmic-glass rounded-2xl p-8 border border-cosmic-cyan/30">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <p className="mb-4">
                When you visit our website and join our waitlist, we may collect the following information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personal Information:</strong> Name, email address, company name</li>
                <li><strong>Geographical Data:</strong> Country, region, city, timezone (derived from IP address)</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device type, screen resolution</li>
                <li><strong>Usage Analytics:</strong> Time spent on site, pages visited, form interactions</li>
                <li><strong>Marketing Data:</strong> Referrer information, UTM parameters, marketing channel</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process your waitlist application</li>
                <li>Send you updates about our product launch</li>
                <li>Improve our website and user experience</li>
                <li>Analyze user behavior and preferences</li>
                <li>Optimize our marketing campaigns</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Storage and Security</h2>
              <p className="mb-4">
                Your data is stored securely using Supabase, a trusted cloud database provider. 
                We implement industry-standard security measures to protect your information 
                from unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience and collect 
                analytics data. You can control cookie settings through your browser preferences 
                or our cookie consent banner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
              <p className="mb-4">
                We may use third-party services for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Database storage and analytics (Supabase)</li>
                <li>Geographical data (IP geolocation services)</li>
                <li>Website analytics</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies and data handling practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this privacy policy or how we handle your data, 
                please contact us at:
              </p>
              <div className="bg-black/40 rounded-lg p-4">
                <p className="text-cosmic-cyan">Email: privacy@cironetwork.com</p>
                <p className="text-cosmic-cyan">Discord: discord.gg/ciro</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Updates to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                significant changes by posting the new policy on this page and updating the 
                "Last Updated" date.
              </p>
              <p className="mt-4 text-sm text-white/60">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <a 
              href="/"
              className="inline-flex items-center gap-2 text-cosmic-cyan hover:text-cosmic-cyan/80 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 