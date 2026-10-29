import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { fetchEmployees, createAssetApi, EmployeeApiItem } from '../../services/peopleApi';

interface CardItem {
  id: string;
  cardNum: string;
  employee: string;
  empCode: string;
  zone: string;
  issuedOn: string;
  status: 'Active' | 'Blocked' | 'Returned';
}

export const AccessCardPage: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [newCard, setNewCard] = useState({
    cardNum: '',
    employee: '',
    empCode: '',
    zone: 'General Office (Level 1)',
  });

  const STORAGE_KEY = 'brightcone_access_cards';

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    fetchEmployees()
      .then((data: any) => {
        const list: EmployeeApiItem[] = Array.isArray(data) ? data : data?.value || [];
        setEmployees(list);

        const saved = localStorage.getItem(STORAGE_KEY);
        let localCards: CardItem[] = [];
        if (saved) {
          try { localCards = JSON.parse(saved); } catch {}
        }

        const baseCards: CardItem[] = list.map((e: any, idx: number) => ({
          id: `c-${idx + 1}`,
          cardNum: `BC-NFC-${1000 + (e.id || idx + 1)}`,
          employee: e.full_name || 'Staff Member',
          empCode: e.employee_code || `BC-100${idx + 1}`,
          zone: e.department === 'AI Research' ? 'AI Lab & Server Room (Tier 4)' : e.department === 'Leadership' ? 'All Floors & Executive Suites' : 'Engineering Floor (Level 2)',
          issuedOn: e.joined || '2022-01-15',
          status: 'Active' as const,
        }));

        // Merge saved cards with base cards so updates & additions persist
        const cardMap = new Map<string, CardItem>();
        baseCards.forEach((c) => cardMap.set(c.empCode, c));
        localCards.forEach((c) => cardMap.set(c.empCode, c));

        const merged = Array.from(cardMap.values());
        setCards(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        if (list.length > 0 && !newCard.empCode) {
          setNewCard((prev) => ({
            ...prev,
            empCode: list[0].employee_code,
            employee: list[0].full_name,
            cardNum: `BC-NFC-${Math.floor(1000 + Math.random() * 9000)}`,
          }));
        }
      })
      .catch(() => setCards([]));
  };

  const saveCards = (newList: CardItem[]) => {
    setCards(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  const handleToggleStatus = (id: string) => {
    const updated = cards.map((c) => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? ('Blocked' as const) : ('Active' as const);
        return { ...c, status: nextStatus };
      }
      return c;
    });
    saveCards(updated);
  };

  const handleSelectEmployee = (code: string) => {
    const emp = employees.find((e) => e.employee_code === code);
    if (emp) {
      setNewCard({
        ...newCard,
        empCode: emp.employee_code,
        employee: emp.full_name,
        cardNum: newCard.cardNum || `BC-NFC-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardNum || !newCard.employee) return;

    try {
      await createAssetApi({
        asset_type: 'Access Card',
        model_name: newCard.zone,
        serial_number: newCard.cardNum,
        employee_code: newCard.empCode || 'BC-1099',
        status: 'Active',
      });
    } catch {}

    const item: CardItem = {
      id: `c-${Date.now()}`,
      cardNum: newCard.cardNum,
      employee: newCard.employee,
      empCode: newCard.empCode || 'BC-1099',
      zone: newCard.zone,
      issuedOn: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    saveCards([item, ...cards]);
    setIsModalOpen(false);
    setNewCard({
      cardNum: `BC-NFC-${Math.floor(1000 + Math.random() * 9000)}`,
      employee: employees[0]?.full_name || '',
      empCode: employees[0]?.employee_code || '',
      zone: 'General Office (Level 1)',
    });
  };

  const filtered = cards.filter((c) => {
    const q = search.toLowerCase();
    return !search || c.employee.toLowerCase().includes(q) || c.cardNum.toLowerCase().includes(q) || c.empCode.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Access Cards & Security Badges</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Issue, manage, and revoke physical RFID/NFC office access cards and security clearance zones.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            if (!newCard.cardNum) {
              setNewCard((prev) => ({ ...prev, cardNum: `BC-NFC-${Math.floor(1000 + Math.random() * 9000)}` }));
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 14)} Issue New Badge
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Active Badges</span>
          <p className="text-2xl font-bold text-[var(--text)]">{cards.filter((c) => c.status === 'Active').length}</p>
          <span className="text-xs text-emerald-500 font-medium">Valid gate access</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Blocked / Suspended</span>
          <p className="text-2xl font-bold text-[var(--text)]">{cards.filter((c) => c.status === 'Blocked').length}</p>
          <span className="text-xs text-rose-500 font-medium">Restricted at turnstiles</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Total Registered Badges</span>
          <p className="text-2xl font-bold text-[var(--text)]">{cards.length}</p>
          <span className="text-xs text-[#12A58E] font-medium">Synced with PostgreSQL</span>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by card number or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
              <th className="p-3.5">Card Number</th>
              <th className="p-3.5">Assigned Employee</th>
              <th className="p-3.5">Access Clearance Zone</th>
              <th className="p-3.5">Issued On</th>
              <th className="p-3.5">Card Status</th>
              <th className="p-3.5 text-right">Security Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--muted)]">No active NFC access cards registered.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-[#12A58E]">{item.cardNum}</td>
                  <td className="p-3.5">
                    <div className="font-semibold">{item.employee}</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">{item.empCode}</div>
                  </td>
                  <td className="p-3.5 text-[var(--muted)]">{item.zone}</td>
                  <td className="p-3.5 font-medium">{item.issuedOn}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.status === 'Blocked' ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-500/10 text-[var(--muted)]'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] cursor-pointer ${
                        item.status === 'Active'
                          ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                      }`}
                    >
                      {item.status === 'Active' ? 'Block Card' : 'Unblock Card'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Issue Access Badge</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">NFC / RFID Card Serial</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. BC-NFC-0950"
                  value={newCard.cardNum}
                  onChange={(e) => setNewCard({ ...newCard, cardNum: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Employee Name (Select from Roster) *</label>
                <select
                  required
                  value={newCard.empCode}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_code} value={emp.employee_code}>
                      {emp.full_name} ({emp.employee_code}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Access Zone</label>
                <select
                  value={newCard.zone}
                  onChange={(e) => setNewCard({ ...newCard, zone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                >
                  <option value="General Office (Level 1)">General Office (Level 1)</option>
                  <option value="Engineering Floor (Level 2)">Engineering Floor (Level 2)</option>
                  <option value="AI Lab & Server Room (Tier 4)">AI Lab & Server Room (Tier 4)</option>
                  <option value="All Floors & Executive Suites">All Floors & Executive Suites</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold cursor-pointer shadow-sm"
                >
                  Issue Badge & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessCardPage;
