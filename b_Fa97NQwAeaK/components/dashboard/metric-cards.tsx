"use client"

import { Activity, Flame, TrendingDown, Wind, Zap } from "lucide-react"

interface MetricCardProps {
  label: string
  value: number | string
  unit?: string
  delta?: number
  icon: React.ReactNode
  colorClass: string
  barPercent: number
}

function MetricCard({ label, value, unit, delta, icon, colorClass, barPercent }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${colorClass}`}>
          {icon}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono text-3xl font-black ${colorClass.replace("bg-", "text-").replace("/10", "")}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-sm text-muted-foreground">{unit}</span>}
      </div>

      {/* mini bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass.replace("/10", "")}`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      {delta !== undefined && (
        <span className={`font-mono text-xs ${delta >= 0 ? "text-signal-green" : "text-signal-red"}`}>
          {delta >= 0 ? "+" : ""}{delta}% vs last inning
        </span>
      )}
    </div>
  )
}

export function MetricCards() {
  const metrics: MetricCardProps[] = [
    {
      label: "GameFlow Index",
      value: 74,
      unit: "/ 100",
      delta: 8,
      icon: <Activity className="h-4 w-4" />,
      colorClass: "bg-signal-green/10 text-signal-green",
      barPercent: 74,
    },
    {
      label: "Pressure Score",
      value: 88,
      unit: "/ 100",
      delta: 12,
      icon: <Flame className="h-4 w-4" />,
      colorClass: "bg-signal-red/10 text-signal-red",
      barPercent: 88,
    },
    {
      label: "Contact Heat",
      value: 61,
      unit: "/ 100",
      delta: -4,
      icon: <Zap className="h-4 w-4" />,
      colorClass: "bg-signal-amber/10 text-signal-amber",
      barPercent: 61,
    },
    {
      label: "Pitcher Drift",
      value: 43,
      unit: "mph",
      delta: -7,
      icon: <Wind className="h-4 w-4" />,
      colorClass: "bg-signal-blue/10 text-signal-blue",
      barPercent: 43,
    },
    {
      label: "Break Probability",
      value: "31%",
      delta: 5,
      icon: <TrendingDown className="h-4 w-4" />,
      colorClass: "bg-signal-amber/10 text-signal-amber",
      barPercent: 31,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  )
}
