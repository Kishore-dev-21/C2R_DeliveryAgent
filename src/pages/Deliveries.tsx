import { useState } from "react";
import { useDeliveries } from "@/context/DeliveryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import type { DeliveryStatus, DeliveryTask } from "@/lib/types";
import {
  Package,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Phone,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Send,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

const Deliveries = () => {
  const { deliveries, transitionStatus, requestAdminReview } = useDeliveries();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [delayModalTask, setDelayModalTask] = useState<DeliveryTask | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [contactModalTask, setContactModalTask] = useState<DeliveryTask | null>(null);
  const [adminReviewModalTask, setAdminReviewModalTask] = useState<DeliveryTask | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "ACTIVE") return ["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(d.status);
    if (activeFilter === "PENDING") return d.status === "ASSIGNED";
    if (activeFilter === "VERIFICATION") return d.status === "VERIFICATION" || d.status === "ARRIVED";
    if (activeFilter === "DELIVERED") return d.status === "DELIVERED";
    if (activeFilter === "HOLD") return d.verificationRequirement === "ADMINISTRATIVE_HOLD";
    return true;
  });

  const handleStatusChange = async (task: DeliveryTask, nextStatus: DeliveryStatus) => {
    const result = await transitionStatus(task.id, nextStatus);
    if (result.success) {
      toast.success(`Delivery status updated: ${t(`status_${nextStatus}`)}`);
      if (nextStatus === "ARRIVED" || nextStatus === "VERIFICATION") {
        navigate(`/verify/${task.id}`);
      }
    } else {
      toast.error(result.error || "Failed to update delivery status");
    }
  };

  const handleReportDelay = async () => {
    if (!delayModalTask) return;
    const result = await transitionStatus(delayModalTask.id, "DELAYED", delayReason);
    if (result.success) {
      toast.warning(`Task ${delayModalTask.id} marked as Delayed: ${delayReason || "Traffic delay"}`);
      setDelayModalTask(null);
      setDelayReason("");
    } else {
      toast.error(result.error || "Failed to report delay");
    }
  };

  const handleSubmitAdminReview = async () => {
    if (!adminReviewModalTask) return;
    const result = await requestAdminReview(adminReviewModalTask.id, adminNotes || "Agent requested shop admin clearance");
    if (result.success) {
      toast.info(`Review request for ${adminReviewModalTask.id} submitted to Shop Administrator.`);
      setAdminReviewModalTask(null);
      setAdminNotes("");
    } else {
      toast.error(result.error || "Failed to submit review request");
    }
  };

  const getStatusBadgeStyle = (status: DeliveryStatus) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-secondary/15 text-secondary border-secondary/30";
      case "ACCEPTED":
        return "bg-primary/15 text-primary border-primary/30";
      case "ON_THE_WAY":
        return "bg-primary text-primary-foreground";
      case "ARRIVED":
      case "VERIFICATION":
        return "bg-warning/20 text-warning border-warning/40";
      case "DELIVERED":
        return "bg-success/15 text-success border-success/30";
      case "DELAYED":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Page Heading */}
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("nav_deliveries")}</h2>
        <p className="text-xs text-muted-foreground">Authorized delivery queue for your assigned route</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {[
          { id: "ALL", label: "All Tasks" },
          { id: "PENDING", label: "Assigned" },
          { id: "ACTIVE", label: "In-Transit" },
          { id: "HOLD", label: "Admin Hold" },
          { id: "DELIVERED", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all border ${
              activeFilter === tab.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delivery Task Cards List */}
      <div className="space-y-3.5">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-foreground">No deliveries matching filter</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Select another filter tab or reset demo queue.</p>
          </div>
        ) : (
          filteredDeliveries.map((task) => {
            const isHold = task.verificationRequirement === "ADMINISTRATIVE_HOLD";
            const isDelivered = task.status === "DELIVERED";

            return (
              <div
                key={task.id}
                className={`bg-card rounded-2xl p-4 shadow-card border transition-all ${
                  isHold
                    ? "border-destructive/40 bg-destructive/5"
                    : isDelivered
                    ? "border-success/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {/* Top Task Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary font-mono">{task.id}</span>
                      <span className="text-[10px] font-medium text-muted-foreground font-mono">
                        {task.beneficiaryIdentifier}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground mt-0.5">
                      {task.beneficiaryNameMasked}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(task.status)}`}>
                    {t(`status_${task.status}`)}
                  </span>
                </div>

                {/* AI Risk Operational Directive Banner */}
                <div className={`p-2.5 rounded-xl text-xs mb-3 flex items-start gap-2 border ${
                  isHold
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : task.verificationRequirement === "ADDITIONAL_VERIFICATION"
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-secondary/10 text-secondary border-secondary/20"
                }`}>
                  {isHold ? (
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {t("operational_instruction")}
                    </p>
                    <p className="text-xs font-semibold leading-tight mt-0.5">
                      {language === "ta" ? task.riskInstructionTa : task.riskInstructionEn}
                    </p>
                  </div>
                </div>

                {/* Delivery Address & Time Window */}
                <div className="space-y-1 text-xs mb-3 text-muted-foreground">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-tight text-card-foreground font-medium">
                      {language === "ta" && task.deliveryAddressTa ? task.deliveryAddressTa : task.deliveryAddress}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>Preferred Time: {task.preferredTimeSlot}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>Ration: {task.rationCardMasked}</span>
                  </div>
                </div>

                {/* Assigned Commodity Items */}
                <div className="bg-muted/50 rounded-xl p-2.5 mb-3 border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("commodities")}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.commodities.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-card text-foreground border border-border"
                      >
                        {language === "ta" ? item.nameTa : item.name} ({item.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setContactModalTask(task)}
                      className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Contact beneficiary"
                    >
                      <Phone className="w-3 h-3 text-primary" />
                      <span>{t("contact_beneficiary")}</span>
                    </button>
                    {!isDelivered && (
                      <button
                        onClick={() => {
                          setDelayModalTask(task);
                          setDelayReason("");
                        }}
                        className="px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                      >
                        {t("report_delay")}
                      </button>
                    )}
                  </div>

                  {/* Lifecycle Next Action Button */}
                  <div>
                    {task.status === "ASSIGNED" && (
                      <button
                        onClick={() => handleStatusChange(task, "ACCEPTED")}
                        className="px-3.5 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <span>{t("btn_accept")}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {task.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleStatusChange(task, "ON_THE_WAY")}
                        className="px-3.5 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <span>{t("btn_start_journey")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {task.status === "ON_THE_WAY" && (
                      <button
                        onClick={() => handleStatusChange(task, "ARRIVED")}
                        className="px-3.5 py-1.5 rounded-xl bg-warning text-warning-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <span>{t("btn_mark_arrived")}</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {(task.status === "ARRIVED" || task.status === "VERIFICATION") && !isHold && (
                      <button
                        onClick={() => navigate(`/verify/${task.id}`)}
                        className="px-3.5 py-1.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <span>{t("btn_proceed_verification")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isHold && (
                      <button
                        onClick={() => {
                          setAdminReviewModalTask(task);
                          setAdminNotes("");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{t("btn_request_admin")}</span>
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        onClick={() => navigate(`/verify/${task.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-success/15 hover:bg-success/25 text-success border border-success/30 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{t("btn_view_proof")}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delay Modal */}
      {delayModalTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 max-w-sm w-full border border-border shadow-elevated space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-sm font-bold text-foreground">Report Route Delay</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Notify shop admin and beneficiary of an unexpected route delay for {delayModalTask.id}.
            </p>
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Delay Reason</label>
              <input
                type="text"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="e.g. Severe traffic congestion / vehicle inspection"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDelayModalTask(null)}
                className="flex-1 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReportDelay}
                className="flex-1 py-2 rounded-xl bg-warning text-warning-foreground text-xs font-bold"
              >
                Record Delay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Beneficiary Modal */}
      {contactModalTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 max-w-sm w-full border border-border shadow-elevated space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Contact Beneficiary</h3>
            </div>
            <div className="bg-muted p-3 rounded-xl text-xs space-y-1">
              <p className="font-bold text-foreground">{contactModalTask.beneficiaryNameMasked}</p>
              <p className="text-muted-foreground">Phone: {contactModalTask.beneficiaryPhoneMasked}</p>
              <p className="text-muted-foreground">Address: {contactModalTask.deliveryAddress}</p>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Click2Ration masks full contact details to protect beneficiary privacy in accordance with data regulations.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setContactModalTask(null)}
                className="flex-1 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold"
              >
                Close
              </button>
              <a
                href={`tel:${contactModalTask.beneficiaryPhoneMasked.replace(/[^0-9+]/g, "")}`}
                onClick={() => {
                  toast.info("Connecting through privacy proxy dialer...");
                  setContactModalTask(null);
                }}
                className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold text-center"
              >
                Dial via Proxy
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Admin Review Modal for Hold */}
      {adminReviewModalTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 max-w-sm w-full border border-destructive/40 shadow-elevated space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <h3 className="text-sm font-bold text-foreground">Administrative Review Escalation</h3>
            </div>
            <div className="bg-destructive/10 p-3 rounded-xl text-xs text-destructive">
              <p className="font-bold mb-0.5">Central AI Intelligence Directive:</p>
              <p className="text-[11px] leading-relaxed">{adminReviewModalTask.riskInstructionEn}</p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Field Notes for Shop Administrator</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Describe field conditions, verification details, or beneficiary status..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdminReviewModalTask(null)}
                className="flex-1 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAdminReview}
                className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold"
              >
                Submit Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
