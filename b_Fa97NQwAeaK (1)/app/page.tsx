import { Header } from "@/components/dashboard/header"
import { TopAlert } from "@/components/dashboard/top-alert"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { LiveGames } from "@/components/dashboard/live-games"
import { SignalFeed } from "@/components/dashboard/signal-feed"
import { games, selectTopGame } from "@/lib/games-data"

export default function Page() {
  const topGame = selectTopGame(games)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-screen-2xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-8">

          {/* Top Alert — driven by scoring algorithm */}
          <TopAlert game={topGame} />

          {/* Metric Cards */}
          <section>
            <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Key Signals
            </h2>
            <MetricCards />
          </section>

          {/* Live Games + Signal Feed */}
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1">
              <LiveGames />
            </div>
            <div className="w-full flex-shrink-0 xl:w-96">
              <SignalFeed />
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-border px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">GameFlow Intelligence Platform · v2.4.1</span>
          <span className="font-mono text-xs text-muted-foreground">{"Data delayed < 5s · For entertainment purposes"}</span>
        </div>
      </footer>
    </div>
  )
}
