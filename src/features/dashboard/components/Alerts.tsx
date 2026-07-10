import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { graphqlRequest } from "../../../lib/graphqlClient";

const AlertItem = ({
  type,
  title,
  message,
  time,
}: {
  type: "urgent" | "notice" | "info";
  title: string;
  message: string;
  time: string;
}) => {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-50 last:border-0 group cursor-pointer hover:bg-[#F7F8F4] -mx-1 px-1 rounded-[10px] transition-colors">
      <div className={cn(
        "w-1.5 rounded-full shrink-0 mt-1",
        type === "urgent" && "bg-[#E63535]",
        type === "notice" && "bg-[#EF9800]",
        type === "info" && "bg-[#2E77F4]"
      )} style={{ height: "32px" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-medium text-foreground truncate">{title}</p>
          <span className="text-[10px] text-[#B0AFA8] font-medium shrink-0">{time}</span>
        </div>
        <p className="text-[12px] text-[#71716A] leading-relaxed line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  );
};

interface DBNotification {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const getTimeAgo = (dateStr: string) => {
  const diffMs = new Date().getTime() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
};

const getAlertType = (title: string, content: string): "urgent" | "notice" | "info" => {
  const lower = `${title} ${content}`.toLowerCase();
  if (lower.includes("drop") || lower.includes("decline") || lower.includes("missing") || lower.includes("urgent") || lower.includes("critical")) {
    return "urgent";
  }
  if (lower.includes("meeting") || lower.includes("reminder") || lower.includes("info")) {
    return "info";
  }
  return "notice";
};

export const AlertsSection = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<DBNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        interface GetAlertsResponse {
          notifications: {
            items: DBNotification[];
          };
        }
        const res = await graphqlRequest<GetAlertsResponse>(`
          query GetAlertNotifications($page: Int, $pageSize: Int) {
            notifications(page: $page, pageSize: $pageSize) {
              items {
                id
                title
                content
                createdAt
              }
            }
          }
        `, { page: 1, pageSize: 5 });
        setAlerts(res.notifications?.items || []);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className={cn("bg-white border border-slate-100 rounded-2xl flex flex-col h-full overflow-hidden", className)}>
      <div className="p-7 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground text-[17px] font-semibold tracking-tight">Notifications</h3>
          <button 
            onClick={() => navigate("/communications")}
            className="text-[12px] text-[#3D6B2C] font-semibold hover:underline underline-offset-2 transition-colors"
          >
            View All
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pb-3 border-b border-slate-50">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B0AFA8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E63535] flex-shrink-0" />Urgent
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B0AFA8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF9800] flex-shrink-0" />Notice
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B0AFA8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E77F4] flex-shrink-0" />Info
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-7 no-scrollbar space-y-2">
        {isLoading ? (
          <p className="text-[12px] text-[#B0AFA8] font-bold text-center py-6">Loading alerts...</p>
        ) : alerts.length > 0 ? (
          alerts.map((item) => (
            <AlertItem
              key={item.id}
              type={getAlertType(item.title, item.content)}
              title={item.title}
              message={item.content}
              time={getTimeAgo(item.createdAt)}
            />
          ))
        ) : (
          <p className="text-[12px] text-[#B0AFA8] font-bold text-center py-6">No recent alerts</p>
        )}
      </div>
    </div>
  );
};
