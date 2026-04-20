"use client"

import { Circle } from "lucide-react"
import type { GameCardData, TrafficSignal } from "@/lib/games-data"
import { games, EDGE_TAG_DESCRIPTIONS } from "@/lib/games-data"

// ─── Style maps ───────────────────────────────────────────────────────────────

const momentumColorMap = {
  green: "border-signal-green/30 bg-signal-green/10 text-signal-green",
  amber: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
  red:   "border-signal-red/30 bg-signal-red/10 text-signal-red",
  blue:  "border-signal-blue/30 bg-signal-blue/10 text-signal-blue",
}

const gfiColorMap = {
  green: "text-signal-green",
  amber: "text-signal-amber",
  red:   "text-signal-red",
  blue:  "text-signal-blue",
}

const trafficConfig: Record<TrafficSignal, {
  pipActive: number
  border: string
  bg: string
  text: string
  glow: string
  headerBg: string
}> = {
  green: {
    pipActive: 2,
    border:    "border-signal-green/35",
    bg:        "bg-signal-green/6",
    text:      "text-signal-green",
    glow:      "shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--color-signal-green)_40%,transparent)]",
    headerBg:  "bg-signal-green/10",
  },
  amber: {
    pipActive: 1,
    border:    "border-signal-amber/35",
    bg:        "bg-signal-amber/6",
    text:      "text-signal-amber",
    glow:      "shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--color-signal-amber)_40%,transparent)]",
    headerBg:  "bg-signal-amber/10",
  },
  red: {
    pipActive: 0,
    border:    "border-signal-red/35",
    bg:        "bg-signal-red/6",
    text:      "text-signal-red",
    glow:      "shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--color-signal-red)_40%,transparent)]",
    headerBg:  "bg-signal-red/10",
  },
}

const pipColors = [
  { on: "bg-signal-red",   off: "bg-signal-red/15"   },
  { on: "bg-signal-amber", off: "bg-signal-amber/15" },
  { on: "bg-signal-green", off: "bg-signal-green/15" },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function TrafficLight({ signal }: { signal: TrafficSignal }) {
  const cfg = trafficConfig[signal]
  return (
    <div
      aria-label={`Traffic signal: ${signal}`}
      className={`flex flex-col items-center gap-[4px] self-stretch rounded-full border ${cfg.border} ${cfg.bg} px-[7px] py-2.5 ${cfg.glow}`}
    >
      {[0, 1, 2].map((i) => {
        const isActive = i === cfg.pipActive
        const colors = pipColors[i]
        return (
          <span
            key={i}
            className={`h-[9px] w-[9px] rounded-full transition-all duration-300 ${
              isActive ? `${colors.on} animate-pulse` : colors.off
            }`}
          />
        )
      })}
    </div>
  )
}

function EdgeTagBadge({ tag }: { tag: NonNullable<GameCardData["edgeTag"]> }) {
  const cfg = trafficConfig[tag.signal]
  const description = EDGE_TAG_DESCRIPTIONS[tag.label]

  return (
    <div className={`overflow-hidden rounded-lg border ${cfg.border} ${cfg.glow}`}>
      <div className={`flex items-center gap-2.5 px-3 py-1.5 ${cfg.headerBg}`}>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Edge Signal
        </span>
      </div>
      <div className={`flex items-stretch gap-3 px-3 py-2.5 ${cfg.bg}`}>
        <TrafficLight signal={tag.signal} />
        <div className="flex flex-col justify-center gap-[3px]">
          <span className={`font-mono text-xs font-bold uppercase tracking-wider leading-none ${cfg.text}`}>
            {tag.label}
          </span>
          <span className="font-mono text-[10px] leading-tight text-muted-foreground">
            {description}
          </span>
        </div>
      </div>
    </div>
  )
}

function RunnerDiamond({ runners }: { runners: GameCardData["runners"] }) {
  const base = (active: boolean) =>
    `h-3 w-3 rotate-45 rounded-sm border ${active ? "bg-signal-amber border-signal-amber" : "border-border bg-transparent"}`

  return (
    <div className="relative h-8 w-8">
      <span className={`${base(runners.second)} absolute left-1/2 top-0 -translate-x-1/2`} />
      <span className={`${base(runners.third)} absolute bottom-0 left-0`} />
      <span className={`${base(runners.first)} absolute bottom-0 right-0`} />
    </div>
  )
}

function OutPips({ outs }: { outs: number }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < outs ? "bg-signal-amber" : "border border-border bg-transparent"}`}
        />
      ))}
    </div>
  )
}

function GameCard({ game }: { game: GameCardData }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border/80 hover:bg-surface-raised">
      {/* header: live dot + inning */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Circle className="h-2 w-2 fill-signal-red text-signal-red animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-signal-red">Live</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{game.inning}</span>
      </div>

      {/* scoreboard */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-lg font-bold text-foreground">{game.awayTeam}</span>
            <span className="font-mono text-2xl font-black text-foreground">{game.awayScore}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-lg font-bold text-foreground">{game.homeTeam}</span>
            <span className="font-mono text-2xl font-black text-foreground">{game.homeScore}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <RunnerDiamond runners={game.runners} />
          <OutPips outs={game.outs} />
        </div>
      </div>

      <div className="h-px w-full bg-border" />

      {/* primary tag + GFI */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-xs font-semibold ${momentumColorMap[game.momentumColor]}`}>
          {game.momentumTag}
        </span>
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs text-muted-foreground">GFI</span>
          <span className={`font-mono text-xl font-black ${gfiColorMap[game.momentumColor]}`}>{game.gfi}</span>
        </div>
      </div>

      {/* secondary edge tag */}
      {game.edgeTag && <EdgeTagBadge tag={game.edgeTag} />}

      {/* insight */}
      <p className="text-xs leading-relaxed text-muted-foreground">{game.insight}</p>
    </div>
  )
}

export function LiveGames() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
            Live Games
          </h2>
          <span className="rounded-full border border-signal-green/30 bg-signal-green/10 px-2 py-0.5 font-mono text-xs text-signal-green">
            {games.length} Active
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">Auto-refreshing</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  )
}
