import React from 'react';
import type { DirectoryEmployee } from './types';

export const getInitials = (name?: string) => {
  if (!name) return '??';
  return name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
};

export const getAvatarColor = (name: string) => {
  const colors = ['#0B6FDB', '#12A58E', '#7C5CFF', '#D9466F', '#E07A1D', '#0BA6CC', '#6366F1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

interface TreeNodeProps {
  employee: DirectoryEmployee;
  allEmployees: DirectoryEmployee[];
  onSelect: (emp: DirectoryEmployee) => void;
}

export const OrgTreeNode: React.FC<TreeNodeProps> = ({ employee, allEmployees, onSelect }) => {
  const children = allEmployees.filter(
    (e) => e.mgr === employee.name && e.status !== 'Inactive'
  );

  return (
    <li>
      <button type="button" className="node" onClick={() => onSelect(employee)}>
        <span className="av" style={{ backgroundColor: getAvatarColor(employee.name) }}>
          {getInitials(employee.name)}
        </span>
        <div className="text-left">
          <b>{employee.name}</b>
          <span>{employee.role}</span>
        </div>
      </button>

      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <OrgTreeNode
              key={child.id}
              employee={child}
              allEmployees={allEmployees}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
