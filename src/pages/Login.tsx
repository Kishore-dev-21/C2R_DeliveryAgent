import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(agentId, password);
    setLoading(false);
    if (success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid Agent ID or Password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="animate-fade-in w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated mb-4">
            <Fingerprint className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Click2Ration</h1>
          <p className="text-sm text-muted-foreground mt-1">Delivery Agent Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-card-foreground mb-1">Welcome Back</h2>
          <p className="text-xs text-muted-foreground mb-6">Sign in to start your deliveries</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Agent ID</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="e.g. AGT001"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-elevated hover:opacity-90 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">Quick Demo Access</p>
            <button
              type="button"
              onClick={() => {
                setAgentId("AGT001");
                setPassword("click2ration");
                toast.info("Demo credentials filled — tap Sign In");
              }}
              className="w-full py-2.5 rounded-xl border-2 border-primary text-primary text-xs font-semibold hover:bg-primary/10 transition-all"
            >
              Fill Demo Credentials
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Agent ID: <span className="font-semibold text-foreground">AGT001</span> &nbsp;|&nbsp; Password: <span className="font-semibold text-foreground">click2ration</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
