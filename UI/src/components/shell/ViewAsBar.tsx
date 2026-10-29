import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ViewAsBarProps {
  role: 'hr_admin' | 'employee';
  onToggleRole: () => void;
}

export const ViewAsBar: React.FC<ViewAsBarProps> = ({ role, onToggleRole }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-none bg-[var(--surface-2)] border-b border-[var(--line)] px-6 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: role === 'hr_admin' ? 'var(--brand)' : 'var(--ok)' }}
        />
        <span className="text-muted">
          Active Workspace Mode: <strong className="text-[var(--text)]">{role === 'hr_admin' ? 'HR Administrator Panel' : 'Employee Self-Service Panel'}</strong>
        </span>
        <span className="text-faint">•</span>
        <span className="text-muted">
          {role === 'hr_admin'
            ? 'Access to envelopes, tracker, template builder, and reminders'
            : 'Access to personal documents awaiting signature and signed archive'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onToggleRole();
            if (role === 'hr_admin') {
              navigate('/doc-sign/flow');
            } else {
              navigate('/doc-sign/dashboard');
            }
          }}
          className="btn sm"
        >
          Switch to {role === 'hr_admin' ? 'Employee Panel' : 'HR Panel'}
        </button>
      </div>
    </div>
  );
};

export default ViewAsBar;
