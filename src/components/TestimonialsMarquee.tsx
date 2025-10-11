import { useEffect, useRef, useState } from 'react';

type Testimonial = {
  name: string;
  affiliation?: string;
  avatar?: string;
  quote: string;
};

type Props = {
  items: Testimonial[];
  speed?: number; // pixels per second
};

export default function TestimonialsMarquee({ items, speed = 40 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startLeft = useRef(0);

  // オートスクロール（左右無限）
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last = performance.now();
    // iOS SafariでscrollLeftの小数が丸められて進まないのを避けるため、
    // 仮想位置posで小数を累積し、DOM反映時のみ整数化される影響を受けるようにする。
    let pos = track.scrollLeft;
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        const maxScroll = track.scrollWidth / 2; // クローン分を考慮
        pos += speed * dt;
        if (pos >= maxScroll) pos -= maxScroll;
        if (pos < 0) pos += maxScroll;
        track.scrollLeft = pos;
      } else {
        // ユーザー操作直後など、停止中はDOM側に合わせて同期
        pos = track.scrollLeft;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed]);

  // ポインター操作（クリック/ドラッグ & スワイプ）でスクロール
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const track = trackRef.current;
    if (!track) return;
    // まだドラッグ扱いにしない（スワイプ判定は移動量で行う）
    dragging.current = false;
    startX.current = e.clientX;
    startLeft.current = track.scrollLeft;
    // しきい値を超えたらpausedを有効化する
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - startX.current;
    // 横移動がしきい値を超えたらドラッグ開始
    if (!dragging.current) {
      if (Math.abs(dx) > 8) {
        dragging.current = true;
        setPaused(true);
      } else {
        return; // しきい値未満は縦スクロールに委ねる
      }
    }
    const next = startLeft.current - dx;
    const maxScroll = track.scrollWidth / 2;
    let val = next;
    if (val < 0) val += maxScroll; // 左端を跨いだら巻き戻す
    if (val >= maxScroll) val -= maxScroll; // 右端を跨いだら巻き戻す
    track.scrollLeft = val;
  };

  const endDrag: React.PointerEventHandler<HTMLDivElement> = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setPaused(false);
  };
  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setPaused(false);
  };

  // アイテムを2回並べて無限スクロール
  const doubled = [...items, ...items];

  return (
    <section className="w-full py-16" aria-label="お客様の声">
      <div
        ref={trackRef}
        className="relative w-full overflow-x-auto scrollbar-hide px-4 md:px-6 select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' as any }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={onPointerCancel}
      >
        <div className="flex gap-4 min-w-max">
          {doubled.map((t, i) => (
            <article
              key={i + t.name}
              className="shrink-0 w-[320px] md:w-[360px] rounded-2xl border border-black/20 bg-white p-6 shadow-card flex flex-col min-h-[220px] md:min-h-[240px]"
            >
              <blockquote className="text-[15px] leading-7 text-base-900">“{t.quote}”</blockquote>
              <footer className="mt-auto pt-5 flex items-center gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-base-900">{t.name}</div>
                  {t.affiliation && <div className="truncate text-sm text-base-900/80">{t.affiliation}</div>}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <a href="/reviews" className="btn-cta">受講者の声一覧を見る</a>
      </div>
    </section>
  );
}


