import React from 'react';
import { ComingSoon } from '../../components/ComingSoon';
import { ic } from '../../components/icons';

export const PerformanceAdminPage: React.FC = () => {
  return (
    <ComingSoon
      moduleName="Performance Management"
      category="Reviews & Goals"
      description="Performance cycles, self-reviews, 360-degree feedback, and calibration."
      icon={ic('chart', 28)}
    />
  );
};

export default PerformanceAdminPage;
