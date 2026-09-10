export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-bg text-fg min-h-dvh"
      // `--color-bg` / `--color-fg` are hardcoded dark values in @theme and do
      // not follow light/dark mode.
    >
      {children}
    </div>
  )
}
