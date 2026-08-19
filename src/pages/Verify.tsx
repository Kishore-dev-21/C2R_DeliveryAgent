import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeliveries } from "@/context/DeliveryContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Fingerprint,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Wifi,
  FileCheck2,
  RotateCw,
  HelpCircle,
  Layers,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import type { VerificationMethod, DigitalProofOfDelivery } from "@/lib/types";

const Verify = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeliveryById, verifyBeneficiaryOtp, requestBeneficiaryOtp, executeBiometricScan, finalizeDelivery } = useDeliveries();
  const { language, t } = useLanguage();

  const delivery = getDeliveryById(id || "");

  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>("MANTRA_MT100_BIOMETRIC");
  const [step, setStep] = useState<"SELECT" | "BIOMETRIC_SCAN" | "OTP_ENTRY" | "FAILURE_TRIAGE" | "PROOF_DISPLAY">("SELECT");

  // Biometric states
  const [bioStatus, setBioStatus] = useState<"idle" | "connecting" | "scanning" | "success" | "failed">("idle");
  const [bioQuality, setBioQuality] = useState<number | null>(null);
  const [simulateBioFail, setSimulateBioFail] = useState(false);

  // OTP states
  const [otpValue, setOtpValue] = useState("");
  const [otpTimeRemaining, setOtpTimeRemaining] = useState(180);
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(3);
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const [demoPasskeyDisplay, setDemoPasskeyDisplay] = useState<string | null>(null);

  // Proof state
  const [generatedProof, setGeneratedProof] = useState<DigitalProofOfDelivery | null>(delivery?.verificationProof || null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (delivery?.status === "DELIVERED" && delivery.verificationProof) {
      setGeneratedProof(delivery.verificationProof);
      setStep("PROOF_DISPLAY");
    }
  }, [delivery]);

  // OTP Timer countdown
  useEffect(() => {
    let timer: any;
    if (step === "OTP_ENTRY" && otpTimeRemaining > 0) {
      timer = setInterval(() => {
        setOtpTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimeRemaining]);

  if (!delivery) {
    return (
      <div className="p-6 text-center space-y-3">
        <PackageNotFound />
        <button
          onClick={() => navigate("/deliveries")}
          className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold"
        >
          Return to Deliveries
        </button>
      </div>
    );
  }

  const isHold = delivery.verificationRequirement === "ADMINISTRATIVE_HOLD";

  // Biometric flow
  const handleStartBiometricScan = async () => {
    setBioStatus("connecting");
    await new Promise((r) => setTimeout(r, 600));
    setBioStatus("scanning");
    const result = await executeBiometricScan(delivery.id, simulateBioFail);

    if (result.success) {
      setBioStatus("success");
      setBioQuality(result.qualityScore || 92);
      toast.success("Mantra MT100: Aadhaar biometric identity confirmed");
      await handleCompleteDelivery("MANTRA_MT100_BIOMETRIC");
    } else {
      setBioStatus("failed");
      toast.error(result.error || "Biometric verification unsuccessful");
      setStep("FAILURE_TRIAGE");
    }
  };

  // OTP Request Flow
  const handleInitiateOtp = async () => {
    setOtpRequestLoading(true);
    const result = await requestBeneficiaryOtp(delivery.id);
    setOtpRequestLoading(false);
    if (result.success) {
      setOtpTimeRemaining(result.expiresInSeconds || 180);
      setOtpAttemptsRemaining(3);
      setDemoPasskeyDisplay(result.mockDisplayOtp || null);
      setStep("OTP_ENTRY");
      toast.info("Secure one-time passkey transmitted to beneficiary");
    } else {
      toast.error(result.error || "Failed to transmit OTP");
    }
  };

  // OTP Verify Flow
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit passkey");
      return;
    }

    const result = await verifyBeneficiaryOtp(delivery.id, otpValue);
    if (result.success) {
      toast.success("Beneficiary passkey authenticated successfully");
      await handleCompleteDelivery("BENEFICIARY_SECURE_OTP");
    } else {
      if (result.attemptsRemaining !== undefined) {
        setOtpAttemptsRemaining(result.attemptsRemaining);
      }
      toast.error(result.error || "Incorrect passkey entered");
      if ((result.attemptsRemaining !== undefined && result.attemptsRemaining <= 0) || result.error?.includes("expired")) {
        setStep("FAILURE_TRIAGE");
      }
    }
  };

  // Complete & Seal Delivery
  const handleCompleteDelivery = async (method: VerificationMethod) => {
    setFinalizing(true);
    const result = await finalizeDelivery(delivery.id, method);
    setFinalizing(false);
    if (result.success && result.proof) {
      setGeneratedProof(result.proof);
      setStep("PROOF_DISPLAY");
      toast.success("Digital Proof of Delivery (e-POD) issued and synced with backend registry");
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/deliveries")}
          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-foreground">{t("verify_title")}</h2>
          <p className="text-[11px] text-muted-foreground">{delivery.id} • {delivery.beneficiaryNameMasked}</p>
        </div>
      </div>

      {/* Administrative Hold Banner */}
      {isHold && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 space-y-2 animate-slide-up">
          <div className="flex items-center gap-2 text-destructive font-bold text-xs">
            <ShieldAlert className="w-5 h-5" />
            <span>Administrative Hold Active</span>
          </div>
          <p className="text-xs text-destructive leading-relaxed">
            {t("admin_hold_notice")}
          </p>
          <div className="pt-2 border-t border-destructive/20 text-[10px] text-muted-foreground">
            Reason: {delivery.adminHoldReason || "Variance review pending with shop administrator"}
          </div>
        </div>
      )}

      {/* Task Summary Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("beneficiary_id")}</span>
            <p className="font-mono font-bold text-foreground">{delivery.beneficiaryIdentifier}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("ration_card")}</span>
            <p className="font-mono font-bold text-foreground">{delivery.rationCardMasked}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("address")}</span>
            <p className="font-medium text-foreground text-[11px]">
              {language === "ta" && delivery.deliveryAddressTa ? delivery.deliveryAddressTa : delivery.deliveryAddress}
            </p>
          </div>
        </div>

        {/* AI Operational Instruction Banner */}
        <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
          isHold
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : delivery.verificationRequirement === "ADDITIONAL_VERIFICATION"
            ? "bg-warning/10 text-warning border-warning/20"
            : "bg-secondary/10 text-secondary border-secondary/20"
        }`}>
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider">{t("operational_instruction")}</span>
            <p className="font-bold text-[11px] leading-tight">
              {language === "ta" ? delivery.riskInstructionTa : delivery.riskInstructionEn}
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: METHOD SELECTION */}
      {step === "SELECT" && !isHold && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{t("method_select")}</h3>

          {/* Option A: Biometric */}
          <div
            onClick={() => {
              setSelectedMethod("MANTRA_MT100_BIOMETRIC");
              setStep("BIOMETRIC_SCAN");
            }}
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary cursor-pointer shadow-card transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t("method_biometric")}</h4>
                  <p className="text-[10px] text-muted-foreground">Direct Aadhaar fingerprint authentication</p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Primary
              </span>
            </div>
            <div className="bg-muted rounded-lg px-2.5 py-1 text-[9px] text-muted-foreground flex items-center gap-1.5 font-medium">
              <Layers className="w-3 h-3 text-secondary" />
              <span>{t("method_biometric_badge")}</span>
            </div>
          </div>

          {/* Option B: OTP */}
          <div
            onClick={() => {
              setSelectedMethod("BENEFICIARY_SECURE_OTP");
              handleInitiateOtp();
            }}
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary cursor-pointer shadow-card transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t("method_otp")}</h4>
                  <p className="text-[10px] text-muted-foreground">Encrypted one-time passkey via registered mobile</p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30">
                Fallback / Multi-Factor
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: BIOMETRIC SCAN WIZARD */}
      {step === "BIOMETRIC_SCAN" && !isHold && (
        <div className="bg-card rounded-2xl p-5 border border-border shadow-card text-center space-y-4 animate-slide-up">
          <div className="inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
            {t("bio_simulated_notice")}
          </div>

          {/* Scanner Visual Icon */}
          <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center transition-all ${
            bioStatus === "scanning" || bioStatus === "connecting"
              ? "gradient-primary animate-pulse text-primary-foreground"
              : bioStatus === "success"
              ? "bg-success text-success-foreground"
              : bioStatus === "failed"
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-foreground border-2 border-dashed border-border"
          }`}>
            {bioStatus === "scanning" || bioStatus === "connecting" ? (
              <Loader2 className="w-9 h-9 animate-spin" />
            ) : bioStatus === "success" ? (
              <CheckCircle2 className="w-9 h-9" />
            ) : bioStatus === "failed" ? (
              <XCircle className="w-9 h-9" />
            ) : (
              <Fingerprint className="w-9 h-9 text-primary" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground">
              {bioStatus === "idle" && t("bio_status_idle")}
              {bioStatus === "connecting" && t("bio_status_connecting")}
              {bioStatus === "scanning" && t("bio_status_scanning")}
              {bioStatus === "success" && "Biometric Identity Confirmed"}
              {bioStatus === "failed" && "Biometric Match Failed"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {bioStatus === "idle" && "Place registered beneficiary finger on Mantra MT100 sensor surface."}
              {bioStatus === "scanning" && "Comparing live biometric token against central UIDAI registry..."}
              {bioStatus === "success" && `UIDAI match successful. Quality Score: ${bioQuality}%`}
              {bioStatus === "failed" && "No match found against registered Aadhaar baseline."}
            </p>
          </div>

          {/* Demo Failure Toggle */}
          <div className="bg-muted/60 rounded-xl p-2 text-[10px] text-muted-foreground flex items-center justify-between text-left">
            <span>Simulate Verification Mismatch (Test Failure Handling):</span>
            <input
              type="checkbox"
              checked={simulateBioFail}
              onChange={(e) => setSimulateBioFail(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {bioStatus === "idle" && (
              <button
                onClick={handleStartBiometricScan}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-elevated hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{t("bio_start_scan")}</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedMethod("BENEFICIARY_SECURE_OTP");
                handleInitiateOtp();
              }}
              className="w-full py-2.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
            >
              {t("switch_to_otp")}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OTP ENTRY WIZARD */}
      {step === "OTP_ENTRY" && !isHold && (
        <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4 animate-slide-up">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mx-auto mb-2 border border-secondary/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">{t("method_otp")}</h4>
            <p className="text-xs text-muted-foreground">{t("otp_sent_to")}</p>
          </div>

          {/* Simulated Demo Passkey Helper */}
          {demoPasskeyDisplay && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-center text-xs">
              <span className="text-[10px] text-muted-foreground block">Simulated SMS Passkey (Demo Mode):</span>
              <span className="font-mono font-bold text-sm tracking-widest text-primary">{demoPasskeyDisplay}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                placeholder={t("otp_placeholder")}
                className="w-full py-3 px-4 text-center font-mono text-lg font-bold tracking-widest rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t("otp_time_left")}: <strong className="text-foreground">{otpTimeRemaining}s</strong></span>
              </span>
              <span>Attempts remaining: <strong className="text-foreground">{otpAttemptsRemaining}</strong></span>
            </div>

            <button
              type="submit"
              disabled={otpValue.length !== 6 || otpTimeRemaining === 0}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-elevated hover:opacity-90 transition-all disabled:opacity-50"
            >
              {t("otp_verify_btn")}
            </button>
          </form>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <button
              onClick={handleInitiateOtp}
              disabled={otpRequestLoading}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>{t("otp_resend")}</span>
            </button>
            <button
              onClick={() => {
                setSelectedMethod("MANTRA_MT100_BIOMETRIC");
                setStep("BIOMETRIC_SCAN");
                setBioStatus("idle");
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Use Biometrics
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FAILURE TRIAGE */}
      {step === "FAILURE_TRIAGE" && (
        <div className="bg-card rounded-2xl p-5 border border-destructive/40 shadow-elevated text-center space-y-4 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-destructive/15 flex items-center justify-center text-destructive mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-card-foreground">{t("verify_failed_headline")}</h4>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-muted p-3 rounded-xl">
              {t("verify_failed_msg")}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setBioStatus("idle");
                setStep("BIOMETRIC_SCAN");
              }}
              className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold transition-all"
            >
              {t("retry_verification")}
            </button>

            <button
              onClick={() => {
                setSelectedMethod("BENEFICIARY_SECURE_OTP");
                handleInitiateOtp();
              }}
              className="w-full py-2.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 text-xs font-bold hover:bg-secondary/25 transition-all"
            >
              {t("switch_to_otp")}
            </button>

            <button
              onClick={() => {
                toast.info("Escalation logged to shop administrator ledger.");
                navigate("/deliveries");
              }}
              className="w-full py-2 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:text-foreground transition-all flex items-center justify-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t("escalate_to_admin")}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: DIGITAL PROOF OF DELIVERY (e-POD) */}
      {step === "PROOF_DISPLAY" && generatedProof && (
        <div className="bg-card rounded-2xl p-5 border border-success/40 shadow-elevated space-y-4 animate-slide-up">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 rounded-2xl bg-success/15 flex items-center justify-center text-success mx-auto border border-success/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">{t("proof_headline")}</h3>
            <p className="text-xs text-success font-semibold">{t("proof_confirmed")}</p>
          </div>

          {/* e-POD Receipt Card */}
          <div className="bg-muted rounded-xl p-3.5 text-xs space-y-2 border border-border font-sans">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">{t("proof_order_id")}</span>
              <span className="font-mono font-bold text-foreground">{generatedProof.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">{t("proof_agent")}</span>
              <span className="font-mono font-bold text-foreground">{generatedProof.agentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">{t("proof_timestamp")}</span>
              <span className="font-mono text-foreground">{new Date(generatedProof.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">{t("proof_method")}</span>
              <span className="font-bold text-foreground">
                {generatedProof.verificationMethod === "MANTRA_MT100_BIOMETRIC" ? "Mantra MT100 Biometric" : "Secure SMS OTP"}
              </span>
            </div>
            <div className="pt-2 border-t border-border/80">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">
                {t("proof_tx_ref")}:
              </span>
              <span className="font-mono text-[10px] break-all text-primary font-bold bg-card p-1.5 rounded block border border-border">
                {generatedProof.transactionReference}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <MapPin className="w-3 h-3 text-secondary shrink-0" />
              <span>{generatedProof.geotagLabel}</span>
            </div>
          </div>

          {/* Feedback loop notice */}
          <div className="bg-primary/10 rounded-xl p-2.5 text-[10px] text-primary border border-primary/20 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t("proof_history_sync")}</span>
          </div>

          <button
            onClick={() => navigate("/deliveries")}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-elevated hover:opacity-90 transition-all"
          >
            {t("proof_done_btn")}
          </button>
        </div>
      )}
    </div>
  );
};

const PackageNotFound = () => (
  <div className="space-y-1">
    <h3 className="text-sm font-bold text-foreground">Delivery Record Not Found</h3>
    <p className="text-xs text-muted-foreground">The requested order does not exist or is not assigned to your account.</p>
  </div>
);

export default Verify;
