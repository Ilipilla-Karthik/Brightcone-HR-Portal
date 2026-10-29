import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  path: string;
  badge?: string;
}

const COMMANDS: CommandItem[] = [
  { id: '1', title: 'Sign: Sign Dashboard Overview', category: 'Sign (Live)', path: '/doc-sign/dashboard', badge: 'Overview' },
  { id: '2', title: 'Sign: Signature Requests & Tracker (HR Panel)', category: 'Sign (Live)', path: '/doc-sign/requests', badge: 'HR' },
  { id: '3', title: 'Sign: Employee Handbook Versions', category: 'Sign (Live)', path: '/doc-sign/handbook', badge: 'Compliance' },
  { id: '4', title: 'Sign: HR Policies Register', category: 'Sign (Live)', path: '/doc-sign/policies', badge: 'Compliance' },
  { id: '5', title: 'Sign: Policy Acknowledgements', category: 'Sign (Live)', path: '/doc-sign/acks', badge: 'Compliance' },
  { id: '6', title: 'Sign: E-Signature Template Library', category: 'Sign (Live)', path: '/doc-sign/templates' },
  { id: '7', title: 'Sign: Documents to Sign (Employee Flow)', category: 'Sign (Live)', path: '/doc-sign/flow', badge: 'Employee' },
  { id: '8', title: 'People Plus: Suite Dashboard Overview', category: 'Suite', path: '/suite' },
  { id: '9', title: 'People: Workforce Directory & Org Structure', category: 'People', path: '/people' },
  { id: '10', title: 'Recruit: Candidate Pipeline & Job Boards', category: 'Recruit', path: '/recruit' },
  { id: '11', title: 'Payroll: Salary Register & Monthly Runs', category: 'Payroll', path: '/payroll' },
  { id: '12', title: 'Expense: Employee Reimbursement Claims', category: 'Expense', path: '/expense' },
  { id: '13', title: 'Connect: Company Social Feed & Kudos', category: 'Connect', path: '/engagement' },
  { id: '14', title: 'Learn: Training Courses & Compliance LMS', category: 'Learn', path: '/learn' },
  { id: '15', title: 'Shift: Attendance Rosters & Time Tracking', category: 'Shift', path: '/time' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="palette on" style={{ maxWidth: '580px' }}>
        <div className="p-3 border-b border-[var(--line)] flex items-center gap-2">
          {ic('search', 16, 'text-muted')}
          <input
            type="text"
            autoFocus
            className="w-full bg-transparent border-0 outline-none text-sm text-[var(--text)] placeholder-[var(--muted)]"
            placeholder="Type a command or jump to an app / page…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="text-[10px] text-muted border border-[var(--line)] px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <li className="text-center py-6 text-xs text-muted">No matching destinations found.</li>
          ) : (
            filtered.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-2)] cursor-pointer text-xs"
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="pill p-mute text-[10px]">{item.category}</span>
                  <span className="font-medium text-[var(--text)]">{item.title}</span>
                </div>
                {item.badge && <span className="pill p-info text-[10px]">{item.badge}</span>}
              </li>
            ))
          )}
        </ul>

        <div className="p-2 border-t border-[var(--line)] bg-[var(--surface-2)] flex justify-between text-[11px] text-muted">
          <span>Navigate with mouse or arrow keys</span>
          <span>Brightcone Suite Search</span>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
