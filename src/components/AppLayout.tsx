import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  History,
  Bell,
  BarChart3,
  LogOut,
  Fingerprint,
  Languages,
  ShieldCheck,
  Building2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";

const AppLayout = () => {
  const { agent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: t("nav_home"), badge: 0 },
    { path: "/deliveries", icon: Package, label: t("nav_deliveries"), badge: 0 },
    { path: "/history", icon: History, label: t("nav_history"), badge: 0 },
    { path: "/notifications", icon: Bell, label: t("nav_notifications"), badge: unreadCount },
    { path: "/performance", icon: BarChart3, label: t("nav_performance"), badge: 0 },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Top Header */}
      <header className="gradient-primary px-4 py-3 flex items-center justify-between shadow-elevated sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center border border-primary-foreground/30 shadow-inner">
            <Fingerprint className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-primary-foreground">{t("app_title")}</h1>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/30">
                Agent
              </span>
            </div>
            <p className="text-[10px] text-primary-foreground/80 font-medium">
              {agent?.name} ({agent?.agentId})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-xs font-semibold transition-all border border-primary-foreground/20"
            title="Toggle English / தமிழ்"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === "en" ? "தமிழ்" : "English"}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground transition-all border border-primary-foreground/20"
            title={t("logout")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Assigned Hub Banner */}
      <div className="bg-card border-b border-border/80 px-4 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-medium text-foreground">{t("hub_label")}:</span>
          <span className="truncate">{agent?.assignedHub}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-success font-semibold shrink-0 ml-2">
          <ShieldCheck className="w-3 h-3 text-success" />
          <span>Zero-Trust Auth</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 max-w-2xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Bottom Sticky Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-card z-30">
        <div className="max-w-2xl mx-auto flex justify-around py-1.5 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                  isActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.badge > 0 && (
                  <span className="absolute 0 top-0.5 right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <span className="text-[9px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
