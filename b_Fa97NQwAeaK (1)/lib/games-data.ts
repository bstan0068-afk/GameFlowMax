// ─── Shared types & data ──────────────────────────────────────────────────────
// Single source of truth for game data, types, and the top-game selection algo.

export interface Runner {
  first: boolean
  second: boolean
  third: boolean
}

// Primary Tag — game-state signal vocabulary
export type PrimaryTagLabel =
  | "False Calm"
  | "Flip Threat"
  | "Control Slip"
  | "Silent Build"
  | "Pitcher Wobble"
  | "Blowout Watch"

export type MomentumColor = "green" | "amber" | "red" | "blue"

// Secondary Edge Tag — bettor-facing intelligence layer
export type EdgeTagLabel =
  | "Under the Radar"
  | "Quiet Edge"
  | "Signal Divergence"
  | "Early Build"

/** green = strong edge / go | amber = forming / watch | red = contested / fade */
export type TrafficSignal = "green" | "amber" | "red"

export interface EdgeTag {
  label: EdgeTagLabel
  signal: TrafficSignal
}

/**
 * Pressure signals used to derive edge tags algorithmically.
 * These are the "raw" inputs that feed the conditional logic.
 */
export interface PressureSignals {
  /** GFI delta vs. previous half-inning (+ve = rising) */
  gfiDelta: number
  /** 0–100 pressure score independent of scoreboard */
  pressureScore: number
  /**
   * How many minutes the score has been unchanged.
   * Used as the "scoreboard hasn't reacted" gate for Under the Radar.
   */
  scoreUnchangedMinutes: number
  /** True if live win-probability has shifted ≥ 3 pts */
  winProbabilityShifted: boolean
}

export interface GameCardData {
  id: string
  awayTeam: string
  homeTeam: string
  awayScore: number
  homeScore: number
  inning: string
  /** Full human-readable inning string for the Top Alert */
  inningLong: string
  outs: number
  runners: Runner
  /** Primary Tag — game-state signal */
  momentumTag: PrimaryTagLabel
  momentumColor: MomentumColor
  insight: string
  gfi: number
  /** Raw pressure signals — used to derive the edge tag automatically */
  pressureSignals: PressureSignals
  /** Secondary Edge Tag — derived automatically by deriveEdgeTag(), never set manually */
  edgeTag?: EdgeTag
}

// ─── Edge tag descriptions (canonical copy) ───────────────────────────────────

export const EDGE_TAG_DESCRIPTIONS: Record<EdgeTagLabel, string> = {
  "Under the Radar":   "Edge forming before scoreboard reaction.",
  "Quiet Edge":        "Low volatility. Edge accumulating silently.",
  "Signal Divergence": "Model vs. line diverging. Act early.",
  "Early Build":       "Momentum forming. Entry point now.",
}

// ─── Conditional edge tag derivation ─────────────────────────────────────────
/**
 * Derives the Secondary Edge Tag from raw pressure signals.
 * Returns undefined when no genuine edge is detectable — rarity is by design.
 *
 * "Under the Radar" fires only when ALL three conditions are true:
 *   1. pressureScore > 70  — genuine internal stress, not noise
 *   2. gfiDelta > 0        — GameFlow Index is actively rising
 *   3. scoreUnchangedMinutes >= 12 — scoreboard has not reacted
 *   → "Pressure is building. The game hasn't shown it yet."
 */
export function deriveEdgeTag(game: Omit<GameCardData, "edgeTag">): EdgeTag | undefined {
  const { pressureSignals: s, momentumTag, gfi } = game

  // ── Under the Radar ────────────────────────────────────────────────────────
  // Exact conditions per spec:
  //   Pressure > 70  AND  GFI rising  AND  score unchanged last X minutes
  const SCORE_UNCHANGED_THRESHOLD_MINUTES = 12
  if (
    s.pressureScore > 70 &&
    s.gfiDelta > 0 &&
    s.scoreUnchangedMinutes >= SCORE_UNCHANGED_THRESHOLD_MINUTES
  ) {
    return { label: "Under the Radar", signal: "green" }
  }

  // ── Signal Divergence ──────────────────────────────────────────────────────
  // GFI rising but primary tag suggests instability (market likely mispriced)
  if (
    s.gfiDelta >= 3 &&
    (momentumTag === "False Calm" || momentumTag === "Control Slip") &&
    s.pressureScore >= 55
  ) {
    return { label: "Signal Divergence", signal: "amber" }
  }

  // ── Early Build ────────────────────────────────────────────────────────────
  // Pressure building with wobble — entry window forming but not confirmed
  if (
    s.gfiDelta >= 2 &&
    (momentumTag === "Pitcher Wobble" || momentumTag === "Silent Build") &&
    gfi >= 60
  ) {
    return { label: "Early Build", signal: "amber" }
  }

  // ── Quiet Edge ─────────────────────────────────────────────────────────────
  // Moderate pressure, no drama — slow accumulation of advantage
  if (
    s.pressureScore >= 50 &&
    s.gfiDelta >= 1 &&
    !s.winProbabilityShifted &&
    gfi < 75
  ) {
    return { label: "Quiet Edge", signal: "green" }
  }

  // No edge detectable — intentionally leave card clean
  return undefined
}

// ─── Scoring weights ──────────────────────────────────────────────────────────
// Higher score = more compelling. The top-scoring game wins the Top Alert slot.

const PRIMARY_TAG_URGENCY: Record<PrimaryTagLabel, number> = {
  "Flip Threat":    30,
  "False Calm":     25,
  "Pitcher Wobble": 20,
  "Control Slip":   18,
  "Silent Build":   12,
  "Blowout Watch":   5,
}

const EDGE_TAG_WEIGHT: Record<EdgeTagLabel, number> = {
  "Signal Divergence": 20,
  "Under the Radar":   18,
  "Early Build":       14,
  "Quiet Edge":        12,
}

const TRAFFIC_SIGNAL_MULTIPLIER: Record<TrafficSignal, number> = {
  green: 1.0,
  amber: 0.7,
  red:   0.4,
}

/**
 * Score a game for "compellingness" based on:
 *  - Raw GFI (normalised 0–40 pts)
 *  - Primary tag urgency (0–30 pts)
 *  - Edge tag presence & strength (0–20 pts, scaled by traffic signal)
 *  - Late-game bonus: inning 7+ adds 10 pts
 */
export function scoreGame(game: GameCardData): number {
  const gfiScore = (game.gfi / 100) * 40

  const primaryScore = PRIMARY_TAG_URGENCY[game.momentumTag] ?? 0

  let edgeScore = 0
  if (game.edgeTag) {
    const base = EDGE_TAG_WEIGHT[game.edgeTag.label] ?? 0
    const mult = TRAFFIC_SIGNAL_MULTIPLIER[game.edgeTag.signal] ?? 0.5
    edgeScore = base * mult
  }

  // Late-game bonus: detect inning 7, 8, or 9 in the inning string
  const inningMatch = game.inning.match(/[TB]?(\d+)/)
  const inningNum = inningMatch ? parseInt(inningMatch[1], 10) : 0
  const lateBonus = inningNum >= 7 ? 10 : 0

  return gfiScore + primaryScore + edgeScore + lateBonus
}

/** Returns the single most compelling game from the dataset. */
export function selectTopGame(games: GameCardData[]): GameCardData {
  return games.reduce((best, game) =>
    scoreGame(game) > scoreGame(best) ? game : best
  )
}

// ─── Game data ────────────────────────────────────────────────────────────────
// edgeTag is never set manually here — it is always derived by deriveEdgeTag().

const rawGames: Omit<GameCardData, "edgeTag">[] = [
  {
    id: "1",
    awayTeam: "STL",
    homeTeam: "CHC",
    awayScore: 2,
    homeScore: 2,
    inning: "B7 ●●○",
    inningLong: "Bot 7th · 2 Outs",
    outs: 2,
    runners: { first: true, second: false, third: true },
    momentumTag: "False Calm",
    momentumColor: "amber",
    insight: "Pressure is rising despite no score change. Both teams showing elevated contact heat — a multi-run sequence is flagged within the next 3 at-bats.",
    gfi: 74,
    pressureSignals: {
      // pressure 72 > 70 ✓, GFI rising +7 ✓, no score change in 18 min ✓
      // → Under the Radar fires
      gfiDelta: 7,
      pressureScore: 72,
      scoreUnchangedMinutes: 18,
      winProbabilityShifted: false,
    },
    // → deriveEdgeTag: "Under the Radar" (pressure > 70, gfiDelta > 0, score unchanged 18 min)
  },
  {
    id: "2",
    awayTeam: "NYY",
    homeTeam: "BOS",
    awayScore: 5,
    homeScore: 3,
    inning: "T9 ●○○",
    inningLong: "Top 9th · 1 Out",
    outs: 1,
    runners: { first: false, second: true, third: false },
    momentumTag: "Flip Threat",
    momentumColor: "red",
    insight: "Closer showing control slip patterns. Velocity down 1.8 mph over last 6 pitches. Lead at severe risk.",
    gfi: 91,
    pressureSignals: {
      // pressure 88 > 70 ✓, GFI rising ✓, BUT score changed 3 min ago ✗
      // → Under the Radar does NOT fire (score just changed, market already knows)
      gfiDelta: 4,
      pressureScore: 88,
      scoreUnchangedMinutes: 3,
      winProbabilityShifted: true,
    },
    // → No edge tag: scoreboard reacted, market is aware
  },
  {
    id: "3",
    awayTeam: "LAD",
    homeTeam: "SF",
    awayScore: 0,
    homeScore: 1,
    inning: "B5 ○○○",
    inningLong: "Bot 5th · 0 Outs",
    outs: 0,
    runners: { first: false, second: false, third: false },
    momentumTag: "Silent Build",
    momentumColor: "blue",
    insight: "Rare scoreless pressure accumulation. Hitter exit velocity trending 4% above season avg.",
    gfi: 58,
    pressureSignals: {
      // pressure 54 — does NOT exceed 70 threshold ✗
      // → Under the Radar fails; falls through to Quiet Edge
      gfiDelta: 3,
      pressureScore: 54,
      scoreUnchangedMinutes: 22,
      winProbabilityShifted: false,
    },
    // → deriveEdgeTag: "Quiet Edge" (pressure below 70, so Under the Radar doesn't fire)
  },
  {
    id: "4",
    awayTeam: "HOU",
    homeTeam: "TEX",
    awayScore: 4,
    homeScore: 4,
    inning: "T8 ●●○",
    inningLong: "Top 8th · 2 Outs",
    outs: 2,
    runners: { first: true, second: true, third: false },
    momentumTag: "Pitcher Wobble",
    momentumColor: "red",
    insight: "Starter losing command. 3 consecutive 3-ball counts. Bullpen warming now.",
    gfi: 83,
    pressureSignals: {
      // pressure 79 > 70 ✓, GFI rising ✓, BUT score changed 8 min ago ✗ (< 12 min threshold)
      // → Under the Radar just misses; falls through to Early Build
      gfiDelta: 4,
      pressureScore: 79,
      scoreUnchangedMinutes: 8,
      winProbabilityShifted: false,
    },
    // → deriveEdgeTag: "Early Build" (score too recent to trigger Under the Radar)
  },
  {
    id: "5",
    awayTeam: "MIL",
    homeTeam: "CIN",
    awayScore: 1,
    homeScore: 3,
    inning: "B6 ●○○",
    inningLong: "Bot 6th · 1 Out",
    outs: 1,
    runners: { first: true, second: false, third: false },
    momentumTag: "Control Slip",
    momentumColor: "amber",
    insight: "Away pitcher throwing fewer first-pitch strikes. Fatigue signal detected at pitch 87.",
    gfi: 67,
    pressureSignals: {
      // pressure 63 — does NOT exceed 70 threshold ✗
      // → Under the Radar fails; falls through to Signal Divergence (Control Slip tag)
      gfiDelta: 5,
      pressureScore: 63,
      scoreUnchangedMinutes: 14,
      winProbabilityShifted: false,
    },
    // → deriveEdgeTag: "Signal Divergence" (pressure below 70 threshold)
  },
  {
    id: "6",
    awayTeam: "ATL",
    homeTeam: "NYM",
    awayScore: 7,
    homeScore: 2,
    inning: "T7 ○○○",
    inningLong: "Top 7th · 0 Outs",
    outs: 0,
    runners: { first: false, second: false, third: false },
    momentumTag: "Blowout Watch",
    momentumColor: "green",
    insight: "Score gap significant but home momentum building. Rally potential flagged.",
    gfi: 29,
    pressureSignals: {
      // pressure 31 ✗, GFI falling ✗ — no condition fires
      gfiDelta: -3,
      pressureScore: 31,
      scoreUnchangedMinutes: 2,
      winProbabilityShifted: true,
    },
    // → No edge tag (pressure < 70, GFI falling)
  },
]

/** Derive all edge tags algorithmically, then freeze the dataset. */
export const games: GameCardData[] = rawGames.map((g) => ({
  ...g,
  edgeTag: deriveEdgeTag(g),
}))
