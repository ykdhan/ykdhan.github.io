import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: number;
  tw: number;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

const LINK = 140;
const POINTER_R = 200;

/** Blend accent cyan → violet; c in [0, 1]. Returns "r, g, b". */
const mix = (c: number) =>
  `${Math.round(155 + 24 * c)}, ${Math.round(231 - 65 * c)}, 255`;

/**
 * Hero-only canvas layer: a drifting constellation of linked nodes that
 * gathers around the pointer, plus the occasional shooting star. Pauses when
 * off-screen or the tab is hidden; renders a single static frame under
 * prefers-reduced-motion.
 */
export default function HeroFX() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    // Non-null aliases so narrowing survives inside the hoisted functions below.
    const canvas = el;
    const ctx = context;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let frame = 0;
    let running = false;
    let visible = false;
    const nodes: Node[] = [];
    let stars: Star[] = [];
    const pointer = { x: -9999, y: -9999 };

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(90, Math.round((w * h) / 16000));
      while (nodes.length < target) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 0.8 + Math.random() * 1.4,
          c: Math.random(),
          tw: Math.random() * Math.PI * 2
        });
      }
      nodes.length = target;
      if (reduced) draw();
    }

    function step() {
      frame++;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < POINTER_R * POINTER_R && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = ((POINTER_R - d) / POINTER_R) * 0.012;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
        const sp = Math.hypot(n.vx, n.vy);
        if (sp > 0.55) {
          n.vx = (n.vx / sp) * 0.55;
          n.vy = (n.vy / sp) * 0.55;
        }
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }

      if (stars.length < 3 && Math.random() < 0.005) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        stars.push({
          x: w * (0.1 + Math.random() * 0.8),
          y: h * 0.35 * Math.random(),
          vx: dir * (6 + Math.random() * 5),
          vy: 2.5 + Math.random() * 2,
          life: 0,
          max: 40 + Math.random() * 25
        });
      }
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
      }
      stars = stars.filter((s) => s.life < s.max);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK) * 0.14;
          ctx.strokeStyle = `rgba(${mix((a.c + b.c) / 2)}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const glow = 0.4 + 0.3 * Math.sin(n.tw + frame * 0.02);
        ctx.fillStyle = `rgba(${mix(n.c)}, ${glow})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (pointer.x > -9000) {
        const g = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          POINTER_R
        );
        g.addColorStop(0, "rgba(155, 231, 255, 0.07)");
        g.addColorStop(1, "rgba(155, 231, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(
          pointer.x - POINTER_R,
          pointer.y - POINTER_R,
          POINTER_R * 2,
          POINTER_R * 2
        );
      }

      for (const s of stars) {
        const t = s.life / s.max;
        const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
        const tail = 10;
        const g = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - s.vx * tail,
          s.y - s.vy * tail
        );
        g.addColorStop(0, `rgba(210, 240, 255, ${0.8 * alpha})`);
        g.addColorStop(1, "rgba(210, 240, 255, 0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    }

    function loop() {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="hero-fx" aria-hidden="true" />;
}
