import { Card, Eyebrow } from '@/components/ui/Card';
import { APPROACH_STEPS, SECTION } from '@/content/site';
import { Panel } from './Panel';

export function Approach() {
  return (
    <Panel {...SECTION.approach}>
      <Card wide>
        <Eyebrow>Our approach</Eyebrow>
        <h2 className="rv">Planning, clear communication, coordinated drawings.</h2>
        <p className="rv">
          We work closely with clients, contractors, consultants and engineers so project documentation is complete, practical and
          ready for construction and permit review.
        </p>
        <ol className="steps rv">
          {APPROACH_STEPS.map((step, i) => (
            <li key={step}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </Panel>
  );
}
