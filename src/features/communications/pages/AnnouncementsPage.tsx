import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { TablePagination } from "../../../components/TablePagination";

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  targetRoles: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
}

interface AnnouncementStats {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  archivedCount: number;
}

const STATUS_FILTERS = ["all", "published", "drafts", "scheduled", "archived"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_MAP: Record<StatusFilter, string | undefined> = {
  all: undefined,
  published: "PUBLISHED",
  drafts: "DRAFT",
  scheduled: "SCHEDULED",
  archived: "ARCHIVED",
};

export const AnnouncementsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const schoolId = localStorage.getItem("school_id") || "";

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit state
  const [editingAnn, setEditingAnn] = useState<AnnouncementRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<string>("PUBLISHED");

  // Delete state
  const [deletingAnn, setDeletingAnn] = useState<AnnouncementRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch stats
  useEffect(() => {
    if (!schoolId) return;
    graphqlRequest<{ announcementStats: AnnouncementStats }>(`
      query GetAnnouncementStats($schoolId: String!) {
        announcementStats(schoolId: $schoolId) {
          totalCount
          publishedCount
          draftCount
          scheduledCount
          archivedCount
        }
      }
    `, { schoolId }).then(res => {
      if (res?.announcementStats) setStats(res.announcementStats);
    }).catch(() => {});
  }, [schoolId]);

  // Fetch announcements with filters + pagination
  useEffect(() => {
    if (!schoolId) return;
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const statusParam = STATUS_MAP[activeFilter];

        const res = await graphqlRequest<{
          announcements: { items: AnnouncementRecord[]; total: number; page: number; pageSize: number }
        }>(`
          query GetAnnouncementsList(
            $schoolId: String!, $status: AnnouncementStatus,
            $page: Int, $pageSize: Int
          ) {
            announcements(schoolId: $schoolId, status: $status, page: $page, pageSize: $pageSize) {
              items {
                id
                title
                content
                targetRoles
                status
                scheduledAt
                publishedAt
                createdAt
              }
              total
              page
              pageSize
            }
          }
        `, {
          schoolId,
          status: statusParam || undefined,
          page: currentPage,
          pageSize: itemsPerPage,
        });

        setAnnouncements(res.announcements?.items || []);
        setTotalRecords(res.announcements?.total || 0);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, [schoolId, activeFilter, currentPage, itemsPerPage]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Client-side search filter (backend doesn't support search yet)
  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm.trim()) return announcements;
    const q = searchTerm.toLowerCase();
    return announcements.filter(
      a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [announcements, searchTerm]);

  // Status badges
  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
      PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
      DRAFT: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
      SCHEDULED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
      ARCHIVED: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
    };
    const c = config[status] || config.DRAFT;
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${c.bg} inline-flex`}>
        <div className={`size-1.5 rounded-full ${c.dot}`} />
        <span className={`text-[11px] font-bold ${c.text} capitalize`}>{status.toLowerCase()}</span>
      </div>
    );
  };

  // Open edit modal with pre-filled data
  const handleOpenEdit = (ann: AnnouncementRecord) => {
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditStatus(ann.status);

    // Map backend role strings to frontend chip labels
    const roleMap: Record<string, string> = {
      STUDENT: "Students",
      PARENT: "Parents",
      TEACHER: "Teachers",
    };
    const frontendRoles = Array.from(
      new Set(ann.targetRoles.map(r => roleMap[r] || "Everyone"))
    );
    setEditRoles(frontendRoles);
  };

  const handleCloseEdit = () => {
    setEditingAnn(null);
    setEditTitle("");
    setEditContent("");
    setEditRoles([]);
    setEditStatus("PUBLISHED");
  };

  // Save edit via mutation
  const handleSaveEdit = async () => {
    if (!editingAnn || !editTitle.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const targetRoles = Array.from(
        new Set(
          editRoles.flatMap((role) => {
            if (role === "Everyone") return ["STUDENT", "PARENT", "TEACHER", "DRIVER", "SCHOOL_ADMIN"];
            if (role === "Students") return ["STUDENT"];
            if (role === "Parents") return ["PARENT"];
            if (role === "Teachers") return ["TEACHER"];
            return [role.toUpperCase()];
          })
        )
      );

      await graphqlRequest(`
        mutation UpdateAnnouncement($id: ID!, $updateAnnouncementInput: UpdateAnnouncementDto!) {
          updateAnnouncement(id: $id, updateAnnouncementInput: $updateAnnouncementInput) {
            id
            title
            status
          }
        }
      `, {
        id: editingAnn.id,
        updateAnnouncementInput: {
          title: editTitle,
          content: editContent,
          targetRoles,
          status: editStatus,
        }
      });

      // Update local state
      setAnnouncements(prev =>
        prev.map(a =>
          a.id === editingAnn.id
            ? { ...a, title: editTitle, content: editContent, targetRoles, status: editStatus as AnnouncementRecord["status"] }
            : a
        )
      );

      // Refresh stats
      const statsRes = await graphqlRequest<{ announcementStats: AnnouncementStats }>(`
        query GetAnnouncementStats($schoolId: String!) {
          announcementStats(schoolId: $schoolId) {
            totalCount publishedCount draftCount scheduledCount archivedCount
          }
        }
      `, { schoolId });
      if (statsRes?.announcementStats) setStats(statsRes.announcementStats);

      handleCloseEdit();
    } catch (err) {
      console.error("Failed to update announcement:", err);
      alert("Failed to update notice. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle audience role chip
  const toggleRole = (role: string) => {
    setEditRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  // Delete via mutation (soft delete — status → ARCHIVED)
  const handleDelete = async () => {
    if (!deletingAnn || isDeleting) return;
    setIsDeleting(true);
    try {
      await graphqlRequest(`
        mutation ArchiveAnnouncement($id: ID!) {
          archiveAnnouncement(id: $id) {
            id
            status
          }
        }
      `, { id: deletingAnn.id });

      setAnnouncements(prev => prev.filter(a => a.id !== deletingAnn.id));
      setDeletingAnn(null);

      // Refresh stats
      const statsRes = await graphqlRequest<{ announcementStats: AnnouncementStats }>(`
        query GetAnnouncementStats($schoolId: String!) {
          announcementStats(schoolId: $schoolId) {
            totalCount publishedCount draftCount scheduledCount archivedCount
          }
        }
      `, { schoolId });
      if (statsRes?.announcementStats) setStats(statsRes.announcementStats);
    } catch (err) {
      console.error("Failed to archive announcement:", err);
      alert("Failed to delete notice. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-white", !isHubChild && "h-screen")}>
      {!isHubChild && (
        <TopBar
          title="School Notices"
          subtitle="Official school broadcasts and engagement tracking"
          actions={
            <button
              onClick={() => navigate("/communications/announcements/add")}
              className="btn-primary h-10 px-6 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Post Announcement
            </button>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar py-8 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto space-y-10">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Stats Summary — from announcementStats API */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">campaign</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">Total Notices</p>
                    <p className="text-xl font-black text-foreground mt-0.5">
                      {!stats ? (
                        <span className="inline-block w-12 h-6 rounded-md bg-slate-100 animate-pulse" />
                      ) : (
                        stats.totalCount
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">Published</p>
                    <p className="text-xl font-black text-foreground mt-0.5">
                      {!stats ? (
                        <span className="inline-block w-12 h-6 rounded-md bg-slate-100 animate-pulse" />
                      ) : (
                        stats.publishedCount
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">Drafts</p>
                    <p className="text-xl font-black text-foreground mt-0.5">
                      {!stats ? (
                        <span className="inline-block w-12 h-6 rounded-md bg-slate-100 animate-pulse" />
                      ) : (
                        stats.draftCount
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">Scheduled</p>
                    <p className="text-xl font-black text-foreground mt-0.5">
                      {!stats ? (
                        <span className="inline-block w-12 h-6 rounded-md bg-slate-100 animate-pulse" />
                      ) : (
                        stats.scheduledCount
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Table Container */}
            <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
              <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 rounded-t-[24px] relative z-20">
                <div className="flex-1">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search notices..."
                      className="input-base w-full pl-11 pr-4 placeholder:text-[#B0AFA8] placeholder:font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {STATUS_FILTERS.map((filter) => {
                    const isActive = activeFilter === filter;
                    const countKey = filter === "all" ? "totalCount"
                      : filter === "published" ? "publishedCount"
                      : filter === "drafts" ? "draftCount"
                      : filter === "scheduled" ? "scheduledCount"
                      : "archivedCount" as keyof AnnouncementStats;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                          "px-5 py-2 text-[12px] font-bold transition-all rounded-xl capitalize border",
                          isActive
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white border-slate-100 text-[#B0AFA8] hover:text-foreground/70 hover:bg-slate-50",
                        )}
                      >
                        {filter}
                        {stats && (
                          <span className={cn(
                            "ml-1.5 px-1.5 py-0.5 rounded text-[10px]",
                            isActive ? "bg-white/20 text-white/80" : "bg-slate-100 text-[#B0AFA8]"
                          )}>
                            {stats[countKey]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Notice Detail</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Audience Scope</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-[12px] text-[#B0AFA8] font-bold">
                          Loading announcements...
                        </td>
                      </tr>
                    ) : filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((ann) => (
                        <tr key={ann.id} className="hover:bg-[#F7F8F4]/50 transition-colors group">
                          <td className="px-6 py-4 min-w-[320px]">
                            <div className="space-y-1">
                              <p className="text-[13px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{ann.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{ann.content}</p>
                              <div className="flex items-center gap-3 pt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 tracking-tight">{ann.id.slice(0, 8)}</span>
                                <div className="size-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-400 tracking-tight">
                                  {new Date(ann.createdAt).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" })}
                                </span>
                                {ann.scheduledAt && (
                                  <>
                                    <div className="size-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-bold text-amber-500 tracking-tight">
                                      Sched: {new Date(ann.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "2-digit" })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {ann.targetRoles.map((v, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200 uppercase">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {statusBadge(ann.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(ann)}
                                className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                                title="Edit notice"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => setDeletingAnn(ann)}
                                className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
                                title="Archive notice"
                              >
                                <span className="material-symbols-outlined text-[18px]">archive</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-[12px] text-[#B0AFA8] font-bold">
                          No announcements found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalRecords > itemsPerPage && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalRecords / itemsPerPage)}
                    totalItems={totalRecords}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                  />
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ✏️ Edit Announcement Modal */}
      <AnimatePresence>
        {editingAnn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full border-0 p-0 block cursor-default"
              onClick={handleCloseEdit}
              aria-label="Close edit backdrop"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-lg w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-navy tracking-tight">Edit Notice</h3>
                <button onClick={handleCloseEdit} className="size-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Title</span>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Notice title"
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Content</span>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Notice content..."
                    rows={4}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground resize-none"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Status</span>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground cursor-pointer"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-2">Audience</span>
                  <div className="flex flex-wrap gap-2">
                    {["Students", "Parents", "Teachers", "Everyone"].map((role) => {
                      const isSelected = editRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[12px] font-bold transition-all border",
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white border-slate-100 text-[#B0AFA8] hover:text-foreground/70 hover:bg-slate-50",
                          )}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseEdit}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || isSaving}
                  className="flex-1 h-12 bg-primary text-foreground text-[14px] font-bold rounded-2xl hover:bg-primary/95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  ) : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🗑️ Archive Confirmation Modal */}
      <AnimatePresence>
        {deletingAnn && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full border-0 p-0 block cursor-default"
              onClick={() => setDeletingAnn(null)}
              aria-label="Close archive backdrop"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-sm w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-14 rounded-full bg-rose-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-500 text-3xl">archive</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy tracking-tight">Archive Notice?</h3>
                  <p className="text-[13px] text-[#B0AFA8] font-medium mt-1 leading-relaxed">
                    "<span className="font-bold text-foreground">{deletingAnn.title}</span>" will be archived and hidden from the school community. You can restore it later by changing its status.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingAnn(null)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Archive"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
