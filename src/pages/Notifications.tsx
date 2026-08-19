import { useNotifications } from "@/context/NotificationContext";
import { useLanguage } from "@/context/LanguageContext";
import { Bell, CheckCheck, ShieldAlert, Package, Info, ShieldCheck } from "lucide-react";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { language, t } = useLanguage();

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("nav_notifications")}</h2>
          <p className="text-xs text-muted-foreground">Operational alerts and shop administrator updates</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-foreground">No notifications at this time</p>
          </div>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.read;
            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`bg-card rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  isUnread ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    {item.type === "security" ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : item.type === "admin" ? (
                      <ShieldAlert className="w-4 h-4 text-warning" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {language === "ta" ? item.titleTa : item.titleEn}
                      </h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {language === "ta" ? item.messageTa : item.messageEn}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
