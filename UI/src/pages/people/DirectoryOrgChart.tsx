import React, { useState, useEffect } from 'react';
import { fetchEmployees, EmployeeApiItem } from '../../services/peopleApi';

interface DynamicNode {
  id: string;
  name: string;
  role: string;
  dept: string;
  email: string;
  phone?: string;
  location?: string;
  status: string;
  reports: DynamicNode[];
}

export const DirectoryOrgChart: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [activeDept, setActiveDept] = useState('All');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [selectedNode, setSelectedNode] = useState<DynamicNode | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployees().then((data) => {
      const list = Array.isArray(data) ? data : (data as any)?.value || [];
      setEmployees(list);
    }).catch(() => setEmployees([]));
  }, []);

  const buildTree = (): DynamicNode | null => {
    if (employees.length === 0) return null;
    const ceo = employees.find((e) => e.job_title?.toLowerCase().includes('ceo') || e.employee_code === 'BC-1001') || employees[0];
    const leads = employees.filter((e) => e.employee_code !== ceo.employee_code && (e.manager_name === ceo.full_name || ['Leadership', 'People Ops', 'AI Research'].includes(e.department)));

    const leadNodes: DynamicNode[] = leads.map((lead) => {
      const team = employees.filter((e) => e.employee_code !== ceo.employee_code && e.employee_code !== lead.employee_code && (e.manager_name === lead.full_name || e.department === lead.department));
      return {
        id: lead.employee_code,
        name: lead.full_name,
        role: lead.job_title,
        dept: lead.department,
        email: lead.work_email,
        phone: lead.phone,
        location: lead.location,
        status: lead.status || 'Active',
        reports: team.map((m) => ({
          id: m.employee_code,
          name: m.full_name,
          role: m.job_title,
          dept: m.department,
          email: m.work_email,
          phone: m.phone,
          location: m.location,
          status: m.status || 'Active',
          reports: [],
        })),
      };
    });

    return {
      id: ceo.employee_code,
      name: ceo.full_name,
      role: ceo.job_title,
      dept: ceo.department,
      email: ceo.work_email,
      phone: ceo.phone,
      location: ceo.location,
      status: ceo.status || 'Active',
      reports: leadNodes,
    };
  };

  const treeRoot = buildTree();
  const depts = ['All', ...Array.from(new Set(employees.map((e) => e.department).filter(Boolean)))];

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.full_name.toLowerCase().includes(q) || e.employee_code.toLowerCase().includes(q) || e.job_title.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
    const matchDept = activeDept === 'All' || e.department === activeDept;
    return matchSearch && matchDept;
  });

  const renderCard = (node: DynamicNode, isLead = false) => {
    const isVisible = activeDept === 'All' || node.dept === activeDept || isLead;
    const initials = (node.name || 'Staff').split(' ').map((n) => n[0]).join('').slice(0, 2);
    return (
      <div
        key={node.id}
        onClick={() => setSelectedNode(node)}
        className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          isVisible ? 'bg-[var(--surface)] border-[var(--line)]' : 'bg-[var(--surface-2)]/40 border-dashed border-[var(--line)] opacity-40'
        } ${isLead ? 'w-64 mx-auto ring-2 ring-[#12A58E]/40' : 'w-56'}`}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
            style={{ background: isLead ? '#0E1730' : '#12A58E' }}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[var(--text)] truncate">{node.name}</h4>
            <p className="text-[11px] text-[var(--muted)] truncate">{node.role}</p>
            <span className="text-[10px] font-mono font-semibold text-[#12A58E]">{node.id}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Organizational Structure & Hierarchy</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Live reporting tree and complete employee roster ({employees.length} total staff).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--line)]">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${viewMode === 'tree' ? 'bg-[#12A58E] text-white shadow-xs' : 'text-[var(--muted)]'}`}
            >
              Org Tree
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${viewMode === 'list' ? 'bg-[#12A58E] text-white shadow-xs' : 'text-[var(--muted)]'}`}
            >
              All Employees ({employees.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {depts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDept(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeDept === d ? 'bg-[#12A58E] text-white shadow-xs' : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filter live roster..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
        />
      </div>

      {viewMode === 'tree' ? (
        <div className="bg-[var(--surface-2)]/40 p-8 rounded-3xl border border-[var(--line)] overflow-x-auto min-h-[500px] flex flex-col items-center">
          {treeRoot && (
            <>
              {renderCard(treeRoot, true)}
              <div className="w-0.5 h-8 bg-[var(--line)] my-2" />
              <div className="flex items-start justify-center gap-6 flex-wrap">
                {treeRoot.reports.map((lead) => (
                  <div key={lead.id} className="flex flex-col items-center">
                    {renderCard(lead)}
                    {lead.reports.length > 0 && (
                      <>
                        <div className="w-0.5 h-6 bg-[var(--line)] my-1" />
                        <div className="flex flex-col gap-2 mt-1">
                          {lead.reports.map((sub) => renderCard(sub))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Job Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Work Email</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5 font-semibold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#12A58E]/15 text-[#12A58E] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {(e.full_name || 'Staff').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                    {e.full_name}
                  </td>
                  <td className="p-3.5 font-mono text-[#12A58E] font-semibold">{e.employee_code}</td>
                  <td className="p-3.5 text-[var(--muted)]">{e.job_title}</td>
                  <td className="p-3.5">{e.department}</td>
                  <td className="p-3.5 font-mono text-[11px] text-[var(--muted)]">{e.work_email}</td>
                  <td className="p-3.5 text-[var(--muted)]">{e.location || 'Hyderabad'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {e.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] text-xs cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full bg-[#12A58E] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {(selectedNode.name || 'Staff').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
              <div>
                <h3 className="font-['Sora'] font-bold text-sm text-[var(--text)]">{selectedNode.name}</h3>
                <p className="text-xs text-[var(--muted)]">{selectedNode.role}</p>
                <span className="font-mono text-[10px] text-[#12A58E] font-semibold">{selectedNode.id}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs pt-2 border-t border-[var(--line)]">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Department</span>
                <span className="font-semibold text-[var(--text)]">{selectedNode.dept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Work Email</span>
                <span className="font-mono text-[11px] text-[var(--text)]">{selectedNode.email}</span>
              </div>
              {selectedNode.location && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Location</span>
                  <span className="text-[var(--text)]">{selectedNode.location}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <span className="text-emerald-500 font-semibold">{selectedNode.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryOrgChart;
