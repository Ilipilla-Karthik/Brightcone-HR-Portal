import React, { useState, useEffect, useCallback } from 'react';
import type { LeaveQuota, LeaveType } from '../../types';
import { shiftApi, request } from '../../services/shiftApi';
import { LeaveQuotasPage } from '../LeaveQuotasPage';

export const LeaveQuotasAdminPage: React.FC = () => {
  const [quotas, setQuotas] = useState<LeaveQuota[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [qData, tData] = await Promise.all([
        request<any[]>('/v1/time/leave-quotas'),
        shiftApi.fetchLeaveTypes(),
      ]);
      if (Array.isArray(qData) && qData.length > 0) {
        setQuotas(qData);
      }
      if (tData.data) {
        setLeaveTypes(tData.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (q: any) => {
    try {
      await request('/v1/time/leave-quotas', {
        method: 'POST',
        body: JSON.stringify(q),
      });
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleUpdate = async (id: number, q: any) => {
    try {
      await request(`/v1/time/leave-quotas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(q),
      });
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request(`/v1/time/leave-quotas/${id}`, {
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
      <LeaveQuotasPage
        leaveQuotas={quotas}
        leaveTypes={leaveTypes}
        onAddQuota={handleAdd}
        onUpdateQuota={handleUpdate}
        onDeleteQuota={handleDelete}
        searchQuery=""
      />
    </div>
  );
};

export default LeaveQuotasAdminPage;
