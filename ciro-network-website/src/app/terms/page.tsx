'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Scale, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="galactic-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cosmic-glass rounded-2xl p-8 border border-cosmic-cyan/30"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-cosmic-cyan" />
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-white/70 text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cosmic-cyan" />
                1. Acceptance of Terms
              </h2>
              <p className="text-white/80 leading-relaxed mb-4">
                By accessing and using Ciro Network's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-cosmic-cyan" />
                2. Use License
              </h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Permission is granted to temporarily access Ciro Network's services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="text-white/80 leading-relaxed mb-4 list-disc list-inside space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on Ciro Network's services</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-cosmic-cyan" />
                3. Disclaimer
              </h2>
              <p className="text-white/80 leading-relaxed mb-4">
                The materials on Ciro Network's services are provided on an 'as is' basis. Ciro Network makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                In no event shall Ciro Network or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Ciro Network's services, even if Ciro Network or a Ciro Network authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Accuracy of Materials</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                The materials appearing on Ciro Network's services could include technical, typographical, or photographic errors. Ciro Network does not warrant that any of the materials on its services are accurate, complete, or current. Ciro Network may make changes to the materials contained on its services at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Links</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Ciro Network has not reviewed all of the sites linked to its services and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Ciro Network of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Modifications</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Ciro Network may revise these terms of service for its services at any time without notice. By using this service, you are agreeing to be bound by the then current version of these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Governing Law</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-black/40 rounded-lg p-4 border border-cosmic-cyan/20">
                <p className="text-white/90">
                  <strong>Email:</strong> legal@ciro.network<br />
                  <strong>Address:</strong> Ciro Network Foundation<br />
                  <strong>Website:</strong> https://ciro.network
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 