import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface DBClass {
  id: string;
  grade: string;
  section?: string;
}

type PublishMode = "now" | "draft" | "schedule";

export const AddNoticePage = () => {
  const navigate = useNavigate();

  const [noticeData, setNoticeData] = useState({
    title: "",
    content: "",
    audiences: ["Parents"],
    recipient: "All School",
    attachments: [] as File[],
  });

  const [publishMode, setPublishMode] = useState<PublishMode>("now");
  const [scheduledDate, setScheduledDate] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [modalState, setModalState] = useState<"idle" | "confirm" | "success">("idle");
  const [isPublishing, setIsPublishing] = useState(false);
  const [classesList, setClassesList] = useState<DBClass[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const schoolId = localStorage.getItem("school_id") || undefined;
      try {
        interface GetNoticeClassesResponse {
          classes: {
            items: DBClass[];
          };
        }
        const res = await graphqlRequest<GetNoticeClassesResponse>(`
          query GetNoticeClasses($schoolId: String) {
            classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
              items {
                id
                grade
                section
              }
            }
          }
        `, { schoolId });
        setClassesList(res.classes?.items || []);
      } catch (err) {
        console.error("Failed to load classes for notices:", err);
      }
    };
    fetchClasses();
  }, []);

  const recipientOptions = [
    "All School",
    ...classesList.map(c => `Class: ${c.grade} (${c.section || ""})`)
  ];

  const handlePost = async () => {
    setIsPublishing(true);
    const schoolId = localStorage.getItem("school_id") || "";
    
    const targetRoles = Array.from(
      new Set(
        noticeData.audiences.flatMap(aud => {
          if (aud === "Everyone") return ["STUDENT", "PARENT", "TEACHER", "DRIVER", "SCHOOL_ADMIN"];
          if (aud === "Students") return ["STUDENT"];
          if (aud === "Parents") return ["PARENT"];
          if (aud === "Teachers") return ["TEACHER"];
          return [aud.toUpperCase()];
        })
      )
    );

    let classId: string | undefined = undefined;
    if (noticeData.recipient !== "All School") {
      const selectedIndex = recipientOptions.indexOf(noticeData.recipient) - 1;
      if (selectedIndex >= 0 && classesList[selectedIndex]) {
        classId = classesList[selectedIndex].id;
      }
    }

    // Determine status and scheduledAt from publishMode
    const status = publishMode === "draft" ? "DRAFT"
      : publishMode === "schedule" ? "SCHEDULED"
      : "PUBLISHED";
    const scheduledAt = publishMode === "schedule" && scheduledDate
      ? new Date(scheduledDate).toISOString()
      : undefined;

    try {
      await graphqlRequest<any>(`
        mutation CreateAnnouncement($input: CreateAnnouncementDto!) {
          createAnnouncement(createAnnouncementInput: $input) {
            id
            title
            status
            scheduledAt
          }
        }
      `, {
        input: {
          title: noticeData.title,
          content: noticeData.content,
          targetRoles,
          schoolId,
          classId,
          status,
          scheduledAt,
        }
      });
      setIsPublishing(false);
      setModalState("success");
    } catch (err: unknown) {
      console.error("Failed to create announcement:", err);
      setIsPublishing(false);
      const errMsg = err instanceof Error ? err.message : "Failed to publish notice.";
      alert("Failed to publish notice: " + errMsg);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (files) {
      setNoticeData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(files)]
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setNoticeData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const publishModeMeta: Record<PublishMode, {
    label: string; icon: string; badge: string; badgeClass: string;
  }> = {
    now: {
      label: "Publish Now",
      icon: "send",
      badge: "Ready",
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    draft: {
      label: "Save as Draft",
      icon: "edit_note",
      badge: "Draft",
      badgeClass: "bg-amber-50 text-amber-600 border-amber-100",
    },
    schedule: {
      label: "Schedule",
      icon: "schedule",
      badge: "Scheduled",
      badgeClass: "bg-sky-50 text-sky-600 border-sky-100",
    },
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
      <TopBar
        title="Compose Notice"
        subtitle="Create an official institutional broadcast"
        actions={
          <div className="flex items-center gap-3">
            <PDSButton variant="text" onClick={() => navigate(-1)}>Discard</PDSButton>
            <PDSButton variant="primary" icon="send" onClick={() => setModalState("confirm")}>
              {publishModeMeta[publishMode].label}
            </PDSButton>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">

          <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50 overflow-hidden flex flex-col">

            {/* Form Header */}
            <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center gap-6">
              <div className="size-12 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">campaign</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-[18px] tracking-tight text-foreground">Write a new notice</h4>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1",
                    publishModeMeta[publishMode].badgeClass,
                  )}>
                    <span className="size-1 rounded-full bg-current animate-pulse" />
                    {publishModeMeta[publishMode].badge}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#B0AFA8]">Fill in the details below to send a message to the school community</p>
              </div>

              {/* Mode selector */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                {(["now", "draft", "schedule"] as PublishMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPublishMode(mode)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5",
                      publishMode === mode
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-[#B0AFA8] hover:text-foreground",
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">{publishModeMeta[mode].icon}</span>
                    {publishModeMeta[mode].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-10 space-y-12">
              {/* Row 1: Title & Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <PDSFormGroup
                  label="Notice Title"
                  placeholder="e.g. School Holiday Announcement"
                  value={noticeData.title}
                  onChange={(val) => setNoticeData({ ...noticeData, title: val })}
                />
                <PDSFormGroup
                  label="Send to"
                  type="select"
                  searchable
                  options={recipientOptions}
                  value={noticeData.recipient}
                  onChange={(val) => setNoticeData({ ...noticeData, recipient: val })}
                />
              </div>

              {/* Row 2: Audience Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <PDSFormGroup
                  label="Who should see this? (Select multiple)"
                  type="chips"
                  options={["Students", "Parents", "Teachers", "Everyone"]}
                  value={noticeData.audiences}
                  onChange={(val) => setNoticeData({ ...noticeData, audiences: val })}
                />

                {/* Schedule date picker — visible only when mode is "schedule" */}
                {publishMode === "schedule" && (
                  <div className="space-y-2">
                    <span className="text-[13px] font-bold text-foreground">Schedule Date & Time</span>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground"
                    />
                    <p className="text-[11px] text-[#B0AFA8] font-medium">
                      The backend will auto-publish at this time via the scheduling cron job.
                    </p>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-4 pt-4">
                <PDSFormGroup
                  label="Message"
                  type="textarea"
                  rows={8}
                  placeholder="Type your message here..."
                  value={noticeData.content}
                  onChange={(val) => setNoticeData({ ...noticeData, content: val })}
                />
              </div>

              {/* Attachments Section - Single Cohesive Drop Zone */}
              <section 
                className="pt-6"
                aria-label="File drop zone"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">attach_file</span>
                    <span className="text-[13px] font-bold text-foreground">Attachments</span>
                    {noticeData.attachments.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {noticeData.attachments.length} files
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[12px] font-bold text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span> Add files
                  </button>
                </div>
                
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />

                <div className="space-y-3">
                  {noticeData.attachments.length === 0 ? (
                    <div className={cn(
                      "py-8 px-6 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all duration-500",
                      isDragging 
                        ? "bg-primary/5 border-primary ring-8 ring-primary/5 scale-[1.01]" 
                        : "bg-slate-50/50 border-slate-100 opacity-60"
                    )}>
                      <div className={cn(
                        "size-12 rounded-[18px] flex items-center justify-center transition-all duration-500",
                        isDragging ? "bg-primary text-white rotate-12" : "bg-white text-slate-300 shadow-sm shadow-slate-200"
                      )}>
                        <span className="material-symbols-outlined text-[24px]">
                          {isDragging ? "upload_file" : "cloud_upload"}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-bold text-foreground">
                          {isDragging ? "Drop your files here" : "Add files to your notice"}
                        </p>
                        <p className="text-[10px] font-medium text-[#B0AFA8]">Images or PDF documents (Optional)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {noticeData.attachments.map((file, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={`${file.name}-${file.size}-${file.lastModified}`} 
                          className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-[20px] hover:border-primary/20 transition-all group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="size-8 rounded-[12px] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">
                                {file.type.includes("image") ? "image" : "description"}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold text-foreground truncate">{file.name}</span>
                              <span className="text-[9px] font-medium text-[#B0AFA8]">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveAttachment(i)}
                            className="size-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-200 transition-all ml-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[12px] font-medium text-slate-400 italic">Draft auto-saved</p>
              </div>
              <div className="flex gap-4">
                <PDSButton variant="text" onClick={() => navigate(-1)}>Save and exit</PDSButton>
                <PDSButton variant="primary" icon={publishModeMeta[publishMode].icon} onClick={() => setModalState("confirm")}>
                  {publishModeMeta[publishMode].label}
                </PDSButton>
              </div>
            </div>

            {/* Footer Authorization Banner */}
            <div className="px-10 py-8 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-foreground shadow-sm">
                  <span className="material-symbols-outlined text-[28px] filled text-emerald-500">verified_user</span>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-foreground">Principal Authorization</p>
                  <p className="text-[13px] text-[#B0AFA8] font-medium leading-relaxed">This notice will be published under the Principal's official digital signature.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Authorized</span>
                  <span className="text-[12px] font-bold text-foreground">Dr. Lakshmi K.</span>
                </div>
                <div className="size-12 rounded-xl border border-slate-100 bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-emerald-500 filled">draw</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Publishing Modal */}
      <AnimatePresence>
        {modalState !== "idle" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => modalState === "confirm" && !isPublishing && setModalState("idle")}
              className="absolute inset-0 cursor-pointer"
            />
            
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden relative z-10 p-12 flex flex-col items-center text-center"
            >
              <AnimatePresence mode="wait">
                {modalState === "confirm" ? (
                  <motion.div 
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center gap-8 w-full"
                  >
                    <div className={cn(
                      "size-24 rounded-[32px] flex items-center justify-center shadow-sm shadow-primary/5",
                      publishMode === "now" ? "bg-primary/10 text-primary" :
                      publishMode === "draft" ? "bg-amber-50 text-amber-600" :
                      "bg-sky-50 text-sky-600",
                    )}>
                      <span className="material-symbols-outlined text-[44px]">{publishModeMeta[publishMode].icon}</span>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[26px] font-bold text-foreground tracking-tight">
                        {publishMode === "now" && "Ready to publish?"}
                        {publishMode === "draft" && "Save as Draft?"}
                        {publishMode === "schedule" && "Schedule this notice?"}
                      </h3>
                      <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                        {publishMode === "now" && (
                          <>This will broadcast the notice to <strong>{noticeData.recipient}</strong> and notify all selected audiences immediately.</>
                        )}
                        {publishMode === "draft" && (
                          <>This notice will be saved as a draft. You can publish it later from the announcements page.</>
                        )}
                        {publishMode === "schedule" && (
                          <>This notice will be saved as <strong>SCHEDULED</strong> and auto-published on <strong>{new Date(scheduledDate).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</strong>.</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 w-full pt-4">
                      <button 
                        onClick={() => setModalState("idle")}
                        disabled={isPublishing}
                        className="flex-1 h-12 rounded-2xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <PDSButton 
                        variant="primary"
                        className="flex-1 h-12 rounded-2xl shadow-lg shadow-primary/20"
                        onClick={handlePost}
                        disabled={isPublishing || (publishMode === "schedule" && !scheduledDate)}
                      >
                        {isPublishing ? (
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                          {
                            now: "Yes, Publish Now",
                            draft: "Save as Draft",
                            schedule: "Confirm Schedule"
                          }[publishMode]
                        )}
                      </PDSButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="mb-8 relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                        className="size-32 mx-auto relative z-10"
                      >
                        <Lottie animationData={successAnimation} loop={false} className="w-full h-full" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 size-32 bg-[#EAF2D7] rounded-full mx-auto"
                      />
                    </div>

                    <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">
                      {publishMode === "now" && "Notice Published!"}
                      {publishMode === "draft" && "Draft Saved!"}
                      {publishMode === "schedule" && "Notice Scheduled!"}
                    </h3>
                    <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
                      {publishMode === "now" && "Your institutional broadcast is now live and has been sent to the community."}
                      {publishMode === "draft" && "Your draft has been saved. You can find it under the Drafts filter in the announcements page."}
                      {publishMode === "schedule" && "Your notice will be automatically published at the scheduled time via the cron engine."}
                    </p>

                    <PDSButton
                      variant="primary"
                      className="w-full h-12 shadow-lg"
                      onClick={() => navigate("/communications/announcements")}
                    >
                      Go to Announcements
                    </PDSButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
