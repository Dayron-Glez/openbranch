import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared"
import { appName, gitConfig } from "./shared"

type Lang = "es" | "en"

const NAV: Record<Lang, LinkItemType[]> = {
  es: [
    { type: "main", text: "Documentación", url: "/docs", active: "url" },
    { type: "main", text: "Git", url: "/docs/git", active: "nested-url" },
    { type: "main", text: "Pruebas", url: "/docs/testing", active: "nested-url" },
    { type: "main", text: "Contribuir", url: "/docs/contributing", active: "nested-url" },
  ],
  en: [
    { type: "main", text: "Docs", url: "/en/docs", active: "url" },
    { type: "main", text: "Git", url: "/en/docs/git", active: "nested-url" },
    { type: "main", text: "Testing", url: "/en/docs/testing", active: "nested-url" },
    {
      type: "main",
      text: "Contributing",
      url: "/en/docs/contributing",
      active: "nested-url",
    },
  ],
}

export function baseOptions(lang: string): BaseLayoutProps {
  const l: Lang = lang === "en" ? "en" : "es"
  return {
    nav: { title: appName },
    links: NAV[l],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
