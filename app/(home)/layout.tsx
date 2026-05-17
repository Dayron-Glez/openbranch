export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh bg-bg text-fg"
      // Ensure the landing is always rendered with dark palette
      // regardless of the user's Fumadocs theme preference.
      // --color-bg / --color-fg are hardcoded dark values in @theme
      // and never change with light/dark mode.
    >
      {children}
    </div>
  );
}
