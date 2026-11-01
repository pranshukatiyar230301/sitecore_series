// client/src/pages/terms-of-service.tsx
export function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-14 text-zinc-100">
      <div className="mb-10 border-b border-zinc-800 pb-6">
        <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-md font-semibold text-xs uppercase tracking-wider">
          Legal Agreement
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3 tracking-tight">Terms of Service</h1>
        <p className="text-zinc-400 text-sm mt-2">Last updated and effective as of: October 2026</p>
      </div>

      <div className="space-y-8 text-zinc-300 leading-relaxed text-base">
        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">01.</span> Acceptance of Agreement
          </h2>
          <p className="text-zinc-400">
            By accessing, browsing, or utilizing <strong className="text-white">SitecoreSeries</strong> (sitecoreseries.com), you signify your formal agreement to comply with and be bound by these Terms of Service. If you disagree with any portion of these provisions, you must immediately terminate your use of this website.
          </p>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">02.</span> Strict Copyright & Intellectual Property
          </h2>
          <p className="text-zinc-400">
            Every piece of original content published on SitecoreSeries—including architectural blueprints, tutorial text, code repositories, UI components, graphics, and logos—is the exclusive intellectual property of the site authors and operators. 
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li>You may view, read, and reference our tutorials for personal or educational development.</li>
            <li>Commercial redistribution, automated screen scraping, framing, or unauthorized syndication of our articles is strictly prohibited and subject to legal action.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">03.</span> Acceptable User Conduct
          </h2>
          <p className="text-zinc-400">
            When interacting with SitecoreSeries, you agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li>Launch automated bots, denial-of-service scripts, or excessive requests designed to disrupt or overload our hosting server infrastructure.</li>
            <li>Attempt unauthorized breach, vulnerability scanning, or brute-force access against our administrative API endpoints.</li>
            <li>Submit fraudulent, abusive, or malicious payloads through our contact forms or newsletter registration boxes.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">04.</span> Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p className="text-zinc-400">
            All code snippets, technical configurations, architectural guides, and troubleshooting advice published on SitecoreSeries are provided <strong className="text-zinc-200">"as is"</strong> without warranty of any kind, either express or implied. 
          </p>
          <p className="text-zinc-400">
            We assume zero legal liability or responsibility for production errors, server downtime, data loss, or system instability resulting from the direct application of code or strategies outlined on this platform. Developers and engineers are solely responsible for testing code in safe staging environments prior to production deployment.
          </p>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">05.</span> External Links & Third-Party Resources
          </h2>
          <p className="text-zinc-400">
            Our articles may reference third-party software, libraries, documentation links, or external tools. We hold no control over, and assume no liability for, the content, privacy policies, or practices of any third-party websites or services.
          </p>
        </section>

        <section className="space-y-3 bg-[#0a0f1d] p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">06.</span> Modifications to Terms
          </h2>
          <p className="text-zinc-400">
            We retain the right to modify these Terms of Service at our sole discretion at any time. Continued access to or use of sitecoreseries.com following any adjustments indicates your full acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}