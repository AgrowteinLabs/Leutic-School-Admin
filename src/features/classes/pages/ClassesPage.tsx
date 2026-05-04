import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { ClassCard } from "../../dashboard/components/ClassCard";
import { useState } from "react";

export const ClassesPage = () => {
  const navigate = useNavigate();
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
            <button className="btn-outline h-10 px-6 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-lg">
                file_download
              </span>
              Export List
            </button>
            <button
              onClick={() => navigate("/classes/create")}
              className="btn-primary h-10 px-6 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
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
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-foreground transition-colors">
                  search
                </span>
                <input
                  className="w-full bg-[#F7F8F4]/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-foreground placeholder-[#B0AFA8]"
                  placeholder="Search by class name or teacher..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-white border border-slate-100 rounded-xl text-sm px-3 py-2 text-foreground focus:ring-primary outline-none">
                <option>Grade</option>
                <option>9th Grade</option>
                <option>10th Grade</option>
                <option>11th Grade</option>
                <option>12th Grade</option>
              </select>
              <select className="bg-white border border-slate-100 rounded-xl text-sm px-3 py-2 text-foreground focus:ring-primary outline-none">
                <option>Section</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
              <button className="p-2 border border-slate-100 rounded-xl hover:bg-[#F7F8F4] transition-colors">
                <span className="material-symbols-outlined text-[#B0AFA8] text-lg">
                  filter_list
                </span>
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                {...cls}
                onClick={() => navigate(`/classes/${cls.id}`)}
              />
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <p className="text-xs text-[#B0AFA8] font-medium">
              Showing {classes.length} of 42 classes
            </p>
            <div className="flex items-center gap-2">
              <button
                className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-[#B0AFA8] disabled:opacity-50"
                disabled
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </button>
              <button className="size-8 !min-h-0 flex items-center justify-center rounded border border-primary btn-primary text-xs font-medium shadow-sm shadow-slate-100/30">
                1
              </button>
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-xs font-medium hover:bg-[#F7F8F4] transition-colors">
                2
              </button>
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-xs font-medium hover:bg-[#F7F8F4] transition-colors">
                3
              </button>
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-[#B0AFA8] hover:bg-[#F7F8F4] transition-colors">
                <span className="material-symbols-outlined text-sm">
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
