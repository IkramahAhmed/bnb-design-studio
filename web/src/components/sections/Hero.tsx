import { Button } from '@/components/ui/Button';
import { SECTION, SITE } from '@/content/site';
import { Panel } from './Panel';

export function Hero() {
  return (
    <Panel {...SECTION.home} eager>
      <div className="hero">
        <p className="eyebrow">Architecture · Structural · MEP · Permit Sets</p>
        <h1>
          <span>Your Dream,</span>
          <span className="g">My Design.</span>
        </h1>
        <p className="lede">
          Homes, restaurants, shops and offices across Dallas-Fort Worth. Tell us your idea and we turn it into plans you can
          build from and the city will approve.
        </p>
        <p className="drag-hint" data-drag-hint>
          Drag anywhere to turn the building
        </p>
        <div className="cta">
          <Button href="#contact">Start a project</Button>
          <Button href="#services" variant="ghost">
            Explore services
          </Button>
        </div>
        <p className="loc">
          <i aria-hidden="true" /> {SITE.address.locality}, Texas {SITE.address.postalCode} &nbsp;·&nbsp; Serving DFW since {SITE.foundedYear}
        </p>
      </div>
    </Panel>
  );
}
