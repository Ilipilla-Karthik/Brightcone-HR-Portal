import React from 'react';
import { X } from 'lucide-react';

type Interview = Record<string, any>;
type NameOf = (id: any) => string;

type InterviewDetailModalProps = {
  selected: any;
  setSelected: any;
  nameOf: NameOf;
  jobOf: (id: any) => string;
};

export const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({
  selected,
  setSelected,
  nameOf,
  jobOf,
}) => {
  return selected && (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={() => setSelected(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Interview — {nameOf(selected.candidate)}
          </h3>
          <X className="w-4 h-4 text-gray-400" onClick={() => setSelected(null)} />
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="text-gray-500">Role:</span> {jobOf(selected.job) || '—'}
          </p>
          <p>
            <span className="text-gray-500">Round:</span> {selected.round}
          </p>
          <p>
            <span className="text-gray-500">Scheduled:</span>
            {new Date(selected.scheduled_at).toLocaleString()} ({selected.duration_minutes || 45} min)
          </p>
          <p>
            <span className="text-gray-500">Mode:</span> {selected.mode}
          </p>
          {selected.panel && (
            <p><span className="text-gray-500">Panel:</span> {selected.panel}</p>
          )}
          {selected.link && (
            <p><span className="text-gray-500">Link:</span> {selected.link}</p>
          )}
          {selected.notes && (
            <p><span className="text-gray-500">Notes:</span> {selected.notes}</p>
          )}
        </div>
        {(selected.result || 'Pending') === 'Pending' && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setResult(selected.id, 'Selected')}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
            >
              Mark Selected
            </button>
            <button
              onClick={() => setResult(selected.id, 'Rejected')}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm"
            >
              Mark Rejected
            </button>
          </div>
        )}
      </div>
    </div>
  );
};