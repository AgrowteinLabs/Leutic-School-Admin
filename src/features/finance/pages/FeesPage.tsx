import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { TablePagination } from "../../../components/TablePagination";
import { cn } from "../../../lib/utils";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";
import { motion, AnimatePresence } from "framer-motion";

interface FeeSummary {
  totalFees: number;
  collected: number;
  pending: number;
  overdue: number;
  collectionRate: number;
  thisMonthCollection: number;
  monthlyGrowth: number;
  autoRemindersSent: number;
}

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  category: string;
  amount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface FeeCategory {
  id: string;
  name: string;
}

type FeeStatusFilter = "all" | "PAID" | "PENDING" | "OVERDUE";

export const FeesPage = () => {
  const { activeAcademicYear } = useApp();
  const schoolId = localStorage.getItem("school_id") || "";

  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<FeeStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<FeeRecord | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<FeeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Fee state
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Student search for Create Fee
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState<any[]>([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [classesMap, setClassesMap] = useState<Record<string, { grade: string; section: string }>>({});

  // Create Fee form
  const [createStudentName, setCreateStudentName] = useState("");
  const [createGrade, setCreateGrade] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createDueDate, setCreateDueDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Record Payment form
  const [paymentMethod, setPaymentMethod] = useState("Online (Razorpay)");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Bulk reminder state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  // Debounce search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchTerm]);

  // Student search for Create Fee drawer
  const studentSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!showCreateDrawer) return;
    if (studentSearchQuery.trim().length < 2) {
      setStudentSuggestions([]);
      return;
    }
    if (studentSearchTimerRef.current) clearTimeout(studentSearchTimerRef.current);
    studentSearchTimerRef.current = setTimeout(async () => {
      try {
        const res = await graphqlRequest<any>(`
          query SearchStudentsForFee($schoolId: ID, $name: String!) {
            users(filter: { role: "STUDENT", schoolId: $schoolId, name: $name, page: 1, pageSize: 5 }) {
              items {
                id
                name
                admissionNumber
                classId
                isActive
              }
            }
          }
        `, { schoolId: schoolId || undefined, name: studentSearchQuery });
        setStudentSuggestions(res?.users?.items || []);
      } catch {
        setStudentSuggestions([]);
      }
    }, 300);
    return () => { if (studentSearchTimerRef.current) clearTimeout(studentSearchTimerRef.current); };
  }, [studentSearchQuery, showCreateDrawer, schoolId]);

  const handleSelectStudent = (student: any) => {
    setSelectedStudentId(student.id);
    setCreateStudentName(student.name);
    const matchedClass = student.classId ? classesMap[student.classId] : null;
    setCreateGrade(matchedClass ? `${matchedClass.grade}${matchedClass.section ? `-${matchedClass.section}` : ""}` : "");
    setStudentSearchQuery(student.name);
    setShowStudentSuggestions(false);
  };

  const academicYearId = activeAcademicYear?.id || undefined;

  // Fetch fee categories + classes (seeded, fetched once)
  useEffect(() => {
    graphqlRequest<{ feeCategories: FeeCategory[] }>(`
      query GetFeeCategories {
        feeCategories { id name }
      }
    `).then((res) => {
      if (res?.feeCategories) setFeeCategories(res.feeCategories);
    }).catch(() => {});

    // Fetch classes for grade resolution
    graphqlRequest<{ classes: { items: Array<{ id: string; grade: string; section: string }> } }>(`
      query GetClassesForFees($schoolId: String!) {
        classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 200) {
          items { id grade section }
        }
      }
    `, { schoolId }).then((res) => {
      if (res?.classes?.items) {
        const map: Record<string, { grade: string; section: string }> = {};
        res.classes.items.forEach((c) => { map[c.id] = { grade: c.grade, section: c.section || "" }; });
        setClassesMap(map);
      }
    }).catch(() => {});
  }, [schoolId]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await graphqlRequest<{ feeCollectionSummary: FeeSummary }>(`
        query GetFeeCollectionSummary($schoolId: String!, $academicYearId: String) {
          feeCollectionSummary(schoolId: $schoolId, academicYearId: $academicYearId) {
            totalFees
            collected
            pending
            overdue
            collectionRate
            thisMonthCollection
            monthlyGrowth
            autoRemindersSent
          }
        }
      `, { schoolId, academicYearId });
      if (res?.feeCollectionSummary) setSummary(res.feeCollectionSummary);
    } catch (err) {
      console.error("Failed to load fee summary:", err);
    }
  }, [schoolId, academicYearId]);

  // Fetch fee records
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = activeTab === "all" ? undefined : activeTab;
      const res = await graphqlRequest<{ feeRecords: { items: FeeRecord[]; total: number; page: number; pageSize: number } }>(`
        query GetFeeRecords(
          $schoolId: String!, $academicYearId: String, $status: FeeStatus,
          $search: String, $page: Int, $pageSize: Int
        ) {
          feeRecords(
            schoolId: $schoolId, academicYearId: $academicYearId,
            status: $status, search: $search, page: $page, pageSize: $pageSize
          ) {
            items { id studentId studentName grade category amount dueDate status paymentMethod paidAt createdAt }
            total page pageSize
          }
        }
      `, {
        schoolId,
        academicYearId,
        status: statusParam || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      });
      if (res?.feeRecords) {
        setFeeRecords(res.feeRecords.items);
        setTotalRecords(res.feeRecords.total);
      }
    } catch (err) {
      console.error("Failed to load fee records:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, academicYearId, activeTab, debouncedSearch, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Re-fetch when tab/search/page changes
  const refreshData = useCallback(() => {
    fetchSummary();
    fetchRecords();
  }, [fetchSummary, fetchRecords]);

  // ── Record Payment ──────────────────────────────────────
  const handleRecordPayment = async () => {
    if (!showPaymentModal) return;
    setIsRecording(true);
    try {
      await graphqlRequest(`
        mutation RecordPayment($id: ID!, $method: String!, $amount: Float!, $date: DateTime) {
          recordPayment(id: $id, method: $method, amount: $amount, date: $date) {
            id status paymentMethod paidAt
          }
        }
      `, {
        id: showPaymentModal.id,
        method: paymentMethod,
        amount: paymentAmount ? parseFloat(paymentAmount) : showPaymentModal.amount,
        date: paymentDate ? paymentDate.toISOString() : undefined,
      });
      setShowPaymentModal(null);
      setPaymentMethod("Online (Razorpay)");
      setPaymentAmount("");
      setPaymentDate(null);
      refreshData();
    } catch (err) {
      console.error("Failed to record payment:", err);
      alert("Failed to record payment. Please try again.");
    } finally {
      setIsRecording(false);
    }
  };

  // ── Create Fee ──────────────────────────────────────────
  const handleCreateFee = async () => {
    if (!selectedStudentId || !createAmount || !createDueDate) {
      alert("Please fill in all required fields: select a student, enter Amount and Due Date.");
      return;
    }
    setIsCreating(true);
    try {
      await graphqlRequest(`
        mutation CreateFee($input: CreateFeeInput!) {
          createFee(input: $input) {
            id studentName grade category amount dueDate status
          }
        }
      `, {
        input: {
          schoolId,
          academicYearId: academicYearId || undefined,
          studentId: selectedStudentId,
          studentName: createStudentName,
          grade: createGrade || "—",
          category: createCategory || "Tuition Fee",
          amount: parseFloat(createAmount),
          dueDate: createDueDate.toISOString(),
          status: "PENDING",
        }
      });
      setShowCreateDrawer(false);
      setSelectedStudentId(null);
      setCreateStudentName("");
      setStudentSearchQuery("");
      setCreateGrade("");
      setCreateCategory("");
      setCreateAmount("");
      setCreateDueDate(null);
      setStudentSuggestions([]);
      refreshData();
    } catch (err) {
      console.error("Failed to create fee:", err);
      alert("Failed to create fee record. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // ---- Update Fee ----
  const handleUpdateFee = async () => {
    if (!editingFee) return;
    setIsUpdating(true);
    try {
      const input: any = {};
      if (editCategory !== editingFee.category) input.category = editCategory;
      if (String(editAmount) !== String(editingFee.amount)) input.amount = parseFloat(editAmount);
      if (editDueDate?.toISOString().split("T")[0] !== editingFee.dueDate?.split("T")[0]) {
        input.dueDate = editDueDate?.toISOString();
      }
      await graphqlRequest(`
        mutation UpdateFee($id: ID!, $input: UpdateFeeInput!) {
          updateFee(id: $id, input: $input) {
            id studentName grade category amount dueDate status
          }
        }
      `, { id: editingFee.id, input });
      setShowEditModal(false);
      setEditingFee(null);
      refreshData();
    } catch (err) {
      console.error("Failed to update fee:", err);
      alert("Failed to update fee record. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---- Delete Fee ----
  const handleDeleteFee = async () => {
    if (!showDeleteConfirm) return;
    setIsDeleting(true);
    try {
      await graphqlRequest(`
        mutation RemoveFee($id: ID!) {
          removeFee(id: $id)
        }
      `, { id: showDeleteConfirm.id });
      setShowDeleteConfirm(null);
      refreshData();
    } catch (err) {
      console.error("Failed to delete fee:", err);
      alert("Failed to delete fee record. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Send Fee Reminder ───────────────────────────────────
  const handleSendReminder = async () => {
    const idsToRemind = selectedIds.length > 0
      ? selectedIds
      : feeRecords.filter(r => r.status === "PENDING" || r.status === "OVERDUE").map(r => r.id);

    if (idsToRemind.length === 0) {
      alert("No pending or overdue records to remind.");
      return;
    }

    setIsSendingReminders(true);
    try {
      const res = await graphqlRequest<{ sendFeeReminder: number }>(`
        mutation SendFeeReminder($feeRecordIds: [String!]!) {
          sendFeeReminder(feeRecordIds: $feeRecordIds)
        }
      `, { feeRecordIds: idsToRemind });
      const count = res?.sendFeeReminder || 0;
      setShowReminderModal(false);
      setSelectedIds([]);
      refreshData();
      alert(`Reminders sent to ${count} record(s).`);
    } catch (err) {
      console.error("Failed to send reminders:", err);
      alert("Failed to send reminders. Please try again.");
    } finally {
      setIsSendingReminders(false);
    }
  };

  // ── Computed stats from live API data ────────────────────
  const stats = useMemo(() => {
    if (summary) {
      const outstanding = summary.pending + summary.overdue;
      return [
        {
          label: "Total Targeted Fee",
          value: `₹${(summary.totalFees / 100000).toFixed(1)}L`,
          trend: `${summary.collectionRate}% Collected`,
          trendType: "up" as const,
          icon: "account_balance_wallet" as const,
        },
        {
          label: "Outstanding Amount",
          value: `₹${(outstanding / 100000).toFixed(1)}L`,
          trend: `${summary.pending > 0 ? Math.round(summary.pending / (summary.pending + summary.overdue) * 100) : 0}% pending`,
          trendType: "down" as const,
          icon: "pending_actions" as const,
        },
        {
          label: "Collection this Month",
          value: `₹${(summary.thisMonthCollection / 100000).toFixed(1)}L`,
          trend: summary.monthlyGrowth >= 0 ? `+${summary.monthlyGrowth}% vs last month` : `${summary.monthlyGrowth}% vs last month`,
          trendType: summary.monthlyGrowth >= 0 ? "up" as const : "down" as const,
          icon: "trending_up" as const,
        },
        {
          label: "Auto-Reminders Sent",
          value: String(summary.autoRemindersSent),
          trend: "Total reminders",
          trendType: "stable" as const,
          icon: "notifications_active" as const,
        },
      ];
    }
    return [];
  }, [summary]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]";
      case "PENDING":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
      case "OVERDUE":
        return "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]";
      default:
        return "bg-[#F7F8F4] text-[#444441] border-slate-100";
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const PAYMENT_METHODS = [
    "Online (Razorpay)",
    "Bank Transfer",
    "UPI (Google Pay)",
    "Cash",
    "Cheque",
    "Card (POS)",
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title="Tuition & Fees"
        subtitle="Track and manage school fee collections"
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setShowReminderModal(true)}
              className="bg-white border border-slate-100 text-foreground px-6 h-10 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              Bulk Reminder
            </button>
            <button
              onClick={() => setShowCreateDrawer(true)}
              className="btn-primary px-6 h-10 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
            >
              <span className="material-symbols-outlined text-lg font-bold">add</span>
              Set New Fee
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.length > 0 ? stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            )) : (
              <>
                {["Total Targeted Fee", "Outstanding Amount", "Collection this Month", "Auto-Reminders Sent"].map((label, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white border border-slate-100">
                    <div className="size-11 rounded-2xl flex items-center justify-center bg-accent shrink-0">
                      <span className="material-symbols-outlined text-[22px] text-foreground/70 animate-pulse">sync</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#B0AFA8] text-[12px] font-medium truncate">{label}</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <p className="text-foreground text-[22px] font-semibold leading-none tracking-tight">—</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Main Content Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/30 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-1 bg-[#F7F8F4] p-1 rounded-[10px] w-fit">
                {(["all", "PENDING", "PAID", "OVERDUE"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                      activeTab === tab
                        ? "bg-white text-foreground shadow-sm"
                        : "text-[#B0AFA8] hover:text-foreground"
                    )}
                  >
                    {tab === "all" ? "All" : tab.toLowerCase()} Receipts
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#F7F8F4] border border-slate-100 rounded-[10px] text-[13px] font-medium placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Select-all bar when items selected */}
            {selectedIds.length > 0 && (
              <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <span className="text-[12px] font-bold text-foreground">
                  {selectedIds.length} record(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="text-[11px] font-bold text-foreground px-3 py-1.5 bg-white border border-slate-100 rounded-lg hover:bg-[#F7F8F4] transition-all"
                  >
                    Send Reminder
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[11px] font-bold text-[#B0AFA8] hover:text-foreground transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F7F8F4] border-b border-slate-100">
                    <th className="px-6 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === feeRecords.length && feeRecords.length > 0}
                        onChange={() => {
                          if (selectedIds.length === feeRecords.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(feeRecords.map(r => r.id));
                          }
                        }}
                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Student & Grade</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Fee Category</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Due Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">Payment Method</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#444441] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <span className="material-symbols-outlined text-3xl text-[#B0AFA8] animate-spin inline-block">sync</span>
                        <p className="text-[13px] text-[#B0AFA8] font-medium mt-2">Loading records...</p>
                      </td>
                    </tr>
                  ) : feeRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <span className="material-symbols-outlined text-3xl text-[#B0AFA8]">receipt_long</span>
                        <p className="text-[13px] text-[#B0AFA8] font-medium mt-2">No fee records found</p>
                      </td>
                    </tr>
                  ) : (
                    feeRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(record.id)}
                            onChange={() => toggleSelectId(record.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-foreground group-hover:underline decoration-primary underline-offset-4">{record.studentName}</span>
                            <span className="text-[11px] font-medium text-[#B0AFA8]">{record.grade}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[12px] font-medium text-[#444441]">{record.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-black text-foreground">₹{(record.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[12px] font-medium text-[#444441]">
                            {record.dueDate ? new Date(record.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                            getStatusStyles(record.status)
                          )}>
                            {record.status === "PAID" ? "Paid" : record.status === "PENDING" ? "Pending" : "Overdue"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[11px] font-medium",
                            record.paymentMethod ? "text-[#444441]" : "text-[#B0AFA8] italic"
                          )}>
                            {record.paymentMethod || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {(record.status === "PENDING" || record.status === "OVERDUE") && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowPaymentModal(record); }}
                                className="size-8 rounded-lg bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                title="Record Payment"
                              >
                                <span className="material-symbols-outlined text-[18px]">payments</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFee(record);
                                setEditCategory(record.category);
                                setEditAmount(String(record.amount));
                                setEditDueDate(record.dueDate ? new Date(record.dueDate) : null);
                                setShowEditModal(true);
                              }}
                              className="size-8 rounded-lg bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] hover:bg-primary/10 hover:text-primary transition-all"
                              title="Edit Fee Record"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(record); }}
                              className="size-8 rounded-lg bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] hover:bg-red-50 hover:text-red-600 transition-all"
                              title="Delete Fee Record"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={totalRecords}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => { setItemsPerPage(count); setCurrentPage(1); }}
              itemName="fee records"
            />
          </div>

          {/* Quick Analytics & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-secondary text-white p-8 rounded-2xl border-l-[6px] border-primary shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
                <span className="material-symbols-outlined text-9xl">insights</span>
              </div>
              <div className="relative z-10 flex flex-col h-full gap-4">
                <div className="btn-primary size-12 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined font-black">currency_rupee</span>
                </div>
                <div>
                  <h4 className="text-[16px] font-black text-primary mb-2">Revenue Forecast</h4>
                  <p className="text-[13px] text-white/80 leading-relaxed font-medium">
                    {summary ? (
                      <>
                        Expected collection for the remaining quarter is{' '}
                        <span className="text-primary font-bold">
                          ₹{((summary.totalFees - summary.collected) / 100000).toFixed(1)}L
                        </span>{' '}
                        based on past trends. Collection rate is at{' '}
                        <span className="text-primary font-bold">{summary.collectionRate}%</span>.
                      </>
                    ) : (
                      "Loading forecast data..."
                    )}
                  </p>
                </div>
                <button className="mt-auto w-fit px-5 py-2 bg-white/10 hover:bg-white/20 rounded-[10px] text-[12px] font-bold tracking-tight transition-all border border-white/10">
                  Detailed Collection Report →
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm shadow-slate-100/30 flex flex-col justify-between">
              <div>
                <h3 className="text-foreground text-[15px] font-bold mb-1">Collection by Category</h3>
                <p className="text-[#B0AFA8] text-[11px] font-medium italic">
                  {summary ? `₹${(summary.collected / 100000).toFixed(1)}L collected total` : "Loading..."}
                </p>
              </div>
              <div className="space-y-4 my-6">
                {[
                  { label: "Tuition Fees", percent: 75, color: "bg-primary" },
                  { label: "Transport Fees", percent: 15, color: "bg-secondary" },
                  { label: "Activity & Clubs", percent: 10, color: "bg-slate-200" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-[#444441]">
                      <span>{item.label}</span>
                      <span className="text-foreground">{item.percent}%</span>
                    </div>
                    <div className="h-2.5 bg-[#F7F8F4] rounded-full overflow-hidden border border-slate-100/50">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-[12px] font-bold text-[#B0AFA8] hover:text-foreground hover:underline underline-offset-4 self-end transition-all">
                Adjust Fee Structure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Fee Drawer ───────────────────────────────── */}
      <AnimatePresence>
        {showCreateDrawer && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateDrawer(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-100"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-[18px] font-bold text-brand-navy tracking-tight">Set New Fee</h3>
                  <p className="text-[12px] text-[#B0AFA8] font-medium mt-0.5">Create a fee record for a student</p>
                </div>
                <button
                  onClick={() => setShowCreateDrawer(false)}
                  className="size-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-navy transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                {/* Student Search */}
                <div className="space-y-1.5 group relative">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Search Student *</label>
                  <input
                    value={studentSearchQuery}
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setSelectedStudentId(null);
                      setCreateStudentName("");
                      setCreateGrade("");
                    }}
                    onFocus={() => setShowStudentSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStudentSuggestions(false), 200)}
                    placeholder="Search by student name..."
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all"
                  />
                  {selectedStudentId && (
                    <div className="mt-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                        <span className="text-[13px] font-bold text-foreground">{createStudentName}</span>
                        <span className="text-[11px] font-medium text-[#B0AFA8]">{createGrade || "No grade"}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStudentId(null);
                          setStudentSearchQuery("");
                          setCreateStudentName("");
                          setCreateGrade("");
                        }}
                        className="text-[#B0AFA8] hover:text-foreground transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  )}
                  {showStudentSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50">
                      {studentSuggestions.map((student: any) => {
                        const matchedClass = student.classId ? classesMap[student.classId] : null;
                        return (
                          <button
                            key={student.id}
                            onMouseDown={() => handleSelectStudent(student)}
                            className="w-full px-5 py-3 hover:bg-[#F7F8F4] transition-all flex items-center justify-between text-left group"
                          >
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
                                {student.name}
                              </span>
                              <span className="text-[10.5px] font-bold text-[#B0AFA8] uppercase tracking-wider">
                                {matchedClass ? `${matchedClass.grade}${matchedClass.section ? `-${matchedClass.section}` : ""}` : "Unassigned"} • {student.admissionNumber || student.id.slice(0, 8)}
                              </span>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-[#B0AFA8] group-hover:text-primary transition-colors">
                              add_circle
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Grade / Class</label>
                  <input
                    value={createGrade}
                    onChange={(e) => setCreateGrade(e.target.value)}
                    placeholder="e.g. Grade 10-A"
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all"
                  />
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Fee Category</label>
                  <select
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {feeCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {feeCategories.length === 0 && (
                      <>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Transport Fee">Transport Fee</option>
                        <option value="Exam Fee">Exam Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Sports Fee">Sports Fee</option>
                        <option value="Lab Fee">Lab Fee</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all"
                  />
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Due Date *</label>
                  <input
                    type="date"
                    value={createDueDate ? createDueDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => setCreateDueDate(e.target.value ? new Date(e.target.value) : null)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground transition-all"
                  />
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <button
                  onClick={() => setShowCreateDrawer(false)}
                  className="text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFee}
                  disabled={isCreating || !createStudentName || !createAmount || !createDueDate}
                  className="btn-primary px-8 h-11 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Fee Record"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Record Payment Modal ───────────────────────────── */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(null)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[16px] bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-foreground tracking-tight">Record Payment</h3>
                  <p className="text-[12px] text-[#B0AFA8] font-medium">
                    {showPaymentModal.studentName} — ₹{(showPaymentModal.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground appearance-none cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={String(showPaymentModal.amount || 0)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all"
                  />
                  <p className="text-[10px] text-[#B0AFA8] font-medium px-1 mt-1">Leave empty to use full amount</p>
                </div>

                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate ? paymentDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                    onChange={(e) => setPaymentDate(e.target.value ? new Date(e.target.value) : null)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPaymentModal(null)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={isRecording}
                  className="flex-[2] h-12 bg-emerald-600 text-white text-[14px] font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecording ? "Recording..." : `Record Payment`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---- Edit Fee Modal ---- */}
      <AnimatePresence>
        {showEditModal && editingFee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditModal(false); setEditingFee(null); }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[16px] bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-foreground tracking-tight">Edit Fee Record</h3>
                  <p className="text-[12px] text-[#B0AFA8] font-medium">
                    {editingFee.studentName} - Rs.{(editingFee.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Student</label>
                  <input
                    value={editingFee.studentName}
                    disabled
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 text-[14px] font-semibold text-foreground opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Grade</label>
                  <input
                    value={editingFee.grade}
                    disabled
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 text-[14px] font-semibold text-foreground opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Fee Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground appearance-none cursor-pointer"
                  >
                    {feeCategories.length > 0 ? (
                      feeCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Transport Fee">Transport Fee</option>
                        <option value="Exam Fee">Exam Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Sports Fee">Sports Fee</option>
                        <option value="Lab Fee">Lab Fee</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Amount (Rs.) *</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground transition-all"
                  />
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">Due Date *</label>
                  <input
                    type="date"
                    value={editDueDate ? editDueDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditDueDate(e.target.value ? new Date(e.target.value) : null)}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowEditModal(false); setEditingFee(null); }}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFee}
                  disabled={isUpdating}
                  className="flex-[2] h-12 bg-brand-navy text-white text-[14px] font-bold rounded-2xl hover:bg-brand-navy/90 transition-all shadow-lg shadow-brand-navy/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---- Delete Fee Confirmation Modal ---- */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-md w-full shadow-2xl space-y-6 text-center"
            >
              <div className="size-16 rounded-[20px] bg-red-50 flex items-center justify-center text-red-600 mx-auto">
                <span className="material-symbols-outlined text-[32px]">delete_forever</span>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-foreground tracking-tight">Delete Fee Record</h3>
                <p className="text-[13px] text-[#B0AFA8] font-medium mt-1">
                  Are you sure you want to delete the fee record for <span className="font-semibold text-foreground">{showDeleteConfirm.studentName}</span> (₹{(showDeleteConfirm.amount || 0).toLocaleString()})? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-11 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFee}
                  disabled={isDeleting}
                  className="flex-[2] h-11 bg-red-600 text-white text-[14px] font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Send Fee Reminder Modal ────────────────────────── */}
      <AnimatePresence>
        {showReminderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReminderModal(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-md w-full shadow-2xl space-y-6 text-center"
            >
              <div className="size-16 rounded-[20px] bg-amber-50 flex items-center justify-center text-amber-600 mx-auto">
                <span className="material-symbols-outlined text-[32px]">notifications_active</span>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-foreground tracking-tight">Send Fee Reminders</h3>
                <p className="text-[13px] text-[#B0AFA8] font-medium mt-1">
                  {selectedIds.length > 0
                    ? `Send reminders to ${selectedIds.length} selected record(s).`
                    : `Send reminders to all ${feeRecords.filter(r => r.status === "PENDING" || r.status === "OVERDUE").length} pending/overdue records.`
                  }
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 h-11 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={isSendingReminders}
                  className="flex-[2] h-11 bg-amber-600 text-white text-[14px] font-bold rounded-2xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingReminders ? "Sending..." : "Confirm Send"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
