import React from 'react';
import { ComingSoon } from '../../components/ComingSoon';
import { ic } from '../../components/icons';

export const AdminDashboard: React.FC = () => {
  return (
    <ComingSoon
      moduleName="Advanced HR Suite"
      category="Administration"
      description="Workforce analytics, retention risk models, and enterprise audit logs."
      icon={ic('shield', 28)}
    />
  );
};

export default AdminDashboard;
