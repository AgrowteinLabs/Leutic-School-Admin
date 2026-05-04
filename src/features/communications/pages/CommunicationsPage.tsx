import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";


export const CommunicationsPage = ({
  isHubChild,
}: {
  isHubChild?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Messages"
          subtitle="Internal school chat and coordination"
          actions={
            <button className="btn-primary px-4 py-2.5 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-sm">
                edit_square
              </span>
              New Message
            </button>
          }
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Inbox Sidebar Hidden as requested */}
        
        {/* Message Content Area - Now expanded */}
        <main className="flex-1 flex flex-col bg-white">
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-[#F7F8F4] size-24 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-foreground/20">
                chat_bubble
              </span>
            </div>
            <h3 className="text-[16px] font-semibold text-foreground mb-2">
              Messages & Coordination Hub
            </h3>
            <p className="text-sm text-[#B0AFA8] max-w-xs leading-relaxed">
              Internal staff chats and institutional coordination are active. Select a thread or start a new coordination session.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
