// client/src/pages/privacy-policy.tsx
export function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-14 text-zinc-100">
      <div className="mb-10 border-b border-zinc-800 pb-6">
        <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-md font-semibold text-xs uppercase tracking-wider">
          Legal Documentation
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3 tracking-tight">Privacy Policy</h1>
        <p className="text-zinc-400 text-sm mt-2">Last updated and effective as of: October 2026</p>
      </div>

      <div className="space-y-8 text-zinc-300 leading-relaxed text-base">
        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">01.</span> Introduction & Scope
          </h2>
          <p className="text-zinc-400">
            Welcome to <strong className="text-white">SitecoreSeries</strong> ("we", "our", or "us"). We operate sitecoreseries.com dedicated to technical guides, architectural tutorials, cloud workflows, and industry insights. Protecting your personal data is a priority. This Privacy Policy outlines what information we collect, how it is handled, and your rights regarding your data when you visit or interact with our platform.
          </p>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">02.</span> Information We Collect
          </h2>
          <p className="text-zinc-400">
            We collect minimal information necessary to deliver and secure our services:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li><strong className="text-zinc-200">Voluntary Submissions:</strong> Data provided when you fill out our contact forms (such as your name, email address, and message contents) or subscribe to our newsletter updates.</li>
            <li><strong className="text-zinc-200">Technical Metadata:</strong> Standard web server logs automatically captured by our cloud infrastructure, including IP addresses, browser user-agent strings, referring URLs, and access timestamps.</li>
            <li><strong className="text-zinc-200">Media & Uploads:</strong> Any administrative attachments or images uploaded through our authenticated dashboard are securely routed to cloud object storage (ImgBB CDN) and referenced via database associations.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">03.</span> How We Use Your Information
          </h2>
          <p className="text-zinc-400">
            The data we gather is strictly utilized for core operational purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li>Delivering, maintaining, and improving our technical guides and article delivery systems.</li>
            <li>Responding directly to inquiries submitted through our contact channels.</li>
            <li>Sending scheduled newsletter notifications or updates regarding new content series (with immediate unsubscribe options).</li>
            <li>Monitoring site security, defending against automated web scraping, and mitigating brute-force attacks.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">04.</span> Data Security & Third-Party Services
          </h2>
          <p className="text-zinc-400">
            We implement robust security practices, including token-based admin authentication, strict environment variable management, and HTTPS encryption across all routes. However, no internet transmission is 100% secure. We utilize trusted third-party infrastructure partners (such as Render for hosting, PostgreSQL for database persistence, and ImgBB for cloud image delivery) which adhere to standard industry security frameworks. We never sell, rent, or trade your personal information to third-party marketers.
          </p>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">05.</span> Intellectual Property Rights
          </h2>
          <p className="text-zinc-400">
            All original technical tutorials, code implementations, textual content, layouts, and brand assets hosted on SitecoreSeries are protected under strict copyright laws. Unauthorized scraping, bulk republication, or commercial redistribution of our content without explicit written attribution and consent is strictly forbidden.
          </p>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">06.</span> Policy Updates & Contact
          </h2>
          <p className="text-zinc-400">
            We reserve the right to revise this Privacy Policy at any time. Any changes will be posted directly on this page with an updated revision date. If you have any formal questions or privacy-related concerns regarding SitecoreSeries, you can reach out via our designated contact page.
          </p>
        </section>
      </div>
    </div>
  );
}