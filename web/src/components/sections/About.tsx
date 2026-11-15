import { Card, Eyebrow } from '@/components/ui/Card';
import { ABOUT_STATS, SECTION } from '@/content/site';
import { Panel } from './Panel';

export function About() {
  return (
    <Panel {...SECTION.about} align="right">
      <Card>
        <Eyebrow>About us</Eyebrow>
        <h2 className="rv">
          Ideas into <em>well-coordinated</em> design.
        </h2>
        <p className="rv">
          BnB Design Studio is an architectural design studio based in Wylie, Texas, providing architectural, structural and
          Mechanical, Electrical &amp; Plumbing design throughout the DFW Metroplex.
        </p>
        <p className="rv">
          Since 2019 we have worked with property owners, developers, business owners, contractors and investors, turning project
          requirements into practical, functional designs that balance aesthetics, building code and construction practicality.
        </p>
        <dl className="stats rv">
          {ABOUT_STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </Panel>
  );
}
