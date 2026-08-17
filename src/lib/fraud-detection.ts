import type { Delivery } from "@/lib/mock-data";

export type FraudType = "Biometric" | "GPS" | "Speed" | "Zone";

export interface FraudLog {
  id: string;
  agentId: string;
  deliveryId: string;
  beneficiaryName: string;
  rationCardNumber: string;
  timestamp: string;
  fraudType: FraudType;
  description: string;
  status: "Pending Review" | "Resolved";
}

// Assigned delivery zone center (Chennai) — agent should deliver within this radius
const ASSIGNED_ZONE_CENTER = { lat: 13.0827, lng: 80.2707 };
const ASSIGNED_ZONE_RADIUS_KM = 25; // 25km radius

// Max distance between delivery GPS and beneficiary registered address
const GPS_DISTANCE_THRESHOLD_KM = 5;

// Min time between deliveries (minutes) — too fast = suspicious
const MIN_DELIVERY_INTERVAL_MINUTES = 5;

// Max biometric failures before flagging
const MAX_BIOMETRIC_FAILURES = 3;

// Haversine formula to calculate distance between two GPS points
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Mock registered address GPS coordinates for beneficiaries
const beneficiaryAddressCoords: Record<string, { lat: number; lng: number }> = {
  DEL001: { lat: 13.0418, lng: 80.2341 },
  DEL002: { lat: 13.0012, lng: 80.2565 },
  DEL003: { lat: 13.0337, lng: 80.2676 },
  DEL004: { lat: 13.0604, lng: 80.2333 },
  DEL005: { lat: 12.9988, lng: 80.2664 },
  DEL006: { lat: 13.0982, lng: 80.1621 },
  DEL007: { lat: 13.0371, lng: 80.1573 },
  DEL008: { lat: 12.9516, lng: 80.1462 },
  DEL009: { lat: 13.0067, lng: 80.2206 },
  DEL010: { lat: 12.9249, lng: 80.1278 },
};

interface FraudCheckParams {
  delivery: Delivery;
  agentId: string;
  biometricAttempts: number;
  deliveryGps: { lat: number; lng: number };
  recentDeliveryTimestamps: string[]; // timestamps of recent completed deliveries
}

export function runFraudDetection(params: FraudCheckParams): FraudLog[] {
  const { delivery, agentId, biometricAttempts, deliveryGps, recentDeliveryTimestamps } = params;
  const fraudLogs: FraudLog[] = [];
  const now = new Date().toISOString();

  // Rule 1: Biometric failures > threshold
  if (biometricAttempts > MAX_BIOMETRIC_FAILURES) {
    fraudLogs.push({
      id: `FR-${Date.now()}-BIO`,
      agentId,
      deliveryId: delivery.id,
      beneficiaryName: delivery.beneficiaryName,
      rationCardNumber: delivery.rationCardNumber,
      timestamp: now,
      fraudType: "Biometric",
      description: `Biometric authentication failed ${biometricAttempts} times before success (threshold: ${MAX_BIOMETRIC_FAILURES}). Possible identity mismatch.`,
      status: "Pending Review",
    });
  }

  // Rule 2: GPS distance from registered address
  const registeredCoords = beneficiaryAddressCoords[delivery.id];
  if (registeredCoords) {
    const distance = haversineDistance(
      deliveryGps.lat, deliveryGps.lng,
      registeredCoords.lat, registeredCoords.lng
    );
    if (distance > GPS_DISTANCE_THRESHOLD_KM) {
      fraudLogs.push({
        id: `FR-${Date.now()}-GPS`,
        agentId,
        deliveryId: delivery.id,
        beneficiaryName: delivery.beneficiaryName,
        rationCardNumber: delivery.rationCardNumber,
        timestamp: now,
        fraudType: "GPS",
        description: `Delivery GPS is ${distance.toFixed(1)}km from registered address (threshold: ${GPS_DISTANCE_THRESHOLD_KM}km). Location mismatch detected.`,
        status: "Pending Review",
      });
    }
  }

  // Rule 3: Too many deliveries in short time
  if (recentDeliveryTimestamps.length >= 2) {
    const sorted = recentDeliveryTimestamps
      .map((t) => new Date(t).getTime())
      .sort((a, b) => b - a);
    
    const lastTwo = sorted.slice(0, 2);
    const intervalMinutes = (lastTwo[0] - lastTwo[1]) / (1000 * 60);
    
    if (intervalMinutes < MIN_DELIVERY_INTERVAL_MINUTES) {
      fraudLogs.push({
        id: `FR-${Date.now()}-SPD`,
        agentId,
        deliveryId: delivery.id,
        beneficiaryName: delivery.beneficiaryName,
        rationCardNumber: delivery.rationCardNumber,
        timestamp: now,
        fraudType: "Speed",
        description: `Only ${intervalMinutes.toFixed(1)} minutes between last two deliveries (minimum: ${MIN_DELIVERY_INTERVAL_MINUTES} min). Abnormally fast delivery rate.`,
        status: "Pending Review",
      });
    }
  }

  // Rule 4: Delivery outside assigned zone
  const distanceFromZone = haversineDistance(
    deliveryGps.lat, deliveryGps.lng,
    ASSIGNED_ZONE_CENTER.lat, ASSIGNED_ZONE_CENTER.lng
  );
  if (distanceFromZone > ASSIGNED_ZONE_RADIUS_KM) {
    fraudLogs.push({
      id: `FR-${Date.now()}-ZON`,
      agentId,
      deliveryId: delivery.id,
      beneficiaryName: delivery.beneficiaryName,
      rationCardNumber: delivery.rationCardNumber,
      timestamp: now,
      fraudType: "Zone",
      description: `Agent is ${distanceFromZone.toFixed(1)}km from assigned zone center (max: ${ASSIGNED_ZONE_RADIUS_KM}km). Delivery outside authorized area.`,
      status: "Pending Review",
    });
  }

  return fraudLogs;
}
