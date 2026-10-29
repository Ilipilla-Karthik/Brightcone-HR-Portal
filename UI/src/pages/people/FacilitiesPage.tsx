import React, { useState, useEffect } from 'react';
import { fetchHelpdeskTickets, createHelpdeskTicketApi, HelpdeskTicketApiItem } from '../../services/peopleApi';
import { ic } from '../../components/icons';

interface FacilityItem {
  id: string;
  category: 'Desk & Seating' | 'HVAC & Lighting' | 'Meeting Room Audio' | 'Cafeteria & Pantry';
  title: string;
  raisedBy: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
}

export const FacilitiesPage: React.FC = () => {
  const [items, setItems] = useState<FacilityItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({ category: 'Desk & Seating' as const, title: '', raisedBy: '', location: '', priority: 'Medium' as const });

  useEffect(() => {
    fetchHelpdeskTickets()
      .then((data: HelpdeskTicketApiItem[]) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        const facilityTickets = list.filter((t: any) => t.category?.toLowerCase()?.includes('facilit') || t.category?.toLowerCase()?.includes('desk') || t.category?.toLowerCase()?.includes('office'));
        if (facilityTickets.length > 0) {
          setItems(
            facilityTickets.map((t: any) => ({
              id: t.ticket_code || `FAC-${t.id}`,
              category: (t.category?.includes('HVAC') ? 'HVAC & Lighting' : t.category?.includes('Meeting') ? 'Meeting Room Audio' : t.category?.includes('Cafeteria') ? 'Cafeteria & Pantry' : 'Desk & Seating') as any,
              title: t.subject,
              raisedBy: t.employee_name || 'Staff Member',
              location: t.description || 'Level 2 Main Bay',
              priority: (t.priority || 'Medium') as any,
              status: (t.status === 'Resolved' ? 'Resolved' : t.status === 'In Progress' ? 'In Progress' : 'Open') as any,
              date: t.created_at?.split('T')[0] || '2026-10-26',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleStatusChange = (id: string, nextStatus: FacilityItem['status']) => {
    setItems(items.map((it) => (it.id === id ? { ...it, status: nextStatus } : it)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.title || !newReq.raisedBy) return;
    try {
      const created = await createHelpdeskTicketApi({
        category: `Facilities - ${newReq.category}`,
        subject: newReq.title,
        description: newReq.location || 'Level 2 Main Bay',
        employee_name: newReq.raisedBy,
        priority: newReq.priority,
      });
      const item: FacilityItem = {
        id: (created as any).ticket_code || (created as any).ticket_id || `FAC-${created.id}`,
        category: newReq.category,
        title: newReq.title,
        raisedBy: newReq.raisedBy,
        location: newReq.location || 'Level 2 Main Bay',
        priority: newReq.priority,
        status: 'Open',
        date: new Date().toISOString().split('T')[0],
      };
      setItems([item, ...items]);
    } catch {
      const created: FacilityItem = {
        id: `FAC-${100 + items.length + 1}`,
        category: newReq.category,
        title: newReq.title,
        raisedBy: newReq.raisedBy,
        location: newReq.location || 'Level 2 Main Bay',
        priority: newReq.priority,
        status: 'Open',
        date: new Date().toISOString().split('T')[0],
      };
      setItems([created, ...items]);
    }
    setIsModalOpen(false);
    setNewReq({ category: 'Desk & Seating', title: '', raisedBy: '', location: '', priority: 'Medium' });
  };

  const filtered = items.filter((i) => filter === 'All' || i.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Office Facilities & Workspaces</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Manage office infrastructure, desk ergonomic requests, meeting room systems, and facility upkeep.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 16)} Log Facility Request
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Open Requests</span>
          <p className="text-2xl font-bold text-[var(--text)]">{items.filter((i) => i.status === 'Open').length}</p>
          <span className="text-xs text-rose-500 font-medium">Needs maintenance dispatch</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-bold text-[var(--text)]">{items.filter((i) => i.status === 'In Progress').length}</p>
          <span className="text-xs text-blue-500 font-medium">Vendor/Technician assigned</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Resolved This Month</span>
          <p className="text-2xl font-bold text-[var(--text)]">{items.filter((i) => i.status === 'Resolved').length}</p>
          <span className="text-xs text-emerald-500 font-medium">SLA achieved 98.4%</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {['All', 'Open', 'In Progress', 'Resolved'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${filter === f ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
              <th className="p-3.5">Request ID</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Title & Description</th>
              <th className="p-3.5">Location</th>
              <th className="p-3.5">Raised By</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[var(--muted)]">No facility or workplace maintenance requests found.</td>
              </tr>
            ) : (
              filtered.map((it) => (
                <tr key={it.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5 font-mono text-[10px] text-[var(--muted)]">{it.id}</td>
                  <td className="p-3.5 font-semibold text-[var(--text)]">{it.category}</td>
                  <td className="p-3.5 max-w-sm font-medium">{it.title}</td>
                  <td className="p-3.5 text-[var(--muted)]">{it.location}</td>
                  <td className="p-3.5">{it.raisedBy}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      it.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                      it.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {it.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      it.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                      it.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {it.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {it.status === 'Open' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(it.id, 'In Progress')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px] cursor-pointer"
                      >
                        Assign Tech
                      </button>
                    )}
                    {it.status === 'In Progress' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(it.id, 'Resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                    {it.status === 'Resolved' && (
                      <span className="text-[10px] text-[var(--muted)]">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Log Facility Issue</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Issue Title</label>
                <input required type="text" placeholder="e.g. Broken monitor arm at Desk 14" value={newReq.title} onChange={(e) => setNewReq({ ...newReq, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Category</label>
                  <select value={newReq.category} onChange={(e) => setNewReq({ ...newReq, category: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="Desk & Seating">Desk & Seating</option>
                    <option value="HVAC & Lighting">HVAC & Lighting</option>
                    <option value="Meeting Room Audio">Meeting Room Audio</option>
                    <option value="Cafeteria & Pantry">Cafeteria & Pantry</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Priority</label>
                  <select value={newReq.priority} onChange={(e) => setNewReq({ ...newReq, priority: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Location / Desk Number</label>
                <input required type="text" placeholder="e.g. Level 2 Engineering Bay" value={newReq.location} onChange={(e) => setNewReq({ ...newReq, location: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Raised By</label>
                <input required type="text" placeholder="e.g. Rahul Varma" value={newReq.raisedBy} onChange={(e) => setNewReq({ ...newReq, raisedBy: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;
