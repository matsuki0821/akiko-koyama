import { useEffect, useRef, useState } from 'react';

type Testimonial = {
  name: string;
  affiliation?: string;
  avatar?: string;
  quote: string;
};

type Props = {
  items: Testimonial[];
  auto?: boolean;
};

export default function WallOfTrust({ items, auto = true }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto || paused || total <= 1) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % total), 4000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [auto, paused, total]);

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + total) % total);

  const item = items[index];

  return (
    <section className="section py-16" aria-label="お客様の声">
      <div className="mx-auto max-w-4xl">
        <div
          className="card p-8 text-center"
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <figure>
            {item.avatar && (
              <img src={item.avatar} alt="" className="mx-auto h-16 w-16 rounded-full object-cover" />
            )}
            <blockquote className="mt-6 text-xl leading-relaxed text-base-900/90">“{item.quote}”</blockquote>
            <figcaption className="mt-4 text-sm text-base-900/70">
              <strong className="font-medium text-base-900">{item.name}</strong>
              {item.affiliation ? `（${item.affiliation}）` : ''}
            </figcaption>
          </figure>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="btn-secondary" aria-label="前へ" onClick={() => go(-1)}>Prev</button>
            <span aria-live="polite" className="text-sm text-base-900/60">{index + 1} / {total}</span>
            <button className="btn-secondary" aria-label="次へ" onClick={() => go(1)}>Next</button>
            <button className="btn-secondary" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
              {paused ? '再生' : '一時停止'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


