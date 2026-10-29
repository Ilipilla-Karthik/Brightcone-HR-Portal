import React, { useState, useEffect, useCallback } from 'react';
import type { Shift } from '../../types';
import { attendanceApi } from '../../services/attendanceApi';
import { ShiftsPage as ShiftMaster } from '../ShiftsPage';

export const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);

  const loadShifts = useCallback(async () => {
    const data = await attendanceApi.fetchShifts();
    setShifts(data);
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleAdd = async (s: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
    const ok = await attendanceApi.createShift(s);
    if (ok) await loadShifts();
    return ok;
  };

  const handleUpdate = async (id: number, s: Partial<Shift>) => {
    const ok = await attendanceApi.updateShift(id, s);
    if (ok) await loadShifts();
    return ok;
  };

  const handleDelete = async (id: number) => {
    const ok = await attendanceApi.deleteShift(id);
    if (ok) await loadShifts();
    return ok;
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <ShiftMaster
        shifts={shifts}
        onAddShift={handleAdd}
        onUpdateShift={handleUpdate}
        onDeleteShift={handleDelete}
        searchQuery=""
      />
    </div>
  );
};

export default ShiftsPage;
