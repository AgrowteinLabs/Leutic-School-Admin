import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { AppDropdown } from "../../../components/AppDropdown";

const ParentMessageModal = ({
  isOpen,
  onClose,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  className: string;
}) => {
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl bg-white rounded-[28px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between bg-white z-10 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-[14px] bg-[#EAF2D7] flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">broadcast_on_home</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-foreground tracking-tight">Broadcast to parents</h3>
              <p className="text-[11px] font-medium text-[#8A8A85] capitalize mt-0.5">Target: Guardians of {className}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-[#B0AFA8] transition-all hover:rotate-90"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Two-Column Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Compose Form */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-8 space-y-8 custom-scrollbar border-r border-slate-50">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8A8A85] px-1 capitalize">
                    Broadcast title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Monthly Academic Progress Update"
                    className="w-full h-11 bg-[#F9FAFB] border border-slate-100 rounded-[14px] px-6 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all"
                  />
                </div>
                {/* Title Suggestions / Tags */}
                <div className="flex flex-wrap gap-2 px-1">
                  {["General Update", "Emergency", "Fee Reminder", "Event Invite"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTitle(tag)}
                      className={cn(
                        "px-4 py-1.5 rounded-full border text-[10.5px] font-bold transition-all",
                        title === tag
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          : "bg-[#F9FAFB] border-slate-100 text-[#8A8A85] hover:border-primary/30 hover:bg-white hover:text-primary"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8A8A85] px-1 flex items-center justify-between capitalize">
                  Message body
                  <span className="text-[10px] text-[#B0AFA8] font-medium lowercase">{message.length}/500 chars</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the detailed message for guardians..."
                  className="w-full h-32 bg-[#F9FAFB] border border-slate-100 rounded-[18px] p-6 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8A8A85] px-1 capitalize">
                  Attachment
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {image ? (
                  <div className="relative group rounded-[18px] overflow-hidden border border-slate-100 aspect-video bg-slate-50 shadow-inner max-h-[140px]">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-4">
                      <button onClick={() => fileInputRef.current?.click()} className="size-10 rounded-full bg-white text-foreground flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button onClick={() => setImage(null)} className="size-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-16 bg-[#F9FAFB] border-2 border-dashed border-slate-100 rounded-[14px] flex items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary/40 hover:bg-white hover:text-primary transition-all group shadow-sm"
                  >
                    <div className="size-9 rounded-xl  flex items-center justify-center group-hover:scale-110 transition-transform ">
                      <span className="material-symbols-outlined text-xl">upload_file</span>
                    </div>
                    <span className="text-[12px] font-bold">Upload notification image</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Mobile Preview */}
          <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-start relative p-12 pt-6 overflow-hidden bg-slate-50/30">
            <div className="relative group scale-[0.8] xl:scale-[0.9] transition-transform duration-700 mt-[-32px]">
              <div className="w-[320px] h-[660px] bg-[#0A0A0A] rounded-[48px] border-[1px] border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 rounded-[47px] border-[8px] border-[#1F1F1F] z-50 pointer-events-none shadow-inner" />
                <div className="absolute inset-[2px] rounded-[45px] border-[1px] border-white/5 z-50 pointer-events-none" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-[60] flex items-center justify-center shadow-2xl">
                  <div className="w-8 h-1 bg-white/5 rounded-full absolute bottom-1" />
                </div>
                <div className="h-12 flex justify-between px-10 items-end pb-1.5 relative z-[10]">
                  <span className="text-[12px] font-bold text-white tracking-tight drop-shadow-sm">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  <div className="flex gap-2 items-center">
                    <span className="material-symbols-outlined text-[15px] text-white font-light drop-shadow-sm">signal_cellular_4_bar</span>
                    <span className="material-symbols-outlined text-[15px] text-white font-light drop-shadow-sm">wifi</span>
                    <div className="w-6 h-3 border border-white/60 rounded-[3px] relative p-[1px] flex items-center">
                      <div className="w-full h-full bg-white rounded-[1px]" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col pt-8 relative z-[10] w-full px-2">
                  <div className="text-center mb-8">
                    <p className="text-[16px] font-medium text-white/90">
                      {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <h1 className="text-[76px] font-bold text-white/90 leading-[1.1] tracking-tight drop-shadow-sm">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </h1>
                  </div>
                  <div className="w-full px-2 space-y-2">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={title + message + (image ? "img" : "noimg")}
                      className="bg-[#D9D9D9]/20 backdrop-blur-[24px] rounded-[20px] p-4 border-[0.5px] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex gap-3.5"
                    >
                      <div className="relative">
                        <div className="size-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img src="/logo_icon.png" alt="Icon" className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between mb-0.5 gap-2">
                          <h4 className="text-[15px] font-semibold tracking-tight text-white leading-snug drop-shadow-sm truncate">
                            {title || "Broadcast title"}
                          </h4>
                          <span className="text-[13px] font-normal text-white/60 shrink-0">now</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[14px] text-white/80 font-normal leading-snug line-clamp-2">
                            {message || "Draft your message to see how it looks..."}
                          </p>
                        </div>
                        {image && (
                          <div className="mt-2.5 rounded-[12px] overflow-hidden aspect-video border border-white/10 shadow-sm">
                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute bottom-12 left-10 z-[10]">
                  <div className="size-[50px] rounded-full bg-black/20 backdrop-blur-xl border-[0.5px] border-white/10 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-[24px]">flashlight_on</span>
                  </div>
                </div>
                <div className="absolute bottom-12 right-10 z-[10]">
                  <div className="size-[50px] rounded-full bg-black/20 backdrop-blur-xl border-[0.5px] border-white/10 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-[22px]">photo_camera</span>
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/50 rounded-full z-[70]" />
                <img
                  src="/Wallpaper.png"
                  alt="Wallpaper"
                  className="absolute inset-0 w-full h-full object-cover z-[1]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between z-10">
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-bold text-foreground">Targeting 42 recipients</p>
            <p className="text-[11px] font-medium text-[#8A8A85] capitalize">Verified guardian community</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 h-11 rounded-[14px] text-[14px] font-bold text-[#8A8A85] hover:bg-slate-50 transition-all capitalize"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || message.length < 5 || !title}
              className="btn-primary px-8 h-11 rounded-[14px] text-[14px] font-bold flex items-center gap-2.5 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-primary/10 active:scale-95"
            >
              {isSending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  Broadcasting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Send broadcast
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], value, onChange }: any) => {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[11px] font-bold text-[#B0AFA8] capitalize tracking-normal px-1">
        {label}
      </label>
      <div className="relative">
        {type === "input" && icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-foreground transition-colors z-10">
            {icon}
          </span>
        )}
        {type === "input" ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full h-10.5 bg-[#F7F8F4] border border-slate-100 rounded-xl outline-none text-[13.5px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white",
              icon ? "pl-11 pr-5" : "px-5"
            )}
            placeholder={placeholder}
          />
        ) : (
          <AppDropdown
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            searchable={label.toLowerCase().includes("teacher")}
            icon={icon}
          />
        )}
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, className, onConfirm }: any) => {
  const [confirmText, setConfirmText] = useState("");
  const isMatched = confirmText === className;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-red-100 overflow-hidden"
          >
            <div className="p-7 text-center space-y-5">
              <div className="size-16 rounded-[20px] bg-red-50 flex items-center justify-center text-red-600 mx-auto animate-pulse">
                <span className="material-symbols-outlined text-[32px]">delete_forever</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-[18px] font-bold text-foreground">Delete this class?</h3>
                <p className="text-[12px] text-[#444441] leading-relaxed px-4">
                  This will permanently remove <span className="font-bold text-foreground">{className}</span> and all associated student mappings. <span className="font-bold text-red-600">This action cannot be undone.</span>
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-[#B0AFA8] capitalize tracking-normal">
                  Type <span className="text-foreground">{className}</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={className}
                  className="w-full h-11 bg-[#F7F8F4] border border-slate-100 rounded-[12px] px-6 text-center text-[13px] font-bold text-foreground focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-5 bg-red-50/30 border-t border-red-50 flex gap-3">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                disabled={!isMatched}
                onClick={onConfirm}
                className="flex-[2] bg-red-600 text-white h-11 rounded-xl text-[13px] font-bold shadow-lg shadow-red-500/10 disabled:opacity-30 disabled:grayscale transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ManageClassDrawer = ({ isOpen, onClose, classData, onDelete }: any) => {
  const [grade, setGrade] = useState(classData.grade);
  const [section, setSection] = useState(classData.section);
  const [room, setRoom] = useState(classData.room);
  const [teacher, setTeacher] = useState(classData.teacher);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImport = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] overflow-hidden">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={(e) => {
              console.log("File selected:", e.target.files?.[0]);
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-100 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F7F8F4]/30">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-[14px] bg-[#EAF2D7] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">settings</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-foreground leading-tight">Manage {classData.grade}-{classData.section}</h3>
                  <p className="text-[11px] font-bold text-[#B0AFA8] capitalize tracking-normal mt-0.5">Edit details</p>
                </div>
              </div>
              <button onClick={onClose} className="size-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#B0AFA8] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-7 no-scrollbar">
              <div className="space-y-5">
                <h4 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">info</span>
                  Core identifiers
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Grade" type="select" options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]} value={grade} onChange={setGrade} />
                  <FormGroup label="Section" value={section} onChange={setSection} />
                </div>
                <FormGroup label="Assigned room" icon="meeting_room" value={room} onChange={setRoom} />
                <FormGroup
                  label="Lead teacher"
                  type="select"
                  icon="person"
                  options={["Mr. Marcus Roberts", "Ms. Elena Rodriguez", "Dr. Sarah Jenkins"]}
                  value={teacher}
                  onChange={setTeacher}
                />
              </div>

              {/* Student Roster Mapping */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">group_add</span>
                      Student roster mapping
                    </h4>
                    <span className="text-[10px] font-bold text-[#B0AFA8] capitalize tracking-wide pl-7">{classData.students.length} mapped students</span>
                  </div>
                  <button
                    onClick={handleBulkImport}
                    className="text-[11px] font-bold text-primary flex items-center gap-1.5 hover:underline transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Bulk import
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {classData.students.map((student: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#F7F8F4]/50 border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-primary shadow-sm">
                          {student.initials}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-bold text-foreground leading-tight">{student.name}</span>
                          <span className="text-[10px] font-bold text-[#B0AFA8] capitalize tracking-wide leading-none">ADM-2024-00{i + 1}</span>
                        </div>
                      </div>
                      <button className="size-7 rounded-lg hover:bg-red-50 hover:text-red-600 text-[#B0AFA8] transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[17px]">remove_circle_outline</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative group h-10">
                  <div className="absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-xl transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none" />
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-primary transition-colors z-20">person_search</span>
                  <input
                    type="text"
                    placeholder="Quick add student by name or ID..."
                    className="relative w-full h-full bg-transparent border-none outline-none pl-11 pr-5 text-[13px] font-semibold text-foreground placeholder-[#B0AFA8] z-10"
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex justify-center">
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors capitalize group"
                >
                  <span className="material-symbols-outlined text-[17px] group-hover:scale-110 transition-transform">delete</span>
                  Delete class registry
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-[#F7F8F4]/30 flex gap-3">
              <button onClick={onClose} className="flex-1 h-11 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">
                Discard
              </button>
              <button onClick={onClose} className="flex-[2] btn-primary px-8 h-11 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/10">
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showParentMessageModal, setShowParentMessageModal] = useState(false);
  const [showManageDrawer, setShowManageDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const classData = {
    grade: "Grade 10",
    section: id?.split("-")[1] || "B",
    room: "Room 304",
    teacher: "Mr. Marcus Roberts",
    avgParticipation: 94.2,
    attendanceRate: 98.5,
    activePrograms: 4,
    behaviorFlags: 2,
    students: [
      {
        name: "Alex Bennett",
        initials: "AB",
        participation: 95,
        auraScore: 842,
        status: "Good Standing",
        statusType: "normal" as const,
      },
      {
        name: "Chloe Hughes",
        initials: "CH",
        participation: 72,
        auraScore: 615,
        status: "Behavior Flag",
        statusType: "risk" as const,
      },
      {
        name: "Daniel Moore",
        initials: "DM",
        participation: 88,
        auraScore: 720,
        status: "Good Standing",
        statusType: "normal" as const,
      },
      {
        name: "Emily Stone",
        initials: "ES",
        participation: 45,
        auraScore: 340,
        status: "High Risk",
        statusType: "risk" as const,
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={`${classData.grade} - Section ${classData.section}`}
        subtitle={`Lead Teacher: ${classData.teacher} | ${classData.room}`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowManageDrawer(true)}
              className="btn-outline px-5 h-9.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Manage
            </button>
            <button
              onClick={() => setShowParentMessageModal(true)}
              className="px-5 h-9.5 btn-primary rounded-xl text-[13px] font-bold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Message Parents
            </button>
          </div>
        }
      />

      <div className="px-8 py-3 shrink-0 border-b border-slate-50">
        <nav className="flex items-center gap-2 text-[11px] font-bold text-[#B0AFA8] capitalize tracking-wide">
          <button
            onClick={() => navigate("/classes")}
            className="hover:text-primary transition-colors"
          >
            Classes
          </button>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#444441]">{classData.grade}-{classData.section}</span>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-8 max-w-[1400px] custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              label: "Avg Participation",
              value: `${classData.avgParticipation}%`,
              icon: "equalizer",
              trend: "+1.2% this week",
              trendType: "up" as const,
            },
            {
              label: "Attendance Rate",
              value: `${classData.attendanceRate}%`,
              icon: "calendar_check",
            },
            {
              label: "Active Programs",
              value: String(classData.activePrograms).padStart(2, "0"),
              icon: "assignment",
            },
            {
              label: "Behavior Flags",
              value: String(classData.behaviorFlags).padStart(2, "0"),
              icon: "flag",
              trend: "Action required for 1",
              trendType: "down" as const,
              iconBg: "bg-red-50 text-red-600 border border-red-100",
            },
          ].map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-foreground text-[16px] font-bold tracking-tight">
                    Students in Class
                  </h2>
                  <span className="px-2 py-0.5 rounded-lg bg-[#F7F8F4] border border-slate-100 text-[10px] font-black text-[#B0AFA8] uppercase">
                    {classData.students.length} Total
                  </span>
                </div>
                <div className="relative group h-9.5 w-64">
                  <div className="absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-xl transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none" />
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-[18px] z-20">
                    search
                  </span>
                  <input
                    className="relative w-full h-full bg-transparent border-none outline-none pl-11 pr-4 text-[13px] font-semibold text-foreground placeholder-[#B0AFA8] z-10"
                    placeholder="Search students..."
                    type="text"
                  />
                </div>
              </div>

              <div className="flex items-center gap-8 px-7 py-3 text-[10px] font-black text-[#B0AFA8] uppercase tracking-wider border-b border-slate-50">
                <div className="flex-1">Student Profile</div>
                <div className="w-[180px] px-6">Participation</div>
                <div className="w-24 text-center">Aura</div>
                <div className="w-32">Standing</div>
                <div className="w-10"></div>
              </div>

              <div className="p-3 space-y-2">
                {classData.students.map((student, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-8 p-4 rounded-2xl bg-white border border-slate-50 hover:border-primary/20 hover:bg-[#F7F8F4]/20 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative size-10.5 shrink-0">
                        <div className="absolute inset-0 rounded-[14px] bg-primary/10 group-hover:scale-105 transition-transform duration-300" />
                        <div
                          className="absolute inset-0 rounded-[14px] bg-cover bg-center border-2 border-white shadow-sm z-10"
                          style={{
                            backgroundImage: `url("${[
                              '/Avatar/Female Avatar Age15.png',
                              '/Avatar/Male Avatar Age15.png',
                              '/Avatar/Female Avatar Age14.png',
                              '/Avatar/Male Avatar Age14.png'
                            ][i % 4]
                              }")`
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider leading-none">ADM-{202400 + i + 1}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-[180px] px-6 border-x border-slate-50">
                      <div className="relative size-9 shrink-0">
                        <svg className="size-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5" stroke="#F7F8F4" />
                          <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5"
                            strokeDasharray={2 * Math.PI * 15.5}
                            strokeDashoffset={2 * Math.PI * 15.5 * (1 - student.participation / 100)}
                            stroke={student.participation > 80 ? "#2E7D32" : student.participation > 60 ? "#EF9800" : "#E63535"}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-black text-foreground">{student.participation}%</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#B0AFA8] tracking-wide">
                        {student.participation > 85 ? "Exceptional" : student.participation > 70 ? "Consistent" : "Developing"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center w-24">
                      <span className="text-[14px] font-bold text-foreground">
                        {student.auraScore}
                      </span>
                    </div>

                    <div className="flex items-center w-32">
                      <span
                        className={cn(
                          "inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black capitalize border tracking-tight",
                          student.statusType === "normal"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100",
                        )}
                      >
                        {student.status}
                      </span>
                    </div>

                    <button className="size-8.5 rounded-xl bg-[#F7F8F4] border border-slate-100 text-[#B0AFA8] hover:text-foreground hover:bg-white transition-all flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-center">
                <button className="text-[11px] font-bold text-primary hover:text-foreground capitalize transition-colors">
                  Load More Students
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <h2 className="text-foreground text-[15px] font-bold tracking-tight mb-4 pl-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
              Class Activity
            </h2>
            <div className="relative pl-3 space-y-6">
              <div className="absolute left-[23px] top-2 bottom-2 w-[1.5px] bg-slate-50" />
              {[
                { type: "Curriculum", title: "Assignment Published", msg: "Unit 4: Modern History essays assigned.", time: "1h ago", icon: "inventory", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { type: "Programs", title: "Science Fair Entries", msg: "12 students from 10-B registered.", time: "4h ago", icon: "groups", color: "bg-blue-50 text-blue-600 border-blue-100" },
                { type: "Alert", title: "Absence Threshold", msg: "Emily Stone has reached 5 absences.", time: "Yesterday", icon: "notification_important", color: "bg-red-50 text-red-600 border-red-100", action: "Contact Guardian" },
                { type: "Staff Note", title: "Substitute Scheduled", msg: "Ms. Vance will cover the session.", time: "2d ago", icon: "forum", color: "bg-amber-50 text-amber-600 border-amber-100" },
              ].map((activity, i) => (
                <div key={i} className="relative flex items-start gap-5 group cursor-pointer">
                  <div className={cn("size-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm transition-transform group-hover:scale-110", activity.color)}>
                    <span className="material-symbols-outlined text-[13px]">{activity.icon}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#B0AFA8]">{activity.type}</span>
                      <span className="text-[10px] font-medium text-[#B0AFA8]">{activity.time}</span>
                    </div>
                    <p className="text-[13px] font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">{activity.title}</p>
                    <p className="text-[12px] text-[#444441] leading-snug opacity-70 mb-2">{activity.msg}</p>
                    {activity.action && (
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline text-left">{activity.action}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <ParentMessageModal
        isOpen={showParentMessageModal}
        onClose={() => setShowParentMessageModal(false)}
        className={`${classData.grade}-${classData.section}`}
      />

      <ManageClassDrawer
        isOpen={showManageDrawer}
        onClose={() => setShowManageDrawer(false)}
        classData={classData}
        onDelete={() => setShowDeleteModal(true)}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className={`${classData.grade}-${classData.section}`}
        onConfirm={() => {
          setShowDeleteModal(false);
          setShowManageDrawer(false);
          navigate("/classes");
        }}
      />
    </div>
  );
};
