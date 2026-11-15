import type { ServiceTag } from '@/content/site';

/** A wrapping list of small pills, used for the items inside each service. */
export function TagList({ tags }: { tags: readonly ServiceTag[] }) {
  return (
    <ul className="ticks rv">
      {tags.map((tag) => (
        <li key={tag.label}>
          {tag.dot ? <i className={`dot dot-${tag.dot}`} aria-hidden="true" /> : null}
          {tag.label}
        </li>
      ))}
    </ul>
  );
}
