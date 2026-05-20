"use client"

import { createContext, useContext } from "react"
import type { DocsDictionary } from "@/lib/dictionaries/docs"
import { docsDictionary } from "@/lib/dictionaries/docs"

const DocsUICtx = createContext<DocsDictionary>(docsDictionary.es)

export function DocsUIProvider({
  dict,
  children,
}: Readonly<{ dict: DocsDictionary; children: React.ReactNode }>) {
  return <DocsUICtx.Provider value={dict}>{children}</DocsUICtx.Provider>
}

export function useDocsUI() {
  return useContext(DocsUICtx)
}
