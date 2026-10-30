import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import {
  ApprovalItem,
  getApprovals,
  updateApprovalStatus,
  approveAllPending,
} from '../../services/suiteStorage';

export const ApprovalsInbox: React.FC = () => {
  const [items, setItems] = useState<ApprovalItem[]>(() => getApprovals());
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setItems(getApprovals());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const updated = updateApprovalStatus(id, newStatus);
    setItems(updated);
    showToast(`Request ${id} marked as ${newStatus}`);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'All' ? true : item.status === activeTab;
    const matchesModule = moduleFilter === 'All' ? true : item.module === moduleFilter;
    const matchesSearch =
      item.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesModule && matchesSearch;
  });

  const pendingCount = items.filter((i) => i.status === 'Pending').length;

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'Leave': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Expense': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shift': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Sign': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Approvals Inbox</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Centralized operational approvals across Leave, Expenses, Shift swaps, and DocSign</p>
        </div>
        <button
          onClick={() => {
            const updated = approveAllPending();
            setItems(updated);
            showToast('Approved all shown requests');
          }}
          className="px-3.5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('check', 16)}</span>
          Approve all shown
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab} {tab === 'Pending' && `(${pendingCount})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Modules</option>
            <option value="Leave">Leave Requests</option>
            <option value="Expense">Expense Claims</option>
            <option value="Shift">Shift Swaps</option>
            <option value="Sign">DocSign Envelopes</option>
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Search request..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
            <span className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5">{ic('search', 14)}</span>
          </div>
        </div>
      </div>

      {/* Approval List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <span className="inline-block p-3 rounded-full bg-slate-100 text-slate-400 mb-3">{ic('inbox', 28)}</span>
            <p className="font-medium text-slate-700">No requests in this view</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  {item.requesterName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getModuleBadge(item.module)}`}>{item.module}</span>
                    <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                    {item.amountOrDuration && (
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">{item.amountOrDuration}</span>
                    )}
                    {item.priority === 'High' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded">High Priority</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.details}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">{item.requesterName} · {item.requesterRole} · {item.submittedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {item.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(item.id, 'Approved')}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-3.5 h-3.5">{ic('check', 14)}</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'Rejected')}
                      className="px-3 py-1.5 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-3.5 h-3.5">{ic('x', 14)}</span>
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {item.status}
                  </span>
                )}
                <button
                  onClick={() => setSelectedItem(item)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="View Details"
                >
                  <span className="w-4 h-4">{ic('doc', 16)}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getModuleBadge(selectedItem.module)}`}>{selectedItem.module}</span>
                <h3 className="font-bold text-slate-900">{selectedItem.title}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400">Requester</span>
                  <p className="font-semibold text-slate-800">{selectedItem.requesterName}</p>
                  <p className="text-slate-500">{selectedItem.requesterRole}</p>
                </div>
                <div>
                  <span className="text-slate-400">Department</span>
                  <p className="font-semibold text-slate-800">{selectedItem.requesterDept}</p>
                  <p className="text-slate-500">{selectedItem.submittedAt}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Request Particulars</span>
                <p className="text-slate-800 font-medium mt-1">{selectedItem.details}</p>
              </div>
              {selectedItem.amountOrDuration && (
                <div>
                  <span className="text-slate-400">Value / Duration</span>
                  <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{selectedItem.amountOrDuration}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
              {selectedItem.status === 'Pending' && (
                <>
                  <button onClick={() => handleAction(selectedItem.id, 'Rejected')} className="px-4 py-2 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg">Reject</button>
                  <button onClick={() => handleAction(selectedItem.id, 'Approved')} className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg">Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
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

export default ApprovalsInbox;
