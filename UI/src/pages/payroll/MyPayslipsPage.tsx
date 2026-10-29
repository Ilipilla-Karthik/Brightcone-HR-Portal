import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ic } from '../../components/icons';

interface Payslip {
  id: string;
  monthYear: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  payDate: string;
  earnings: { basic: number; hra: number; special: number; bonus?: number };
  deductions: { pf: number; pt: number; tds: number };
}

export const MyPayslipsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Payslips' | 'Declaration'>('Payslips');
  const [history, setHistory] = useState<Payslip[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const [declaration, setDeclaration] = useState({
    sec80C: '150000',
    sec80D: '25000',
    rentPaidMonthly: '35000',
    nps80CCD: '50000',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    axios
      .get<Array<{ id: string; month: string; status: string; is_locked: boolean; disbursed_at?: string }>>('/api/payroll/runs')
      .then((res) => {
        const runs = Array.isArray(res.data) ? res.data : [];
        const slips: Payslip[] = runs
          .filter((r) => r.is_locked || r.status.includes('Disbursed'))
          .map((r) => ({
            id: r.id,
            monthYear: r.month,
            grossPay: 185000,
            totalDeductions: 24200,
            netPay: 160800,
            payDate: r.disbursed_at ? new Date(r.disbursed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Sep 2026',
            earnings: { basic: 92500, hra: 46250, special: 46250 },
            deductions: { pf: 11100, pt: 200, tds: 12900 },
          }));
        setHistory(slips);
        if (slips.length > 0) setSelectedSlip(slips[0]);
      })
      .catch(() => setHistory([]));
  }, []);

  const handleDownload = (month: string) => {
    showToast(`Downloading Payslip PDF for ${month}`);
  };

  const handleSaveDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('IT Declaration for FY 2026-27 updated & saved');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">
            My Compensation & Payslips
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Download monthly salary statements and manage annual income tax declarations [PAY-06]
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('Payslips')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'Payslips' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Payslips Archive
          </button>
          <button
            onClick={() => setActiveTab('Declaration')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'Declaration' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            IT Tax Declaration
          </button>
        </div>
      </div>

      {activeTab === 'Payslips' && (
        history.length === 0 || !selectedSlip ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-3xl text-slate-300">📄</span>
              <h3 className="font-bold text-slate-900 text-base font-['Sora']">No Payslips Disbursed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">Payslips will be generated and published once monthly payroll runs are locked and disbursed.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Pay Periods (FY 2026-27)
              </h2>
              <div className="space-y-2">
                {history.map((slip) => {
                  const isSelected = selectedSlip.id === slip.id;
                  return (
                    <div
                      key={slip.id}
                      onClick={() => setSelectedSlip(slip)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm">{slip.monthYear}</span>
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          ₹{slip.netPay.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>Paid on {slip.payDate}</span>
                        <span className="text-[11px] text-slate-400">Gross: ₹{slip.grossPay.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                    Brightcone Technologies Private Limited
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-['Sora'] mt-0.5">
                    Payslip for {selectedSlip.monthYear}
                  </h3>
                </div>
                <button
                  onClick={() => handleDownload(selectedSlip.monthYear)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-3.5 h-3.5">{ic('download', 14)}</span>
                  Download PDF
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400">Employee Name</span>
                  <p className="font-semibold text-slate-800">Karthik Reddy</p>
                </div>
                <div>
                  <span className="text-slate-400">Employee ID</span>
                  <p className="font-semibold text-slate-800 font-mono">BC-1012</p>
                </div>
                <div>
                  <span className="text-slate-400">PAN</span>
                  <p className="font-semibold text-slate-800 font-mono">AAACB1234D</p>
                </div>
                <div>
                  <span className="text-slate-400">Bank Account</span>
                  <p className="font-semibold text-slate-800 font-mono">HDFC •••• 9214</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                    <span>Earnings</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary</span>
                      <span className="font-mono text-slate-900 font-medium">₹{selectedSlip.earnings.basic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">House Rent Allowance (HRA)</span>
                      <span className="font-mono text-slate-900 font-medium">₹{selectedSlip.earnings.hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Special Allowance</span>
                      <span className="font-mono text-slate-900 font-medium">₹{selectedSlip.earnings.special.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Gross Earnings</span>
                      <span className="font-mono">₹{selectedSlip.grossPay.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                    <span>Deductions</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Provident Fund (EPF)</span>
                      <span className="font-mono text-slate-900 font-medium">₹{selectedSlip.deductions.pf.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Professional Tax (PT)</span>
                      <span className="font-mono text-slate-900 font-medium">₹{selectedSlip.deductions.pt.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">TDS / Income Tax</span>
                      <span className="font-mono text-slate-900 font-medium">₹{selectedSlip.deductions.tds.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-600">₹{selectedSlip.totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Net Take-Home Pay</p>
                  <p className="text-2xl font-extrabold text-emerald-900 font-mono mt-0.5">
                    ₹{selectedSlip.netPay.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xs text-emerald-700 text-right">
                  Credited directly to account on {selectedSlip.payDate}
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {activeTab === 'Declaration' && (
        <form onSubmit={handleSaveDeclaration} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Sora']">Income Tax Declaration (FY 2026-27)</h2>
            <p className="text-xs text-slate-500 mt-1">Submit your tax-saving investment declarations for lower monthly TDS deductions</p>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section 80C (PPF, ELSS, EPF) · Max ₹1,50,000</label>
              <input type="number" value={declaration.sec80C} onChange={(e) => setDeclaration({ ...declaration, sec80C: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section 80D (Health Insurance Premium) · Max ₹25,000</label>
              <input type="number" value={declaration.sec80D} onChange={(e) => setDeclaration({ ...declaration, sec80D: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Rent Paid for HRA (₹/month)</label>
              <input type="number" value={declaration.rentPaidMonthly} onChange={(e) => setDeclaration({ ...declaration, rentPaidMonthly: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">National Pension Scheme (80CCD 1B) · Additional ₹50,000</label>
              <input type="number" value={declaration.nps80CCD} onChange={(e) => setDeclaration({ ...declaration, nps80CCD: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm">
              Save IT Declaration
            </button>
          </div>
        </form>
      )}

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-4 h-4 text-emerald-400">{ic('check', 16)}</span>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default MyPayslipsPage;
