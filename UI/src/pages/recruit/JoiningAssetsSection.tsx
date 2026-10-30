import React from 'react';

type JoiningAssetProps = {
  record: any;
  toggleAsset: any;
};

type AssetKey = 'idcard' | 'mail' | 'laptop' | 'bankd' | 'pf';

export const JoiningAssetsSection: React.FC<JoiningAssetProps> = ({ record, toggleAsset }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {['idcard', 'mail', 'laptop', 'bankd', 'pf'].map((k) => (
        <button
          key={k}
          onClick={() => toggleAsset(record, k)}
          title={`${k}: ${record[k] || 'No'}`}
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
            record[k] === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {k === 'idcard' ? 'ID' : k === 'mail' ? 'Mail' : k === 'laptop' ? 'Laptop' : k === 'bankd' ? 'Bank' : 'PF'}
        </button>
      ))}
    </div>
  );
};