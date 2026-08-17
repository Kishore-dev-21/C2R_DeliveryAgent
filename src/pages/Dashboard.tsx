import { useAuth } from "@/context/AuthContext";
import { useDeliveries } from "@/context/DeliveryContext";
import { useNavigate } from "react-router-dom";
import { Package, CheckCircle2, Clock, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { agent } = useAuth();
  const { stats, deliveries } = useDeliveries();
  const navigate = useNavigate();
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsActive(true),
        () => setGpsActive(false)
      );
    }
  }, []);

  const completionPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const recentDeliveries = deliveries.filter((d) => d.status === "Delivered").slice(0, 3);

  return (
    <div className="p-4 space-y-5 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Hello, {agent?.name?.split(" ")[0]}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Here's your delivery overview for today</p>
      </div>

      {/* GPS Status */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card shadow-card">
        <div className={`w-2 h-2 rounded-full ${gpsActive ? "bg-success animate-pulse-dot" : "bg-destructive"}`} />
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          GPS: {gpsActive ? "Active" : "Weak Signal"}
        </span>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Today's Progress</h3>
          <span className="text-lg font-bold text-primary">{completionPercent}%</span>
        </div>
        <Progress value={completionPercent} className="h-2.5 mb-4 bg-muted" />
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-secondary/10">
            <Package className="w-4 h-4 text-secondary mb-1" />
            <span className="text-lg font-bold text-foreground">{stats.total}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Total</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-warning/10">
            <Clock className="w-4 h-4 text-warning mb-1" />
            <span className="text-lg font-bold text-foreground">{stats.pending}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Pending</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary mb-1" />
            <span className="text-lg font-bold text-foreground">{stats.inProgress}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Active</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-success/10">
            <CheckCircle2 className="w-4 h-4 text-success mb-1" />
            <span className="text-lg font-bold text-foreground">{stats.completed}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Done</span>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate("/deliveries")}
        className="w-full py-3.5 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm shadow-elevated hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        View All Deliveries <ArrowRight className="w-4 h-4" />
      </button>

      {/* Recent */}
      {recentDeliveries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Deliveries</h3>
          <div className="space-y-2">
            {recentDeliveries.map((d) => (
              <div key={d.id} className="bg-card rounded-xl p-3 shadow-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{d.beneficiaryName}</p>
                  <p className="text-[10px] text-muted-foreground">{d.rationCardNumber}</p>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
                  Delivered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
