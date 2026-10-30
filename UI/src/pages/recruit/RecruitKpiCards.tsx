import React from 'react';

export type KpiCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
};

export const RecruitKpiCards: React.FC<{ cards: KpiCardProps[] }> = ({ cards }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs"
        >
          <span className="text-xs text-[var(--muted)] font-medium">{card.label}</span>
          <p className="text-3xl font-bold font-['Sora'] mt-1">{card.value}</p>
          {card.subtitle && (
            <span className="text-[11px] mt-2 block">{card.subtitle}</span>
          )}
        </div>
      ))}
    </div>
  );
};
