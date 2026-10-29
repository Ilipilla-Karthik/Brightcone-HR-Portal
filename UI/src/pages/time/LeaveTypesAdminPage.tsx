import React, { useState, useEffect, useCallback } from 'react';
import type { LeaveType } from '../../types';
import { request } from '../../services/shiftApi';
import { LeaveTypesPage } from '../LeaveTypesPage';

export const LeaveTypesAdminPage: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await request<any[]>('/v1/time/leave-types');
      if (Array.isArray(data)) {
        setTypes(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (t: any) => {
    try {
      await request('/v1/time/leave-types', {
        method: 'POST',
        body: JSON.stringify(t),
      });
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleUpdate = async (id: number, t: any) => {
    try {
      await request(`/v1/time/leave-types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(t),
      });
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request(`/v1/time/leave-types/${id}`, {
        method: 'DELETE',
      });
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <LeaveTypesPage
        leaveTypes={types}
        onAddLeaveType={handleAdd}
        onUpdateLeaveType={handleUpdate}
        onDeleteLeaveType={handleDelete}
        searchQuery=""
      />
    </div>
  );
};

export default LeaveTypesAdminPage;
