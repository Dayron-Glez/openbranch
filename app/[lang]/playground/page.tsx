import type { ReactNode } from "react"
import type { Metadata } from "next"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { ChallengeCard } from "@/components/playground/ChallengeCard"
import { StartingLine } from "@/components/playground/StartingLine"
import { BadgesSection } from "@/components/playground/BadgesSection"
import { IconPR, IconBug, IconGitMerge, IconFlask, IconBook, IconBranch } from "@/icons"

const CHALLENGE_ICONS: Record<string, ReactNode> = {
  GitPullRequest: <IconPR />,
  Bug: <IconBug />,
  GitMerge: <IconGitMerge />,
  FlaskConical: <IconFlask />,
  BookOpen: <IconBook />,
}

const getChallengeIcon = (iconName: string | undefined): ReactNode =>
  (iconName !== undefined && CHALLENGE_ICONS[iconName]) || <IconBranch />

const CATEGORY_ORDER = ["code-review", "bug-fix", "testing", "git", "documentation"] as const

const DIFFICULTY_SORT: Record<string, number> = { beginner: 0, moderate: 1, demanding: 2 }

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/playground">>): Promise<Metadata> {
  const { lang } = await params
  const dict = getPlaygroundDict(lang)

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  }
}

export default async function PlaygroundPage({
  params,
}: Readonly<PageProps<"/[lang]/playground">>) {
  const { lang } = await params
  const dict = getPlaygroundDict(lang)

  const challenges = playgroundSource
    .getPages(lang)
    .filter((page) => page.data.maturity === "stable")

  const startingChallenge = [...challenges].sort(
    (a, b) =>
      (DIFFICULTY_SORT[a.data.difficulty] ?? 0) - (DIFFICULTY_SORT[b.data.difficulty] ?? 0) ||
      a.data.estimated_minutes - b.data.estimated_minutes
  )[0]

  const startingLineBody = dict.startingLine.body.replace("{count}", String(challenges.length))

  return (
    <main className="relative z-1 mx-auto max-w-275 px-8 py-25 max-[520px]:px-5">
      <p className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
        {dict.hub.eyebrow}
      </p>
      <h1 className="m-0 mb-[18px] text-[42px] leading-[1.05] font-medium tracking-[0] text-balance max-[980px]:text-[32px]">
        {dict.hub.heading} <span className="text-fg-2 font-light">{dict.hub.headingAccent}</span>
      </h1>
      <p className="text-fg-2 m-0 mb-10 max-w-[56ch] text-base leading-[1.55]">{dict.hub.intro}</p>

      {startingChallenge !== undefined && (
        <StartingLine
          href={localizedHref(lang, startingChallenge.url)}
          challengeTitle={startingChallenge.data.title}
          challengeIcon={getChallengeIcon(startingChallenge.data.icon)}
          challengeCategoryLabel={dict.category[startingChallenge.data.category]}
          challengeMinutes={startingChallenge.data.estimated_minutes}
          eyebrow={dict.startingLine.eyebrow}
          heading={dict.startingLine.heading}
          body={startingLineBody}
          cta={dict.startingLine.cta}
          minutesLabel={dict.time.minutes}
        />
      )}

      <div className="flex flex-col gap-10">
        {CATEGORY_ORDER.map((category) => {
          const categoryChallenges = challenges.filter((c) => c.data.category === category)
          if (categoryChallenges.length === 0) return null
          return (
            <div key={category}>
              <div className="text-fg-muted border-line mb-4 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
                {dict.category[category]}
              </div>
              <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
                {categoryChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.url}
                    href={localizedHref(lang, challenge.url)}
                    title={challenge.data.title}
                    description={challenge.data.description ?? ""}
                    difficulty={challenge.data.difficulty}
                    estimatedMinutes={challenge.data.estimated_minutes}
                    icon={getChallengeIcon(challenge.data.icon)}
                    difficultyLabel={dict.difficulty[challenge.data.difficulty]}
                    statusLabel={dict.status.notStarted}
                    minutesLabel={dict.time.minutes}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-14">
        <BadgesSection dict={dict.badges} />
      </div>
    </main>
  )
}
