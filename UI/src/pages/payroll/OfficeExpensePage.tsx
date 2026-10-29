import React, { useState, useEffect } from "react";
import axios from "axios";
import { Building2, Plus, Search } from "lucide-react";
import { useNotifications } from "../../services/NotificationsContext";
import { type OfficeExpense, categories } from "./office-expense/types";
import { ExpenseStats } from "./office-expense/ExpenseStats";
import { AddExpenseModal } from "./office-expense/AddExpenseModal";

export const OfficeExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<OfficeExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { addNotification } = useNotifications();

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/api/office-expenses");
      if (res.data && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch {
      // Local fallback
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = async (payload: Omit<OfficeExpense, "id">) => {
    try {
      const res = await axios.post("/api/office-expenses", payload);
      if (res.data) {
        setExpenses((prev) => [res.data, ...prev]);
      }
    } catch {
      const newExp: OfficeExpense = {
        id: `OE-${Math.floor(100 + Math.random() * 900)}`,
        ...payload,
      };
      setExpenses((prev) => [newExp, ...prev]);
    }

    addNotification({
      title: "Vendor Invoice Logged",
      message: `Invoice ${payload.invoice_no} for ₹${payload.total_amount.toLocaleString("en-IN")} from ${payload.vendor_name} recorded.`,
      category: "expense",
      actionUrl: "/payroll/office-expense",
    });
  };

  const filtered = expenses.filter((e) => {
    const matchesCat = selectedCategory === "All" ? true : e.category === selectedCategory;
    const matchesSearch =
      e.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      e.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sora font-bold text-txt flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand" />
            Office & Operational Expenses
          </h2>
          <p className="text-xs text-txt-muted mt-1">
            Track business utilities, office rents, SaaS licences, and statutory GST input credits.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-brand/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Record Vendor Invoice
        </button>
      </div>

      <ExpenseStats expenses={expenses} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-brand text-white font-semibold"
                  : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
              <tr>
                <th className="p-3.5 pl-5">Invoice ID</th>
                <th className="p-3.5">Vendor Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Base (₹)</th>
                <th className="p-3.5">GST Rate</th>
                <th className="p-3.5">GST (₹)</th>
                <th className="p-3.5">Total Amount (₹)</th>
                <th className="p-3.5 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-txt-faint">
                    No vendor invoices match this search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-txt">{item.id}</td>
                    <td className="p-3.5 font-medium text-txt">{item.vendor_name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-line text-txt-muted">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-txt-muted">{item.invoice_no}</td>
                    <td className="p-3.5 text-txt-faint">{item.invoice_date}</td>
                    <td className="p-3.5 font-sora font-medium text-txt">
                      ₹{item.base_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-txt-muted font-medium">{item.gst_rate}%</td>
                    <td className="p-3.5 font-sora text-emerald-600 dark:text-emerald-400 font-medium">
                      +₹{item.gst_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 font-sora font-semibold text-txt">
                      ₹{item.total_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 pr-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default OfficeExpensePage;
