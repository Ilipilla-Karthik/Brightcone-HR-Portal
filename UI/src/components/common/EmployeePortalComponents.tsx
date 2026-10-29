import React from 'react';

export type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

const navigation = [
  { label: 'Dashboard', icon: '⌂' },
  { label: 'My Profile', icon: '♙' },
  { label: 'Attendance', icon: '◷' },
  { label: 'Leave Management', icon: '▤' },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="relative flex h-full flex-col overflow-y-auto bg-[#06101F] px-[14px] py-5 text-[#C9D3EE]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[220px] bg-[radial-gradient(120%_80%_at_0%_100%,rgba(11,111,219,0.35),transparent_70%)]" />

      <a
        href="/"
        className="relative flex items-center gap-2.5 px-2 pb-[22px] pt-1 text-white no-underline"
      >
        <span className="font-['Sora'] text-lg font-semibold tracking-tight">
          Brightcone
        </span>
        <span className="block text-xs text-[#C9D3EE]">People Plus</span>
      </a>

      <nav className="relative z-10 flex flex-col gap-1">
        <p className="px-2.5 pb-1 pt-3.5 text-xs text-[#8D97B0]">
          WORKSPACE
        </p>

        {navigation.map((item) => {
          const active = activePage === item.label;

          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.label)}
              className={`flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-[9px] text-left text-sm font-medium transition-colors ${
                active
                  ? 'bg-gradient-to-r from-[#0B6FDB]/55 to-[#0B6FDB]/[0.12] text-white'
                  : 'text-[#C9D3EE] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center">
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="relative z-10 mt-auto p-2 pt-6">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.06] p-3 text-[13px]">
          <strong className="block text-white">Help & Support</strong>
          <span>Contact your HR team</span>
        </div>
      </div>
    </aside>
  );
}

export function PageHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-[#E3E8F2] bg-white/85 px-7 py-3.5 backdrop-blur-lg">
      <button
        aria-label="Notifications"
        className="relative grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] border border-[#E3E8F2] bg-white hover:bg-[#F8FAFD]"
      >
        ♧
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#D93D4A]" />
      </button>

      <div className="ml-auto flex items-center gap-2.5 text-[13px]">
        <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#0B6FDB] text-xs font-bold text-white">
          KS
        </div>
        <div>
          <p className="font-semibold text-[#0E1730]">Employee</p>
          <p className="text-xs text-[#5B6787]">People Plus</p>
        </div>
      </div>
    </header>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="rounded-2xl border border-[#E3E8F2] bg-white p-[18px_20px] shadow-[0_1px_2px_rgba(14,23,48,0.06),0_8px_24px_-12px_rgba(14,23,48,0.12)]">
      <p className="flex items-center gap-2 text-[13px] text-[#5B6787]">
        {label}
      </p>
      <p className="mt-3 font-['Sora'] text-[28px] font-semibold leading-tight text-[#0E1730]">
        {value}
      </p>
      <p className="mt-1 text-[12.5px] text-[#5B6787]">{detail}</p>
    </section>
  );
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-[7px] whitespace-nowrap rounded-[9px] border border-[#0B6FDB] bg-[#0B6FDB] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#095DB8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6FDB]"
    >
      {children}
    </button>
  );
}
