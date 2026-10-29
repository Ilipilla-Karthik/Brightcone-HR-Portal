import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { fetchAssets, createAssetApi } from '../../services/peopleApi';

interface AssetRecord {
  id: string;
  tag: string;
  name: string;
  category: 'Laptop' | 'Monitor' | 'Access Device' | 'Phone';
  serial: string;
  assignedTo: string;
  department: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  status: 'Assigned' | 'Available' | 'Maintenance';
}

export const AssetsAdminPage: React.FC = () => {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', tag: '', category: 'Laptop' as const, serial: '', assignedTo: 'Unassigned', department: 'Engineering' });

  useEffect(() => {
    fetchAssets()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        const mapped: AssetRecord[] = list.map((d: any, i: number) => ({
          id: String(d.id || i + 1),
          tag: d.serial_number || `BC-AST-${100 + i}`,
          name: d.model_name || 'Hardware Asset',
          category: (d.asset_type === 'Monitor' ? 'Monitor' : d.asset_type === 'Peripherals' ? 'Access Device' : 'Laptop') as any,
          serial: d.serial_number || `SN-${i}`,
          assignedTo: d.employee_code || 'Unassigned',
          department: 'IT Equipment',
          condition: 'Excellent',
          status: d.status?.includes('Active') || d.status?.includes('Assigned') ? 'Assigned' : 'Available',
        }));
        setAssets(mapped);
      })
      .catch(() => {
        setAssets([]);
      });
  }, []);

  const categories = ['All', 'Laptop', 'Monitor', 'Access Device', 'Phone'];

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.assignedTo.toLowerCase().includes(q) || a.serial.toLowerCase().includes(q);
    const matchCategory = categoryFilter === 'All' || a.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.tag) return;
    const serialNum = newAsset.serial || `SN-${Math.floor(Math.random() * 900000 + 100000)}`;
    const item: AssetRecord = {
      id: `ast-${Date.now()}`,
      tag: newAsset.tag,
      name: newAsset.name,
      category: newAsset.category,
      serial: serialNum,
      assignedTo: newAsset.assignedTo,
      department: newAsset.department,
      condition: 'Excellent',
      status: newAsset.assignedTo === 'Unassigned' ? 'Available' : 'Assigned',
    };
    createAssetApi({
      model_name: item.name,
      asset_type: item.category,
      serial_number: item.serial,
      employee_code: item.assignedTo,
      status: item.status,
    }).catch(() => {});
    setAssets([item, ...assets]);
    setIsAddOpen(false);
    setNewAsset({ name: '', tag: '', category: 'Laptop', serial: '', assignedTo: 'Unassigned', department: 'Engineering' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Asset Management</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Hardware inventory, serial assignments, and IT provisioning.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
          style={{ background: '#12A58E' }}
        >
          {ic('plus', 14)} Add New Asset
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Total Assets</p>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-1">{assets.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Assigned to Staff</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#15A36B] mt-1">{assets.filter((a) => a.status === 'Assigned').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">In Inventory</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#0B6FDB] mt-1">{assets.filter((a) => a.status === 'Available').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Hardware Value</p>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-1">₹34.8 Lakhs</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
          {ic('search', 15)}
          <input
            type="text"
            placeholder="Search by asset tag, name, or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-[var(--text)] focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                categoryFilter === c ? 'bg-[#12A58E] text-white' : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Asset Tag</th>
              <th className="py-3 px-4">Item & Specification</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Serial Number</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filtered.map((ast) => (
              <tr key={ast.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-xs text-[var(--text)]">{ast.tag}</td>
                <td className="py-3 px-4 text-xs font-semibold text-[var(--text)]">{ast.name}</td>
                <td className="py-3 px-4 text-xs text-[var(--muted)]">{ast.category}</td>
                <td className="py-3 px-4 text-xs font-mono text-[var(--muted)]">{ast.serial}</td>
                <td className="py-3 px-4 text-xs font-medium text-[var(--text)]">{ast.assignedTo}</td>
                <td className="py-3 px-4 text-xs text-[var(--muted)]">{ast.condition}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    ast.status === 'Assigned' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {ast.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No hardware assets registered in database.</div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleAdd} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Register Hardware Asset</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Asset Tag</label>
                <input required type="text" placeholder="e.g. BC-MBP-04" value={newAsset.tag} onChange={(e) => setNewAsset({ ...newAsset, tag: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Device Name / Model</label>
                <input required type="text" placeholder="e.g. Apple MacBook Pro 14 M3" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Category</label>
                  <select value={newAsset.category} onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Access Device">Access Device</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Serial Number</label>
                  <input type="text" placeholder="e.g. C02GK10294" value={newAsset.serial} onChange={(e) => setNewAsset({ ...newAsset, serial: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--line)]">
              <button type="button" onClick={() => setIsAddOpen(false)} className="btn text-xs font-semibold px-4 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]">Cancel</button>
              <button type="submit" className="btn primary text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm" style={{ background: '#12A58E' }}>Save Asset</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AssetsAdminPage;
