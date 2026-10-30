import React from 'react';

type Interview = Record<string, any>;
type NameOf = (id: any) => string;
type JobOf = (id: any) => string;

type InterviewTableProps = {
  items: Interview[];
  candidates: any[];
  jobs: any[];
  nameOf: NameOf;
  jobOf: JobOf;
  removeItem: (id: number) => void;
  setResult: (id: number, result: string) => void;
  selected: any;
  setSelected: any;
};

export const InterviewTable: React.FC<InterviewTableProps> = ({
  items,
  candidates,
  jobs,
  nameOf,
  jobOf,
  removeItem,
  setResult,
  selected,
  setSelected,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-[900px] w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
            <th className="px-4 py-3">Candidate</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Round</th>
            <th className="px-4 py-3">Date/Time</th>
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3">Panel</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">{nameOf(it.candidate)}</td>
              <td className="px-4 py-3 text-gray-600">{jobOf(it.job) || '—'}</td>
              <td className="px-4 py-3">{it.round}</td>
              <td className="px-4 py-3 text-gray-600">{new Date(it.scheduled_at).toLocaleString()}</td>
              <td className="px-4 py-3">{it.mode}</td>
              <td className="px-4 py-3 text-gray-600">{it.panel || '—'}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    (it.result || 'Pending') === 'Selected'
                      ? 'px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700'
                      : (it.result || 'Pending') === 'Rejected'
                      ? 'px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600'
                      : 'px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700'
                  }
                >
                  {it.result || 'Pending'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {(it.result || 'Pending') === 'Pending' && (
                    <>
                      <button
                        onClick={() => setResult(it.id, 'Selected')}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => setResult(it.id, 'Rejected')}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelected(it)}
                    className="text-xs text-teal-700 hover:underline"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};