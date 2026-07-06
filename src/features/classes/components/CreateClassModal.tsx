import { useState, useEffect } from "react";
import { AppFormSelect, AppFormInput } from "../../../components/FormFields";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";

interface TeacherUser {
  id: string;
  name: string;
}

interface CreateClassResponse {
  id: string;
  schoolId: string;
  grade: string;
  section: string;
  academicYearId: string;
  displayLabel?: string;
  classTeacherId: string;
  roomNumber?: string;
  shift?: string;
}

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newClass: CreateClassResponse) => void;
}

export const CreateClassModal = ({ isOpen, onClose, onCreated }: CreateClassModalProps) => {
  const { schoolProfile, activeAcademicYear } = useApp();
  const activeGrades = schoolProfile?.activeGrades || ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const [gradeLevel, setGradeLevel] = useState(activeGrades[0] || "Grade 10");
  const [section, setSection] = useState("");
  const [room, setRoom] = useState("");
  const [shift, setShift] = useState("Morning Shift");
  const [classTeacher, setClassTeacher] = useState("");
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeGrades.length > 0 && !activeGrades.includes(gradeLevel)) {
      setGradeLevel(activeGrades[0]);
    }
  }, [activeGrades, gradeLevel]);

  useEffect(() => {
    if (!isOpen) return;
    const loadTeachers = async () => {
      const schoolId = localStorage.getItem("school_id") || "";
      const teachersQuery = `
        query GetTeachers($schoolId: ID) {
          users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 200 }) {
            items {
              id
              name
            }
          }
        }
      `;
      try {
        const data = await graphqlRequest<{ users: { items: TeacherUser[] } }>(teachersQuery, { schoolId: schoolId || undefined });
        setTeachers(data.users?.items || []);
      } catch (err) {
        console.error("Failed to load teachers for modal:", err);
      }
    };
    loadTeachers();
  }, [isOpen]);

  if (!isOpen) return null;

  const mapShiftToEnum = (s: string) => {
    if (s.toLowerCase().includes("morning")) return "MORNING";
    if (s.toLowerCase().includes("afternoon")) return "AFTERNOON";
    if (s.toLowerCase().includes("evening")) return "EVENING";
    return "MORNING";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gradeLevel || !section) {
      setError("Grade Level and Section are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const schoolId = localStorage.getItem("school_id") || "";
    const selectedTeacherObj = teachers.find(t => t.name === classTeacher);
    const classTeacherId = selectedTeacherObj ? selectedTeacherObj.id : undefined;

    const createClassMutation = `
      mutation CreateClass(
        $schoolId: String!
        $grade: String!
        $section: String!
        $academicYearId: String!
        $classTeacherId: String
        $shift: ClassShift
        $roomNumber: String
      ) {
        createClass(createClassInput: {
          schoolId: $schoolId
          grade: $grade
          section: $section
          academicYearId: $academicYearId
          classTeacherId: $classTeacherId
          shift: $shift
          roomNumber: $roomNumber
        }) {
          id
          schoolId
          grade
          section
          academicYearId
          displayLabel
          classTeacherId
          shift
          roomNumber
        }
      }
    `;

    try {
      const data = await graphqlRequest<{ createClass: CreateClassResponse }>(createClassMutation, {
        schoolId,
        grade: gradeLevel,
        section,
        academicYearId: activeAcademicYear?.id || "",
        classTeacherId,
        shift: mapShiftToEnum(shift),
        roomNumber: room
      });

      onCreated(data.createClass);
      onClose();
    } catch (err: unknown) {
      console.error("Modal class creation failed:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to create class";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-secondary/60 backdrop-grayscale animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[32px] border border-slate-100 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Create New Class</h2>
            <p className="text-sm text-[#B0AFA8] font-medium">Set up a new grade section and assign faculty.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F8F4] rounded-xl text-[#B0AFA8] transition-colors" disabled={isSaving}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <AppFormSelect
              label="Grade Level"
              options={activeGrades}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            />
            <AppFormInput
              label="Section"
              placeholder="e.g. A, B, C"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>

          <AppFormSelect
            label="Primary Class Teacher"
            options={teachers.map(t => t.name)}
            value={classTeacher}
            onChange={(e) => setClassTeacher(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <AppFormInput
              label="Assigned Room"
              placeholder="e.g. Room 304"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <AppFormSelect
              label="Shift"
              options={["Morning Shift", "Afternoon Shift", "Evening Shift"]}
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-[13px] font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSaving ? "Setting up..." : "Set up Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
