import { useEffect, useMemo, useState } from 'react';

type Props = {
  title: string;
  words: string[];
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export default function Hero({ title, words, subtitle, primaryCta, secondaryCta }: Props) {
  const safeWords = useMemo(() => (words?.length ? words : []), [words]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!safeWords.length || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % safeWords.length), 2800);
    return () => clearInterval(id);
  }, [safeWords, paused]);

  return (
    <section className="section pt-16 pb-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-base-900 sm:text-5xl">
          {title}
          {safeWords.length > 0 && (
            <span className="relative inline-block">
              <span
                aria-live="polite"
                className="ml-2 inline-block min-w-[6ch] align-baseline"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <span key={index} className="inline-block animate-fade">
                  {safeWords[index]}
                </span>
              </span>
            </span>
          )}
        </h1>
        {subtitle && <p className="mt-4 text-lg text-base-900/80">{subtitle}</p>}
        <div className="mt-8 flex justify-center gap-4">
          {primaryCta && (
            <a href={primaryCta.href} className="btn-primary">{primaryCta.label}</a>
          )}
          {secondaryCta && (
            <a href={secondaryCta.href} className="btn-secondary">{secondaryCta.label}</a>
          )}
        </div>
        <div className="mt-10">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-white/70"></div>
          </div>
        </div>
      </div>
    </section>
  );
}


