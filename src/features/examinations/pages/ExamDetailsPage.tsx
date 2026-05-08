import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../../components/StatCard";
import { TopBar } from "../../../components/Header";
import { PDSButton } from "../../../components/pds/PDSButton";
import { TablePagination } from "../../../components/TablePagination";
import { AppDropdown } from "../../../components/AppDropdown";

export const ExamDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedGrade, setSelectedGrade] = useState("Grade (All)");
  const [selectedSection, setSelectedSection] = useState("Section (All)");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const examData = {
    title: "Mid-Term Examination 2024",
    id: id || "EX-2024-001",
    status: "Completed",
    totalClasses: 8,
    classesPublished: 6,
    subjects: [
      {
        name: "Mathematics",
        teacher: "Dr. Lakshmi K.",
        avgScore: 76.5,
        submissions: "100%",
        status: "Published",
      },
      {
        name: "Science",
        teacher: "Dhanya S.",
        avgScore: 82.1,
        submissions: "100%",
        status: "Published",
      },
      {
        name: "History",
        teacher: "Arvind S.",
        avgScore: 74.8,
        submissions: "98%",
        status: "Reviewing",
      },
      {
        name: "English Literature",
        teacher: "Ms. Deepika S.",
        avgScore: 79.2,
        submissions: "100%",
        status: "Published",
      },
    ],
    classSubmissions: [
      { name: "Grade 10-A", status: "Published", teacher: "Ms. Maneesha O M", updatedBy: "Ms. Maneesha", time: "2h ago" },
      { name: "Grade 10-B", status: "Published", teacher: "Mr. Marcus Roberts", updatedBy: "Mr. Marcus", time: "5h ago" },
      { name: "Grade 9-A", status: "Published", teacher: "Ms. Saritha N S", updatedBy: "Ms. Saritha", time: "1d ago" },
      { name: "Grade 9-B", status: "Pending", teacher: "Ms. Preetha", updatedBy: "-", time: "-" },
      { name: "Grade 11-A", status: "Published", teacher: "Dr. Stefna Dias", updatedBy: "Dr. Stefna", time: "2d ago" },
      { name: "Grade 12-A", status: "Reviewing", teacher: "Ms. Latha Viswanathan", updatedBy: "Ms. Latha", time: "3h ago" },
    ],
    studentPerformance: [
      {
        name: "Adarsh V.",
        grade: "10B",
        math: 85,
        science: 90,
        history: 88,
        english: 82,
        gpa: 3.8,
        img: "/Avatar/Male Avatar Age15.png",
      },
      {
        name: "Isha K.",
        grade: "10B",
        math: 65,
        science: 72,
        history: 68,
        english: 70,
        gpa: 2.9,
        img: "/Avatar/Female Avatar Age14.png",
      },
      {
        name: "Kabir M.",
        grade: "10B",
        math: 92,
        science: 88,
        history: 94,
        english: 90,
        gpa: 4.0,
        img: "/Avatar/Male Avatar Age16.png",
      },
      {
        name: "Sneha R.",
        grade: "10B",
        math: 42,
        science: 55,
        history: 48,
        english: 50,
        gpa: 2.1,
        img: "/Avatar/Female Avatar Age13.png",
      },
    ],
    logs: [
      { user: "Ms. Maneesha O M", action: "Uploaded marks for Grade 10-A", time: "2 hours ago" },
      { user: "Ms. Latha Viswanathan", action: "Requested review for Grade 12-A", time: "3 hours ago" },
      { user: "Mr. Marcus Roberts", action: "Published results for Grade 10-B", time: "5 hours ago" },
      { user: "Admin (You)", action: "Edited Math weightage", time: "1 day ago" },
    ]
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={examData.title || "Examination Detail"}
        subtitle={`${examData.date || "Academic Year 2024"} • ${examData.type || "Final Assessment"} • ID: ${examData.id}`}
        onBack={() => navigate("/examinations")}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 space-y-8">
          
          {/* 1. Executive Summary - Reusable StatCards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Candidates" 
              value="1,240" 
              icon="groups" 
              tooltip="Total students enrolled for this examination"
            />
            <StatCard 
              label="Average Score" 
              value="78.4%" 
              icon="equalizer" 
              trend="+2.4% vs Term 1"
              trendType="up"
              iconBg="bg-emerald-50"
            />
            <StatCard 
              label="Upload Progress" 
              value={`${examData.classesPublished}/${examData.totalClasses}`} 
              icon="cloud_upload" 
              trend="75% Complete"
              trendType="stable"
              iconBg="bg-amber-50"
            />
            <StatCard 
              label="Institutional Rank" 
              value="Tier A" 
              icon="workspace_premium" 
              iconBg="bg-blue-50"
            />
          </div>

          {/* 2. Toppers Spotlight */}
          {/* 2. Institutional Achievers Table */}
          <section className="space-y-4">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col overflow-hidden">
               {/* Integrated Search and Filters */}
               <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 relative z-20 bg-white">
                  <div className="flex-1">
                     <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                           search
                        </span>
                        <input
                           className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-11 pr-4 h-10 text-[13px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all"
                           placeholder="Search student by name or ID..."
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                     <AppDropdown
                        options={["Grade (All)", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
                        value={selectedGrade}
                        onChange={setSelectedGrade}
                        width="w-[140px]"
                        searchable={true}
                     />
                     <AppDropdown
                        options={["Section (All)", "Section A", "Section B", "Section C"]}
                        value={selectedSection}
                        onChange={setSelectedSection}
                        width="w-[140px]"
                        searchable={true}
                     />
                     <div className="flex items-center gap-2 ml-1">
                        {/* Hover Dropdown for Export */}
                        <div className="relative group/export-menu">
                          <button className="h-10 px-4 bg-white border border-slate-100 rounded-xl flex items-center gap-2 group/export whitespace-nowrap hover:bg-[#F7F8F4] transition-all">
                            <span className="material-symbols-outlined text-[18px] group-hover/export:translate-y-[-1px] transition-transform text-[#444441]/70">download</span>
                            <span className="text-[13px] font-bold text-[#444441]">Export</span>
                            <span className="material-symbols-outlined text-[16px] opacity-40 group-hover/export:rotate-180 transition-transform">expand_more</span>
                          </button>

                          {/* Hover Content */}
                          <div className="absolute top-[calc(100%+8px)] right-0 w-[180px] bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 opacity-0 invisible translate-y-2 group-hover/export-menu:opacity-100 group-hover/export-menu:visible group-hover/export-menu:translate-y-0 transition-all duration-200 z-[100] overflow-hidden p-1.5">
                            <button className="w-full px-4 py-2.5 text-[11px] font-bold text-[#444441] hover:bg-[#F7F8F4] rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap text-left">
                              <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">description</span>
                              Download as CSV
                            </button>
                            <button className="w-full px-4 py-2.5 text-[11px] font-bold text-[#444441] hover:bg-[#F7F8F4] rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap text-left">
                              <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">picture_as_pdf</span>
                              Download as PDF
                            </button>
                          </div>
                        </div>

                        <PDSButton variant="primary" size="sm" icon="upload" className="h-10 px-6 text-[12px] font-bold shadow-lg shadow-primary/20">Upload Marks</PDSButton>
                     </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-[#F7F8F4]/30 border-b border-slate-100">
                        <tr>
                           <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Rank</th>
                           <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Student Achiever</th>
                           <th className="px-4 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Grade/Sec</th>
                           <th className="px-4 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-center">Trend</th>
                           <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right">Total Marks</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {[
                           { rank: 1, name: "Kabir M.", class: "Grade 10-B", marks: "492", total: "500", trend: "up", badges: ["Exam Topper"], img: "/Avatar/Male Avatar Age16.png" },
                           { rank: 2, name: "Saritha K.", class: "Grade 9-A", marks: "488", total: "500", trend: "stable", badges: ["Section Lead"], img: "/Avatar/Female Avatar Age14.png" },
                           { rank: 3, name: "Isha K.", class: "Grade 12-A", marks: "485", total: "500", trend: "up", badges: ["Section Lead"], img: "/Avatar/Female Avatar Age13.png" },
                           { rank: 4, name: "Adarsh V.", class: "Grade 10-A", marks: "478", total: "500", trend: "down", badges: ["Distinction"], img: "/Avatar/Male Avatar Age15.png" },
                           { rank: 5, name: "Rahul S.", class: "Grade 11-A", marks: "472", total: "500", trend: "stable", badges: ["Distinction"], img: "/Avatar/Male Avatar Age16.png" },
                        ].map((topper, i) => (
                           <tr key={i} className="group hover:bg-[#F7F8F4] transition-colors cursor-pointer border-b border-slate-50 last:border-0">
                              <td className="px-6 py-4">
                                 <div className="size-8 rounded-lg flex items-center justify-center text-[13px] font-black bg-white text-slate-400 border border-slate-100 group-hover:border-primary group-hover:text-primary transition-all">
                                    {topper.rank}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-cover bg-center border border-slate-100 shadow-sm" style={{ backgroundImage: `url("${topper.img}")` }} />
                                    <div>
                                       <p className="text-[14px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{topper.name}</p>
                                       <div className="flex gap-2 mt-1">
                                          {topper.badges.map((badge, j) => (
                                             <span key={j} className="text-[9px] font-bold uppercase text-[#B0AFA8] tracking-widest">{badge}</span>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-foreground leading-none mb-1">{topper.class.split("-")[0]}</span>
                                    <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Section {topper.class.split("-")[1]}</span>
                                 </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                 <span className="material-symbols-outlined text-[18px] text-emerald-500">
                                    {topper.trend === "up" ? "trending_up" : topper.trend === "down" ? "trending_down" : "trending_flat"}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[15px] font-black text-foreground">{topper.marks}</span>
                                    <span className="text-[10px] text-[#B0AFA8] font-bold tracking-widest uppercase">/ {topper.total} Marks</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               <TablePagination
                  totalItems={24}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(count) => {
                     setItemsPerPage(count);
                     setCurrentPage(1);
                  }}
                  itemName="achievers"
               />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
