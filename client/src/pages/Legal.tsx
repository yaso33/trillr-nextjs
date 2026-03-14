import type { FC } from 'react'

const LegalPage: FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-strong p-6 sm:p-8 rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 glow-text text-primary">
            Legal Information
          </h1>

          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-primary">Privacy Policy</h2>
            <div className="prose prose-invert max-w-none">
              <p>
                At TINAR, we believe that privacy is a fundamental right. This policy outlines how
                we handle your data and ensure your digital safety.
              </p>
              <h3 className="text-xl font-semibold text-primary">Information We Collect</h3>
              <p>
                We collect minimal data to provide a seamless experience, including account info
                (name, email), content you post, and technical data like IP addresses for security
                purposes.
              </p>
              <h3 className="text-xl font-semibold text-primary">How We Use Your Data</h3>
              <p>
                Your information is used to personalize your feed, improve app features, and send
                important security updates.
              </p>
              <h3 className="text-xl font-semibold text-primary">Data Protection & Sharing</h3>
              <p>
                We never sell your personal data to third parties. All sensitive information is
                encrypted using advanced security protocols.
              </p>
              <h3 className="text-xl font-semibold text-primary">Your Rights</h3>
              <p>
                You have full control. You can edit, download, or delete your data at any time
                through your account settings.
              </p>
              <h3 className="text-xl font-semibold text-primary">Updates</h3>
              <p>
                We may update this policy periodically to reflect technical or legal changes.
                Significant updates will be notified via the app.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-primary">
              Terms of Service
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-muted-foreground">Last Updated: January 2026</p>
              <p>
                Welcome to TINAR. By accessing or using our platform, you agree to be bound by these
                terms. Please read them carefully.
              </p>

              <h3 className="text-xl font-semibold text-primary">1. Acceptance of Terms</h3>
              <p>
                By creating an account or using the TINAR app/website, you enter into a legally
                binding contract with TINAR. If you do not agree to these terms, you may not access
                our services.
              </p>

              <h3 className="text-xl font-semibold text-primary">2. Eligibility</h3>
              <p>
                You must be at least 13 years old (or the minimum legal age in your country) to use
                TINAR.
              </p>
              <p>
                You must provide accurate and up-to-date information during the registration
                process.
              </p>

              <h3 className="text-xl font-semibold text-primary">
                3. User Conduct & Responsibilities
              </h3>
              <p>
                You are responsible for all activity that occurs under your account. To maintain a
                safe community, you agree NOT to:
              </p>
              <ul>
                <li>Post content that is illegal, hateful, threatening, or harmful.</li>
                <li>Harass, abuse, or impersonate other users.</li>
                <li>
                  Upload viruses or malicious code to interfere with the platform’s functionality.
                </li>
                <li>Use the platform for unauthorized commercial communications (spam).</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary">4. Content Ownership & Rights</h3>
              <p>
                <strong>Your Content:</strong> You retain all ownership rights to the text, photos,
                and videos you post on TINAR.
              </p>
              <p>
                <strong>Our License:</strong> By posting content, you grant TINAR a non-exclusive,
                royalty-free, worldwide license to host, distribute, and display your content to
                other users within the app.
              </p>

              <h3 className="text-xl font-semibold text-primary">5. Intellectual Property</h3>
              <p>
                All graphics, logos, designs, and software associated with TINAR are the exclusive
                property of TINAR. You may not use our branding without prior written consent.
              </p>

              <h3 className="text-xl font-semibold text-primary">6. Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time, without
                notice, if we believe you have violated these Terms or pose a risk to the community.
              </p>

              <h3 className="text-xl font-semibold text-primary">7. Limitation of Liability</h3>
              <p>
                TINAR is provided "as is" without any warranties. We are not responsible for
                user-generated content or any damages resulting from your use of the platform.
              </p>

              <h3 className="text-xl font-semibold text-primary">8. Governing Law</h3>
              <p>
                These terms are governed by the laws of the jurisdiction in which TINAR is
                headquartered, without regard to conflict of law principles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalPage
