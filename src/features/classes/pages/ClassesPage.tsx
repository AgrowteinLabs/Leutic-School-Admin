import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { ClassCard } from "../../dashboard/components/ClassCard";
import { AppFormInput } from "../../../components/FormFields";
import { AppDropdown } from "../../../components/AppDropdown";
import { useState } from "react";
import { cn } from "../../../lib/utils";


export const ClassesPage = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classes] = useState([
    {
      grade: "Grade 10",
      section: "B",
      room: "Room 304 | Morning Shift",
      status: "Normal",
      statusType: "normal" as const,
      teacher: "Ms. Preetha",
      students: 28,
      participation: 94,
      id: "10-B",
    },
    {
      grade: "Grade 12",
      section: "A",
      room: "Room 102 | Morning Shift",
      status: "Normal",
      statusType: "normal" as const,
      teacher: "Ms. Saritha N S",
      students: 22,
      participation: 88,
      id: "12-A",
    },
    {
      grade: "Grade 9",
      section: "D",
      room: "Lab 1 | Afternoon Shift",
      status: "Attention",
      statusType: "attention" as const,
      teacher: "Ms. Latha Viswanathan",
      students: 31,
      participation: 76,
      id: "9-D",
    },
    {
      grade: "Grade 11",
      section: "C",
      room: "Room 205 | Morning Shift",
      status: "At Risk",
      statusType: "risk" as const,
      teacher: "Dr. Stefna Dias",
      students: 25,
      participation: 62,
      id: "11-C",
    },
    {
      grade: "Grade 10",
      section: "A",
      room: "Room 301 | Morning Shift",
      status: "Normal",
      statusType: "normal" as const,
      teacher: "Ms. Maneesha O M",
      students: 30,
      participation: 91,
      id: "10-A",
    },
    {
      grade: "Grade 11",
      section: "B",
      room: "Room 202 | Afternoon Shift",
      status: "Normal",
      statusType: "normal" as const,
      teacher: "Ms. Rajini Murali",
      students: 26,
      participation: 85,
      id: "11-B",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopBar
        title="Classes"
        subtitle="Overview of all active grade levels and sections."
        actions={
          <>
            <button className="btn-outline h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-lg">
                file_download
              </span>
              Export List
            </button>
            <button
              onClick={() => navigate("/classes/create")}
              className="btn-primary h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
            >
              <span className="material-symbols-outlined text-sm">
                add_circle
              </span>
              New Class
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          {/* Flat Architectural Search and Filters */}
          <div className="bg-white p-3 rounded-[18px] border border-slate-100 flex flex-wrap gap-3 items-center shadow-none focus-within:shadow-none">
            <div className="flex-1 min-w-[350px]">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg">
                  search
                </span>
                <input
                  className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-11 pr-4 h-12 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:shadow-none outline-none transition-all"
                  placeholder="Search classes, teachers, or schedules..."
                  type="text"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AppDropdown
                options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
                value={selectedGrade}
                onChange={setSelectedGrade}
                width="w-44"
                placeholder="Grade Level"
              />

              <AppDropdown
                options={["A", "B", "C", "D"]}
                value={selectedSection}
                onChange={setSelectedSection}
                width="w-32"
                placeholder="Section"
              />

              <button className="h-10 w-10 bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-center text-[#B0AFA8] hover:text-primary hover:bg-white hover:border-primary/30 transition-all outline-none shadow-none focus:shadow-none">
                <span className="material-symbols-outlined text-[20px]">
                  tune
                </span>
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                {...cls}
                onClick={() => navigate(`/classes/${cls.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-10 border-t border-slate-100">
            <p className="text-xs text-[#B0AFA8] font-semi-bold">
              Showing {classes.length} of 42 entries
            </p>
            <div className="flex items-center gap-2">
              <button
                className="size-10 flex items-center justify-center rounded-[10px] border border-slate-100 bg-white text-[#B0AFA8] hover:border-primary/20 hover:text-primary transition-all disabled:opacity-30"
                disabled
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_left
                </span>
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={cn(
                    "size-10 flex items-center justify-center rounded-[10px] text-xs font-black transition-all border",
                    page === 1
                      ? "bg-primary border-primary text-foreground shadow-lg shadow-primary/20"
                      : "bg-white border-slate-100 text-[#B0AFA8] hover:border-primary/20 hover:text-primary"
                  )}
                >
                  {page}
                </button>
              ))}
              <button className="size-10 flex items-center justify-center rounded-[10px] border border-slate-100 bg-white text-[#B0AFA8] hover:border-primary/20 hover:text-primary transition-all">
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
