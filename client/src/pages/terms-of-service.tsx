// client/src/pages/terms-of-service.tsx
export function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold font-display text-red-500 mb-6">Terms of Service</h1>
      <div className="space-y-6 text-zinc-400 leading-relaxed text-sm">
        <p className="text-zinc-500 text-xs font-mono">Last updated: October 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing and using SitecoreSeries (sitecoreseries.com), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not accept these terms in full, you must cease using the website immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Intellectual Property & Strict Copyright</h2>
          <p>
            All content published on this platform—including but not limited to technical articles, architectural guides, code snippets, graphics, logos, and UI layouts—is the exclusive property of SitecoreSeries and its creator. Unauthorized copying, scraping, republication, redistribution, or commercial use of any material without express written consent constitutes a direct violation of copyright laws and will be legally pursued.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. User Conduct & Prohibited Activities</h2>
          <p>
            You agree not to misuse this platform, attempt unauthorized access to administrative controls, overload or disrupt our infrastructure, scrape content via automated bots without permission, or submit malicious data through contact forms or newsletter subscriptions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Disclaimer of Warranties & Liability</h2>
          <p>
            The guides, code examples, and insights provided on SitecoreSeries are for informational and educational purposes only. All content is provided "as is" without any warranties of any kind, express or implied. We assume no legal liability or responsibility for any errors, system downtime, bugs, or technical damages resulting from the implementation of code or advice found on this site.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Modifications to Terms</h2>
          <p>
            We reserve the right to alter, modify, or update these Terms of Service at any time at our sole discretion. Continued use of the website following any changes signifies your binding acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}