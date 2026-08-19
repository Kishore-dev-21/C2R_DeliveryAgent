import { useDeliveries } from "@/context/DeliveryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Award
} from "lucide-react";

const Performance = () => {
  const { stats } = useDeliveries();
  const { agent } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("perf_title")}</h2>
        <p className="text-xs text-muted-foreground">Legitimate operational metrics for Agent {agent?.agentId}</p>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-semibold">{t("perf_total_assigned")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalAssigned}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Assigned route orders</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="font-semibold">{t("perf_completed")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Fully verified e-PODs</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span className="font-semibold">{t("perf_success_rate")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.successRatePercent}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">First-time auth rate</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Clock className="w-4 h-4 text-warning" />
            <span className="font-semibold">{t("perf_avg_time")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgCompletionTimeMinutes} min</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Per verified delivery</p>
        </div>
      </div>

      {/* Quality Standards & Governance Note */}
      <div className="bg-card rounded-2xl p-4 border border-primary/20 shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Click2Ration Quality & Ethics Standards</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Agent metrics evaluate legitimate operational throughput, route fulfillment, and identity verification compliance. Anomaly and fraud intelligence evaluations remain centralized within the Central AI Governance layer.
        </p>
      </div>
    </div>
  );
};

export default Performance;
