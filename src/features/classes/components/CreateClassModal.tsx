
interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newClass: any) => void;
}

export const CreateClassModal = ({ isOpen, onClose, onCreated }: CreateClassModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-secondary/60 backdrop-grayscale animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[32px] border border-slate-100 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Create New Class</h2>
            <p className="text-sm text-[#B0AFA8] font-medium">Set up a new grade section and assign faculty.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F8F4] rounded-xl text-[#B0AFA8] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form className="space-y-5" onSubmit={(e) => {
          e.preventDefault();
          // Mock creation
          onCreated({
            grade: "Grade 10",
            section: "C",
            room: "Room 305 | Morning Shift",
            status: "Normal",
            statusType: "normal",
            teacher: "Dr. New Teacher",
            students: 0,
            participation: 100,
            id: `new-${Date.now()}`
          });
          onClose();
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">Grade Level</label>
              <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-4 py-3 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">Section</label>
              <input
                type="text"
                placeholder="e.g. A, B, C"
                className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-4 py-3 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#B0AFA8]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">Primary Class Teacher</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">person_search</span>
              <input
                type="text"
                placeholder="Search staff directory..."
                className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-12 py-3 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#B0AFA8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">Assigned Room</label>
              <input
                type="text"
                placeholder="e.g. Room 304"
                className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-4 py-3 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#B0AFA8]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">Shift</label>
              <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-4 py-3 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option>Morning Shift</option>
                <option>Afternoon Shift</option>
                <option>Evening Shift</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-[13px] font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5  font-sans"
            >
              Set up Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
