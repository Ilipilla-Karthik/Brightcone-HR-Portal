import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Globe,
  MapPin,
  Repeat,
} from 'lucide-react';
import type { Holiday } from '../types';
import { StatCard } from '../components/common/StatCard';
import { HolidayModal } from '../components/holidays/HolidayModal';

interface HolidaysPageProps {
  holidays: Holiday[];
  onAddHoliday: (holiday: Omit<Holiday, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onUpdateHoliday: (id: number, holiday: Partial<Holiday>) => Promise<boolean>;
  onDeleteHoliday: (id: number) => Promise<boolean>;
  searchQuery?: string;
}

export const HolidaysPage: React.FC<HolidaysPageProps> = ({
  holidays,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  searchQuery = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    holidays.forEach((h) => {
      if (h.applicable_location) locs.add(h.applicable_location);
    });
    return Array.from(locs);
  }, [holidays]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        h.name.toLowerCase().includes(q) ||
        h.holiday_date.includes(q) ||
        (h.applicable_location && h.applicable_location.toLowerCase().includes(q)) ||
        (h.description && h.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (locationFilter === 'all') return true;
      if (locationFilter === 'global') return !h.applicable_location;
      return h.applicable_location === locationFilter;
    });
  }, [holidays, searchQuery, locationFilter]);

  const stats = useMemo(() => {
    const total = holidays.length;
    const globalCount = holidays.filter((h) => !h.applicable_location).length;
    const regionalCount = holidays.filter((h) => Boolean(h.applicable_location)).length;
    const recurringCount = holidays.filter((h) => h.is_recurring).length;
    return { total, globalCount, regionalCount, recurringCount };
  }, [holidays]);

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Holiday) => {
    setEditingHoliday(h);
    setIsModalOpen(true);
  };

  const handleSave = async (holidayData: Omit<Holiday, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingHoliday) {
      return onUpdateHoliday(editingHoliday.id, holidayData);
    }
    return onAddHoliday(holidayData);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-['Sora'] text-2xl font-bold tracking-tight text-[#0E1730] dark:text-[#E8EDFB]">
            Holiday Master Calendar
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#8D97B0] mt-1">
            Maintain statutory, national, and state-specific holidays across all company work locations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] shadow-md shadow-[#0B6FDB]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Holidays"
          value={stats.total}
          subtext="Configured on company calendar"
          icon={Calendar}
        />
        <StatCard
          label="Global / All Sites"
          value={stats.globalCount}
          subtext="Mandatory nationwide holidays"
          icon={Globe}
          badge={{ text: 'Company-Wide', variant: 'ok' }}
        />
        <StatCard
          label="Regional State Holidays"
          value={stats.regionalCount}
          subtext="Location specific branches"
          icon={MapPin}
          badge={{ text: 'State Specific', variant: 'info' }}
        />
        <StatCard
          label="Annual Recurring"
          value={stats.recurringCount}
          subtext="Carried over automatically"
          icon={Repeat}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#5B6787] font-medium mr-1">Filter Location:</span>
        <button
          onClick={() => setLocationFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            locationFilter === 'all'
              ? 'bg-[#0B6FDB] text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1833] text-[#5B6787] hover:bg-black/5 dark:hover:bg-white/5 border border-[#E3E8F2] dark:border-[#1D2B52]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setLocationFilter('global')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            locationFilter === 'global'
              ? 'bg-[#0B6FDB] text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1833] text-[#5B6787] hover:bg-black/5 dark:hover:bg-white/5 border border-[#E3E8F2] dark:border-[#1D2B52]'
          }`}
        >
          All Locations
        </button>
        {uniqueLocations.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocationFilter(loc)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              locationFilter === loc
                ? 'bg-[#0B6FDB] text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1833] text-[#5B6787] hover:bg-black/5 dark:hover:bg-white/5 border border-[#E3E8F2] dark:border-[#1D2B52]'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0E1833] border border-[#E3E8F2] dark:border-[#1D2B52] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E3E8F2] dark:border-[#1D2B52] bg-[#F8FAFD] dark:bg-[#122042] text-[#5B6787]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Holiday Name</th>
                <th className="py-3 px-4 font-semibold">Location Scope</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Frequency</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#1D2B52]">
              {filteredHolidays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5B6787]">
                    No holidays match the criteria.
                  </td>
                </tr>
              ) : (
                filteredHolidays.map((h) => (
                  <tr key={h.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#0B6FDB]">{h.holiday_date}</td>
                    <td className="py-3 px-4 font-semibold text-[#0E1730] dark:text-[#E8EDFB]">{h.name}</td>
                    <td className="py-3 px-4">
                      {h.applicable_location ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E3F0FF] text-[#0B6FDB]">
                          <MapPin className="w-3 h-3" /> {h.applicable_location}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E3F6EE] text-[#15A36B]">
                          <Globe className="w-3 h-3" /> All Locations (Global)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#5B6787] max-w-xs truncate">{h.description || '—'}</td>
                    <td className="py-3 px-4">
                      {h.is_recurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                          <Repeat className="w-2.5 h-2.5" /> Annual
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#5B6787]">One-off</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(h)}
                          className="p-1 rounded-lg text-[#5B6787] hover:text-[#0B6FDB] hover:bg-black/5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHoliday(h.id)}
                          className="p-1 rounded-lg text-[#5B6787] hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingHoliday={editingHoliday}
        onSave={handleSave}
      />
    </div>
  );
};

export default HolidaysPage;
