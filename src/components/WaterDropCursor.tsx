import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface SmoothCursorProps {
  cursorSize?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  hideSystemCursor?: boolean;
  enableBlendMode?: boolean;
  invertIconColors?: boolean;
  enableClickEffect?: boolean;
}

function DefaultCursorSVG({
  invertColors,
}: {
  invertColors: boolean;
}) {
  const innerColor = invertColors ? "white" : "var(--ted-red)";
  const outerColor = invertColors ? "black" : "var(--soft-red)";

  return (
    <svg viewBox="0 0 50 54" width="100%" height="100%" fill="none">
      <path
        d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
        fill={innerColor}
      />
      <path
        d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
        stroke={outerColor}
        strokeWidth="2.25825"
      />
    </svg>
  );
}

export function WaterDropCursor({
  cursorSize = 40,
  stiffness = 400,
  damping = 45,
  mass = 1,
  hideSystemCursor = true,
  enableBlendMode = false,
  invertIconColors = false,
  enableClickEffect = true,
}: SmoothCursorProps) {
  const [visible, setVisible] = useState(false);

  const cursorX = useSpring(-100, { stiffness, damping, mass });
  const cursorY = useSpring(-100, { stiffness, damping, mass });
  const rotation = useSpring(0, { stiffness: 300, damping: 60 });
  const scale = useSpring(1, { stiffness: 500, damping: 35 });

  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const previousAngle = useRef<number | null>(null);
  const accumulatedRotation = useRef(0);
  const latestPosition = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);
  const isMouseDown = useRef(false);

  useEffect(() => {
    const checkDevice = () => {
      setVisible(window.innerWidth >= 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const updateMouse = () => {
      rafId.current = null;

      const { x, y } = latestPosition.current;
      const previous = lastMousePos.current;

      cursorX.set(x);
      cursorY.set(y);

      if (previous) {
        const dx = x - previous.x;
        const dy = y - previous.y;

        if (Math.hypot(dx, dy) > 0.5) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          if (previousAngle.current === null) {
            previousAngle.current = angle;
          } else {
            let difference = angle - previousAngle.current;

            if (difference > 180) difference -= 360;
            if (difference < -180) difference += 360;

            accumulatedRotation.current += difference;
            rotation.set(accumulatedRotation.current);
            previousAngle.current = angle;
          }

          if (!isMouseDown.current) {
            scale.set(0.94);
            requestAnimationFrame(() => scale.set(1));
          }
        }
      }

      lastMousePos.current = { x, y };
    };

    const onMouseMove = (event: MouseEvent) => {
      latestPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(updateMouse);
      }
    };

    const onMouseDown = () => {
      isMouseDown.current = true;
      if (enableClickEffect) scale.set(0.7);
    };

    const onMouseUp = () => {
      isMouseDown.current = false;
      if (enableClickEffect) scale.set(1);
    };

    const onMouseLeave = () => {
      lastMousePos.current = null;
      previousAngle.current = null;
    };

    if (hideSystemCursor) {
      document.documentElement.classList.add("custom-cursor-active");
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);

      document.documentElement.classList.remove("custom-cursor-active");

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [
    visible,
    cursorX,
    cursorY,
    rotation,
    scale,
    hideSystemCursor,
    enableClickEffect,
  ]);

  if (!visible) return null;

  return (
    <>
      {hideSystemCursor && (
  <style>{`
    html.custom-cursor-active,
    html.custom-cursor-active *,
    html.custom-cursor-active body {
      cursor: none !important;
    }
  `}</style>
)}

      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: cursorX,
          y: cursorY,
          rotate: rotation,
          scale,
          zIndex: 999999,
          pointerEvents: "none",
          willChange: "transform",
          mixBlendMode: enableBlendMode ? "difference" : "normal",
          width: cursorSize,
          height: cursorSize,
          marginLeft: -cursorSize / 2,
          marginTop: -cursorSize / 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DefaultCursorSVG invertColors={invertIconColors} />
      </motion.div>
    </>
  );
}

export default WaterDropCursor;