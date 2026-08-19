export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "VERIFICATION"
  | "DELIVERED"
  | "DELAYED";

export type OperationalRiskLevel = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL";

export type VerificationRequirement =
  | "STANDARD_VERIFICATION"
  | "ADDITIONAL_VERIFICATION"
  | "ADMINISTRATIVE_HOLD";

export type VerificationMethod =
  | "MANTRA_MT100_BIOMETRIC"
  | "BENEFICIARY_SECURE_OTP";

export interface CommodityItem {
  name: string;
  nameTa: string;
  quantity: string;
}

export interface DigitalProofOfDelivery {
  orderId: string;
  agentId: string;
  beneficiaryIdentifier: string;
  timestamp: string;
  status: "DELIVERED";
  verificationMethod: VerificationMethod;
  verificationResult: "VERIFIED_SUCCESS";
  transactionReference: string;
  geotagLabel: string;
  auditLedgerSync: boolean;
  feedbackContribution: string;
}

export interface DeliveryTask {
  id: string; // Order ID
  agentId: string;
  beneficiaryIdentifier: string;
  beneficiaryNameMasked: string;
  rationCardMasked: string;
  aadhaarLast4: string;
  deliveryAddress: string;
  deliveryAddressTa?: string;
  commodities: CommodityItem[];
  preferredTimeSlot: string;
  status: DeliveryStatus;
  riskLevel: OperationalRiskLevel;
  riskInstructionEn: string;
  riskInstructionTa: string;
  verificationRequirement: VerificationRequirement;
  beneficiaryPhoneMasked: string;
  assignedAt: string;
  acceptedAt?: string;
  onTheWayAt?: string;
  arrivedAt?: string;
  deliveredAt?: string;
  delayedAt?: string;
  delayReason?: string;
  verificationProof?: DigitalProofOfDelivery;
  adminHoldReason?: string;
  adminClearanceStatus?: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  demoCase?: "CASE_1_NORMAL" | "CASE_2_ADDITIONAL_VERIFICATION" | "CASE_3_ADMIN_HOLD";
}

export interface AgentNotification {
  id: string;
  timestamp: string;
  titleEn: string;
  titleTa: string;
  messageEn: string;
  messageTa: string;
  type: "assignment" | "status" | "admin" | "security";
  read: boolean;
  orderId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  orderId?: string;
  action: string;
  details: string;
}

export interface AgentProfile {
  agentId: string;
  name: string;
  phone: string;
  assignedHub: string;
  role: "DELIVERY_AGENT";
  token: string;
}

export type Language = "en" | "ta";
