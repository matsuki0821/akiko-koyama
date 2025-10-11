import { useEffect, useMemo, useRef, useState } from "react";

type FloatingCard = {
  label: string;
  caption: string;
  icon?: string;
  x: number;
  y: number;
  amp?: number;
  w?: number;
  h?: number;
  tone?: "blue" | "sand" | "gray";
};

type Props = {
  title?: string;
  subtitle?: string;
  promptText?: string;
  cards?: FloatingCard[];
};

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

export default function SimplePromptShowcaseSticky({
  title = "学びたい人は認定講座。\n課題解決はカウンセリング。",
  subtitle = "誰かの役に立ちたい人も、自分の悩みを解決したい人も、ここから始められる。",
  promptText = "",
  cards = [
    { label: "個別カウンセリング", caption: "今現在悩んでいる人も", icon: "🏫", x: -600, y: 20, amp: -18, w: 520, h: 620, tone: "blue" },
    { label: "認定講座", caption: "CBT×コーチングの16回講座", icon: "🎓", x: 600, y: -20, amp: 18, w: 520, h: 620, tone: "sand" },
  ],
}: Props) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0.5);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const MOTION_MULTIPLIER = 10; // 動きの強さ（振幅）を10倍に
  const MOBILE_STACK_GAP = -100; // モバイル時の上下の間隔（px）S
  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateIsMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    const el = hostRef.current!;
    let raf = 0;

    const onScroll = () => {
      if (prefersReduced) return setProgress(0.5);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const offset = -rect.top;
        const p = total > 0 ? offset / total : 0;
        setProgress(clamp(p));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", updateIsMobile);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReduced]);

  const stageCards = cards.map((c) => {
    const baseW = c.w ?? 220;
    const baseH = c.h ?? 160;
    return {
      ...c,
      // モバイルではカードのサイズをちょうど半分に
      w: isMobile ? Math.round(baseW * 0.5) : baseW,
      h: isMobile ? Math.round(baseH * 0.5) : baseH,
      amp: prefersReduced ? 0 : (c.amp ?? 20) * MOTION_MULTIPLIER,
    };
  });

  return (
    <section
      ref={hostRef}
      className="relative min-h-[200vh] overflow-clip text-white"
      style={{
        background:
          "radial-gradient(900px 500px at 10% -10%, rgba(255,255,255,0.07), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(255,255,255,0.05), transparent 60%), #111",
      }}
      aria-label="Simple Prompt Showcase"
    >
      <div className="sticky top-0 z-0 flex h-[100svh] items-center justify-center">
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white/90 sm:text-5xl lg:text-6xl leading-tight sm:leading-[1.15] md:leading-[1.1]">
            {title.split('\n').map((line, i) => {
              const target = "課題解決は登校サポート。";
              if (line === target) {
                return (
                  <span key={i} className="block">
                    <span className="block sm:hidden">課題解決は</span>
                    <span className="block sm:hidden">登校サポート。</span>
                    <span className="hidden sm:inline whitespace-nowrap">{line}</span>
                  </span>
                );
              }
              return (
                <span key={i} className="block whitespace-normal sm:whitespace-nowrap">{line}</span>
              );
            })}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed">{subtitle}</p>
          )}

          {/* 入力UI（検索窓風）は非表示にしました */}
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="relative h-full w-full">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {stageCards.map((c, i) => {
                const norm = (progress - 0.5) * 2;
                // デスクトップ: 縦方向の揺れ（従来） / モバイル: 水平方向の揺れ
                const y = isMobile ? (i === 0 ? -((c.h as number) / 2 + MOBILE_STACK_GAP) : (c.h as number) / 2 + MOBILE_STACK_GAP) : c.y + (c.amp as number) * 2 * norm;
                const x = isMobile ? (c.amp as number) * 2 * norm : c.x;
                const tone =
                  c.tone === "blue"
                    ? "bg-sky-200/60 text-black"
                    : c.tone === "sand"
                    ? "bg-amber-200/70 text-black"
                    : "bg-white/80 text-black";
                const img1x = i === 0
                  ? "/images/portraits/akiko-koyama-portrait3.jpg"
                  : "/images/portraits/akiko-koyama-portrait4.jpg";
                const img2x = i === 0
                  ? "/images/portraits/akiko-koyama-portrait3@2x.jpg"
                  : "/images/portraits/akiko-koyama-portrait4@2x.jpg";

                return (
                  <article
                    key={i}
                    className={[
                      "select-none rounded-[20px] border backdrop-blur-md shadow-xl will-change-transform",
                      "border-black/10",
                      tone,
                    ].join(" ")}
                    style={{
                      width: `${c.w}px`,
                      height: `${c.h}px`,
                      transform: `translate3d(${x}px, ${y}px, 0)`,
                      transition: "transform 0.02s linear",
                    }}
                    aria-hidden="true"
                  >
                    <div className="flex h-full flex-col p-5">
                      <div className="mt-2 text-xl sm:text-4xl font-semibold opacity-90">{c.label}</div>
                      <div className="mt- text-xs opacity-100">{c.caption}</div>
                      <div className="mt-auto overflow-hidden rounded-xl border border-black/10 bg-white/90 shadow">
                        <img
                          src={img1x}
                          srcSet={`${img1x} 1x, ${img2x} 2x`}
                          sizes={`${c.w}px`}
                          alt={c.label}
                          className="h-90 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#111] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111] to-transparent" />
      </div>
    </section>
  );
}


