import { AppFormSelect, AppFormInput } from "../../../components/FormFields";

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
            <AppFormSelect
              label="Grade Level"
              options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
            />
            <AppFormInput
              label="Section"
              placeholder="e.g. A, B, C"
            />
          </div>

          <AppFormInput
            label="Primary Class Teacher"
            placeholder="Search staff directory..."
            icon="person_search"
          />

          <div className="grid grid-cols-2 gap-4">
            <AppFormInput
              label="Assigned Room"
              placeholder="e.g. Room 304"
            />
            <AppFormSelect
              label="Shift"
              options={["Morning Shift", "Afternoon Shift", "Evening Shift"]}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-[13px] font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5"
            >
              Set up Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
