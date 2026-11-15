/**
 * Turns the page scroll position into a fractional section index (0 = first section, 1.5 = halfway
 * between the second and third). Section centres are measured once and re-measured on resize, so
 * reading the fraction every frame never touches layout.
 */
export class ScrollMap {
  private centers: number[] = [];
  private readonly resizeObserver: ResizeObserver;

  constructor(private readonly sections: readonly HTMLElement[]) {
    this.measure();
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(document.body);
    void document.fonts?.ready.then(() => this.measure());
  }

  fraction(): number {
    const c = this.centers;
    if (c.length === 0) return 0;
    const mid = window.scrollY + window.innerHeight / 2;
    if (mid <= c[0]) return 0;
    for (let i = 0; i < c.length - 1; i++) {
      if (mid <= c[i + 1]) return i + (mid - c[i]) / (c[i + 1] - c[i]);
    }
    return c.length - 1;
  }

  disconnect(): void {
    this.resizeObserver.disconnect();
  }

  private measure(): void {
    const scrollY = window.scrollY;
    this.centers = this.sections.map((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + scrollY + rect.height / 2;
    });
  }
}
