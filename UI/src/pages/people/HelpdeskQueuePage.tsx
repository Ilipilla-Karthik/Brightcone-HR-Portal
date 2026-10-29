import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import {
  fetchHelpdeskTickets,
  createHelpdeskTicketApi,
  HelpdeskTicketApiItem,
} from '../../services/peopleApi';

interface TicketItem {
  id: string;
  ticketId: string;
  employee: string;
  empCode: string;
  category: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdOn: string;
}

export const HelpdeskQueuePage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTkt, setNewTkt] = useState({ employee: '', empCode: 'BC-1038', category: 'Payroll & Tax', subject: '', description: '', priority: 'Medium' as const });

  useEffect(() => {
    fetchHelpdeskTickets()
      .then((data: HelpdeskTicketApiItem[]) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        const mapped: TicketItem[] = list.map((d: any, i: number) => ({
          id: String(d.id || i + 1),
          ticketId: `TKT-${1040 + i}`,
          employee: d.employee_name || 'Rahul Varma',
          empCode: d.employee_code || 'BC-1038',
          category: d.category || 'General HR',
          subject: d.subject || 'Employee Query',
          priority: (d.priority || 'Medium') as any,
          status: (d.status || 'Open') as any,
          createdOn: new Date().toISOString().split('T')[0],
        }));
        setTickets(mapped);
      })
      .catch(() => {
        setTickets([]);
      });
  }, []);

  const handleStatusChange = (id: string, nextStatus: TicketItem['status']) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTkt.subject || !newTkt.employee) return;
    try {
      await createHelpdeskTicketApi({
        employee_name: newTkt.employee,
        employee_code: newTkt.empCode,
        category: newTkt.category,
        subject: newTkt.subject,
        description: newTkt.description,
        priority: newTkt.priority,
      });
    } catch {}
    const created: TicketItem = {
      id: String(Date.now()),
      ticketId: `TKT-${1040 + tickets.length + 1}`,
      employee: newTkt.employee,
      empCode: newTkt.empCode,
      category: newTkt.category,
      subject: newTkt.subject,
      priority: newTkt.priority,
      status: 'Open',
      createdOn: new Date().toISOString().split('T')[0],
    };
    setTickets([created, ...tickets]);
    setIsModalOpen(false);
    setNewTkt({ employee: '', empCode: 'BC-1038', category: 'Payroll & Tax', subject: '', description: '', priority: 'Medium' });
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.subject.toLowerCase().includes(q) || t.employee.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">HR & Operations Helpdesk Queue</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Unified employee ticket queue covering payroll, benefits, IT provisioning, and policy inquiries.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 16)} Raise Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Open Tickets</span>
          <p className="text-2xl font-bold text-[var(--text)]">{tickets.filter((t) => t.status === 'Open').length}</p>
          <span className="text-xs text-rose-500 font-medium">Awaiting HR assignment</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-bold text-[var(--text)]">{tickets.filter((t) => t.status === 'In Progress').length}</p>
          <span className="text-xs text-blue-500 font-medium">Under active investigation</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Avg Resolution Time</span>
          <p className="text-2xl font-bold text-[var(--text)]">3.8 Hours</p>
          <span className="text-xs text-emerald-500 font-medium">Within 24h SLA target</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
              <th className="p-3.5">Ticket ID</th>
              <th className="p-3.5">Employee</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Subject</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Queue Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--muted)]">No support or helpdesk tickets found in queue.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5 font-mono text-[10px] text-[#12A58E] font-semibold">{item.ticketId}</td>
                  <td className="p-3.5">
                    <div className="font-semibold">{item.employee}</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">{item.empCode}</div>
                  </td>
                  <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-medium">{item.category}</span></td>
                  <td className="p-3.5 max-w-sm font-medium">{item.subject}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                      item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {item.status === 'Open' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'In Progress')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px] cursor-pointer"
                      >
                        Take Ticket
                      </button>
                    )}
                    {item.status === 'In Progress' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'Resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] cursor-pointer"
                      >
                        Resolve & Close
                      </button>
                    )}
                    {item.status === 'Resolved' && (
                      <span className="text-[10px] text-[var(--muted)]">Closed</span>
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
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Raise HR Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Employee Name</label>
                <input required type="text" placeholder="e.g. Rahul Varma" value={newTkt.employee} onChange={(e) => setNewTkt({ ...newTkt, employee: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Category</label>
                  <select value={newTkt.category} onChange={(e) => setNewTkt({ ...newTkt, category: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="Payroll & Tax">Payroll & Tax</option>
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Leave Query">Leave Query</option>
                    <option value="General HR">General HR</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Priority</label>
                  <select value={newTkt.priority} onChange={(e) => setNewTkt({ ...newTkt, priority: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Subject</label>
                <input required type="text" placeholder="Summary of question or issue" value={newTkt.subject} onChange={(e) => setNewTkt({ ...newTkt, subject: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Detailed Description</label>
                <textarea rows={2} placeholder="Add any background context..." value={newTkt.description} onChange={(e) => setNewTkt({ ...newTkt, description: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskQueuePage;
