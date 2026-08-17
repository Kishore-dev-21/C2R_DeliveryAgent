import { useDeliveries } from "@/context/DeliveryContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Package } from "lucide-react";

const statusStyles: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  "In Progress": "bg-secondary/10 text-secondary",
  Delivered: "bg-success/10 text-success",
};

const Deliveries = () => {
  const { deliveries } = useDeliveries();
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Deliveries</h2>
        <p className="text-xs text-muted-foreground">Today's assigned deliveries</p>
      </div>

      <div className="space-y-3">
        {deliveries.map((d, i) => (
          <div
            key={d.id}
            className="bg-card rounded-2xl p-4 shadow-card animate-slide-up cursor-pointer hover:shadow-elevated transition-shadow"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => d.status !== "Delivered" && navigate(`/verify/${d.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Package className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{d.beneficiaryName}</p>
                  <p className="text-[10px] text-muted-foreground">{d.rationCardNumber}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${statusStyles[d.status]}`}>
                {d.status}
              </span>
            </div>

            <div className="flex items-start gap-1.5 mb-2">
              <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-tight">{d.address}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {d.items.map((item) => (
                <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>

            {d.status !== "Delivered" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/verify/${d.id}`);
                }}
                className="mt-3 w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-elevated hover:opacity-90 transition-all"
              >
                {d.status === "Pending" ? "Start Delivery" : "Verify & Complete"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deliveries;
