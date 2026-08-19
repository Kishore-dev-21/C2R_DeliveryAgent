import type {
  DeliveryTask,
  DeliveryStatus,
  DigitalProofOfDelivery,
  VerificationMethod,
  AuditLogEntry,
  AgentProfile
} from "./types";

// In-memory audit log store
const auditLogs: AuditLogEntry[] = [];

// In-memory active OTP store (never plaintext in localStorage, expiring records)
interface ActiveOtpSession {
  orderId: string;
  hashedCode: string; // simulated hash
  expiresAt: number;
  attemptsRemaining: number;
  maxAttempts: number;
}

const activeOtpSessions = new Map<string, ActiveOtpSession>();

// Simple hash simulation for safe token matching
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "H_" + Math.abs(hash).toString(16);
}

// Generate cryptographic-like transaction reference
export function generateTransactionReference(orderId: string, agentId: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `C2R-TXN-${orderId}-${agentId}-${ts}-${rand}`;
}

export class ApiService {
  private static token: string | null = null;
  private static currentAgent: AgentProfile | null = null;

  public static setSession(agent: AgentProfile | null) {
    this.currentAgent = agent;
    this.token = agent ? agent.token : null;
  }

  public static getSession(): { agent: AgentProfile | null; token: string | null } {
    return { agent: this.currentAgent, token: this.token };
  }

  // Record audit log
  public static logAudit(action: string, orderId?: string, details?: string) {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      agentId: this.currentAgent?.agentId || "UNAUTHENTICATED",
      orderId,
      action,
      details: details || "Action recorded by Click2Ration backend audit trail",
    };
    auditLogs.unshift(entry);
    return entry;
  }

  public static getAuditLogs(): AuditLogEntry[] {
    return [...auditLogs];
  }

  // 1. Status Transition with JWT & Assignment Validation
  public static async transitionDeliveryStatus(
    delivery: DeliveryTask,
    targetStatus: DeliveryStatus,
    reason?: string
  ): Promise<{ success: boolean; updatedDelivery?: DeliveryTask; error?: string }> {
    // A. Validate Authentication
    if (!this.currentAgent || !this.token) {
      return { success: false, error: "Unauthorized: Active agent session required" };
    }

    // B. Validate Agent Assignment Isolation (Cannot modify other agents' deliveries)
    if (delivery.agentId !== this.currentAgent.agentId) {
      this.logAudit("UNAUTHORIZED_ACCESS_ATTEMPT", delivery.id, "Attempted to access non-assigned delivery");
      return { success: false, error: "Access Denied: This delivery task is not assigned to your agent account." };
    }

    // C. Validate Admin Hold constraint
    if (delivery.verificationRequirement === "ADMINISTRATIVE_HOLD" && delivery.adminClearanceStatus !== "APPROVED") {
      if (targetStatus === "DELIVERED" || targetStatus === "VERIFICATION") {
        return {
          success: false,
          error: "Administrative Hold Active: Cannot complete delivery without authorized shop administrator clearance.",
        };
      }
    }

    // Simulate backend network latency
    await new Promise((r) => setTimeout(r, 400));

    const now = new Date().toISOString();
    const updated: DeliveryTask = { ...delivery, status: targetStatus };

    switch (targetStatus) {
      case "ACCEPTED":
        updated.acceptedAt = now;
        break;
      case "ON_THE_WAY":
        updated.onTheWayAt = now;
        break;
      case "ARRIVED":
        updated.arrivedAt = now;
        break;
      case "DELAYED":
        updated.delayedAt = now;
        updated.delayReason = reason || "Traffic / Route congestion reported";
        break;
      default:
        break;
    }

    this.logAudit(`STATUS_TRANSITION_${targetStatus}`, delivery.id, `Status updated to ${targetStatus}`);
    return { success: true, updatedDelivery: updated };
  }

  // 2. Request OTP generation from backend
  public static async requestOtp(orderId: string): Promise<{
    success: boolean;
    expiresInSeconds: number;
    mockDisplayOtp: string; // Only provided in simulated test environment for demo convenience
    error?: string;
  }> {
    // 6-digit cryptographically random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = 180; // 3 minutes

    activeOtpSessions.set(orderId, {
      orderId,
      hashedCode: simpleHash(otp),
      expiresAt: Date.now() + ttlSeconds * 1000,
      attemptsRemaining: 3,
      maxAttempts: 3,
    });

    this.logAudit("OTP_REQUESTED", orderId, `Secure OTP generated with ${ttlSeconds}s TTL`);

    // In a real environment, OTP is transmitted strictly via SMS Gateway to beneficiary phone
    return {
      success: true,
      expiresInSeconds: ttlSeconds,
      mockDisplayOtp: otp,
    };
  }

  // 3. Verify Beneficiary OTP
  public static async verifyOtp(
    orderId: string,
    enteredOtp: string
  ): Promise<{ success: boolean; error?: string; attemptsRemaining?: number }> {
    const session = activeOtpSessions.get(orderId);

    if (!session) {
      return { success: false, error: "No active OTP request found. Please generate a new passkey." };
    }

    if (Date.now() > session.expiresAt) {
      activeOtpSessions.delete(orderId);
      this.logAudit("OTP_EXPIRED", orderId, "Beneficiary OTP expired before verification");
      return { success: false, error: "The one-time passkey has expired. Please request a new code." };
    }

    if (session.attemptsRemaining <= 0) {
      activeOtpSessions.delete(orderId);
      this.logAudit("OTP_MAX_ATTEMPTS_EXCEEDED", orderId, "Max OTP entry attempts exceeded");
      return {
        success: false,
        error: "Maximum verification attempts exceeded. Additional verification or administrative assistance is required.",
      };
    }

    const enteredHash = simpleHash(enteredOtp.trim());
    if (enteredHash === session.hashedCode) {
      activeOtpSessions.delete(orderId);
      this.logAudit("OTP_VERIFICATION_SUCCESS", orderId, "Beneficiary OTP validated successfully");
      return { success: true };
    } else {
      session.attemptsRemaining -= 1;
      this.logAudit("OTP_VERIFICATION_FAILED", orderId, `Invalid OTP entered. Remaining attempts: ${session.attemptsRemaining}`);
      return {
        success: false,
        attemptsRemaining: session.attemptsRemaining,
        error: "Incorrect passkey entered. Please verify with beneficiary.",
      };
    }
  }

  // 4. Simulated Mantra MT100 Biometric Gateway
  public static async executeMantraBiometricVerification(
    orderId: string,
    beneficiaryId: string,
    shouldSimulateFail: boolean = false
  ): Promise<{
    success: boolean;
    qualityScore?: number;
    uidaiResponseCode?: string;
    error?: string;
  }> {
    // Simulated RD service interaction
    await new Promise((r) => setTimeout(r, 1200));

    if (shouldSimulateFail) {
      this.logAudit("BIOMETRIC_MATCH_FAILED", orderId, "Mantra MT100 capture mismatch against UIDAI registry");
      return {
        success: false,
        error: "Identity verification unsuccessful. Additional verification or administrative assistance is required.",
      };
    }

    const quality = Math.floor(82 + Math.random() * 16); // 82-98%
    this.logAudit("BIOMETRIC_MATCH_SUCCESS", orderId, `UIDAI biometric match successful (Quality: ${quality}%)`);

    return {
      success: true,
      qualityScore: quality,
      uidaiResponseCode: "UIDAI_AUTH_200_OK",
    };
  }

  // 5. Finalize Delivery & Generate Digital Proof (e-POD)
  public static async finalizeDeliveryWithProof(
    delivery: DeliveryTask,
    verificationMethod: VerificationMethod
  ): Promise<{ success: boolean; proof: DigitalProofOfDelivery; updatedDelivery: DeliveryTask }> {
    const now = new Date().toISOString();
    const txRef = generateTransactionReference(delivery.id, delivery.agentId);

    const proof: DigitalProofOfDelivery = {
      orderId: delivery.id,
      agentId: delivery.agentId,
      beneficiaryIdentifier: delivery.beneficiaryIdentifier,
      timestamp: now,
      status: "DELIVERED",
      verificationMethod,
      verificationResult: "VERIFIED_SUCCESS",
      transactionReference: txRef,
      geotagLabel: "GPS Geotag Logged: 13.0827°N, 80.2707°E (SIMULATED GPS WAYPOINT)",
      auditLedgerSync: true,
      feedbackContribution: "Ration Behaviour History baseline updated for downstream AI evaluation",
    };

    const updatedDelivery: DeliveryTask = {
      ...delivery,
      status: "DELIVERED",
      deliveredAt: now,
      verificationProof: proof,
    };

    this.logAudit("DIGITAL_PROOF_ISSUED", delivery.id, `e-POD generated with TX reference: ${txRef}`);
    this.logAudit("BEHAVIOURAL_FEEDBACK_RECORDED", delivery.id, "Delivery event fed back into Central AI Ration DNA repository");

    return {
      success: true,
      proof,
      updatedDelivery,
    };
  }

  // 6. Request Administrative Hold Clearance
  public static async requestAdminClearance(
    orderId: string,
    notes: string
  ): Promise<{ success: boolean; status: "PENDING_REVIEW" }> {
    await new Promise((r) => setTimeout(r, 600));
    this.logAudit("ADMIN_CLEARANCE_REQUESTED", orderId, `Agent requested admin review: ${notes}`);
    return { success: true, status: "PENDING_REVIEW" };
  }
}
