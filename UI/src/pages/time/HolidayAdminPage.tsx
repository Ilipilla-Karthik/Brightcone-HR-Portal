import React, { useState, useEffect, useCallback } from 'react';
import type { Holiday } from '../../types';
import { attendanceApi } from '../../services/attendanceApi';
import { HolidaysPage } from '../HolidaysPage';

export const HolidayAdminPage: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const loadHolidays = useCallback(async () => {
    const data = await attendanceApi.fetchHolidays();
    setHolidays(data);
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const handleAdd = async (h: Omit<Holiday, 'id' | 'created_at' | 'updated_at'>) => {
    const ok = await attendanceApi.createHoliday(h);
    if (ok) await loadHolidays();
    return ok;
  };

  const handleUpdate = async (_id: number, _h: Partial<Holiday>) => {
    await loadHolidays();
    return true;
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    await attendanceApi.deleteHoliday(id);
    await loadHolidays();
    return true;
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <HolidaysPage
        holidays={holidays}
        onAddHoliday={handleAdd}
        onUpdateHoliday={handleUpdate}
        onDeleteHoliday={handleDelete}
      />
    </div>
  );
};

export default HolidayAdminPage;
