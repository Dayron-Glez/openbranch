import type { ReactNode } from "react"
import { AppShell } from "@/features/playground/components/AppShell"
import "../../playground/playground.css"

export default async function ProfileLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  return <AppShell lang={lang}>{children}</AppShell>
}
