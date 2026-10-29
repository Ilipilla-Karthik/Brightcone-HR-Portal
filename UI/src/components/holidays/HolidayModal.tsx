import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Holiday } from '../../types';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHoliday: Holiday | null;
  onSave: (holiday: Omit<Holiday, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({
  isOpen,
  onClose,
  editingHoliday,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [description, setDescription] = useState('');
  const [locationType, setLocationType] = useState<'global' | 'branch'>('global');
  const [customLocation, setCustomLocation] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingHoliday) {
      setName(editingHoliday.name);
      setHolidayDate(editingHoliday.holiday_date);
      setDescription(editingHoliday.description || '');
      if (editingHoliday.applicable_location) {
        setLocationType('branch');
        setCustomLocation(editingHoliday.applicable_location);
      } else {
        setLocationType('global');
        setCustomLocation('');
      }
      setIsRecurring(editingHoliday.is_recurring);
    } else {
      setName('');
      setHolidayDate('');
      setDescription('');
      setLocationType('global');
      setCustomLocation('');
      setIsRecurring(false);
    }
    setErrorMsg(null);
  }, [editingHoliday, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !holidayDate) {
      setErrorMsg('Holiday name and date are required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const loc = locationType === 'branch' ? customLocation.trim() || null : null;
      const ok = await onSave({
        name: name.trim(),
        holiday_date: holidayDate,
        description: description.trim() || null,
        applicable_location: loc,
        is_recurring: isRecurring,
      });
      if (ok) onClose();
      else setErrorMsg('Failed to save holiday record.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingHoliday ? 'Edit Master Holiday' : 'Add Master Holiday'}
      description={editingHoliday ? `Update details for ${editingHoliday.name}.` : 'Create a statutory or regional holiday record.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Holiday Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Telangana Formation Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Date *</label>
            <input
              type="date"
              required
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Applicable Location</label>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E3E8F2] dark:border-[#1D2B52] cursor-pointer text-xs">
              <input type="radio" checked={locationType === 'global'} onChange={() => setLocationType('global')} />
              <span>All Locations (Global)</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-xl border border-[#E3E8F2] dark:border-[#1D2B52] cursor-pointer text-xs">
              <input type="radio" checked={locationType === 'branch'} onChange={() => setLocationType('branch')} />
              <span>Specific Branch</span>
            </label>
          </div>
          {locationType === 'branch' && (
            <input
              type="text"
              placeholder="e.g. Hyderabad, Bengaluru"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52]"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Description (Optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52]"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="is-recurring" className="text-xs">Annual Recurring Holiday</label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#E3E8F2] dark:border-[#1D2B52]">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-[#5B6787]">Cancel</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B6FDB] rounded-lg shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Save Holiday'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HolidayModal;
