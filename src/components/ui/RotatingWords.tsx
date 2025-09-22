import { useEffect, useMemo, useState } from 'react';

type Props = {
  words: string[];
  intervalMs?: number;
};

export default function RotatingWords({ words, intervalMs = 2800 }: Props) {
  const safeWords = useMemo(() => (words?.length ? words : []), [words]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!safeWords.length || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % safeWords.length), intervalMs);
    return () => clearInterval(id);
  }, [safeWords, paused, intervalMs]);

  if (!safeWords.length) return null;

  return (
    <span
      className="relative inline-block min-w-[6ch] align-baseline"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span key={index} className="inline-block animate-fade">{safeWords[index]}</span>
    </span>
  );
}


