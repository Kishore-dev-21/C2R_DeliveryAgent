import { useFraud } from "@/context/FraudContext";
import { ShieldAlert, CheckCircle2, AlertTriangle, MapPin, Fingerprint, Zap, MapPinOff } from "lucide-react";
import { toast } from "sonner";

const fraudTypeConfig: Record<string, { icon: typeof ShieldAlert; color: string; bg: string }> = {
  Biometric: { icon: Fingerprint, color: "text-destructive", bg: "bg-destructive/10" },
  GPS: { icon: MapPin, color: "text-warning", bg: "bg-warning/10" },
  Speed: { icon: Zap, color: "text-secondary", bg: "bg-secondary/10" },
  Zone: { icon: MapPinOff, color: "text-primary", bg: "bg-primary/10" },
};

const FraudAlerts = () => {
  const { fraudLogs, resolveFraud, pendingCount } = useFraud();

  const handleResolve = (id: string) => {
    resolveFraud(id);
    toast.success("Alert marked as resolved");
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          Fraud Alerts
        </h2>
        <p className="text-xs text-muted-foreground">
          Automated anomaly detection on your deliveries
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pending Review</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{fraudLogs.length - pendingCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Resolved</p>
        </div>
      </div>

      {/* Empty State */}
      {fraudLogs.length === 0 && (
        <div className="bg-card rounded-2xl p-8 shadow-card text-center animate-slide-up">
          <ShieldAlert className="w-12 h-12 text-success mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-semibold text-card-foreground">All Clear!</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            No suspicious activity detected. Fraud checks run automatically on every delivery confirmation.
          </p>
        </div>
      )}

      {/* Fraud Logs */}
      <div className="space-y-3">
        {fraudLogs.map((log, i) => {
          const config = fraudTypeConfig[log.fraudType] || fraudTypeConfig.GPS;
          const Icon = config.icon;
          const isResolved = log.status === "Resolved";

          return (
            <div
              key={log.id}
              className={`bg-card rounded-2xl p-4 shadow-card animate-slide-up ${isResolved ? "opacity-60" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{log.fraudType} Alert</p>
                    <p className="text-[10px] text-muted-foreground">{log.beneficiaryName} • {log.rationCardNumber}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  isResolved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  {log.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 bg-muted rounded-xl p-2.5">
                {log.description}
              </p>

              {/* Details row */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                <span>Agent: {log.agentId}</span>
                <span>Delivery: {log.deliveryId}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              {/* Review handled by government authorities */}
              {!isResolved && (
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Under government review
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="bg-muted/50 rounded-xl p-3 text-[10px] text-muted-foreground">
        <p className="font-medium mb-1">Fraud Detection Rules:</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Biometric: &gt;3 failed attempts before success</li>
          <li>GPS: Delivery location far from registered address</li>
          <li>Speed: Multiple deliveries completed too quickly</li>
          <li>Zone: Delivery outside assigned area boundary</li>
        </ul>
      </div>
    </div>
  );
};

export default FraudAlerts;
