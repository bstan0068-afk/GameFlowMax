"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, TrendingDown, TrendingUp, Wind, Zap } from "lucide-react"

type SignalSeverity = "critical" | "warning" | "info"

interface Signal {
  id: string
  type: string
  game: string
  detail: string
  timestamp: string
  severity: SignalSeverity
  icon: React.ReactNode
}

const initialSignals: Signal[] = [
  {
    id: "1",
    type: "Pitcher Wobble",
    game: "NYY vs BOS",
    detail: "Closer velocity dropped below threshold — 3 consecutive pitches below 93 mph",
    timestamp: "0:12 ago",
    severity: "critical",
    icon: <Wind className="h-4 w-4" />,
  },
  {
    id: "2",
    type: "False Calm",
    game: "STL vs CHC",
    detail: "Score unchanged for 18 minutes but batter contact heat index at season high",
    timestamp: "1:04 ago",
    severity: "warning",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "3",
    type: "Control Slip",
    game: "MIL vs CIN",
    detail: "First-pitch strike rate fell to 38% — 9 pts below game average",
    timestamp: "2:31 ago",
    severity: "warning",
    icon: <TrendingDown className="h-4 w-4" />,
  },
  {
    id: "4",
    type: "Flip Threat",
    game: "NYY vs BOS",
    detail: "Rally signal detected — 3 consecutive hard contacts, BABIP spike incoming",
    timestamp: "3:17 ago",
    severity: "critical",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: "5",
    type: "Momentum Surge",
    game: "ATL vs NYM",
    detail: "Home crowd noise index correlated with 4.2% velocity gain last 2 pitches",
    timestamp: "4:45 ago",
    severity: "info",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: "6",
    type: "Pitcher Wobble",
    game: "HOU vs TEX",
    detail: "Pitch tunnel consistency dropped 18 pts in last 10 pitches — batter advantage",
    timestamp: "5:02 ago",
    severity: "warning",
    icon: <Wind className="h-4 w-4" />,
  },
  {
    id: "7",
    type: "Silent Build",
    game: "LAD vs SF",
    detail: "Scoreless innings masking xRun differential of +1.8 for home team",
    timestamp: "6:58 ago",
    severity: "info",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "8",
    type: "False Calm",
    game: "STL vs CHC",
    detail: "Second false calm signal in 4 innings — historically precedes multi-run inning",
    timestamp: "9:12 ago",
    severity: "warning",
    icon: <Zap className="h-4 w-4" />,
  },
]

const severityStyles: Record<SignalSeverity, string> = {
  critical: "border-signal-red/30 bg-signal-red/10 text-signal-red",
  warning: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
  info: "border-signal-blue/30 bg-signal-blue/10 text-signal-blue",
}

const severityDot: Record<SignalSeverity, string> = {
  critical: "bg-signal-red",
  warning: "bg-signal-amber",
  info: "bg-signal-blue",
}

export function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>(initialSignals)
  const [tick, setTick] = useState(0)

  // Simulate a live feed with a new signal every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
      const newSignal: Signal = {
        id: Date.now().toString(),
        type: ["Pitcher Wobble", "False Calm", "Control Slip", "Flip Threat", "Momentum Surge"][Math.floor(Math.random() * 5)],
        game: ["STL vs CHC", "NYY vs BOS", "LAD vs SF", "HOU vs TEX", "MIL vs CIN"][Math.floor(Math.random() * 5)],
        detail: "New momentum signal detected — reviewing pitch sequence data",
        timestamp: "Just now",
        severity: (["critical", "warning", "info"] as SignalSeverity[])[Math.floor(Math.random() * 3)],
        icon: <Zap className="h-4 w-4" />,
      }
      setSignals((prev) => [newSignal, ...prev.slice(0, 11)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
            Live Signal Feed
          </h2>
          <span className="flex h-2 w-2 rounded-full bg-signal-green animate-pulse" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{signals.length} signals</span>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="divide-y divide-border">
          {signals.map((signal, idx) => (
            <div
              key={signal.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-raised ${idx === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}`}
            >
              {/* severity dot */}
              <div className="mt-1 flex-shrink-0">
                <span className={`flex h-2 w-2 rounded-full ${severityDot[signal.severity]} ${idx === 0 ? "animate-pulse" : ""}`} />
              </div>

              {/* icon */}
              <div className={`flex-shrink-0 rounded-md border p-1.5 ${severityStyles[signal.severity]}`}>
                {signal.icon}
              </div>

              {/* content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-foreground">{signal.type}</span>
                    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {signal.game}
                    </span>
                  </div>
                  <span className="flex-shrink-0 font-mono text-xs text-muted-foreground">{signal.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{signal.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
