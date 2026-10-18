import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff, KeyRound, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { setAdminToken, isAdminLoggedIn } from "@/lib/admin";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Stores error message for direct display

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setLocation("/admin");
    }
  }, [setLocation]);

  if (isAdminLoggedIn()) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(""); // Clear previous errors on submission

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const errorText = "Incorrect password. Please try again.";
        setErrorMessage(errorText); // Display error right on the form
        toast({
          title: "Access Denied",
          description: errorText,
          variant: "destructive",
        });
        setSubmitting(false); // Explicitly stop loading state
        return;
      }

      const { token } = await res.json();
      setAdminToken(token);
      toast({ title: "Welcome back, Admin!", description: "Successfully authenticated." });
      setLocation("/admin");
    } catch {
      const connError = "Could not communicate with the server.";
      setErrorMessage(connError);
      toast({
        title: "Connection Error",
        description: connError,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Soft, Eye-Friendly Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Container Card */}
      <div className="relative z-10 w-full max-w-md bg-[#131B2A]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 text-xs font-medium mb-3 border border-slate-700/50">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>SitecoreSeries Admin</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Please enter your password to access the administrative dashboard.
          </p>
        </div>

        {/* Inline Error Warning Message Box */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase flex items-center justify-between ml-0.5">
              <span>Password</span>
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
            </label>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock className="h-4 w-4" />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(""); // Clear error on user edit
                }}
                placeholder="Enter password"
                className={`w-full pl-11 pr-12 py-3.5 text-sm rounded-xl border bg-[#0B0F17]/70 text-slate-100 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-500 ${
                  errorMessage
                    ? "border-red-500/80 focus:ring-red-500/30 focus:border-red-500"
                    : "border-slate-700/70 focus:ring-indigo-500/40 focus:border-indigo-500/80"
                }`}
                required
                autoFocus
                data-testid="input-admin-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all"
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl h-12 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all duration-200"
            data-testid="button-admin-login"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Sign In to Portal"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}