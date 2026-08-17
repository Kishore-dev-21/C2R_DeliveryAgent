import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, LogOut, Fingerprint, ShieldAlert } from "lucide-react";
import { useFraud } from "@/context/FraudContext";

const AppLayout = () => {
  const { agent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { pendingCount } = useFraud();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Home", badge: 0 },
    { path: "/deliveries", icon: Package, label: "Deliveries", badge: 0 },
    { path: "/fraud-alerts", icon: ShieldAlert, label: "Alerts", badge: pendingCount },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-primary px-4 py-3 flex items-center justify-between shadow-elevated">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-primary-foreground">Click2Ration</h1>
            <p className="text-[10px] text-primary-foreground/70">{agent?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-card">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
