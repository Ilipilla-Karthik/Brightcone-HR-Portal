import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Lock,
  Clock,
  DollarSign,
  Search,
} from "lucide-react";
import { useNotifications } from "../../services/NotificationsContext";

interface ExpenseClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receipt_url?: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  paid_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export const ExpenseFinancePage: React.FC = () => {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const { addNotification } = useNotifications();

  const fetchClaims = async () => {
    try {
      const [expRes, offRes] = await Promise.all([
        axios.get("/api/expenses").catch(() => ({ data: [] })),
        axios.get("/api/office-expenses").catch(() => ({ data: [] })),
      ]);
      const list: ExpenseClaim[] = Array.isArray(expRes.data) ? [...expRes.data] : [];
      if (Array.isArray(offRes.data)) {
        offRes.data.forEach((o: any) => {
          list.push({
            id: o.id || `OE-${Date.now()}`,
            employee_id: o.submitted_by_code || 'BC-1006',
            employee_name: o.submitted_by || 'Rahul Varma',
            category: o.category || 'Office Supplies',
            amount: typeof o.amount === 'number' ? o.amount : parseFloat(o.amount || '0'),
            date: o.date || new Date().toISOString().slice(0, 10),
            description: o.description || o.title || 'Office operational expenditure',
            status: o.status || 'Pending',
            created_at: o.created_at || new Date().toISOString(),
          });
        });
      }
      // Reflect the server list even when it comes back empty, so a refetch
      // after a failed action shows the real state instead of stale rows.
      setClaims(list);
    } catch {
      // Keep local state fallback
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/expenses/${id}/approve`);
    } catch {
      // The claim id doesn't exist server-side — don't fake a success.
      fetchClaims();
      addNotification({
        title: "Approval Failed",
        message: `Claim ${id} was not found on the server, so it was not approved.`,
        category: "expense",
        actionUrl: "/payroll/finance-expenses",
      });
      return;
    }
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Approved" } : c))
    );
    addNotification({
      title: "Claim Approved",
      message: `Claim ${id} was marked as Approved. Waiting for final disbursement.`,
      category: "expense",
      actionUrl: "/payroll/finance-expenses",
    });
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Please enter the reason for rejecting this claim:");
    if (!reason) return;

    try {
      await axios.post(`/api/expenses/${id}/reject`, { reason });
    } catch {
      fetchClaims();
      addNotification({
        title: "Rejection Failed",
        message: `Claim ${id} was not found on the server, so it was not rejected.`,
        category: "expense",
        actionUrl: "/payroll/finance-expenses",
      });
      return;
    }
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Rejected", rejection_reason: reason } : c
      )
    );
  };

  // EXP-02: Finance pays only after approval and only once. Paid claims become read-only.
  const handlePayClaim = async (id: string) => {
    const target = claims.find((c) => c.id === id);
    if (!target) return;
    if (target.status === "Paid") {
      alert("This claim is already paid and locked.");
      return;
    }
    if (target.status !== "Approved") {
      alert("Finance can only disburse claims that have already been Approved.");
      return;
    }

    try {
      await axios.post(`/api/expenses/${id}/pay`);
    } catch {
      fetchClaims();
      addNotification({
        title: "Payment Failed",
        message: `Claim ${id} was not found on the server, so no reimbursement was recorded.`,
        category: "expense",
        actionUrl: "/payroll/finance-expenses",
      });
      return;
    }

    const now = new Date().toISOString();
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Paid", paid_at: now } : c))
    );

    addNotification({
      title: "Reimbursement Disbursed",
      message: `Claim ${id} for ?${target.amount.toLocaleString("en-IN")} was paid and marked Read-Only.`,
      category: "expense",
      actionUrl: "/payroll/finance-expenses",
    });
  };

  const pendingCount = claims.filter((c) => c.status === "Pending").length;
  const approvedCount = claims.filter((c) => c.status === "Approved").length;
  const paidCount = claims.filter((c) => c.status === "Paid").length;
  const totalPaidAmount = claims
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + c.amount, 0);

  const filtered = claims.filter((c) => {
    const matchesFilter = filter === "All" ? true : c.status === filter;
    const matchesSearch =
      c.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-sora text-2xl font-semibold text-txt">
          Finance Expense Approvals & Payment
        </h1>
        <p className="text-xs text-txt-muted mt-1">
          Review employee claims, approve valid vouchers, and execute reimbursements. Paid claims become read-only to prevent duplicate payout.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
            <span>Awaiting Review</span>
          </div>
          <div className="font-sora text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Pending HR/Manager approval</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300">
              <CreditCard className="w-4 h-4" />
            </span>
            <span>Ready for Payout</span>
          </div>
          <div className="font-sora text-2xl font-bold text-brand mt-2">
            {approvedCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Approved & pending disbursement</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Lock className="w-4 h-4" />
            </span>
            <span>Paid & Locked</span>
          </div>
          <div className="font-sora text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {paidCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Immutable read-only records</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand">
              <DollarSign className="w-4 h-4" />
            </span>
            <span>Total Disbursed</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            ?{totalPaidAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Processed reimbursement spend</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          {["All", "Pending", "Approved", "Paid"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === tab
                  ? "bg-brand text-white font-semibold"
                  : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by employee, ID, note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
              <tr>
                <th className="p-3.5 pl-5">Claim ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Finance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-txt-faint">
                    No claims match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-txt">{claim.id}</td>
                    <td className="p-3.5 font-medium text-txt flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-soft text-brand text-[10px] font-bold flex items-center justify-center">
                        {claim.employee_name[0]}
                      </div>
                      <span>{claim.employee_name}</span>
                    </td>
                    <td className="p-3.5 text-txt-muted">{claim.category}</td>
                    <td className="p-3.5 text-txt-muted max-w-xs truncate" title={claim.description}>
                      {claim.description}
                      {claim.rejection_reason && (
                        <div className="text-[11px] text-rose-500 font-normal">
                          Reason: {claim.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-txt-faint">{claim.date}</td>
                    <td className="p-3.5 font-sora font-semibold text-txt">
                      ?{claim.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          claim.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : claim.status === "Approved"
                            ? "bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300"
                            : claim.status === "Rejected"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {claim.status === "Paid" && <Lock className="w-3 h-3" />}
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      {/* Read-Only State for Paid Claims */}
                      {claim.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <Lock className="w-3.5 h-3.5" />
                          Paid & Locked
                        </span>
                      ) : claim.status === "Approved" ? (
                        /* Only Approved claims can be paid */
                        <button
                          onClick={() => handlePayClaim(claim.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm inline-flex items-center gap-1 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Claim
                        </button>
                      ) : claim.status === "Pending" ? (
                        /* Pending claims can be approved or rejected */
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(claim.id)}
                            className="p-1.5 rounded-lg border border-line bg-surface text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                            title="Approve Claim"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(claim.id)}
                            className="p-1.5 rounded-lg border border-line bg-surface text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Reject Claim"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-txt-faint">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFinancePage;


