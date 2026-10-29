import React from 'react';
import { Link } from 'react-router-dom';
import { ic } from './icons';

interface ComingSoonProps {
  moduleName: string;
  category?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  moduleName,
  category = 'People Operations',
  description = 'This module is scheduled in the upcoming release cycle and will connect to live backend services.',
  icon,
}) => {
  return (
    <div className="view pb-12">
      <div className="head mb-6">
        <div className="eyebrow">{category}</div>
        <h1 className="text-2xl font-bold font-heading">{moduleName}</h1>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>

      <div className="card text-center py-12 max-w-xl mx-auto border-dashed">
        <div className="empty-ic">
          {icon || ic('clock', 28)}
        </div>
        <span className="pill p-warn text-xs uppercase tracking-wider mb-2">Coming Soon in Next Phase</span>
        <h2 className="text-xl font-bold font-heading text-[var(--text)] mt-2">
          {moduleName} Module Under Development
        </h2>
        <p className="text-xs text-muted max-w-md mx-auto mt-2 leading-relaxed">
          The full enterprise frontend for {moduleName} will be connected to its dedicated backend persistence APIs upon backend repository handoff.
        </p>

        <div className="flex justify-center gap-3 mt-6">
          <Link to="/doc-sign/requests" className="btn primary sm">
            View DocSign (Live Feature)
          </Link>
          <Link to="/suite" className="btn sm">
            Back to Suite Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
