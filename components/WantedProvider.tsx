"use client"

import { createContext, useContext, useMemo } from "react"
import type { Wanted } from "@/lib/wanted"

const WantedContext = createContext<ReadonlyMap<string, Wanted>>(new Map())

export function WantedProvider({
  items,
  children,
}: Readonly<{
  items: Wanted[]
  children: React.ReactNode
}>) {
  const map = useMemo(() => new Map(items.map((w) => [w.id, w])), [items])

  return <WantedContext.Provider value={map}>{children}</WantedContext.Provider>
}

export function useWantedMap(): ReadonlyMap<string, Wanted> {
  return useContext(WantedContext)
}
