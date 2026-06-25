import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { AppDropdown } from "../../../components/AppDropdown";
import { graphqlRequest } from "../../../lib/graphqlClient";

const STUDENT_CLASS_CSV_TEMPLATE = `FullName,AdmissionNumber,RollNumber,Gender,BloodGroup,Address,MobileNo,Email,Password,FatherName,FatherMobile,MotherName,MotherMobile
John Doe,ADM-001,1,Male,O+,123 Main St,9876543210,john@example.com,JohnPass1!,Robert Doe,9876543211,Jane Doe,9876543212
Alice Smith,ADM-002,2,Female,A-,456 Elm St,9876543220,alice@example.com,AlicePass2!,Tom Smith,9876543221,Mary Smith,9876543222`;

const parseCSV = (text: string): string[][] => {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    })
    .filter((row) => row.length > 0 && row.some((cell) => cell !== ""));
};

const escapeCSV = (val: string) => {
  if (val === undefined || val === null) return "";
  const stringVal = String(val);
  if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
};

interface ImportResult {
  rowNumber: number;
  identifier: string;
  status: "success" | "failed";
  error?: string;
  originalRow: Record<string, string>;
  tempPassword?: string;
}

interface StudentUI {
  uid: string;
  name: string;
  id: string;
  initials: string;
  participation: number;
  auraScore: number;
  status: string;
  statusType: "normal" | "risk";
}

interface ClassDetails {
  id: string;
  grade: string;
  section: string;
  room: string;
  shift: string;
  teacher: string;
  teacherId?: string;
  avgParticipation: number;
  attendanceRate: number;
  activePrograms: number;
  behaviorFlags: number;
  students: StudentUI[];
}

const ParentMessageModal = ({
  isOpen,
  onClose,
  className,
  classId
}: {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  classId: string;
}) => {
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    const schoolId = localStorage.getItem("school_id") || "";
    
    const createAnnouncementMutation = `
      mutation CreateAnnouncement($schoolId: String, $classId: String, $title: String!, $content: String!, $targetRoles: [String!]!) {
        createAnnouncement(createAnnouncementInput: {
          schoolId: $schoolId
          classId: $classId
          title: $title
          content: $content
          targetRoles: $targetRoles
        }) {
          id
        }
      }
    `;

    try {
      await graphqlRequest(createAnnouncementMutation, {
        schoolId,
        classId,
        title,
        content: message,
        targetRoles: ["PARENT"]
      });
      setTitle("");
      setMessage("");
      setImage(null);
    } catch (err: unknown) {
      console.error("Broadcast announcement failed:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to broadcast message to parents.";
      alert(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-6xl bg-white rounded-[28px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 flex flex-col h-[85vh]">
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
            aria-label="Close message modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
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
                    <div className="size-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ">
                      <span className="material-symbols-outlined text-xl">upload_file</span>
                    </div>
                    <span className="text-[12px] font-bold">Upload notification image</span>
                  </button>
                )}
              </div>
            </div>
          </div>

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
                        <div className="size-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-white/20">
                          <img src="/logo_icon.png" alt="Icon" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
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
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between z-10">
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-bold text-foreground">Targeting guardians</p>
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

interface FormGroupProps {
  label: string;
  placeholder?: string;
  icon?: string;
  type?: "input" | "select";
  options?: string[];
  value: string;
  onChange: (val: string) => void;
}

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], value, onChange }: FormGroupProps) => {
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

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  onConfirm: () => void;
}

const DeleteConfirmationModal = ({ isOpen, onClose, className, onConfirm }: DeleteModalProps) => {
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

interface TeacherOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
  classId?: string;
  admissionNumber?: string;
  isActive?: boolean;
}

interface ManageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassDetails;
  teachersList: TeacherOption[];
  studentsList: StudentOption[];
  onDelete: () => void;
  onApplyChanges: (fields: { grade: string; section: string; room: string; teacherName: string }) => void;
  onRemoveStudent: (studentId: string) => void;
  onAddStudent: (studentId: string) => void;
  onBulkImport: () => void;
}

const ManageClassDrawer = ({
  isOpen,
  onClose,
  classData,
  teachersList,
  studentsList,
  onDelete,
  onApplyChanges,
  onRemoveStudent,
  onAddStudent,
  onBulkImport
}: ManageDrawerProps) => {
  const [grade, setGrade] = useState(classData?.grade || "");
  const [section, setSection] = useState(classData?.section || "");
  const [room, setRoom] = useState(classData?.room || "");
  const [teacher, setTeacher] = useState(classData?.teacher || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const eligibleStudents = studentsList.filter((s) =>
    s.classId !== classData.id &&
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] overflow-hidden">
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
                  options={teachersList.map((t) => t.name)}
                  value={teacher}
                  onChange={setTeacher}
                />
              </div>

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
                    onClick={onBulkImport}
                    className="text-[11px] font-bold text-primary flex items-center gap-1.5 hover:underline transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Bulk import
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {classData.students.length === 0 ? (
                    <div className="p-4 text-center text-[#B0AFA8] text-[12px] font-semibold bg-[#F7F8F4]/30 rounded-[16px] border border-dashed border-slate-100">
                      No students enrolled in this class yet.
                    </div>
                  ) : (
                    classData.students.map((student, i) => (
                      <div key={student.uid || i} className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#F7F8F4]/50 border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-primary shadow-sm">
                            {student.initials}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold text-foreground leading-tight">{student.name}</span>
                            <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wide leading-none">{student.id}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveStudent(student.uid)}
                          className="size-7 rounded-lg hover:bg-red-50 hover:text-red-600 text-[#B0AFA8] transition-colors flex items-center justify-center"
                          title="Remove from class"
                        >
                          <span className="material-symbols-outlined text-[17px]">remove_circle_outline</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="relative group h-10">
                  <div className="absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-xl transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none" />
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-primary transition-colors z-20">person_search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Quick add student by name..."
                    className="relative w-full h-full bg-transparent border-none outline-none pl-11 pr-5 text-[13px] font-semibold text-foreground placeholder-[#B0AFA8] z-10"
                  />

                  {showSuggestions && searchQuery.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[20] max-h-48 overflow-y-auto custom-scrollbar">
                      {eligibleStudents.length === 0 ? (
                        <div className="p-3 text-[12px] text-[#B0AFA8] font-bold text-center">No students found</div>
                      ) : (
                        eligibleStudents.slice(0, 5).map((student) => (
                          <button
                            key={student.id}
                            onClick={() => {
                              onAddStudent(student.id);
                              setSearchQuery("");
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F7F8F4] flex items-center justify-between border-b border-slate-50 last:border-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-foreground">{student.name}</span>
                              <span className="text-[10px] font-medium text-[#B0AFA8] uppercase tracking-wider">{student.admissionNumber || student.id.slice(0, 8)}</span>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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
              <button
                onClick={() => onApplyChanges({ grade, section, room, teacherName: teacher })}
                className="flex-[2] btn-primary px-8 h-11 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/10"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ActivityUI {
  type: string;
  title: string;
  msg: string;
  time: string;
  icon: string;
  color: string;
}

interface GraphQLClassDetails {
  id: string;
  schoolId: string;
  grade: string;
  section: string;
  classTeacherId: string;
  roomNumber?: string;
  shift?: string;
  capacity?: number;
}

export const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showParentMessageModal, setShowParentMessageModal] = useState(false);
  const [showManageDrawer, setShowManageDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
  const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);
  const [activities, setActivities] = useState<ActivityUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const schoolId = localStorage.getItem("school_id") || "";

    const classQuery = `
      query GetClass($id: ID!) {
        class(id: $id) {
          id
          schoolId
          grade
          section
          classTeacherId
          roomNumber
          shift
          capacity
        }
      }
    `;

    const teachersQuery = `
      query GetTeachers($schoolId: String) {
        users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 200 }) {
          items {
            id
            name
          }
        }
      }
    `;

    const studentsQuery = `
      query GetStudents($schoolId: String) {
        users(filter: { role: "STUDENT", schoolId: $schoolId, page: 1, pageSize: 2000 }) {
          items {
            id
            name
            classId
            admissionNumber
            isActive
          }
        }
      }
    `;

    const classStudentsQuery = `
      query GetClassStudents($classId: ID!) {
        studentsByClass(classId: $classId, page: 1, pageSize: 200) {
          items {
            id
            name
            admissionNumber
            classId
            email
          }
        }
      }
    `;

    try {
      const results = await Promise.allSettled([
        graphqlRequest<{ class: GraphQLClassDetails }>(classQuery, { id }),
        graphqlRequest<{ users: { items: TeacherOption[] } }>(teachersQuery, { schoolId: schoolId || undefined }),
        graphqlRequest<{ users: { items: StudentOption[] } }>(studentsQuery, { schoolId: schoolId || undefined }),
        graphqlRequest<{ studentsByClass: { items: StudentOption[] } }>(classStudentsQuery, { classId: id })
      ]);

      let cls: GraphQLClassDetails | null = null;
      let teachers: TeacherOption[] = [];
      let students: StudentOption[] = [];
      let classStudents: StudentOption[] = [];

      if (results[0].status === "fulfilled") {
        cls = results[0].value.class;
        if (!cls) throw new Error("Class details returned null");
      } else {
        throw new Error("Failed to load class details");
      }

      if (results[1].status === "fulfilled") {
        teachers = results[1].value.users?.items || [];
      }

      if (results[2].status === "fulfilled") {
        students = results[2].value.users?.items || [];
      }

      if (results[3].status === "fulfilled") {
        classStudents = results[3].value.studentsByClass?.items || [];
      }

      setTeachersList(teachers);
      setStudentsList(students);

      const teacherMap = new Map(teachers.map(t => [t.id, t.name]));
      const teacherName = cls.classTeacherId ? (teacherMap.get(cls.classTeacherId) || "No Teacher Assigned") : "No Teacher Assigned";

      const parsedRoom = cls.roomNumber || "Room TBD";
      const parsedShift = cls.shift || "Morning Shift";

      // Fetch aura points in parallel for roster students
      const auraScores = await Promise.all(
        classStudents.map(async (s) => {
          try {
            const auraQuery = `
              query GetStudentAura($studentId: String!) {
                studentAuraPoints(studentId: $studentId) {
                  totalPoints
                }
              }
            `;
            const res = await graphqlRequest<{ studentAuraPoints: { totalPoints: number } }>(auraQuery, { studentId: s.id });
            return {
              id: s.id,
              points: res?.studentAuraPoints?.totalPoints ?? 80
            };
          } catch (e) {
            console.error("Failed to load aura points for student:", s.id, e);
            return { id: s.id, points: 80 };
          }
        })
      );
      const auraMap = new Map(auraScores.map(x => [x.id, x.points]));

      interface NotificationItem {
        id: string;
        title: string;
        content: string;
        targetRoles: string[];
        createdAt: string;
      }

      // Fetch live notifications for timeline
      const notificationsQuery = `
        query GetNotifications {
          notifications(page: 1, pageSize: 5) {
            items {
              id
              title
              content
              targetRoles
              createdAt
            }
          }
        }
      `;
      let loadedNotifications: NotificationItem[] = [];
      try {
        const notRes = await graphqlRequest<{ notifications: { items: NotificationItem[] } }>(notificationsQuery);
        loadedNotifications = notRes?.notifications?.items || [];
      } catch (e) {
        console.error("Failed to load notifications for timeline:", e);
      }

      const timelineActivities = loadedNotifications.map((not, idx) => {
        const typeLabel = not.targetRoles?.join(", ") || "Announcement";
        const icons = ["inventory", "groups", "notification_important", "forum", "campaign"];
        const colors = [
          "bg-emerald-50 text-emerald-600 border-emerald-100",
          "bg-blue-50 text-blue-600 border-blue-100",
          "bg-red-50 text-red-600 border-red-100",
          "bg-amber-50 text-amber-600 border-amber-100",
          "bg-purple-50 text-purple-600 border-purple-100"
        ];
        const dateObj = new Date(not.createdAt);
        const timeAgo = Number.isNaN(dateObj.getTime()) ? "Recently" : dateObj.toLocaleDateString();

        return {
          type: typeLabel,
          title: not.title,
          msg: not.content,
          time: timeAgo,
          icon: icons[idx % icons.length],
          color: colors[idx % colors.length]
        };
      });

      if (timelineActivities.length === 0) {
        setActivities([
          { type: "Curriculum", title: "Assignment Published", msg: "Unit 4: Modern History essays assigned.", time: "1h ago", icon: "inventory", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { type: "Programs", title: "Science Fair Entries", msg: `Registered students from ${cls.grade}-${cls.section || "A"}.`, time: "4h ago", icon: "groups", color: "bg-blue-50 text-blue-600 border-blue-100" },
        ]);
      } else {
        setActivities(timelineActivities);
      }

      const mappedClassStudents = classStudents.map((s) => {
        const participation = 80 + ((s.name.codePointAt(0) || 0) % 20);
        const auraScore = auraMap.get(s.id) ?? 80;
        const isRisk = participation < 85;
        return {
          uid: s.id,
          name: s.name,
          id: s.admissionNumber || s.id.slice(0, 8),
          initials: s.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
          participation,
          auraScore,
          status: isRisk ? "Behavior Flag" : "Good Standing",
          statusType: (isRisk ? "risk" : "normal") as "risk" | "normal"
        };
      });

      setClassDetails({
        id: cls.id,
        grade: cls.grade,
        section: cls.section || "A",
        room: parsedRoom,
        shift: parsedShift,
        teacher: teacherName,
        teacherId: cls.classTeacherId,
        avgParticipation: classStudents.length > 0 ? Math.round(mappedClassStudents.reduce((sum, s) => sum + s.participation, 0) / classStudents.length) : 85,
        attendanceRate: 98.2,
        activePrograms: 3,
        behaviorFlags: mappedClassStudents.filter(s => s.statusType === "risk").length,
        students: mappedClassStudents
      });

    } catch (err: unknown) {
      console.error("Failed to load class details page:", err);
      const errMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const downloadTemplate = () => {
    const content = STUDENT_CLASS_CSV_TEMPLATE;
    const filename = "student_class_import_template.csv";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setImportStatus(null);
    setSelectedFile(file);
    setImportResults([]);
    setCsvHeaders([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setErrorMsg("The CSV file must contain a header row and at least one data row.");
          return;
        }

        const rawHeaders = rows[0];
        setCsvHeaders(rawHeaders);

        const headers = rawHeaders.map((h) => h.toLowerCase().replace(/\s/g, ""));
        const dataRows = rows.slice(1);

        const records = dataRows.map((row) => {
          const record: Record<string, string> = {};
          headers.forEach((header, idx) => {
            record[header] = row[idx] || "";
          });
          return record;
        });

        const invalid = records.some(r => !r.fullname || !r.admissionnumber);
        if (invalid) {
          setErrorMsg("Missing required columns: FullName or AdmissionNumber in one or more rows.");
          return;
        }

        setParsedRecords(records);
      } catch (err) {
        setErrorMsg("Failed to parse CSV file. Ensure it is a valid comma-separated text file.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRecords.length === 0) return;
    setImporting(true);
    setImportStatus("Importing records...");
    setImportResults([]);
    const schoolId = localStorage.getItem("school_id") || "";

    const bulkCreateUsersMutation = `
      mutation BulkCreateUsers($inputs: [CreateUserDto!]!) {
        bulkCreateUsers(inputs: $inputs) {
          totalCount
          succeededCount
          failedCount
          results {
            rowNumber
            identifier
            status
            error
            tempPassword
          }
        }
      }
    `;

    try {
      const inputs = parsedRecords.map((r) => {
        const guardians = [];
        if (r.fathername) {
          guardians.push({
            relationship: "Father",
            fullName: r.fathername,
            mobileNo: r.fathermobile || undefined,
          });
        }
        if (r.mothername) {
          guardians.push({
            relationship: "Mother",
            fullName: r.mothername,
            mobileNo: r.mothermobile || undefined,
          });
        }

        return {
          role: "STUDENT",
          name: r.fullname,
          admissionNumber: r.admissionnumber,
          rollNumber: r.rollnumber || undefined,
          gender: r.gender || "Male",
          bloodGroup: r.bloodgroup || undefined,
          address: r.address || undefined,
          mobileNo: r.mobileno || undefined,
          email: r.email || undefined,
          password: r.password || undefined,
          schoolId,
          classId: id,
          studentStatus: "ACTIVE",
          guardians,
        };
      });

      const response = await graphqlRequest<{
        bulkCreateUsers: {
          totalCount: number;
          succeededCount: number;
          failedCount: number;
          results: Array<{
            rowNumber: number;
            identifier: string;
            status: "SUCCESS" | "FAILED";
            error?: string;
            tempPassword?: string;
          }>;
        };
      }>(bulkCreateUsersMutation, { inputs });

      const { succeededCount, failedCount, results: backendResults } = response.bulkCreateUsers;

      const results: ImportResult[] = backendResults.map((res, idx) => ({
        rowNumber: res.rowNumber || idx + 2,
        identifier: res.identifier,
        status: res.status === "SUCCESS" ? ("success" as const) : ("failed" as const),
        error: res.error || undefined,
        originalRow: parsedRecords[idx],
        tempPassword: res.tempPassword || undefined,
      }));

      setImportResults(results);

      if (failedCount === 0) {
        setImportStatus(`Success! Successfully imported all ${succeededCount} records.`);
      } else {
        setImportStatus(`Import Aborted! 0 records imported. The entire transaction was rolled back due to validation failures on ${failedCount} row(s).`);
      }
    } catch (err: any) {
      console.error("Bulk import failed:", err);
      setImportStatus(`Error: ${err.message || "An unexpected error occurred."}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadFailedCSV = () => {
    const failedResults = importResults.filter((res) => res.status === "failed");
    if (failedResults.length === 0) return;

    const headers = csvHeaders.map((h) => h.toLowerCase().replace(/\s/g, ""));
    const rawHeaders = [...csvHeaders, "ErrorReason"];

    const csvRows = [];
    csvRows.push(rawHeaders.map(escapeCSV).join(","));

    failedResults.forEach((res) => {
      const rowValues = csvHeaders.map((_, idx) => {
        const normalizedKey = headers[idx];
        return res.originalRow[normalizedKey] || "";
      });
      rowValues.push(res.error || "Unknown error");
      csvRows.push(rowValues.map(escapeCSV).join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `failed_student_class_import.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCredentialsCSV = () => {
    const succeededResults = importResults.filter((res) => res.status === "success");
    if (succeededResults.length === 0) return;

    const csvRows = [["FullName", "Email", "Password"].join(",")];

    succeededResults.forEach((res) => {
      const fullName = res.originalRow.fullname || "";
      const email = res.originalRow.email || res.identifier;
      const password = res.tempPassword || res.originalRow.password || "Autogenerated by Backend";
      csvRows.push([escapeCSV(fullName), escapeCSV(email), escapeCSV(password)].join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `imported_student_class_credentials.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClass = async () => {
    const removeMutation = `
      mutation RemoveClass($id: ID!) {
        removeClass(id: $id) {
          id
        }
      }
    `;
    try {
      await graphqlRequest(removeMutation, { id });
      setShowDeleteModal(false);
      setShowManageDrawer(false);
      navigate("/classes");
    } catch (err: unknown) {
      console.error("Failed to delete class:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to delete class";
      alert(errMsg);
    }
  };

  const handleApplyChanges = async (updatedFields: { grade: string; section: string; room: string; teacherName: string }) => {
    const selectedTeacherObj = teachersList.find(t => t.name === updatedFields.teacherName);
    const classTeacherId = selectedTeacherObj ? selectedTeacherObj.id : null;

    const updateMutation = `
      mutation UpdateClass($id: ID!, $grade: String, $section: String, $classTeacherId: String, $roomNumber: String) {
        updateClass(id: $id, updateClassInput: {
          grade: $grade
          section: $section
          classTeacherId: $classTeacherId
          roomNumber: $roomNumber
        }) {
          id
          grade
          section
          classTeacherId
          roomNumber
          shift
          capacity
        }
      }
    `;

    try {
      await graphqlRequest(updateMutation, {
        id,
        grade: updatedFields.grade,
        section: updatedFields.section,
        classTeacherId,
        roomNumber: updatedFields.room
      });
      setShowManageDrawer(false);
      await loadData();
    } catch (err: unknown) {
      console.error("Failed to update class details:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to update class details";
      alert(errMsg);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    const updateStudentMutation = `
      mutation UpdateUser($id: ID!, $classId: String) {
        updateUser(id: $id, updateUserInput: { classId: $classId }) {
          id
        }
      }
    `;
    try {
      await graphqlRequest(updateStudentMutation, { id: studentId, classId: null });
      await loadData();
    } catch (err: unknown) {
      console.error("Failed to remove student from class:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to remove student";
      alert(errMsg);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    const updateStudentMutation = `
      mutation UpdateUser($id: ID!, $classId: String) {
        updateUser(id: $id, updateUserInput: { classId: $classId }) {
          id
        }
      }
    `;
    try {
      await graphqlRequest(updateStudentMutation, { id: studentId, classId: id });
      await loadData();
    } catch (err: unknown) {
      console.error("Failed to add student to class:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to add student";
      alert(errMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-white">
        <TopBar title="Loading class..." subtitle="Retrieving live roster and statistics" />
        <div className="flex-1 flex flex-col items-center justify-center text-[#B0AFA8]">
          <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
          <p className="mt-4 text-[14px] font-bold">Loading roster details...</p>
        </div>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-white">
        <TopBar title="Error loading class" subtitle="Something went wrong" />
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <span className="material-symbols-outlined text-5xl">error</span>
          <p className="mt-4 text-[14px] font-bold">{error || "Class not found"}</p>
          <button onClick={() => navigate("/classes")} className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-foreground font-bold text-[12px] rounded-xl transition-all">
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  const filteredClassStudents = classDetails.students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={`${classDetails.grade} - Section ${classDetails.section}`}
        subtitle={`Lead Teacher: ${classDetails.teacher} | ${classDetails.room}`}
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
            className="hover:text-primary transition-colors animate-none"
          >
            Classes
          </button>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#444441]">{classDetails.grade}-{classDetails.section}</span>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-8 max-w-[1400px] custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              label: "Avg Participation",
              value: `${classDetails.avgParticipation}%`,
              icon: "equalizer",
              trend: "+1.2% this week",
              trendType: "up" as const,
            },
            {
              label: "Attendance Rate",
              value: `${classDetails.attendanceRate}%`,
              icon: "calendar_check",
            },
            {
              label: "Active Programs",
              value: String(classDetails.activePrograms).padStart(2, "0"),
              icon: "assignment",
            },
            {
              label: "Behavior Flags",
              value: String(classDetails.behaviorFlags).padStart(2, "0"),
              icon: "flag",
              trend: classDetails.behaviorFlags > 0 ? `Action required for ${classDetails.behaviorFlags}` : "No outstanding alerts",
              trendType: classDetails.behaviorFlags > 0 ? ("down" as const) : ("up" as const),
              iconBg: classDetails.behaviorFlags > 0 ? "bg-red-50 text-red-600 border border-red-100" : undefined,
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
                    {classDetails.students.length} Total
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
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
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
                {filteredClassStudents.length === 0 ? (
                  <div className="py-12 text-center text-[#B0AFA8] font-bold text-[14px]">
                    No students matching search criteria.
                  </div>
                ) : (
                  filteredClassStudents.map((student, i) => (
                    <div
                      key={student.uid || i}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/students/${student.uid}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          navigate(`/students/${student.uid}`);
                        }
                      }}
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
                          <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider leading-none">{student.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-[180px] px-6 border-x border-slate-50">
                        <div className="relative size-9 shrink-0">
                          <svg className="size-full -rotate-90">
                            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5" stroke="#F7F8F4" />
                            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5"
                              strokeDasharray={String(2 * Math.PI * 15.5)}
                              strokeDashoffset={String(2 * Math.PI * 15.5 * (1 - student.participation / 100))}
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

                      <button className="size-8.5 rounded-xl bg-[#F7F8F4] border border-slate-100 text-[#B0AFA8] hover:text-foreground hover:bg-white transition-all flex items-center justify-center shrink-0" aria-label="View student details">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  ))
                )}
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
              {activities.map((activity, i) => (
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
        className={`${classDetails.grade}-${classDetails.section}`}
        classId={classDetails.id}
      />

      <ManageClassDrawer
        key={classDetails ? `${classDetails.id}-${showManageDrawer}` : "drawer-loading"}
        isOpen={showManageDrawer}
        onClose={() => setShowManageDrawer(false)}
        classData={classDetails}
        teachersList={teachersList}
        studentsList={studentsList}
        onDelete={() => setShowDeleteModal(true)}
        onApplyChanges={handleApplyChanges}
        onRemoveStudent={handleRemoveStudent}
        onAddStudent={handleAddStudent}
        onBulkImport={() => {
          setShowManageDrawer(false);
          setShowBulkModal(true);
        }}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className={`${classDetails.grade}-${classDetails.section}`}
        onConfirm={handleDeleteClass}
      />

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-foreground text-2xl font-bold">Import Students List</h3>
                <p className="text-sm text-[#B0AFA8] font-medium mt-1">Upload CSV files to enroll multiple students to this class at once.</p>
              </div>
              <button 
                onClick={() => {
                  setShowBulkModal(false);
                  setSelectedFile(null);
                  setParsedRecords([]);
                  setErrorMsg(null);
                  setImportStatus(null);
                  setImportResults([]);
                  setCsvHeaders([]);
                }} 
                className="size-10 rounded-full hover:bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] transition-all" 
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Upload Drag & Drop Box */}
            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#F7F8F4] group hover:border-primary transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <div className="size-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-[#B0AFA8] mb-4 group-hover:bg-primary group-hover:text-foreground transition-all">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <p className="text-[15px] font-bold text-foreground">
                {selectedFile ? selectedFile.name : "Select CSV file"}
              </p>
              <p className="text-[12px] text-[#B0AFA8] font-medium mt-1">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Supports .csv files (Max 10MB)"}
              </p>
            </label>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-[12px] font-bold rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-600">error</span>
                <p className="text-left leading-tight">{errorMsg}</p>
              </div>
            )}

            {importStatus && (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 border text-[12px] font-bold rounded-2xl flex items-center justify-between gap-3",
                  importResults.some(r => r.status === "failed") || importStatus.toLowerCase().includes("error")
                    ? "bg-rose-50 border-rose-100 text-rose-800"
                    : "bg-emerald-50 border-emerald-100 text-emerald-800"
                )}>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "material-symbols-outlined",
                      importResults.some(r => r.status === "failed") || importStatus.toLowerCase().includes("error") ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {importResults.some(r => r.status === "failed") || importStatus.toLowerCase().includes("error") ? "error" : "check_circle"}
                    </span>
                    <p className="text-left leading-tight">{importStatus}</p>
                  </div>
                  {importResults.some(r => r.status === "failed") && (
                    <button
                      onClick={downloadFailedCSV}
                      className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download Failed CSV
                    </button>
                  )}
                  {importResults.some(r => r.status === "success") && (
                    <button
                      type="button"
                      onClick={downloadCredentialsCSV}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                      Download Credentials
                    </button>
                  )}
                </div>

                {importResults.some(r => r.status === "failed") && (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="px-4 py-2 border-b border-slate-100 bg-[#F7F8F4] flex justify-between items-center">
                      <p className="text-[11px] font-bold text-foreground">Detailed Failure Log</p>
                      <p className="text-[10px] text-[#B0AFA8] font-bold">{importResults.filter(r => r.status === "failed").length} issues found</p>
                    </div>
                    <div className="max-h-36 overflow-y-auto px-4 py-2 space-y-1.5 divide-y divide-slate-100">
                      {importResults
                        .filter((res) => res.status === "failed")
                        .map((res, idx) => (
                          <div key={idx} className="text-[11px] leading-relaxed flex items-start gap-2 py-1 text-slate-700">
                            <span className="font-bold text-rose-600 shrink-0">Row {res.rowNumber}:</span>
                            <span className="font-bold shrink-0">{res.identifier}</span>
                            <span className="text-[#B0AFA8]">—</span>
                            <span className="text-slate-600">{res.error}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {parsedRecords.length > 0 && !importStatus && !errorMsg && (
              <div className="p-4 bg-blue-50/50 border border-blue-100 text-blue-800 text-[12px] font-bold rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <p className="text-left leading-tight">Ready to import {parsedRecords.length} records successfully validated!</p>
              </div>
            )}

            {/* Template Download Option */}
            <div className="bg-[#F7F8F4] rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">download</span>
                <div className="text-left">
                  <p className="text-[12px] font-bold text-foreground">Download Template</p>
                  <p className="text-[10px] text-[#B0AFA8] font-medium">Pre-formatted student import sheet</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={downloadTemplate} 
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Download CSV
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-50">
              {importResults.length > 0 ? (
                <button 
                  onClick={() => {
                    setShowBulkModal(false);
                    setSelectedFile(null);
                    setParsedRecords([]);
                    setErrorMsg(null);
                    setImportStatus(null);
                    setImportResults([]);
                    setCsvHeaders([]);
                    loadData();
                  }}
                  className="btn-primary flex-1"
                >
                  Close & Refresh Roster
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setShowBulkModal(false);
                      setSelectedFile(null);
                      setParsedRecords([]);
                      setErrorMsg(null);
                      setImportStatus(null);
                      setImportResults([]);
                      setCsvHeaders([]);
                    }} 
                    className="btn-outline flex-1"
                    disabled={importing}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleImport}
                    disabled={parsedRecords.length === 0 || importing || !!errorMsg} 
                    className={cn(
                      "btn-primary flex-1",
                      (parsedRecords.length === 0 || importing || !!errorMsg) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {importing ? "Importing..." : `Import ${parsedRecords.length || ""} Records`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
