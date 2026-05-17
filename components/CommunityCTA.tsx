import { IconPR, IconGithub, IconArrowRight } from '@/icons';

export function CommunityCTA() {
  return (
    <section className="ob-community">
      <div className="ob-community-card">
        <span className="eyebrow">made by the community</span>
        <h3>The handbook gets better every time you open a PR.</h3>
        <p>
          Found a pattern that worked? Disagree with an existing guide? Open a pull request, write up your
          story, or just add a sentence — the way we work is the way the docs grow.
        </p>
        <div className="cta-row">
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer"
             className="ob-btn ob-btn-primary ob-btn-lg ob-btn-arrow">
            <IconPR />
            Open your first PR
            <IconArrowRight className="arr" />
          </a>
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer"
             className="ob-btn ob-btn-secondary ob-btn-lg">
            <IconGithub />
            Browse the repo
          </a>
        </div>

        <div className="ob-contributor-row">
          <span className="lbl">2,400+ contributors · last 30 days</span>
          <div className="ob-avatars">
            {['AK','JM','SP','RN','TY','DL','MV','CH'].map((initials) => (
              <span key={initials} className="a">{initials}</span>
            ))}
            <span className="a more">+2.4k</span>
          </div>
        </div>
      </div>
    </section>
  );
}
