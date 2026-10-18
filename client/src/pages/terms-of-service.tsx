// client/src/pages/terms-of-service.tsx
export function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold font-display text-red-500 mb-6">Terms of Service</h1>
      <div className="space-y-4 text-zinc-400 leading-relaxed text-sm">
        <p>Last updated: October 2026</p>
        <p>By accessing SitecoreSeries, you agree to abide by these terms of service and all applicable laws...</p>
        {/* Add your terms text here */}
      </div>
    </div>
  );
}