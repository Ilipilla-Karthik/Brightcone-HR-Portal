import React, { useState } from "react";
import { X } from "lucide-react";
import { type OfficeExpense, categories, gstRates } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<OfficeExpense, "id">) => void;
}

export const AddExpenseModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [vendorName, setVendorName] = useState("");
  const [category, setCategory] = useState("Office Supplies");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [baseAmount, setBaseAmount] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Pending");

  if (!isOpen) return null;

  const numBase = parseFloat(baseAmount) || 0;
  const computedGst = Math.round((numBase * gstRate) / 100);
  const computedTotal = numBase + computedGst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !invoiceNo.trim() || numBase <= 0) {
      alert("Please enter valid vendor, invoice number and base amount.");
      return;
    }
    onSave({
      vendor_name: vendorName.trim(),
      category,
      invoice_no: invoiceNo.trim(),
      invoice_date: invoiceDate,
      base_amount: numBase,
      gst_rate: gstRate,
      gst_amount: computedGst,
      total_amount: computedTotal,
      status: paymentStatus,
    });
    setVendorName("");
    setInvoiceNo("");
    setBaseAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h3 className="font-sora font-semibold text-sm text-txt">
              Record Vendor Office Expense
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              GST input credit will be computed and mapped to statutory tax registers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-txt-faint hover:text-txt rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Vendor Name</label>
              <input
                type="text"
                placeholder="e.g. WeWork, Airtel, Dell"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-txt font-medium mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Invoice Number</label>
              <input
                type="text"
                placeholder="e.g. INV-2026-908"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-txt font-medium mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Base Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 50000"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-txt font-medium mb-1">GST Slab Rate</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-semibold"
              >
                {gstRates.map((r) => (
                  <option key={r} value={r}>
                    {r}% GST
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-secondary border border-line space-y-1.5">
            <div className="flex justify-between text-txt-muted text-[11px]">
              <span>Base Amount:</span>
              <span className="font-mono text-txt font-semibold">
                ₹{numBase.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
              <span>Computed GST ({gstRate}%):</span>
              <span className="font-mono font-semibold">
                +₹{computedGst.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="pt-1.5 border-t border-line flex justify-between text-txt text-xs font-bold">
              <span>Total Payable:</span>
              <span className="font-mono text-brand text-sm">
                ₹{computedTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-txt font-medium mb-1">Payment Status</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={paymentStatus === "Pending"}
                  onChange={() => setPaymentStatus("Pending")}
                  className="text-brand focus:ring-0"
                />
                <span className="text-txt">Pending Payout</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={paymentStatus === "Paid"}
                  onChange={() => setPaymentStatus("Paid")}
                  className="text-brand focus:ring-0"
                />
                <span className="text-txt">Already Paid</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
            >
              Save Vendor Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

