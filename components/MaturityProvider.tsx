"use client"

import { createContext, useContext, useMemo } from "react"
import type { Maturity } from "@/lib/maturity"

const MaturityMapCtx = createContext<Map<string, Maturity>>(new Map())

export function MaturityProvider({
  map,
  children,
}: Readonly<{ map: Record<string, Maturity>; children: React.ReactNode }>) {
  const value = useMemo(() => new Map(Object.entries(map)), [map])
  return <MaturityMapCtx.Provider value={value}>{children}</MaturityMapCtx.Provider>
}

export function useMaturityMap() {
  return useContext(MaturityMapCtx)
}
