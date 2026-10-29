import React, { useState, useMemo, useEffect } from 'react';
import { ic } from '../../components/icons';
import { DirectoryEmployee } from './types';
import { fetchConnectDirectory, createConnectPost } from '../../services/signConnectApi';
import { mapDirectoryEmployeeFromApi } from './apiMapper';
import { useNotifications } from '../../services/NotificationsContext';
import { useAuth } from '../../services/authContext';
import { OrgTreeNode, getInitials, getAvatarColor } from './OrgTreeNode';

export const DirectoryPage: React.FC = () => {
  const [employees, setEmployees] = useState<DirectoryEmployee[]>([]);

  useEffect(() => {
    fetchConnectDirectory()
      .then((data) => {
        if (data) setEmployees(data.map(mapDirectoryEmployeeFromApi));
      })
      .catch(() => {});
  }, []);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const currentUser = user?.name || (user?.role === 'employee' ? 'Rahul Varma' : 'Ananya Rao');

  const [activeTab, setActiveTab] = useState<'People' | 'Org chart'>('People');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<DirectoryEmployee | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !msgBody.trim()) return;

    const subject = msgSubject.trim() || 'Internal HR Communication';
    const body = msgBody.trim();

    try {
      await createConnectPost({
        post_type: 'Announcement',
        body: `📨 Message to ${selectedEmployee.name}: ${subject}\n\n${body}`,
        to_employee_name: selectedEmployee.name,
        author_name: currentUser,
      });
    } catch {}

    // Add to notification center
    addNotification({
      title: `Message for ${selectedEmployee.name}: ${subject}`,
      message: `${body} (From ${currentUser})`,
      category: 'announcement',
      actionUrl: '/engagement/feed',
    });

    showToast(`Message successfully delivered to ${selectedEmployee.name}`);
    setIsMsgModalOpen(false);
    setMsgSubject('');
    setMsgBody('');
    setSelectedEmployee(null);
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.dept) set.add(e.dept);
    });
    return Array.from(set);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return employees.filter((e) => {
      if (e.status === 'Inactive') return false;
      const matchesQuery =
        !q ||
        (e.name + ' ' + e.role + ' ' + e.dept + ' ' + e.loc)
          .toLowerCase()
          .includes(q);
      const matchesDept = !selectedDept || e.dept === selectedDept;
      return matchesQuery && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  const rootEmployees = useMemo(() => {
    return employees.filter((e) => !e.mgr && e.status !== 'Inactive');
  }, [employees]);

  const activeCount = employees.filter((e) => e.status !== 'Inactive').length;

  return (
    <div
      className="view max-w-[1240px] mx-auto"
      style={{ '--ac': '#0BA6CC' } as React.CSSProperties}
    >
      {/* Head */}
      <div className="head">
        <div>
          <h1>People directory</h1>
          <p>{activeCount} people at Brightcone.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-4">
        {(['People', 'Org chart'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={activeTab === t ? 'on' : ''}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* People View */}
      {activeTab === 'People' && (
        <>
          <div className="toolbar">
            <div className="search">
              {ic('search', 16)}
              <input
                className="input"
                id="dq"
                placeholder="Search by name, role or team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="input"
              id="dd"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="people-grid">
            {filteredEmployees.length === 0 ? (
              <div className="empty col-span-full">
                No one matches. Try another name.
              </div>
            ) : (
              filteredEmployees.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="pcard"
                  onClick={() => setSelectedEmployee(e)}
                >
                  <div className="who">
                    <span
                      className="av"
                      style={{ backgroundColor: getAvatarColor(e.name) }}
                    >
                      {getInitials(e.name)}
                    </span>
                    <div>
                      <b>{e.name}</b>
                      <span>{e.role}</span>
                    </div>
                  </div>
                  <div className="muted" style={{ fontSize: '13px' }}>
                    {e.dept}, {e.loc}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Org Chart View */}
      {activeTab === 'Org chart' && (
        <div className="card">
          <h3>Organisation chart</h3>
          <div style={{ overflowX: 'auto', padding: '10px 0' }}>
            <ul className="org">
              {rootEmployees.map((root) => (
                <OrgTreeNode
                  key={root.id}
                  employee={root}
                  allEmployees={employees}
                  onSelect={(emp) => setSelectedEmployee(emp)}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Employee Mini Profile Drawer */}
      <div
        className={`scrim ${selectedEmployee ? 'on' : ''}`}
        onClick={() => setSelectedEmployee(null)}
      />
      <div className={`drawer ${selectedEmployee ? 'on' : ''}`}>
        {selectedEmployee && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] text-[var(--muted)] font-mono">
                {selectedEmployee.id}
              </span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedEmployee(null)}
                title="Close"
              >
                {ic('x', 18)}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span
                className="av lg"
                style={{ backgroundColor: getAvatarColor(selectedEmployee.name) }}
              >
                {getInitials(selectedEmployee.name)}
              </span>
              <div>
                <h2 style={{ fontSize: '20px' }}>{selectedEmployee.name}</h2>
                <div className="muted">{selectedEmployee.role}</div>
              </div>
            </div>

            <dl className="kv">
              <dt>Department</dt>
              <dd>{selectedEmployee.dept}</dd>
              <dt>Reports to</dt>
              <dd>{selectedEmployee.mgr || '—'}</dd>
              <dt>Location</dt>
              <dd>{selectedEmployee.loc}</dd>
              <dt>Email</dt>
              <dd>{selectedEmployee.email}</dd>
              <dt>Phone</dt>
              <dd>{selectedEmployee.phone}</dd>
            </dl>

            <div className="mt">
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsMsgModalOpen(true)}
              >
                Send message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Composer Modal */}
      {isMsgModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Sora']">
                  Send Message to {selectedEmployee.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEmployee.role} · {selectedEmployee.dept}
                </p>
              </div>
              <button
                onClick={() => setIsMsgModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="e.g. Project onboarding sync, 1-on-1 check-in"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Write your note or announcement here..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMsgModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0BA6CC] hover:bg-[#0993b5] text-white rounded-xl shadow-sm transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'on' : ''}`}>
        {ic('chat', 18)}
        <span>{toastMsg}</span>
      </div>
    </div>
  );
};

export default DirectoryPage;
