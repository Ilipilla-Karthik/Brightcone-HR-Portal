import React, { useState } from 'react'

export const PayrollTrendsChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(4) // Default Sep

  const data = [
    { month: 'May', val: 194.5, label: '₹194.5 L' },
    { month: 'Jun', val: 198.2, label: '₹198.2 L' },
    { month: 'Jul', val: 202.8, label: '₹202.8 L' },
    { month: 'Aug', val: 208.1, label: '₹208.1 L' },
    { month: 'Sep', val: 214.2, label: '₹214.2 L' },
    { month: 'Oct', val: 216.0, label: '₹216.0 L (proj)' },
  ]

  const min = 190
  const max = 220
  const width = 640
  const height = 180
  const paddingX = 40
  const paddingY = 30

  const getX = (index: number) => paddingX + (index * (width - paddingX * 2)) / (data.length - 1)
  const getY = (val: number) => height - paddingY - ((val - min) / (max - min)) * (height - paddingY * 2)

  const points = data.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ')
  const areaPoints = `${getX(0)},${height} ${points} ${getX(data.length - 1)},${height}`

  return (
    <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Gross payroll, last 6 months</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historical monthly payroll expenditure trend</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Stable growth</span>
        </div>
      </div>

      <div className="relative w-full h-[200px] mt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="payrollAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="payrollLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={getY(200)} x2={width - paddingX} y2={getY(200)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
          <line x1={paddingX} y1={getY(210)} x2={width - paddingX} y2={getY(210)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />

          {/* Filled Area */}
          <polygon points={areaPoints} fill="url(#payrollAreaGrad)" />

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="url(#payrollLineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Dots and Labels */}
          {data.map((d, i) => {
            const cx = getX(i)
            const cy = getY(d.val)
            const isHovered = hoveredIdx === i

            return (
              <g key={d.month} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  className="fill-emerald-500 stroke-white dark:stroke-[#10192A] stroke-2 transition-all duration-150"
                />
                {isHovered && (
                  <g>
                    <rect
                      x={cx - 36}
                      y={cy - 30}
                      width="72"
                      height="22"
                      rx="6"
                      className="fill-slate-900 dark:fill-emerald-950/95 stroke-slate-700 dark:stroke-emerald-600/60 stroke"
                    />
                    <text
                      x={cx}
                      y={cy - 15}
                      textAnchor="middle"
                      className="fill-white dark:fill-emerald-300 text-[11px] font-bold"
                    >
                      {d.label}
                    </text>
                  </g>
                )}
                {/* Month labels along bottom */}
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 text-xs font-medium"
                >
                  {d.month}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
