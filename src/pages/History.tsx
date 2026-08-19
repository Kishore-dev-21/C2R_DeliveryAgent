import { useState } from "react";
import { useDeliveries } from "@/context/DeliveryContext";
import { useLanguage } from "@/context/LanguageContext";
import { ApiService } from "@/lib/api-service";
import type { DeliveryTask, DigitalProofOfDelivery } from "@/lib/types";
import {
  History as HistoryIcon,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Clock,
  MapPin,
  Shield,
  Layers,
  FileText
} from "lucide-react";

const History = () => {
  const { deliveries } = useDeliveries();
  const { language, t } = useLanguage();
  const [selectedProof, setSelectedProof] = useState<DigitalProofOfDelivery | null>(null);
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "DELAYED" | "AUDIT">("COMPLETED");

  const completedList = deliveries.filter((d) => d.status === "DELIVERED");
  const delayedList = deliveries.filter((d) => d.status === "DELAYED");
  const auditLogs = ApiService.getAuditLogs();

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("history_title")}</h2>
        <p className="text-xs text-muted-foreground">{t("history_subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "COMPLETED"
              ? "bg-primary text-primary-foreground font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completedList.length})
        </button>
        <button
          onClick={() => setActiveTab("DELAYED")}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "DELAYED"
              ? "bg-primary text-primary-foreground font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Delayed ({delayedList.length})
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "AUDIT"
              ? "bg-primary text-primary-foreground font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab: COMPLETED */}
      {activeTab === "COMPLETED" && (
        <div className="space-y-3">
          {completedList.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-foreground">No completed deliveries yet</p>
            </div>
          ) : (
            completedList.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl p-4 shadow-card border border-border space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary font-mono">{item.id}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.beneficiaryIdentifier}</span>
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground mt-0.5">{item.beneficiaryNameMasked}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                    {t("status_DELIVERED")}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{item.deliveredAt ? new Date(item.deliveredAt).toLocaleTimeString() : "Delivered"}</span>
                  </span>
                  <span className="font-mono text-[10px]">Ration: {item.rationCardMasked}</span>
                </div>

                {item.verificationProof && (
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">
                      {item.verificationProof.transactionReference}
                    </span>
                    <button
                      onClick={() => setSelectedProof(item.verificationProof!)}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{t("btn_view_proof")}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: DELAYED */}
      {activeTab === "DELAYED" && (
        <div className="space-y-3">
          {delayedList.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-foreground">No delayed tasks recorded</p>
            </div>
          ) : (
            delayedList.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl p-4 shadow-card border border-destructive/30 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground font-mono">{item.id}</span>
                    <h3 className="text-sm font-bold text-card-foreground">{item.beneficiaryNameMasked}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                    {t("status_DELAYED")}
                  </span>
                </div>
                <div className="bg-destructive/10 p-2 rounded-lg text-xs text-destructive">
                  <p className="font-semibold text-[11px]">Recorded Reason:</p>
                  <p className="text-[10px] mt-0.5">{item.delayReason || "Route obstruction"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: AUDIT TRAIL */}
      {activeTab === "AUDIT" && (
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-card rounded-xl p-3 border border-border text-xs space-y-1 font-mono"
            >
              <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                <span className="font-bold text-primary">{log.action}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-[11px] text-foreground font-sans">{log.details}</p>
              {log.orderId && (
                <span className="text-[10px] text-muted-foreground block">Order: {log.orderId}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 max-w-sm w-full border border-success/40 shadow-elevated space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-success" />
              <h3 className="text-sm font-bold text-foreground">{t("proof_headline")}</h3>
            </div>
            <div className="bg-muted p-3 rounded-xl text-xs space-y-2 font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-bold text-foreground">{selectedProof.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent</span>
                <span className="font-mono font-bold text-foreground">{selectedProof.agentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-bold text-foreground">
                  {selectedProof.verificationMethod === "MANTRA_MT100_BIOMETRIC" ? "Mantra MT100 Biometric" : "Secure SMS OTP"}
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground block mb-0.5">Transaction Reference:</span>
                <span className="font-mono text-[9px] break-all text-primary font-bold bg-card p-1 rounded block">
                  {selectedProof.transactionReference}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {selectedProof.geotagLabel}
              </div>
            </div>
            <button
              onClick={() => setSelectedProof(null)}
              className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
