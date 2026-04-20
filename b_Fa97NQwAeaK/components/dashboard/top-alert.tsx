"use client"

import { TrendingUp, Zap, ArrowUp } from "lucide-react"
import type { GameCardData, TrafficSignal } from "@/lib/games-data"
import { scoreGame, EDGE_TAG_DESCRIPTIONS } from "@/lib/games-data"

// ─── Style maps ───────────────────────────────────────────────────────────────

const momentumColorMap = {
  green: { border: "border-signal-green/30", bg: "bg-signal-green/10", text: "text-signal-green", ring: "text-signal-green" },
  amber: { border: "border-signal-amber/30", bg: "bg-signal-amber/10", text: "text-signal-amber", ring: "text-signal-amber" },
  red:   { border: "border-signal-red/30",   bg: "bg-signal-red/10",   text: "text-signal-red",   ring: "text-signal-red"   },
  blue:  { border: "border-signal-blue/30",  bg: "bg-signal-blue/10",  text: "text-signal-blue",  ring: "text-signal-blue"  },
}

const trafficConfig: Record<TrafficSignal, {
  pipActive: number
  border: string
  bg: string
  headerBg: string
  text: string
  glow: string
}> = {
  green: {
    pipActive: 2,
    border:    "border-signal-green/35",
    bg:        "bg-signal-green/6",
    headerBg:  "bg-signal-green/12",
    text:      "text-signal-green",
    glow:      "shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--color-signal-green)_40%,transparent)]",
  },
  amber: {
    pipActive: 1,
    border:    "border-signal-amber/35",
    bg:        "bg-signal-amber/6",
    headerBg:  "bg-signal-amber/12",
    text:      "text-signal-amber",
    glow:      "shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--color-signal-amber)_40%,transparent)]",
  },
  red: {
    pipActive: 0,
    border:    "border-signal-red/35",
    bg:        "bg-signal-red/6",
    headerBg:  "bg-signal-red/12",
    text:      "text-signal-red",
    glow:      "shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--color-signal-red)_40%,transparent)]",
  },
}

const pipColors = [
  { on: "bg-signal-red",   off: "bg-signal-red/15"   },
  { on: "bg-signal-amber", off: "bg-signal-amber/15" },
  { on: "bg-signal-green", off: "bg-signal-green/15" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrafficLight({ signal }: { signal: TrafficSignal }) {
  const cfg = trafficConfig[signal]
  return (
    <div
      aria-label={`Traffic signal: ${signal}`}
      className={`flex flex-col items-center gap-[5px] self-stretch rounded-full border ${cfg.border} ${cfg.bg} px-2 py-3 ${cfg.glow}`}
    >
      {[0, 1, 2].map((i) => {
        const isActive = i === cfg.pipActive
        const colors = pipColors[i]
        return (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              isActive ? `${colors.on} animate-pulse` : colors.off
            }`}
          />
        )
      })}
    </div>
  )
}

// ─── TopAlert ────────────────────────────────────────────────────────────────

interface TopAlertProps {
  game: GameCardData
}

export function TopAlert({ game }: TopAlertProps) {
  const mc = momentumColorMap[game.momentumColor]
  const score = Math.round(scoreGame(game))
  const circumference = 276.46
  const progress = (game.gfi / 100) * circumference

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 md:p-8">
      {/* ambient glows keyed to game's color */}
      <div className={`pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl ${mc.bg} opacity-40`} />
      <div className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 rounded-full bg-signal-amber/5 blur-3xl" />

      {/* ── Top label row ─────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-signal-red animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-signal-red">
            Top Alert Right Now
          </span>
        </div>
        {/* Compellingness score chip */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1">
          <ArrowUp className="h-3 w-3 text-signal-green" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Compellingness
          </span>
          <span className="font-mono text-xs font-black text-foreground">{score}</span>
        </div>
      </div>

      {/* ── Main row ──────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Matchup */}
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {game.awayTeam}
            </span>
            <span className="font-mono text-xl text-muted-foreground">vs</span>
            <span className="font-mono text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {game.homeTeam}
            </span>
            <span className="ml-2 self-center rounded border border-border bg-surface-raised px-2 py-0.5 font-mono text-sm text-muted-foreground">
              {game.inningLong}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-2">
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{game.awayTeam}</span>
                <span className="font-mono text-2xl font-black text-foreground">{game.awayScore}</span>
              </div>
              <span className="font-mono text-lg text-border">—</span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{game.homeTeam}</span>
                <span className="font-mono text-2xl font-black text-foreground">{game.homeScore}</span>
              </div>
            </div>
          </div>

          {/* Primary tag + edge tag — side by side when both present */}
          <div className="flex flex-wrap items-stretch gap-3">
            {/* Primary Tag */}
            <div className={`flex items-center gap-1.5 rounded-md border px-3 py-2 ${mc.border} ${mc.bg}`}>
              <Zap className={`h-3.5 w-3.5 ${mc.text}`} />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Primary Signal
                </span>
                <span className={`font-mono text-sm font-bold uppercase tracking-wide ${mc.text}`}>
                  {game.momentumTag}
                </span>
              </div>
            </div>

            {/* Secondary Edge Tag */}
            {game.edgeTag && (() => {
              const cfg = trafficConfig[game.edgeTag.signal]
              return (
                <div className={`overflow-hidden rounded-md border ${cfg.border} ${cfg.glow}`}>
                  <div className={`px-3 py-1 ${cfg.headerBg}`}>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      Edge Signal
                    </span>
                  </div>
                  <div className={`flex items-stretch gap-2.5 px-3 py-2 ${cfg.bg}`}>
                    <TrafficLight signal={game.edgeTag.signal} />
                    <div className="flex flex-col justify-center gap-[3px]">
                      <span className={`font-mono text-sm font-bold uppercase tracking-wide leading-none ${cfg.text}`}>
                        {game.edgeTag.label}
                      </span>
                      <span className="font-mono text-[10px] leading-tight text-muted-foreground">
                        {EDGE_TAG_DESCRIPTIONS[game.edgeTag.label]}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Insight */}
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            {game.insight}
          </p>
        </div>

        {/* Right column: GFI ring */}
        <div className="flex flex-col items-center gap-3 md:items-end md:pl-8">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            GameFlow Index
          </span>
          <div className="relative flex h-36 w-36 items-center justify-center md:h-44 md:w-44">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              {/* track */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
              {/* fill — color follows momentumColor */}
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progress} ${circumference}`}
                className={`${mc.ring} transition-all duration-1000`}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className={`font-mono text-5xl font-black md:text-6xl ${mc.ring}`}>
                {game.gfi}
              </span>
              <span className="font-mono text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 ${mc.text}`}>
            <TrendingUp className="h-4 w-4" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">Rising</span>
          </div>
        </div>

      </div>
    </div>
  )
}
