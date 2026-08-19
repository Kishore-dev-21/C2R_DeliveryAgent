import { describe, it, expect, beforeEach } from "vitest";
import { ApiService } from "../lib/api-service";
import type { DeliveryTask, AgentProfile } from "../lib/types";

const testAgent: AgentProfile = {
  agentId: "AGT001",
  name: "Rajesh Kumar",
  phone: "+91 98765 43210",
  assignedHub: "Chennai Central Distribution Zone",
  role: "DELIVERY_AGENT",
  token: "TEST_JWT_SESSION_TOKEN_VALID",
};

const sampleTask: DeliveryTask = {
  id: "ORD-TEST-001",
  agentId: "AGT001",
  beneficiaryIdentifier: "BEN-TEST-101",
  beneficiaryNameMasked: "Test Beneficiary",
  rationCardMasked: "TN-12****34",
  aadhaarLast4: "9999",
  deliveryAddress: "100 Test Road, Chennai",
  commodities: [{ name: "Rice", nameTa: "அரிசி", quantity: "5.0 kg" }],
  preferredTimeSlot: "10:00 AM - 12:00 PM",
  status: "ASSIGNED",
  riskLevel: "LOW_RISK",
  riskInstructionEn: "Standard delivery verification required.",
  riskInstructionTa: "நிலையான விநியோக சரிபார்ப்பு தேவை.",
  verificationRequirement: "STANDARD_VERIFICATION",
  beneficiaryPhoneMasked: "+91 98*** **000",
  assignedAt: new Date().toISOString(),
};

describe("Click2Ration Delivery Agent Portal - Core Architecture Tests", () => {
  beforeEach(() => {
    ApiService.setSession(testAgent);
  });

  it("authenticates agent session and authorizes status transitions", async () => {
    const result = await ApiService.transitionDeliveryStatus(sampleTask, "ACCEPTED");
    expect(result.success).toBe(true);
    expect(result.updatedDelivery?.status).toBe("ACCEPTED");
  });

  it("blocks unauthorized access when an agent attempts to modify another agent's delivery", async () => {
    const otherAgentTask: DeliveryTask = {
      ...sampleTask,
      id: "ORD-FOREIGN-999",
      agentId: "AGT999_OTHER",
    };

    const result = await ApiService.transitionDeliveryStatus(otherAgentTask, "ACCEPTED");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Access Denied");
  });

  it("enforces administrative hold constraints", async () => {
    const holdTask: DeliveryTask = {
      ...sampleTask,
      id: "ORD-HOLD-001",
      verificationRequirement: "ADMINISTRATIVE_HOLD",
      adminClearanceStatus: "PENDING_REVIEW",
    };

    const result = await ApiService.transitionDeliveryStatus(holdTask, "DELIVERED");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Administrative Hold Active");
  });

  it("handles secure OTP generation, verification, and expiration", async () => {
    const otpRes = await ApiService.requestOtp("ORD-TEST-001");
    expect(otpRes.success).toBe(true);
    expect(otpRes.expiresInSeconds).toBe(180);
    expect(otpRes.mockDisplayOtp).toBeDefined();

    // Verify correct OTP
    const verifySuccess = await ApiService.verifyOtp("ORD-TEST-001", otpRes.mockDisplayOtp!);
    expect(verifySuccess.success).toBe(true);
  });

  it("decrements remaining attempts on invalid OTP entry", async () => {
    await ApiService.requestOtp("ORD-TEST-002");
    const badVerify = await ApiService.verifyOtp("ORD-TEST-002", "000000");
    expect(badVerify.success).toBe(false);
    expect(badVerify.attemptsRemaining).toBe(2);
  });

  it("simulates Mantra MT100 biometric capture with safe failure response", async () => {
    const failResult = await ApiService.executeMantraBiometricVerification("ORD-TEST-001", "BEN-101", true);
    expect(failResult.success).toBe(false);
    expect(failResult.error).toBe(
      "Identity verification unsuccessful. Additional verification or administrative assistance is required."
    );

    const successResult = await ApiService.executeMantraBiometricVerification("ORD-TEST-001", "BEN-101", false);
    expect(successResult.success).toBe(true);
    expect(successResult.qualityScore).toBeGreaterThanOrEqual(80);
  });

  it("generates tamper-evident Digital Proof of Delivery (e-POD) with transaction reference", async () => {
    const finalized = await ApiService.finalizeDeliveryWithProof(sampleTask, "MANTRA_MT100_BIOMETRIC");
    expect(finalized.success).toBe(true);
    expect(finalized.proof.status).toBe("DELIVERED");
    expect(finalized.proof.transactionReference).toContain("C2R-TXN-ORD-TEST-001");
    expect(finalized.proof.auditLedgerSync).toBe(true);
  });

  it("logs security events into the backend audit trail", () => {
    const logs = ApiService.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
  });
});
