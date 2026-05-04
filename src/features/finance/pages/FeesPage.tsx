import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { cn } from "../../../lib/utils";

export const FeesPage = () => {
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "paid">("all");

    const feeStats = [
        {
            label: "Total Targeted Fee",
            value: "₹42.8L",
            trend: "94% Collected",
            trendType: "up" as const,
            icon: "account_balance_wallet",
        },
        {
            label: "Outstanding Amount",
            value: "₹2.4L",
            trend: "128 students pending",
            trendType: "down" as const,
            icon: "pending_actions",
        },
        {
            label: "Collection this Month",
            value: "₹8.2L",
            trend: "+15% vs last month",
            trendType: "up" as const,
            icon: "trending_up",
        },
        {
            label: "Auto-Reminders Sent",
            value: "312",
            trend: "Active this week",
            trendType: "stable" as const,
            icon: "notifications_active",
        },
    ];

    const feeRecords = [
        {
            id: "F-2024-001",
            student: "Rahul K.",
            grade: "Grade 10-A",
            category: "Tuition Fee",
            amount: 45000,
            dueDate: "Mar 30, 2024",
            status: "Paid",
            method: "Online (Razorpay)",
        },
        {
            id: "F-2024-002",
            student: "Sneha R.",
            grade: "Grade 8-C",
            category: "Transport Fee",
            amount: 12000,
            dueDate: "Apr 05, 2024",
            status: "Pending",
            method: "-",
        },
        {
            id: "F-2024-003",
            student: "Aryan Sreekumar",
            grade: "Grade 12-B",
            category: "Tuition Fee",
            amount: 52000,
            dueDate: "Apr 10, 2024",
            status: "Overdue",
            method: "-",
        },
        {
            id: "F-2024-004",
            student: "Priya D.",
            grade: "Grade 9-A",
            category: "Tuition Fee",
            amount: 45000,
            dueDate: "Mar 25, 2024",
            status: "Paid",
            method: "Bank Transfer",
        },
        {
            id: "F-2024-005",
            student: "Zaid Muhammad",
            grade: "Grade 11-D",
            category: "Exam Fee",
            amount: 2500,
            dueDate: "Apr 15, 2024",
            status: "Pending",
            method: "-",
        },
    ];

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]";
            case "pending":
                return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
            case "overdue":
                return "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]";
            default:
                return "bg-[#F7F8F4] text-[#444441] border-slate-100";
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
            <TopBar
                title="Tuition & Fees"
                subtitle="Track and manage school fee collections"
                actions={
                    <div className="flex gap-3">
                        <button className="bg-white border border-slate-100 text-foreground px-6 h-10 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all">
                            <span className="material-symbols-outlined text-lg">payments</span>
                            Bulk Reminder
                        </button>
                        <button className="btn-primary px-6 h-10 rounded-[10px] text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30">
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
                        {feeStats.map((stat, i) => (
                            <StatCard key={i} {...stat} />
                        ))}
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/30 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-1 bg-[#F7F8F4] p-1 rounded-[10px] w-fit">
                                {["all", "pending", "paid"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                                            activeTab === tab
                                                ? "bg-white text-foreground shadow-sm"
                                                : "text-[#B0AFA8] hover:text-foreground"
                                        )}
                                    >
                                        {tab} Receipts
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search by student name..."
                                        className="pl-10 pr-4 py-2 bg-[#F7F8F4] border border-slate-100 rounded-[10px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                                    />
                                </div>
                                <button className="size-10 bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-center text-[#B0AFA8] hover:text-foreground hover:bg-[#F7F8F4] transition-all">
                                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#F7F8F4] border-b border-slate-100">
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
                                    {feeRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-semibold text-foreground group-hover:underline decoration-primary underline-offset-4">{record.student}</span>
                                                    <span className="text-[11px] font-medium text-[#B0AFA8]">{record.grade}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] font-medium text-[#444441]">{record.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-black text-foreground">₹{record.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] font-medium text-[#444441]">{record.dueDate}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                                    getStatusStyles(record.status)
                                                )}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-medium text-[#B0AFA8] italic">{record.method}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="size-8 rounded-lg bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] hover:bg-primary hover:text-foreground transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="p-4 bg-[#F7F8F4]/30 flex items-center justify-between border-t border-slate-100">
                            <p className="text-[11px] text-[#B0AFA8] font-medium tracking-tight">Showing 1-5 of 1,240 records</p>
                            <div className="flex gap-2">
                                <button className="size-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#B0AFA8] hover:border-primary hover:text-foreground transition-all disabled:opacity-50" disabled>
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                                <button className="size-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#B0AFA8] hover:border-primary hover:text-foreground transition-all">
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
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
                                        Expected collection for the remaining quarter is <span className="text-primary font-bold">₹12.4L</span> based on past trends. 
                                        High-delinquency cases are concentrated in Grade 12-B. Recommend triggering "Fee-2" sms reminders next Monday.
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
                                <p className="text-[#B0AFA8] text-[11px] font-medium italic">Breakdown of total revenue</p>
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
        </div>
    );
};
