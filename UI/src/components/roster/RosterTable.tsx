import React from 'react';
import type { EmployeeRosterRow, DayRosterEntry } from '../../types/attendance';

interface RosterTableProps {
  employees: EmployeeRosterRow[];
  onCellClick: (employee: EmployeeRosterRow, dayEntry: DayRosterEntry) => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  employees,
  onCellClick,
  isLoading,
  searchQuery = '',
}) => {
  const getAvatarBg = (color?: string) => {
    if (color?.includes('pink')) return 'bg-pink-600';
    if (color?.includes('emerald')) return 'bg-emerald-600';
    if (color?.includes('blue')) return 'bg-blue-600';
    if (color?.includes('amber')) return 'bg-amber-600';
    if (color?.includes('teal')) return 'bg-teal-600';
    return 'bg-purple-600';
  };

  const getShiftBadgeStyle = (code: string | null, isOff: boolean) => {
    if (isOff || !code) {
      return 'bg-[#121E38] text-[#556994] border border-[#1D2B52] hover:border-[#2B3F73]';
    }
    const clean = code.split('-')[0].toUpperCase();
    if (clean === 'GEN') return 'bg-[#0B6FDB] text-white hover:brightness-110 shadow-xs';
    if (clean === 'USP') return 'bg-[#722ED1] text-white hover:brightness-110 shadow-xs';
    if (clean === 'USC') return 'bg-[#4F46E5] text-white hover:brightness-110 shadow-xs';
    if (clean === 'NGT') return 'bg-[#0891B2] text-white hover:brightness-110 shadow-xs';
    if (clean === 'MOR') return 'bg-[#059669] text-white hover:brightness-110 shadow-xs';
    return 'bg-[#2563EB] text-white hover:brightness-110 shadow-xs';
  };

  const daysHeader = employees[0]?.days || [];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B152E] border border-[#E3E8F2] dark:border-[#17264D] overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[#E3E8F2] dark:border-[#18274A] bg-[#F8FAFD] dark:bg-[#0E1A38]/70 text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#7E8EA8]">
              <th className="py-4 px-6 w-72">Employee</th>
              {daysHeader.map((day) => (
                <th key={day.date} className="py-4 px-3 text-center">
                  <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#8D9BB8]">
                    {day.day_name}
                  </div>
                  <div className="text-sm font-extrabold text-[#0E1730] dark:text-white mt-0.5">
                    {day.day_number}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#152345] text-sm">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0 ${getAvatarBg(
                        emp.avatar_color
                      )}`}
                    >
                      {String(emp?.name || (emp as any)?.employee_name || 'Staff')
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'ST'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0E1730] dark:text-white truncate text-sm">
                        {emp.name || (emp as any).employee_name || 'Staff Member'}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#8D9BB8] truncate">
                        {emp.default_shift_name || 'General shift'}
                      </div>
                    </div>
                  </div>
                </td>

                {(emp.days || (emp as any).assignments || []).map((day: any) => {
                  const shiftDisplay = day.is_off
                    ? 'OFF'
                    : day.shift_code
                    ? day.shift_code.split('-')[0]
                    : 'OFF';

                  return (
                    <td
                      key={day.date}
                      onClick={() => onCellClick(emp, day)}
                      className="py-3 px-2.5 text-center cursor-pointer group/cell"
                    >
                      <div className="flex items-center justify-center">
                        <span
                          className={`w-14 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all transform group-hover/cell:scale-105 inline-block ${getShiftBadgeStyle(
                            day.shift_code,
                            day.is_off
                          )}`}
                        >
                          {shiftDisplay}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {employees.length === 0 && !isLoading && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-[#8D9BB8]">
                  No employees matching &ldquo;{searchQuery}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RosterTable;
