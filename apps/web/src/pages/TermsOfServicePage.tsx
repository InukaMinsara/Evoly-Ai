import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldAlert, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'immaster2024@gmail.com';

  useEffect(() => {
    document.title = 'Terms of Service | EvolyAI';
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
              to="/privacy"
              className="text-xs font-medium text-slate-400 hover:text-evoly-400 transition-colors"
            >
              Privacy Policy
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
            <FileText className="w-3.5 h-3.5" />
            <span>Official Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date &amp; Last Updated: <span className="text-slate-200 font-medium">September 13, 2026</span>
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and <strong className="text-white">EvolyAI</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), governing your access to and use of our platform hosted at{' '}
            <a href="https://evolyai.netlify.app/" className="text-evoly-400 hover:underline font-medium">https://evolyai.netlify.app/</a>.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            By accessing or using EvolyAI, you confirm that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use or access the service.
          </p>
        </div>

        {/* Highlight Callout: Engineering & Safety Disclaimer */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-surface-card to-surface-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-semibold text-base">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Important Engineering &amp; Hardware Safety Disclaimer</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            EvolyAI provides AI-generated source code, microcontroller suggestions, and schematic layouts for engineering and educational reference. <strong className="text-white">Always independently verify circuit wiring, voltage levels, component pinouts, and code logic</strong> before flashing microcontrollers or applying power to real physical hardware, lithium batteries, motors, or mains electricity.
          </p>
        </div>

        {/* Section 1: Description of Service */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">1</span>
            Description of the Service
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            EvolyAI is a robotics engineering and software acceleration platform. Key platform features include:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-1.5">
            <li>AI-assisted firmware development, compilation verification, and syntax debugging.</li>
            <li>Robotics component catalogs, hardware pinout mapping, and bill-of-materials generation.</li>
            <li>Circuit simulation, wiring lab utilities, and schematic visualization.</li>
            <li>Integrated creator studios for YouTube analytics and Google Search Console performance tracking upon user authorization.</li>
          </ul>
        </section>

        {/* Section 2: Account Registration & Google Authentication */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">2</span>
            User Accounts &amp; Authentication
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            You may access parts of EvolyAI through Google OAuth / Sign-In or other authentication providers:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-1.5">
            <li>You agree to provide accurate, current, and complete account information during the authorization process.</li>
            <li>You are responsible for safeguarding your credentials and any devices used to access your EvolyAI account.</li>
            <li>You agree to notify us immediately if you suspect any unauthorized access to your account or session.</li>
          </ul>
        </section>

        {/* Section 3: Acceptable Use Policy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">3</span>
            Acceptable Use Policy
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            When accessing or using EvolyAI, you agree that you will NOT:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-1.5">
            <li>Use the service to design, build, or deploy weapons, explosive devices, or hazardous systems intended to cause bodily harm.</li>
            <li>Attempt to probe, scan, test the vulnerability of, or breach any system or network security measures.</li>
            <li>Interfere with, disrupt, or place an unreasonable load on the service infrastructure or API rate limits.</li>
            <li>Attempt to decompile, reverse engineer, or extract proprietary algorithms from EvolyAI.</li>
            <li>Use the service to transmit malware, viruses, ransomware, or unauthorized commercial spam.</li>
          </ul>
        </section>

        {/* Section 4: AI-Generated Content Disclaimer */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">4</span>
            AI-Generated Content &amp; Advisory Disclaimer
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            EvolyAI utilizes machine learning and generative artificial intelligence models (such as Groq and Gemini) to synthesize code, circuit diagrams, and technical responses.
          </p>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Informational Nature:</strong> AI responses may occasionally contain inaccuracies, outdated library syntax, or non-optimal pin assignments. EvolyAI does not warrant that AI-generated code will run error-free or that circuit schematics are suitable for commercial safety certifications.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">User Responsibility:</strong> You assume full responsibility and risk for inspecting, simulating, testing, and verifying all AI outputs prior to deployment.
            </p>
          </div>
        </section>

        {/* Section 5: Intellectual Property */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">5</span>
            Intellectual Property Rights
          </h2>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-2">
            <li>
              <strong>Your Content:</strong> You retain all intellectual property rights in and to your original source code, firmware sketches, circuit designs, and projects created using EvolyAI.
            </li>
            <li>
              <strong>Platform IP:</strong> EvolyAI, its source code, UI design, brand assets, logos, and proprietary features are the exclusive property of EvolyAI and its licensors, protected by copyright and intellectual property laws.
            </li>
          </ul>
        </section>

        {/* Section 6: Third-Party Integrations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">6</span>
            Third-Party Integrations &amp; APIs
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The platform provides optional integrations with third-party services, including Google OAuth, YouTube Data API, Google Search Console, and GitHub:
          </p>
          <ul className="text-sm text-slate-300 list-disc pl-6 space-y-1.5">
            <li>Your use of Google services via EvolyAI is subject to the <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-evoly-400 hover:underline">Google Terms of Service</a>.</li>
            <li>Your use of GitHub features is subject to the <a href="https://docs.github.com/site-policy/github-terms/github-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-evoly-400 hover:underline">GitHub Terms of Service</a>.</li>
            <li>We do not control and are not responsible for the availability, uptime, or policies of external third-party services.</li>
          </ul>
        </section>

        {/* Section 7: Limitation of Liability */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">7</span>
            Limitation of Liability &amp; Disclaimer of Warranties
          </h2>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3 text-xs sm:text-sm text-slate-400">
            <p className="uppercase tracking-wider font-mono text-slate-300 text-[11px]">
              Provided &ldquo;As Is&rdquo; and &ldquo;As Available&rdquo;
            </p>
            <p className="leading-relaxed">
              EVOLYAI AND ITS AFFILIATES, LICENSORS, AND SUPPLIERS DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="leading-relaxed">
              IN NO EVENT SHALL EVOLYAI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, HARDWARE DAMAGE, DATA CORRUPTION, OR BUSINESS INTERRUPTION ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.
            </p>
          </div>
        </section>

        {/* Section 8: Termination */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">8</span>
            Termination
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We reserve the right to suspend or terminate your access to EvolyAI at our discretion, without prior notice, if you breach these Terms or engage in activities that threaten platform security, abuse resources, or violate applicable laws. You may cease using the platform and disconnect your integrations at any time.
          </p>
        </section>

        {/* Section 9: Changes to Terms */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">9</span>
            Modifications to Terms
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We may modify these Terms at any time by posting the revised version on this page with an updated &ldquo;Effective Date.&rdquo; Your continued use of the platform following any modifications constitutes your acknowledgment and agreement to the revised Terms.
          </p>
        </section>

        {/* Section 10: Contact Information */}
        <section className="space-y-4 border-t border-surface-border pt-8">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface-card border border-surface-border text-xs flex items-center justify-center font-mono text-evoly-400">10</span>
            Contact Information
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            If you have questions, inquiries, or legal concerns regarding these Terms of Service, please reach out:
          </p>
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex items-center gap-3">
            <Mail className="w-5 h-5 text-evoly-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Official Legal &amp; Inquiries Email</p>
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
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-evoly-400 hover:text-evoly-300 transition-colors font-medium">
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
