import { Card, Eyebrow } from '@/components/ui/Card';
import { TagList } from '@/components/ui/TagList';
import type { Service } from '@/content/site';
import { Panel } from './Panel';

/** One service (architecture, structure, MEP or permits), fully described by its data. */
export function ServicePanel({ service }: { service: Service }) {
  return (
    <Panel id={service.id} name={service.title} align={service.align}>
      <Card>
        <span className="big-n rv" aria-hidden="true">
          {service.number}
        </span>
        <Eyebrow>{service.eyebrow}</Eyebrow>
        <h2 className="rv">{service.title}</h2>
        <p className="kicker rv">{service.summary}</p>
        <TagList tags={service.tags} />
      </Card>
    </Panel>
  );
}
