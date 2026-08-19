import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Eye, EyeOff, ShieldCheck, Languages } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(agentId, password);
    setLoading(false);
    if (result.success) {
      toast.success("Authenticated successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Invalid Agent ID or Password");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-foreground">
      {/* Top language toggle */}
      <div className="w-full max-w-sm flex justify-end mb-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold hover:border-primary transition-all text-muted-foreground hover:text-foreground"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{language === "en" ? "தமிழ்" : "English"}</span>
        </button>
      </div>

      <div className="animate-fade-in w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated mb-3 border border-primary-foreground/20">
            <Fingerprint className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("app_title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("portal_subtitle")}</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4 animate-slide-up">
          <div>
            <h2 className="text-base font-bold text-foreground">Agent Sign In</h2>
            <p className="text-xs text-muted-foreground">Access your assigned doorstep delivery route</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Agent Identifier</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="e.g. AGT001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Security Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-xs shadow-elevated hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Terminal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-border space-y-2">
            <p className="text-[10px] text-muted-foreground text-center font-semibold uppercase tracking-wider">
              Demonstration Access
            </p>
            <button
              type="button"
              onClick={() => {
                setAgentId("AGT001");
                setPassword("click2ration");
                toast.info("Demo credentials populated: AGT001");
              }}
              className="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all"
            >
              Auto-Fill Demo Credentials
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Agent ID: <strong className="text-foreground">AGT001</strong> | Password: <strong className="text-foreground">click2ration</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
