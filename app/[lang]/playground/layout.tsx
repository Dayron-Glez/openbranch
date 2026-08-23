import type { ReactNode } from "react"
import { AppShell } from "@/features/playground/components/AppShell"
import "./playground.css"

export default async function PlaygroundLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  return (
    <AppShell lang={lang} variant="fixed">
      {children}
    </AppShell>
  )
}
