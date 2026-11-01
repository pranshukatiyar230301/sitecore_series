// client/src/pages/privacy-policy.tsx
export function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold font-display text-red-500 mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-zinc-400 leading-relaxed text-sm">
        <p className="text-zinc-500 text-xs font-mono">Last updated: October 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Introduction & Acceptance</h2>
          <p>
            Welcome to SitecoreSeries ("we," "our," or "us"). By accessing or using sitecoreseries.com, you agree to comply with and be bound by this Privacy Policy. If you do not agree with any part of these terms, you must discontinue use of this website immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Data Collection</h2>
          <p>
            We collect minimal information necessary to operate this platform. This includes voluntary submissions such as contact form inquiries, newsletter subscriptions, and standard server technical metadata (IP addresses, browser types, and access timestamps) handled automatically via our hosting and database infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Use of Information</h2>
          <p>
            Information collected is strictly utilized for site functionality, communicating responses to direct inquiries, delivering requested newsletter content, and maintaining platform security. We do not sell, trade, or rent personal identification information to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Intellectual Property & Copyright Notice</h2>
          <p>
            All original articles, guides, code snippets, branding elements, graphics, and text materials published on SitecoreSeries are the exclusive intellectual property of the site author and operators unless explicitly stated otherwise. Unauthorized copying, redistribution, republication, or commercial exploitation of any content from this site without express written permission is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. External Links Disclaimer</h2>
          <p>
            Our platform may contain links to external third-party websites or APIs (such as cloud media hosts). We assume no responsibility or legal liability for the privacy practices, terms of use, or content of those independent external sites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">6. Policy Updates</h2>
          <p>
            We reserve the right to modify, amend, or change this Privacy Policy at any time without prior individual notice. Continued use of sitecoreseries.com following any adjustments constitutes your formal acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}