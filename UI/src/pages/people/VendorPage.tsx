import React, { useState, useEffect } from 'react';
import { fetchVendors, createVendorApi, VendorApiItem } from '../../services/peopleApi';
import { ic } from '../../components/icons';

interface VendorItem {
  id: string;
  name: string;
  category: 'IT Hardware' | 'SaaS & Cloud' | 'Facilities & Security' | 'Catering & Supplies';
  contactPerson: string;
  email: string;
  phone: string;
  contractExpiry: string;
  status: 'Active' | 'Under Renewal' | 'Terminated';
}

export const VendorPage: React.FC = () => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', category: 'IT Hardware' as const, contactPerson: '', email: '', phone: '', contractExpiry: '' });

  useEffect(() => {
    fetchVendors()
      .then((data: VendorApiItem[]) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        setVendors(
          list.map((v: any) => ({
            id: v.vendor_code || `VEN-0${v.id}`,
            name: v.name,
            category: v.category as any,
            contactPerson: v.contact_person,
            email: v.email,
            phone: v.phone,
            contractExpiry: v.contract_expiry,
            status: v.status as any,
          }))
        );
      })
      .catch(() => setVendors([]));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.contactPerson) return;
    try {
      const created = await createVendorApi({
        name: newVendor.name,
        category: newVendor.category,
        contact_person: newVendor.contactPerson,
        email: newVendor.email,
        phone: newVendor.phone,
        contract_expiry: newVendor.contractExpiry || '2027-12-31',
        status: 'Active',
      });
      const item: VendorItem = {
        id: created.vendor_code || `VEN-0${created.id}`,
        name: created.name,
        category: created.category as any,
        contactPerson: created.contact_person,
        email: created.email,
        phone: created.phone,
        contractExpiry: created.contract_expiry,
        status: created.status as any,
      };
      setVendors([item, ...vendors]);
    } catch {
      const item: VendorItem = {
        id: `VEN-0${vendors.length + 1}`,
        name: newVendor.name,
        category: newVendor.category,
        contactPerson: newVendor.contactPerson,
        email: newVendor.email,
        phone: newVendor.phone,
        contractExpiry: newVendor.contractExpiry || '2027-12-31',
        status: 'Active',
      };
      setVendors([item, ...vendors]);
    }
    setIsModalOpen(false);
    setNewVendor({ name: '', category: 'IT Hardware', contactPerson: '', email: '', phone: '', contractExpiry: '' });
  };

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return !search || v.name.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Vendor Management</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Track external suppliers, IT hardware vendors, service contracts, and SLA agreements.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 16)} Onboard Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Active Contracts</span>
          <p className="text-2xl font-bold text-[var(--text)]">{vendors.filter((v) => v.status === 'Active').length}</p>
          <span className="text-xs text-emerald-500 font-medium">Valid vendor agreements</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Under Renewal</span>
          <p className="text-2xl font-bold text-[var(--text)]">{vendors.filter((v) => v.status === 'Under Renewal').length}</p>
          <span className="text-xs text-amber-500 font-medium">Expires within 45 days</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Annual Vendor Spend</span>
          <p className="text-2xl font-bold text-[var(--text)]">₹42.8 L</p>
          <span className="text-xs text-blue-500 font-medium">Within corporate budget</span>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search vendors..."
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
              <th className="p-3.5">Vendor Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Primary Contact</th>
              <th className="p-3.5">Email & Phone</th>
              <th className="p-3.5">Contract Expiry</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--muted)]">No vendors registered in registry. Click "Onboard New Vendor" to add one.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-medium">{item.category}</td>
                  <td className="p-3.5">{item.contactPerson}</td>
                  <td className="p-3.5 text-[var(--muted)]">
                    <div>{item.email}</div>
                    <div className="text-[10px]">{item.phone}</div>
                  </td>
                  <td className="p-3.5 font-medium">{item.contractExpiry}</td>
                  <td className="p-3.5 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.status}
                    </span>
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
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Onboard New Vendor</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Company / Vendor Name</label>
                <input required type="text" placeholder="e.g. Cisco Networking Solutions" value={newVendor.name} onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Category</label>
                  <select value={newVendor.category} onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="SaaS & Cloud">SaaS & Cloud</option>
                    <option value="Facilities & Security">Facilities & Security</option>
                    <option value="Catering & Supplies">Catering & Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Contract Expiry</label>
                  <input required type="date" value={newVendor.contractExpiry} onChange={(e) => setNewVendor({ ...newVendor, contractExpiry: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Contact Person</label>
                <input required type="text" placeholder="Account Executive name" value={newVendor.contactPerson} onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Email</label>
                  <input required type="email" placeholder="vendor@partner.com" value={newVendor.email} onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Phone</label>
                  <input required type="tel" placeholder="+91 99887 76655" value={newVendor.phone} onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPage;
