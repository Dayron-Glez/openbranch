"use client"

import { createContext, useContext } from "react"
import type { Maturity } from "@/lib/maturity"

const MaturityMapCtx = createContext<Map<string, Maturity>>(new Map())

export function MaturityProvider({
  map,
  children,
}: Readonly<{ map: Record<string, Maturity>; children: React.ReactNode }>) {
  return (
    <MaturityMapCtx.Provider value={new Map(Object.entries(map))}>
      {children}
    </MaturityMapCtx.Provider>
  )
}

export function useMaturityMap() {
  return useContext(MaturityMapCtx)
}
