import { Eyebrow } from '@/components/ui/Card';
import { PROJECTS, SECTION } from '@/content/site';
import { Panel } from './Panel';

export function Portfolio() {
  return (
    <Panel {...SECTION.portfolio} align="center">
      <div className="port">
        <Eyebrow>Selected work</Eyebrow>
        <h2 className="rv">From concept to reality.</h2>
        <div className="grid">
          {PROJECTS.map((project) => (
            <article key={project.title} className="proj rv">
              <div className="ph" aria-hidden="true" />
              <h3>{project.title}</h3>
              <span>{project.note}</span>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}
