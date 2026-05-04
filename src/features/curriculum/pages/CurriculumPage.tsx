import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

export const CurriculumPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const [activeTab, setActiveTab] = useState<"mapping" | "subjects" | "syllabic">("mapping");
  const [showAssignModal, setShowAssignModal] = useState(false);

  const subjects = [
    { id: "SUB-001", name: "Mathematics", head: "Dr. Lakshmi K.", teachers: 4, classes: 8, intensity: "High" },
    { id: "SUB-002", name: "Modern Physics", head: "Dhanya S.", teachers: 3, classes: 6, intensity: "Medium" },
    { id: "SUB-003", name: "World History", head: "Arvind S.", teachers: 2, classes: 5, intensity: "Medium" },
    { id: "SUB-004", name: "English Literature", head: "Ms. Deepika S.", teachers: 5, classes: 10, intensity: "High" },
  ];

  const mappings = [
    { class: "Grade 10-A", subject: "Mathematics", teacher: "Dr. Lakshmi K.", students: 32, schedule: "Mon, Wed, Fri", status: "Active" },
    { class: "Grade 10-B", subject: "Mathematics", teacher: "Ms. Saritha", students: 28, schedule: "Tue, Thu, Sat", status: "Active" },
    { class: "Grade 11-A", subject: "Modern Physics", teacher: "Dhanya S.", students: 30, schedule: "Mon, Thu", status: "Incomplete" },
    { class: "Grade 12-C", subject: "World History", teacher: "Arvind S.", students: 25, schedule: "Wed, Fri", status: "Active" },
  ];

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-white", !isHubChild && "h-screen")}>
      {!isHubChild && (
        <TopBar
          title="Curriculum"
          subtitle="Manage subjects and class mapping"
          actions={
            <div className="flex gap-3">
               <button className="btn-outline px-4 py-2 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-lg">auto_stories</span>
                Add Subject
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30 "
              >
                <span className="material-symbols-outlined text-sm">assignment_ind</span>
                Assign mapping
              </button>
            </div>
          }
        />
      )}

      <div className="px-8 pt-6 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex gap-8">
          {[
            { id: "mapping", label: "Subject Mapping", icon: "hub" },
            { id: "subjects", label: "Subject Inventory", icon: "inventory_2" },
            { id: "syllabic", label: "Syllabic Tracker", icon: "fact_check" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 pb-4 text-[13px] font-semibold tracking-tight transition-all relative",
                activeTab === tab.id ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground",
              )}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-8 max-w-[1400px] ">
        {activeTab === "mapping" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">

                {/* Visual Mapping Cards for Quick View */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        onClick={() => setShowAssignModal(true)}
                        className="bg-[#F7F8F4]/50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all"
                    >
                        <div className="size-10 rounded-full bg-white flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary group-hover:text-foreground mb-3 transition-all">
                            <span className="material-symbols-outlined">add</span>
                        </div>
                        <p className="text-[12px] font-bold text-foreground">New Teacher Mapping</p>
                        <p className="text-[10px] text-[#B0AFA8] mt-1">Assign subject to teacher</p>
                    </div>
                    <div
                        onClick={() => setShowAssignModal(true)}
                        className="bg-[#F7F8F4]/50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all"
                    >
                        <div className="size-10 rounded-full bg-white flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary group-hover:text-foreground mb-3 transition-all">
                            <span className="material-symbols-outlined">person_add</span>
                        </div>
                        <p className="text-[12px] font-bold text-foreground">New Student Mapping</p>
                        <p className="text-[10px] text-[#B0AFA8] mt-1">Enroll students to subject</p>
                    </div>
                    <div className="bg-secondary text-white rounded-2xl p-4 flex flex-col justify-between">
                        <div>
                        <p className="text-[10px] font-bold text-primary">System Audit</p>
                        <p className="text-[12px] font-medium text-white/70 mt-1">3 unassigned sections found for this term.</p>
                        </div>
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="text-[11px] font-bold text-primary hover:underline underline-offset-4 mt-4 w-fit"
                        >
                            Resolve Now →
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-foreground text-[16px] font-bold tracking-tight">Active Mappings</h3>
                        <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">Teacher and Student associations per class</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">search</span>
                        <input
                            className="pl-10 pr-4 py-2 bg-[#F7F8F4]/50 border border-slate-100 rounded-xl text-xs w-64 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            placeholder="Search class, teacher or subject..."
                            type="text"
                        />
                        </div>
                        <button className="size-9 bg-[#F7F8F4] border border-slate-100 rounded-xl flex items-center justify-center text-[#B0AFA8] hover:text-foreground hover:bg-[#F7F8F4] transition-all">
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                        </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#F7F8F4]/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Class Entity</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Subject</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Mapped Teacher</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-[#444441] text-center">Enrolled Students</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Status</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-[#444441] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {mappings.map((m, i) => (
                          <tr key={i} className="hover:bg-[#F7F8F4]/50 transition-colors group cursor-pointer">
                            <td className="px-6 py-4 font-bold text-[13px] text-foreground">{m.class}</td>
                            <td className="px-6 py-4 font-bold">
                              <span className="px-2.5 py-1 rounded-lg bg-[#F0F0EC] text-foreground text-[11px] border border-slate-200/50 tracking-wider">
                                {m.subject}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-foreground group-hover:bg-primary transition-all">
                                  {m.teacher.split(" ").pop()?.charAt(0)}
                                </div>
                                <span className="text-[13px] font-semibold text-[#444441] group-hover:text-foreground transition-colors">
                                  {m.teacher}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-[13px] font-bold text-foreground bg-[#F7F8F4] px-3 py-1 rounded-lg border border-slate-100">{m.students}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                    m.status === "Active" ? "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]" : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                                )}>
                                    {m.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                <button className="size-8 rounded-lg bg-[#F0F0EC] flex items-center justify-center text-[#B0AFA8] hover:text-foreground hover:bg-primary transition-all">
                                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                </button>
                                <button className="size-8 rounded-lg bg-[#F0F0EC] flex items-center justify-center text-[#B0AFA8] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-all">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30">
                  <h3 className="text-foreground text-[12px] font-bold mb-6">Subject Distribution</h3>
                  <div className="space-y-5">
                    {subjects.map((sub, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold capitalize tracking-tight text-[#444441]">
                          <span>{sub.name}</span>
                          <span className="text-foreground">{sub.classes} Units</span>
                        </div>
                        <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden border border-slate-200/20">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(219,232,144,0.5)]"
                            style={{ width: `${(sub.classes / 12) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-100 text-[11px] font-bold text-[#B0AFA8] hover:text-foreground hover:bg-[#F7F8F4] transition-all">
                      View Subject Inventory →
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30">
                  <h3 className="text-foreground text-[12px] font-bold mb-4">Mapping Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#F7F8F4] p-3 rounded-2xl border border-slate-100">
                          <p className="text-[10px] text-[#B0AFA8] font-bold">Assigned</p>
                          <p className="text-[18px] font-bold text-foreground mt-1">92%</p>
                      </div>
                      <div className="bg-[#F7F8F4] p-3 rounded-2xl border border-slate-100">
                          <p className="text-[10px] text-[#B0AFA8] font-bold">Pending</p>
                          <p className="text-[18px] font-bold text-[#B45309] mt-1">08%</p>
                      </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* Subjects Tab Content */}
        {activeTab === "subjects" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subjects.map((sub, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">auto_stories</span>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary group-hover:text-foreground group-hover:border-primary transition-all shadow-sm">
                            <span className="material-symbols-outlined text-2xl font-light">auto_stories</span>
                        </div>
                        <span className={cn(
                            "text-[9px] font-bold px-2.5 py-1 rounded-lg border",
                            sub.intensity === "High" ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]" : "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]"
                        )}>
                            {sub.intensity} Load
                        </span>
                    </div>
                    <h3 className="text-[17px] font-bold text-foreground mb-1 group-hover:underline decoration-primary underline-offset-4">{sub.name}</h3>
                    <p className="text-[11px] text-[#B0AFA8] font-bold mt-1">HOD: {sub.head}</p>
                    <div className="mt-8 grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                        <div>
                            <p className="text-[10px] text-[#B0AFA8] font-bold">Teachers</p>
                            <p className="text-[15px] font-bold text-foreground">{sub.teachers}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#B0AFA8] font-bold">Active Units</p>
                            <p className="text-[15px] font-bold text-foreground">{sub.classes}</p>
                        </div>
                    </div>
                </div>
                ))}

                {/* Add New Subject Card */}
                <div className="bg-[#F7F8F4]/50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary hover:bg-white transition-all shadow-sm">
                    <div className="size-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary group-hover:text-foreground group-hover:border-primary mb-4 transition-all">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <p className="text-[14px] font-bold text-foreground">New Subject</p>
                    <p className="text-[11px] text-[#B0AFA8] font-medium mt-1">Add to institutional catalog</p>
                </div>
            </div>
          </div>
        )}

        {/* Syllabic Tracker Tab Content (Placeholder) */}
        {activeTab === "syllabic" && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="size-20 bg-[#F7F8F4] rounded-full flex items-center justify-center text-[#B0AFA8]">
                    <span className="material-symbols-outlined text-5xl">fact_check</span>
                </div>
                <div>
                    <h3 className="text-foreground text-lg font-black tracking-tight">Syllabus Progress Tracker</h3>
                    <p className="text-[13px] text-[#B0AFA8] max-w-sm mx-auto font-medium">Coming soon: Track real-time completion status of syllabus topics across all grades and subjects.</p>
                </div>
            </div>
        )}
      </div>

      {/* Basic Assign Modal Mockup */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-secondary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
                <div>
                    <h3 className="text-foreground text-xl font-bold">Assign New Mapping</h3>
                    <p className="text-sm text-[#B0AFA8] font-medium">Connect a teacher and students to an academic subject.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#B0AFA8]">Target Class</label>
                        <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground">
                            <option>Select Grade & Section</option>
                            <option>Grade 10-C</option>
                            <option>Grade 9-A</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#B0AFA8]">Subject</label>
                        <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground">
                            <option>Select Subject</option>
                            <option>Advanced Mathematics</option>
                            <option>Biology Honors</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#B0AFA8]">Assigned Teacher</label>
                        <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground">
                            <option>Search Staff</option>
                            <option>Mr. Menon (Grade Lead)</option>
                            <option>Ms. Nair</option>
                        </select>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-bold text-[#B0AFA8]">Student Enrollment</label>
                            <button className="text-[10px] font-bold text-primary hover:underline">Select All</button>
                        </div>
                        <div className="bg-[#F7F8F4] border border-slate-100 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-3">
                            {[
                                { name: "Rahul K.", id: "STU-001" },
                                { name: "Sneha R.", id: "STU-002" },
                                { name: "Aryan Sreekumar", id: "STU-003" },
                                { name: "Priya D.", id: "STU-004" },
                                { name: "Zaid Muhammad", id: "STU-005" },
                            ].map((stu) => (
                                <div key={stu.id} className="flex items-center gap-3">
                                    <div className="size-4 rounded border border-slate-300 bg-white flex items-center justify-center cursor-pointer">
                                        <div className="size-2 bg-primary rounded-sm opacity-0 group-hover:opacity-100" />
                                    </div>
                                    <span className="text-[12px] font-medium text-[#444441]">{stu.name}</span>
                                    <span className="text-[10px] text-[#B0AFA8] ml-auto font-bold">{stu.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={() => setShowAssignModal(false)}
                        className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all">Cancel</button>
                    <button
                        onClick={() => setShowAssignModal(false)}
                        className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-[13px] font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 ">Finalize Assignment</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
