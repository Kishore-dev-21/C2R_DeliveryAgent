import { useAuth } from "@/context/AuthContext";
import { useDeliveries } from "@/context/DeliveryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  Clock,
  Compass,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Navigation,
  FileCheck2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const Dashboard = () => {
  const { agent } = useAuth();
  const { deliveries, activeTask, stats, triggerDemoScenario, resetDemoQueue } = useDeliveries();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const completionPercent = stats.totalAssigned > 0
    ? Math.round((stats.completed / stats.totalAssigned) * 100)
    : 0;

  const recentCompleted = deliveries.filter((d) => d.status === "DELIVERED").slice(0, 3);

  const handleTriggerScenario = (scenario: "CASE_1_NORMAL" | "CASE_2_ADDITIONAL_VERIFICATION" | "CASE_3_ADMIN_HOLD") => {
    const orderId = triggerDemoScenario(scenario);
    if (scenario === "CASE_1_NORMAL") {
      toast.info("Demo Activated: Case 1 - Normal verification order initialized.");
    } else if (scenario === "CASE_2_ADDITIONAL_VERIFICATION") {
      toast.warning("Demo Activated: Case 2 - Central AI flagged behavioural anomaly; additional verification required.");
    } else {
      toast.error("Demo Activated: Case 3 - Central AI flagged administrative hold; shop admin review required.");
    }
    navigate(`/deliveries`);
  };

  const handleResetQueue = () => {
    resetDemoQueue();
    toast.success("Delivery roster reset to initial state.");
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("greeting_prefix")} {agent?.name?.split(" ")[0]}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("daily_overview")}</p>
        </div>
        <div className="text-right">
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {new Date().toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>

      {/* Synthetic Demo Scenarios Control Panel */}
      <div className="bg-card border border-primary/20 rounded-2xl p-3.5 shadow-card">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-card-foreground">{t("quick_demo_cases")}</h3>
          </div>
          <button
            onClick={handleResetQueue}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            title={t("demo_reset_btn")}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t("demo_reset_btn")}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleTriggerScenario("CASE_1_NORMAL")}
            className="text-left px-2.5 py-2 rounded-xl bg-success/10 hover:bg-success/20 border border-success/20 transition-all text-xs"
          >
            <p className="font-bold text-success text-[11px]">Case 1: Normal</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Low behavioural risk, standard OTP/Bio</p>
          </button>
          <button
            onClick={() => handleTriggerScenario("CASE_2_ADDITIONAL_VERIFICATION")}
            className="text-left px-2.5 py-2 rounded-xl bg-warning/10 hover:bg-warning/20 border border-warning/20 transition-all text-xs"
          >
            <p className="font-bold text-warning text-[11px]">Case 2: Anomaly</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">AI flagged variance, additional verification</p>
          </button>
          <button
            onClick={() => handleTriggerScenario("CASE_3_ADMIN_HOLD")}
            className="text-left px-2.5 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 transition-all text-xs"
          >
            <p className="font-bold text-destructive text-[11px]">Case 3: Admin Hold</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">High risk flag, admin clearance required</p>
          </button>
        </div>
      </div>

      {/* Navigation Future Scope Status Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/20 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-secondary shrink-0" />
          <div>
            <p className="font-semibold text-secondary text-[11px]">
              Navigation Integration — Future Scope
            </p>
            <p className="text-[10px] text-muted-foreground">
              Simulated waypoints active (13.0827°N, 80.2707°E)
            </p>
          </div>
        </div>
        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary/20 text-secondary">
          Simulated
        </span>
      </div>

      {/* Progress & Operational KPIs Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-foreground">{t("today_progress")}</h3>
          <span className="text-base font-bold text-primary">{completionPercent}%</span>
        </div>
        <Progress value={completionPercent} className="h-2 mb-3.5 bg-muted" />

        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl bg-secondary/10 text-center">
            <Package className="w-4 h-4 text-secondary mb-1" />
            <span className="text-base font-bold text-foreground">{stats.totalAssigned}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase">{t("assigned_kpi")}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-primary/10 text-center">
            <TrendingUp className="w-4 h-4 text-primary mb-1" />
            <span className="text-base font-bold text-foreground">{stats.inTransit}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase">{t("active_kpi")}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-success/10 text-center">
            <CheckCircle2 className="w-4 h-4 text-success mb-1" />
            <span className="text-base font-bold text-foreground">{stats.completed}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase">{t("completed_kpi")}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-destructive/10 text-center">
            <ShieldAlert className="w-4 h-4 text-destructive mb-1" />
            <span className="text-base font-bold text-foreground">{stats.adminHeld}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase">{t("held_kpi")}</span>
          </div>
        </div>
      </div>

      {/* Active Delivery Highlight Banner */}
      {activeTask ? (
        <div className="bg-card border-2 border-primary/30 rounded-2xl p-4 shadow-elevated animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
              {t("active_task_banner")}
            </span>
            <span className="text-xs font-semibold text-primary">{activeTask.id}</span>
          </div>
          <h4 className="text-sm font-bold text-foreground">{activeTask.beneficiaryNameMasked}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activeTask.deliveryAddress}</p>
          <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Status: <span className="font-bold text-foreground">{t(`status_${activeTask.status}`)}</span>
            </span>
            <button
              onClick={() => navigate(`/verify/${activeTask.id}`)}
              className="px-3.5 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span>{t("continue_delivery")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/deliveries")}
          className="w-full py-3.5 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm shadow-elevated hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <span>View Assigned Deliveries Roster</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Recent Verified Deliveries */}
      {recentCompleted.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground">Recently Verified Deliveries</h3>
            <button
              onClick={() => navigate("/history")}
              className="text-[10px] font-semibold text-primary hover:underline"
            >
              View All History
            </button>
          </div>
          <div className="space-y-2">
            {recentCompleted.map((d) => (
              <div
                key={d.id}
                onClick={() => navigate(`/verify/${d.id}`)}
                className="bg-card rounded-xl p-3 shadow-card border border-border flex items-center justify-between cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{d.beneficiaryNameMasked} ({d.id})</p>
                    <p className="text-[10px] text-muted-foreground">{d.verificationProof?.transactionReference}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                  {t("status_DELIVERED")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
