import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ic } from '../icons';
import { useAuth } from '../../services/authContext';
import { getAppInfo, getSidebarSections } from './sidebarConfig';

interface SidebarNavProps {
  role?: 'hr_admin' | 'employee';
  onToggleRole?: () => void;
  onNavigate?: () => void;
  currentPersona?: 'admin' | 'employee';
  onPersonaChange?: (persona: 'admin' | 'employee') => void;
  onSwitchRole?: (role: 'hr_admin' | 'employee') => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  role = 'hr_admin',
  currentPersona,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const p = location.pathname;

  const isEmployee =
    user?.role?.toLowerCase()?.includes('employee') ||
    user?.email?.toLowerCase()?.includes('rahul') ||
    role === 'employee' ||
    currentPersona === 'employee';

  const activeRole: 'hr_admin' | 'employee' = isEmployee ? 'employee' : 'hr_admin';

  const appInfo = getAppInfo(p);
  const sections = getSidebarSections(p, activeRole);

  const displayName = user
    ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || (activeRole === 'employee' ? 'Rahul Varma' : 'Ananya Rao'))
    : (activeRole === 'employee' ? 'Rahul Varma' : 'Ananya Rao');
  const displayEmail = user?.email || (activeRole === 'employee' ? 'rahul.varma@brightcone.ai' : 'ananya.rao@brightcone.ai');
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || (activeRole === 'employee' ? 'RV' : 'AR');

  return (
    <aside className="side" aria-label="Sidebar Navigation" style={{ '--ac': appInfo.color } as React.CSSProperties}>
      <div className="apphead flex items-center gap-3 pb-4 mb-2 border-b border-[var(--line)]">
        <i
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md transition-all"
          style={{ background: appInfo.color }}
        >
          {appInfo.icon}
        </i>
        <div className="min-w-0 flex-1 text-left">
          <b className="font-['Sora'] text-[16px] font-semibold tracking-tight text-[var(--text)] block truncate">
            {appInfo.name}
          </b>
          <span className="text-xs text-[var(--muted)] block">
            {activeRole === 'hr_admin' ? 'HR Admin' : 'Employee self-service'}
          </span>
        </div>
      </div>

      <nav id="nav" className="side-nav flex-1 overflow-y-auto custom-scroll space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="sec">
            <span className="navgroup text-[11px] font-bold uppercase tracking-wider text-[var(--faint)] px-2.5 py-1 block">
              {section.title}
            </span>
            <div className="nav-items space-y-0.5 mt-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => {
                    const isItemActive =
                      isActive ||
                      location.pathname + location.search === item.to ||
                      (location.search === '' && item.to.includes('?tab=') && item.to.endsWith(item.to.split('?tab=')[1]));
                    return `nav flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isItemActive
                        ? 'active font-semibold text-[var(--text)]'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`;
                  }}
                  style={({ isActive }) =>
                    isActive
                      ? ({
                          background: `color-mix(in srgb, ${appInfo.color} 14%, transparent)`,
                          color: appInfo.color,
                        } as React.CSSProperties)
                      : {}
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--bad)] text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="side-foot pt-3 border-t border-[var(--line)] mt-auto">
        <div className="side-user flex items-center justify-between p-2 rounded-xl bg-[var(--surface-2)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="av w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0"
              style={{ background: appInfo.color }}
            >
              {userInitials}
            </span>
            <div className="min-w-0 flex-1 text-left">
              <b className="truncate block text-xs text-[var(--text)] font-semibold">{displayName}</b>
              <span className="truncate block text-[11px] text-[var(--muted)]">{displayEmail}</span>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 text-[var(--muted)] hover:text-red-500 rounded-lg hover:bg-[var(--surface)] transition-colors cursor-pointer"
            aria-label="Sign out"
            title="Sign out"
            onClick={logout}
          >
            {ic('logout', 16)}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
