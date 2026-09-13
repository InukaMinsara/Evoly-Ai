import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'immaster2024@gmail.com';

  useEffect(() => {
    document.title = 'Privacy Policy | EvolyAI';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-y-auto custom-scrollbar text-slate-300">
      {/* ── Top Navigation Bar ── */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-xs font-medium text-slate-400 hover:text-evoly-400 transition-colors"
            >
              Terms of Service
            </Link>
            <div className="w-px h-4 bg-surface-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center shadow-md shadow-evoly-600/20">
                <span className="text-[10px] font-bold text-white select-none">EV</span>
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">EvolyAI</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Header Section */}
        <div className="space-y-4 border-b border-surface-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-evoly-600/10 text-evoly-400 border border-evoly-600/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Privacy Document</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date &amp; Last Updated: <span className="text-slate-200 font-medium">September 13, 2026</span>
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome to <strong className="text-white">EvolyAI</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible at{' '}
            <a href="https://evolyai.netlify.app/" className="text-evoly-400 hover:underline font-medium">https://evolyai.netlify.app/</a>.
            EvolyAI is an engineering and artificial intelligence platform designed to assist developers, engineers, and creators with microcontroller firmware generation, circuit simulation, hardware debugging, and creator intelligence.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            We are deeply committed to protecting your personal data and ensuring transparency in all our data handling practices. This Privacy Policy explains what information we collect, how we process and safeguard it, and your rights regarding your data when using EvolyAI.
          </p>
        </div>

        {/* Highlight Callout: Google User Data */}
        <div className="rounded-xl border border-evoly-600/30 bg-gradient-to-r from-evoly-950/40 via-surface-card to-surface-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-semibold text-base">
            <Lock className="w-5 h-5 text-evoly-400" />
            <span>Google API Services User Data Policy &amp; Limited Use Disclosure</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            EvolyAI&apos;s use and transfer to any other app of information received from Google APIs adheres strictly to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-evoly-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Google API Services User Data Policy
              <ExternalLink className="w-3 h-3" />
            </a>, including the Limited Use requirements.
          </p>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-2 pl-4 list-disc marker:text-evoly-400">
            <li><strong className="text-white">Never Sold:</strong> We NEVER sell, rent, or trade Google user data, email addresses, or personal information to data brokers, advertisers, or any third parties.</li>
            <li><strong className="text-white">No Advertising:</strong> Google user data is NEVER used for behavioral targeting, profiling, or commercial advertising.</li>
            <li><strong className="text-white">No AI Model Training:</strong> Information received via Google APIs is NEVER used to train, retrain, or fine-tune generalized artificial intelligence or machine learning models.</li>
          </ul>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">1</span>
            Information We Collect
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We collect only the minimum amount of information necessary to provide, secure, and operate EvolyAI.
          </p>

          <div className="space-y-4 pl-2 sm:pl-4">
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                A. Google OAuth &amp; Authentication Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                When you sign in or connect your Google account to EvolyAI via Google OAuth, you authorize us to receive:
              </p>
              <ul className="text-xs sm:text-sm text-slate-300 list-disc pl-5 space-y-1">
                <li><strong>Profile Information:</strong> Your display name, email address, avatar image URL, and Google subject ID to identify and maintain your account session.</li>
                <li><strong>OAuth Tokens:</strong> Encrypted access tokens and refresh tokens necessary to perform actions you specifically authorize (such as YouTube channel analytics or Google Search Console performance reports). Tokens are stored securely on backend infrastructure and are never exposed to client-side code.</li>
                <li><strong>Consented Scopes:</strong> Only scopes explicitly granted by you during the Google consent screen (e.g., <code>openid</code>, <code>email</code>, <code>profile</code>, <code>youtube.readonly</code>, <code>webmasters.readonly</code>).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                B. User-Provided Content &amp; Project Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                When interacting with the platform, you provide:
              </p>
              <ul className="text-xs sm:text-sm text-slate-300 list-disc pl-5 space-y-1">
                <li>Chat messages, engineering prompts, and technical questions submitted to the AI assistant.</li>
                <li>Firmware source code, microcontroller files (such as <code>.ino</code>, <code>.cpp</code>, <code>.h</code>), and wiring schematics.</li>
                <li>Local workspace files and editor preferences, stored client-side in your browser&apos;s <code>localStorage</code>.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                C. Technical &amp; Diagnostic Information
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                To guarantee reliable operation, our servers automatically log standard network requests:
              </p>
              <ul className="text-xs sm:text-sm text-slate-300 list-disc pl-5 space-y-1">
                <li>Browser user-agent, operating system, timestamp, and HTTP status codes.</li>
                <li>Security logs to prevent distributed denial-of-service (DDoS) and brute-force attacks.</li>
                <li>We do NOT use cross-site tracking cookies or advertising tracking pixels.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">2</span>
            How We Use Your Information
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We use collected data solely for the following explicit purposes:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-2">
            <li><strong>Service Delivery:</strong> Authenticating user accounts, managing active sessions, and storing project preferences.</li>
            <li><strong>AI Engineering Operations:</strong> Processing user queries through authorized AI model APIs (such as Groq and Gemini) to generate firmware, debugging solutions, and circuit diagrams.</li>
            <li><strong>Requested Integrations:</strong> Displaying authorized YouTube channel statistics or Search Console site performance when you connect those services.</li>
            <li><strong>Platform Protection:</strong> Enforcing rate limits, detecting unauthorized access, and securing system resources.</li>
          </ul>
        </section>

        {/* Section 3: Third-Party Service Providers Actually Integrated */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">3</span>
            Third-Party Services &amp; API Providers
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            EvolyAI integrates exclusively with verified infrastructure providers to deliver its functionality:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <p className="text-xs font-semibold text-white">Google LLC</p>
              <p className="text-xs text-slate-400 mt-1">Google OAuth, Gemini AI, YouTube Data API, Google Search Console API.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <p className="text-xs font-semibold text-white">Groq, Inc.</p>
              <p className="text-xs text-slate-400 mt-1">Primary high-speed LPU inference for AI engineering chat and code generation.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <p className="text-xs font-semibold text-white">NVIDIA Corporation / Pollinations AI</p>
              <p className="text-xs text-slate-400 mt-1">Visual generative models for schematic illustration and image generation.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <p className="text-xs font-semibold text-white">GitHub, Inc.</p>
              <p className="text-xs text-slate-400 mt-1">Repository inspection and issue management when connected by user.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border sm:col-span-2">
              <p className="text-xs font-semibold text-white">Netlify, Inc.</p>
              <p className="text-xs text-slate-400 mt-1">Secure static web hosting and global content delivery network (CDN) at evolyai.netlify.app.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Sharing & Disclosure */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">4</span>
            Data Sharing &amp; Disclosure Policy
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We do NOT sell, rent, or trade your personal information or Google user data under any circumstances. Information is only shared under the following limited conditions:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-2">
            <li><strong>Service Execution:</strong> With verified API providers (e.g., Groq, Google) strictly to process your direct engineering queries.</li>
            <li><strong>Legal Requirements:</strong> When required by valid legal process, regulation, or enforceable governmental authority.</li>
            <li><strong>Security Protection:</strong> To protect the rights, property, and safety of EvolyAI, our users, and the public from fraudulent or abusive conduct.</li>
          </ul>
        </section>

        {/* Section 5: Data Retention & Security */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">5</span>
            Data Storage, Retention &amp; Security
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We maintain stringent technical protections for all user data:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-2">
            <li><strong>Encryption in Transit:</strong> All communication between your device and EvolyAI is encrypted via Transport Layer Security (TLS 1.2/1.3 / HTTPS).</li>
            <li><strong>Token Isolation:</strong> OAuth tokens are isolated on backend servers and are never transmitted to client browsers.</li>
            <li><strong>Retention Limits:</strong> Account records are kept only as long as your account remains active. Transient prompt and inference data is not permanently preserved.</li>
          </ul>
        </section>

        {/* Section 6: User Rights & Data Deletion */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">6</span>
            User Rights &amp; Account Deletion
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            You hold complete control over your data, credentials, and third-party authorizations:
          </p>
          <div className="space-y-3 pl-2 sm:pl-4">
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <h3 className="text-sm font-semibold text-white">How to Disconnect or Delete Your Data</h3>
              <ul className="text-xs sm:text-sm text-slate-300 list-disc pl-5 space-y-2">
                <li>
                  <strong>Revoke Google Access:</strong> You can revoke EvolyAI&apos;s access to your Google account at any time via{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-evoly-400 hover:underline inline-flex items-center gap-1"
                  >
                    Google Account Permissions
                    <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>
                  <strong>Disconnect via Settings:</strong> You can disconnect your Google, YouTube, or GitHub accounts at any time from the{' '}
                  <Link to="/settings" className="text-evoly-400 hover:underline">
                    Settings Page
                  </Link>.
                </li>
                <li>
                  <strong>Request Complete Data Deletion:</strong> You may request complete deletion of your account and all associated stored records by emailing us at{' '}
                  <a href={'mailto:' + contactEmail} className="text-evoly-400 hover:underline font-medium">
                    {contactEmail}
                  </a>. All records will be permanently deleted within 30 days of confirmation.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 7: Children's Privacy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">7</span>
            Children&apos;s Privacy
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            EvolyAI is intended for developers, engineers, and students aged 13 and older (or 16 in certain jurisdictions). We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately for prompt deletion.
          </p>
        </section>

        {/* Section 8: Changes to this Policy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">8</span>
            Changes to this Privacy Policy
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We may revise this Privacy Policy periodically to reflect technological updates or legal requirements. Material modifications will be reflected with an updated Effective Date at the top of this document.
          </p>
        </section>

        {/* Section 9: Contact Information */}
        <section className="space-y-4 border-t border-surface-border pt-8">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">9</span>
            Contact Information
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            For questions, inquiries, or data requests regarding this Privacy Policy, please contact our administrator:
          </p>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex items-center gap-3">
            <Mail className="w-5 h-5 text-evoly-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Official Contact &amp; Privacy Inquiries</p>
              <a
                href={'mailto:' + contactEmail}
                className="text-sm font-medium text-white hover:text-evoly-400 transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border bg-surface-card/40 mt-auto py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EvolyAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <Link to="/privacy" className="text-evoly-400 hover:text-evoly-300 transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <a href={'mailto:' + contactEmail} className="hover:text-slate-300 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
