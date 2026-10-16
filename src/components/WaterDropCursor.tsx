import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

const SIZE = 26;

function ArrowSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 50 54" fill="none"
      style={{ filter: "drop-shadow(0 0 8px oklch(0.58 0.24 22 / .7))" }}>
      <path d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z" fill="var(--ted-red)" />
      <path d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z" stroke="var(--soft-red)" strokeWidth={2.25825} />
    </svg>
  );
}

export function WaterDropCursor() {
  const [visible, setVisible] = useState(false);
  const x = useSpring(-100, { stiffness: 400, damping: 45, mass: 1 });
  const y = useSpring(-100, { stiffness: 400, damping: 45, mass: 1 });
  const rotation = useSpring(0, { stiffness: 300, damping: 60 });
  const scale = useSpring(1, { stiffness: 500, damping: 35 });
  const last = useRef({ x: 0, y: 0, t: Date.now() });
  const prevAngle = useRef(0);
  const acc = useRef(0);
  const down = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setVisible(window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const move = (e: MouseEvent) => {
      const now = Date.now(); const dt = now - last.current.t;
      const vx = dt > 0 ? (e.clientX - last.current.x) / dt : 0;
      const vy = dt > 0 ? (e.clientY - last.current.y) / dt : 0;
      last.current = { x: e.clientX, y: e.clientY, t: now };
      x.set(e.clientX); y.set(e.clientY);
      if (Math.hypot(vx, vy) > 0.1) {
        const a = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
        let d = a - prevAngle.current;
        if (d > 180) d -= 360; if (d < -180) d += 360;
        acc.current += d; rotation.set(acc.current); prevAngle.current = a;
        if (!down.current) { scale.set(0.95); setTimeout(() => { if (!down.current) scale.set(1); }, 150); }
      }
    };
    const onMove = (e: MouseEvent) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => { move(e); raf.current = null; });
    };
    const md = () => { down.current = true; scale.set(0.7); };
    const mu = () => { down.current = false; scale.set(1); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("mouseleave", mu);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("mouseleave", mu);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [visible, x, y, rotation, scale]);

  if (!visible) return null;
  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, x, y, rotate: rotation, scale,
          zIndex: 999999, pointerEvents: "none", willChange: "transform",
          width: SIZE, height: SIZE, marginLeft: -SIZE / 2, marginTop: -SIZE / 2,
        }}
      >
        <ArrowSVG />
      </motion.div>
    </>
  );
}
