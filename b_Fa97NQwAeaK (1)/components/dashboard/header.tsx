"use client"

import { useEffect, useState } from "react"
import { Activity, Bell, Settings } from "lucide-react"

function Clock() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">{time} ET</span>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-green/10 border border-signal-green/30">
            <Activity className="h-4 w-4 text-signal-green" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base font-black tracking-tight text-foreground">GameFlow</span>
            <span className="font-mono text-xs text-muted-foreground">Intelligence</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {["Dashboard", "Games", "Signals", "Players", "Analytics"].map((item) => (
            <button
              key={item}
              className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                item === "Dashboard"
                  ? "bg-surface-raised text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Clock />
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
            <span className="font-mono text-xs text-signal-green">Live</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
