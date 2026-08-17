import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeliveries } from "@/context/DeliveryContext";
import { useFraud } from "@/context/FraudContext";
import { useAuth } from "@/context/AuthContext";
import { runFraudDetection } from "@/lib/fraud-detection";
import { Fingerprint, MapPin, CheckCircle2, XCircle, ArrowLeft, Loader2, Wifi } from "lucide-react";
import { toast } from "sonner";

const Verify = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deliveries, updateDelivery } = useDeliveries();
  const { addFraudLogs } = useFraud();
  const { agent } = useAuth();
  const delivery = deliveries.find((d) => d.id === id);

  const [step, setStep] = useState<"connect" | "scan" | "result" | "confirm">("connect");
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [rdConnected, setRdConnected] = useState(false);
  const [biometricAttempts, setBiometricAttempts] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGps({ lat: 13.0827, lng: 80.2707 }) // fallback mock
      );
    } else {
      setGps({ lat: 13.0827, lng: 80.2707 });
    }
  }, []);

  if (!delivery) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Delivery not found</p>
      </div>
    );
  }

  const connectRD = async () => {
    setRdConnected(false);
    await new Promise((r) => setTimeout(r, 1500));
    setRdConnected(true);
    toast.success("Mantra RD Service Connected");
    setStep("scan");
  };

  const startScan = async () => {
    setScanStatus("scanning");
    setBiometricAttempts((prev) => prev + 1);
    await new Promise((r) => setTimeout(r, 2500));
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    setScanStatus(success ? "success" : "failed");
    if (success) {
      toast.success("UIDAI: Authentication Successful");
      setStep("result");
    } else {
      toast.error("UIDAI: Authentication Failed");
    }
  };

  const confirmDelivery = () => {
    const deliveryGps = gps || { lat: 13.0827, lng: 80.2707 };
    const nowIso = new Date().toISOString();

    updateDelivery(delivery.id, {
      status: "Delivered",
      verified: true,
      gpsLocation: deliveryGps,
      timestamp: nowIso,
    });

    // Run fraud detection
    const recentTimestamps = deliveries
      .filter((d) => d.status === "Delivered" && d.timestamp)
      .map((d) => d.timestamp!)
      .concat([nowIso]);

    const fraudResults = runFraudDetection({
      delivery,
      agentId: agent?.agentId || "UNKNOWN",
      biometricAttempts,
      deliveryGps,
      recentDeliveryTimestamps: recentTimestamps,
    });

    if (fraudResults.length > 0) {
      addFraudLogs(fraudResults);
      toast.warning(`${fraudResults.length} fraud alert(s) flagged for review`);
    }

    toast.success("Delivery confirmed successfully!");
    setStep("confirm");
    setTimeout(() => navigate("/deliveries"), 1500);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/deliveries")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Verify Delivery</h2>
          <p className="text-xs text-muted-foreground">{delivery.beneficiaryName}</p>
        </div>
      </div>

      {/* Delivery Info Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Ration Card</p>
            <p className="font-medium text-card-foreground">{delivery.rationCardNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Aadhaar (Last 4)</p>
            <p className="font-medium text-card-foreground">XXXX-XXXX-{delivery.aadhaarLast4}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium text-card-foreground">{delivery.address}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Items</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {delivery.items.map((item) => (
                <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GPS Info */}
      <div className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <MapPin className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-medium text-card-foreground">GPS Location</p>
          {gps ? (
            <p className="text-[11px] text-muted-foreground">
              {gps.lat.toFixed(4)}°N, {gps.lng.toFixed(4)}°E
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Fetching location...</p>
          )}
        </div>
        <div className={`ml-auto w-2 h-2 rounded-full ${gps ? "bg-success animate-pulse-dot" : "bg-warning"}`} />
      </div>

      {/* Step: Connect RD Service */}
      {step === "connect" && (
        <div className="bg-card rounded-2xl p-5 shadow-card text-center animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
            <Wifi className="w-7 h-7 text-accent-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Connect Mantra Scanner</h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Ensure the Mantra MTerminal100 is connected via USB OTG or Bluetooth
          </p>
          <button
            onClick={connectRD}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-elevated hover:opacity-90 transition-all"
          >
            Connect RD Service
          </button>
        </div>
      )}

      {/* Step: Scan Fingerprint */}
      {step === "scan" && (
        <div className="bg-card rounded-2xl p-5 shadow-card text-center animate-slide-up">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
            scanStatus === "scanning"
              ? "gradient-primary animate-pulse"
              : scanStatus === "success"
              ? "bg-success"
              : scanStatus === "failed"
              ? "bg-destructive"
              : "bg-accent"
          }`}>
            {scanStatus === "scanning" ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : scanStatus === "success" ? (
              <CheckCircle2 className="w-8 h-8 text-success-foreground" />
            ) : scanStatus === "failed" ? (
              <XCircle className="w-8 h-8 text-destructive-foreground" />
            ) : (
              <Fingerprint className="w-8 h-8 text-accent-foreground" />
            )}
          </div>

          <h3 className="text-sm font-semibold text-card-foreground mb-1">
            {scanStatus === "idle" && "Ready to Scan"}
            {scanStatus === "scanning" && "Scanning Fingerprint..."}
            {scanStatus === "success" && "Verification Successful!"}
            {scanStatus === "failed" && "Verification Failed"}
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            {scanStatus === "idle" && "Place beneficiary's finger on the scanner"}
            {scanStatus === "scanning" && "Verifying with UIDAI server..."}
            {scanStatus === "success" && "Identity confirmed via UIDAI Aadhaar"}
            {scanStatus === "failed" && "Fingerprint did not match. Please try again."}
          </p>

          {(scanStatus === "idle" || scanStatus === "failed") && (
            <button
              onClick={startScan}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-elevated hover:opacity-90 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Capture Fingerprint
              </span>
            </button>
          )}
        </div>
      )}

      {/* Step: Result + Confirm */}
      {step === "result" && (
        <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up">
          <div className="text-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-card-foreground">Ready to Confirm</h3>
            <p className="text-[11px] text-muted-foreground">Biometric verified • GPS captured</p>
          </div>

          <div className="bg-muted rounded-xl p-3 text-xs space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biometric</span>
              <span className="text-success font-medium">Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPS</span>
              <span className="text-card-foreground font-medium">
                {gps ? `${gps.lat.toFixed(4)}°N, ${gps.lng.toFixed(4)}°E` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="text-card-foreground font-medium">{new Date().toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            onClick={confirmDelivery}
            className="w-full py-3 rounded-xl bg-success text-success-foreground text-sm font-semibold shadow-elevated hover:opacity-90 transition-all"
          >
            Confirm Delivery
          </button>
        </div>
      )}

      {/* Step: Confirmed */}
      {step === "confirm" && (
        <div className="bg-card rounded-2xl p-5 shadow-card text-center animate-slide-up">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
          <h3 className="text-lg font-bold text-card-foreground">Delivery Confirmed!</h3>
          <p className="text-xs text-muted-foreground mt-1">Redirecting to deliveries...</p>
        </div>
      )}

      {/* Architecture Note */}
      <div className="bg-muted/50 rounded-xl p-3 text-[10px] text-muted-foreground">
        <p className="font-medium mb-1">Signal Processing Flow:</p>
        <p>Scanner → RD Service (Encrypt) → UIDAI Auth → GPS Fusion → Verified Record</p>
      </div>
    </div>
  );
};

export default Verify;
