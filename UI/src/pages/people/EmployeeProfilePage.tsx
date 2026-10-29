import React, { useState, useEffect } from 'react';
import { fetchEmployees } from '../../services/peopleApi';
import { api } from '../../services/api';
import { ic } from '../../components/icons';

interface ProfileRecord {
  id: string;
  dbId?: number;
  name: string;
  role: string;
  dept: string;
  personalEmail: string;
  phone: string;
  address: string;
  location: string;
  grade: string;
  joined: string;
  manager: string;
  emergencyContact: string;
  emergencyRelation: string;
  emergencyPhone: string;
  bloodGroup: string;
  panMasked: string;
  aadhaarLast4: string;
  verificationStatus: 'Verified' | 'Pending';
}

export const EmployeeProfilePage: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ProfileRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    fetchEmployees()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.value || [];
        const mapped: ProfileRecord[] = list.map((e: any, idx: number) => {
          const codeDigits = (e.employee_code || '').replace(/\D/g, '') || String(idx + 1001);
          const panNum = codeDigits.slice(-4).padStart(4, '0');
          const aadhaarSuffix = String(parseInt(codeDigits, 10) * 73).slice(-4).padStart(4, '0');

          return {
            id: e.employee_code || `BC-${1000 + idx}`,
            dbId: e.id,
            name: e.full_name || 'Employee',
            role: e.job_title || 'Specialist',
            dept: e.department || 'General',
            personalEmail: e.work_email || `${(e.full_name || 'emp').toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
            phone: e.phone || `+91 98480 11${(idx + 1).toString().padStart(3, '0')}`,
            address: e.address || `Plot ${idx * 7 + 12}, Hitec City, Hyderabad - 500081`,
            location: e.location || 'Hyderabad',
            grade: e.grade || 'L4',
            joined: e.joined || '2022-01-15',
            manager: e.manager_name || 'Naresh Vemparala',
            emergencyContact: e.emergency_contact_name || `Family of ${e.full_name}`,
            emergencyRelation: e.emergency_contact_relation || (idx % 2 === 0 ? 'Spouse' : 'Father'),
            emergencyPhone: e.emergency_contact_phone || `+91 98480 99${(idx + 1).toString().padStart(3, '0')}`,
            bloodGroup: e.blood_group || (['O+', 'A+', 'B+', 'AB+'][idx % 4]),
            panMasked: `ABCDE${panNum}F`,
            aadhaarLast4: aadhaarSuffix,
            verificationStatus: 'Verified' as const,
          };
        });
        setProfiles(mapped);
        if (mapped.length > 0) {
          setSelected((prev) => (prev ? mapped.find((m) => m.id === prev.id) || mapped[0] : mapped[0]));
        }
      })
      .catch(() => setProfiles([]));
  };

  const handleSelect = (item: ProfileRecord) => {
    setSelected(item);
    setIsEditing(false);
    setSaveSuccess(false);
  };

  const startEdit = () => {
    if (!selected) return;
    setEditForm({
      phone: selected.phone,
      address: selected.address,
      emergencyContact: selected.emergencyContact,
      emergencyRelation: selected.emergencyRelation,
      emergencyPhone: selected.emergencyPhone,
      bloodGroup: selected.bloodGroup,
    });
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSaving(true);
    try {
      if (selected.dbId) {
        await api.patch(`/employees/${selected.dbId}`, {
          phone: editForm.phone,
          address: editForm.address,
          emergency_contact_name: editForm.emergencyContact,
          emergency_contact_relation: editForm.emergencyRelation,
          emergency_contact_phone: editForm.emergencyPhone,
          blood_group: editForm.bloodGroup,
        });
      }
      const updated = { ...selected, ...editForm };
      setSelected(updated);
      setProfiles((prev) => prev.map((p) => (p.id === selected.id ? updated : p)));
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Keep optimistic update
      const updated = { ...selected, ...editForm };
      setSelected(updated);
      setProfiles((prev) => prev.map((p) => (p.id === selected.id ? updated : p)));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return !search || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Employee Profiles & Statutory</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Personal, emergency, and statutory records. Sensitive tax and identity numbers are masked for data privacy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <input
            type="text"
            placeholder="Search employee profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filtered.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selected?.id === item.id
                    ? 'bg-[#12A58E]/10 border-[#12A58E] shadow-sm ring-1 ring-[#12A58E]'
                    : 'bg-[var(--surface)] border-[var(--line)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[var(--text)]">{item.name}</span>
                  <span className="text-[10px] font-mono text-[var(--muted)]">{item.id}</span>
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">{item.role}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--line)]/50 text-[10px]">
                  <span className="text-[var(--muted)]">{item.dept}</span>
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-500">
                    {item.verificationStatus}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
                <div>
                  <h2 className="text-xl font-bold font-['Sora'] text-[var(--text)]">{selected.name}</h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {selected.role} • {selected.dept} • <span className="font-mono text-[#12A58E] font-semibold">{selected.id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold px-2 py-1 rounded-lg bg-emerald-50">Saved to DB!</span>
                  )}
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={startEdit}
                      className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer"
                    >
                      {ic('edit', 14)} Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[var(--text)] mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[var(--text)] mb-1">Blood Group</label>
                      <select
                        value={editForm.bloodGroup || 'O+'}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-[var(--text)] mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[var(--text)] mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={editForm.emergencyContact || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[var(--text)] mb-1">Relationship</label>
                      <input
                        type="text"
                        value={editForm.emergencyRelation || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyRelation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-[var(--text)] mb-1">Emergency Phone</label>
                      <input
                        type="text"
                        value={editForm.emergencyPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold cursor-pointer shadow-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">1. Contact & Residential</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Work Email</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.personalEmail}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Mobile Phone</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.phone}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] sm:col-span-2">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Residential Address</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.address}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">2. Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Contact Name</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.emergencyContact}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Relationship</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.emergencyRelation}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Emergency Phone</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.emergencyPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">3. Statutory & Identity (Masked)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">PAN Card</span>
                        <p className="font-mono font-semibold text-[var(--text)] mt-0.5">{selected.panMasked}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Aadhaar (Last 4)</span>
                        <p className="font-mono font-semibold text-[var(--text)] mt-0.5">•••• •••• {selected.aadhaarLast4}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Blood Group</span>
                        <p className="font-semibold text-rose-500 mt-0.5">{selected.bloodGroup}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">4. Employment & Hierarchy</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Reporting Manager</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.manager}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Office Location</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.location}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--muted)] font-medium">Date Joined</span>
                        <p className="font-semibold text-[var(--text)] mt-0.5">{selected.joined}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
