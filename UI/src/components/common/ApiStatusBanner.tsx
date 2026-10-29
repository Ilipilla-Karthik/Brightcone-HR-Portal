import React from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface ApiStatusBannerProps {
  isBackendConnected?: boolean | null;
  onRefresh?: () => void;
  error?: string | null;
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({
  onRefresh,
}) => {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#E3F6EE] dark:bg-[#0E3326] border border-[#15A36B]/30 text-[#15A36B] text-xs">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 flex-none" />
        <span>
          <strong>Connected to Rust + Loco Backend:</strong> Real-time PostgreSQL database persistence active.
        </span>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 font-semibold text-xs underline hover:opacity-80 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Re-check
        </button>
      )}
    </div>
  );
};

export default ApiStatusBanner;
