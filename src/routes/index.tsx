import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, Check, Copy, ExternalLink, Instagram, Linkedin, Mail } from "lucide-react";
import { Toaster, toast } from "sonner";
import { WaterDropCursor } from "@/components/WaterDropCursor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TEDxRSET — Coming Soon" },
      {
        name: "description",
        content: "TEDxRSET is coming. Ideas worth spreading — the countdown has begun.",
      },
      { property: "og:title", content: "TEDxRSET — Coming Soon" },
      {
        property: "og:description",
        content: "Ideas worth spreading. The countdown to TEDxRSET has begun.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TARGET = new Date(2027, 0, 8, 0, 0, 0).getTime();

/* ---------------- Audio ---------------- */
let actx: AudioContext | null = null;
function noiseBuf(ctx: AudioContext, dur: number) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function noise(
  dur: number,
  type: BiquadFilterType,
  f0: number,
  f1: number,
  q: number,
  vol: number,
) {
  if (!actx) return;
  const t = actx.currentTime;
  const s = actx.createBufferSource();
  s.buffer = noiseBuf(actx, dur);
  const f = actx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(actx.destination);
  s.start(t);
  s.stop(t + dur);
}
const sfx = {
  pencil: () => {
    for (let i = 0; i < 19; i++) {
      setTimeout(() => noise(0.18, "bandpass", 3500, 2500, 6, 0.05), i * 190);
    }
  },
  fluid: () => noise(1.6, "lowpass", 200, 1400, 3, 0.18),
  swoosh: () => noise(0.9, "bandpass", 400, 2400, 1.2, 0.16),
  tick: () => {
    if (!actx) return;
    const t = actx.currentTime;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(1800, t);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + 0.05);
  },
  boom: () => {
    if (!actx) return;
    const t = actx.currentTime;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 1.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + 2.3);
    noise(0.6, "lowpass", 800, 100, 1, 0.12);
  },
};

/* ---------------- Particles ---------------- */
type P = {
  x: number;
  y: number;
  s: number;
  solid: boolean;
  dur: number;
  delay: number;
  dx: number;
  dy: number;
  r: number;
  o: number;
};
// TED-style X: thick arms with flat horizontal cut ends
const X_POINTS = "0,0 34,0 50,28 66,0 100,0 68,50 100,100 66,100 50,72 34,100 0,100 32,50";
function Particles() {
  const [ps, setPs] = useState<P[]>([]);
  useEffect(() => {
    const m = window.innerWidth < 640 ? 0.5 : 1;
    setPs(
      Array.from({ length: window.innerWidth < 640 ? 24 : 40 }, () => {
        const r = Math.random();
        const big = r < 0.25;
        return {
          ...(() => {
            const band = () => (Math.random() < 0.5 ? Math.random() * 22 : 78 + Math.random() * 22);
            return Math.random() < 0.55
              ? { x: band(), y: Math.random() * 100 }
              : { x: Math.random() * 100, y: band() };
          })(),
          s:
            m *
            (r < 0.08
              ? 100 + Math.random() * 80
              : big
                ? 88 + Math.random() * 72
                : r < 0.6
                  ? 48 + Math.random() * 32
                  : 24 + Math.random() * 16),
          solid: Math.random() < 0.5,
          dur: 18 + Math.random() * 22,
          delay: -Math.random() * 30,
          dx: (Math.random() - 0.5) * 160,
          dy: (Math.random() - 0.5) * 160,
          r: (Math.random() - 0.5) * 120,
          o:
            r < 0.08
              ? 0.08 + Math.random() * 0.08
              : big
                ? 0.12 + Math.random() * 0.1
                : 0.25 + Math.random() * 0.35,
        };
      }),
    );
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ps.map((p, i) => (
        <span
          key={i}
          className="x-particle absolute block"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s * 0.72,
            height: p.s * 0.72,
            opacity: p.o,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ["--r" as string]: `${p.r}deg`,
          }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full" overflow="visible">
            <polygon
              points={X_POINTS}
              fill={p.solid ? "var(--ted-red)" : "none"}
              stroke={p.solid ? "none" : "var(--ted-red)"}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="miter"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ---------------- Odometer ---------------- */
function Digit({ d }: { d: string }) {
  const [cur, setCur] = useState(d);
  const [prev, setPrev] = useState<string | null>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (d !== cur) {
      setPrev(cur);
      setCur(d);
      setK((x) => x + 1);
    }
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span className="drum relative inline-block h-[1.2em] w-[0.62em] overflow-hidden leading-[1.2em]">
      {prev !== null && (
        <span key={`o${k}`} className="roll-out absolute inset-0 text-center">
          {prev}
        </span>
      )}
      <span key={`i${k}`} className={`${k ? "roll-in" : ""} absolute inset-0 text-center`}>
        {cur}
      </span>
    </span>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const parts: [string, number][] = [
    ["Days", Math.floor(diff / 864e5)],
    ["Hours", Math.floor(diff / 36e5) % 24],
    ["Minutes", Math.floor(diff / 6e4) % 60],
    ["Seconds", Math.floor(diff / 1e3) % 60],
  ];
  return (
    <div className="flex gap-2 sm:gap-4">
      {parts.map(([label, v]) => (
        <div
          key={label}
          className="count-card flex w-[4.4rem] flex-col items-center rounded-xl px-2 py-3 sm:w-28 sm:py-5"
        >
          <div className="count-num text-3xl font-extrabold tabular-nums leading-none sm:text-5xl">
            {String(v)
              .padStart(2, "0")
              .split("")
              .map((c, i, a) => (
                <Digit key={a.length - i} d={c} />
              ))}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Main ---------------- */
// phases: 0 idle, 1 outline, 2 fill, 3 slide, 4 top, 5 coming soon, 6 settled, 7 countdown
function Index() {
  const [phase, setPhase] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [showContactButton, setShowContactButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        setShowContactButton(rect.top > 200);
      } else {
        setShowContactButton(window.scrollY < window.innerHeight * 0.5);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unlock = () => {
      if (!actx) {
        try {
          actx = new AudioContext();
        } catch {
          /* noop */
        }
      }
      actx?.resume();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    const steps: [number, () => void][] = [
      [300, () => setPhase(1)],
      [3500, () => setPhase(2)],
      [5400, () => setPhase(3)],
      [7400, () => setPhase(4)],
      [8400, () => setPhase(5)],
      [9300, () => setPhase(6)],
      [10000, () => setPhase(7)],
    ];
    const ids = steps.map(([t, f]) => setTimeout(f, t));
    return () => {
      ids.forEach(clearTimeout);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedEmail(null), 2500);
    }
  };

  const textProps = {
    fontFamily: "Archivo, Helvetica, Arial, sans-serif",
    fontWeight: 800,
  } as const;

  const teLetters = (
    <>
      <text
        x="0"
        y="100"
        fontSize="130"
        textLength="258"
        lengthAdjust="spacingAndGlyphs"
        {...textProps}
      >
        TED
      </text>
      <text
        x="264"
        y="46"
        fontSize="78"
        textLength="40"
        lengthAdjust="spacingAndGlyphs"
        {...textProps}
      >
        x
      </text>
    </>
  );

  return (
    <main className="relative min-h-[100svh] w-full bg-background text-foreground select-none overflow-x-hidden">
      <WaterDropCursor />
      <Toaster position="bottom-right" theme="dark" />

      {/* Unified Persistent Stage Background (Single continuous bg for both parts) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="stage-grid absolute inset-0" />
        <div className="stage-spot absolute inset-0" />
        <div className="stage-flare absolute inset-0" />
        <Particles />
      </div>

      {/* Top Right Contact Navigation Button (Appears only after countdown appears, disappears at bottom) */}
      <header
        className={`fixed top-4 right-4 sm:top-6 sm:right-8 z-50 transition-all duration-500 ${
          phase >= 7 && showContactButton
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
        }`}
      >
        <button
          type="button"
          onClick={scrollToContact}
          className="group flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--ted-red)] shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-[var(--ted-red)] hover:bg-black/90 hover:shadow-[0_0_24px_rgba(235,0,40,0.45)] active:scale-95 cursor-pointer"
          aria-label="Scroll to contact details"
        >
          <span className="text-[var(--ted-red)]">Contact</span>
          <ArrowDown className="h-4 w-4 text-[var(--ted-red)] transition-transform duration-300 group-hover:translate-y-0.5" />
        </button>
      </header>

      {/* Hero Teaser Section */}
      <section className="relative h-[100svh] w-full flex flex-col items-center justify-center z-10">
        {/* Lockup */}
        <div
          className={`lockup absolute left-1/2 top-[46%] flex items-end ${phase >= 4 ? "is-top" : ""}`}
        >
          <svg
            viewBox="0 0 310 110"
            className={`tedx ${phase >= 3 ? "slid" : ""}`}
            aria-label="TEDx"
            overflow="visible"
          >
            <defs>
              <clipPath id="tedclip">{teLetters}</clipPath>
              <filter id="inkbleed" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="7" />
                <feDisplacementMap in="SourceGraphic" scale="14" />
                <feGaussianBlur stdDeviation="0.6" />
              </filter>
            </defs>
            <g clipPath="url(#tedclip)">
              <g
                filter="url(#inkbleed)"
                className={`ink ${phase >= 2 ? "go" : ""}`}
                fill="var(--ted-red)"
              >
                {[
                  [40, 60, 0],
                  [150, 40, 0.25],
                  [110, 95, 0.12],
                  [230, 70, 0.4],
                  [285, 30, 0.55],
                  [20, 20, 0.5],
                  [190, 10, 0.3],
                ].map(([cx, cy, d], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="90"
                    style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${d}s` }}
                  />
                ))}
              </g>
            </g>
            <g
              className={`outline-draw ${phase >= 1 ? "go" : ""}`}
              fill="none"
              stroke="var(--ted-red)"
              strokeWidth="1.6"
            >
              {teLetters}
            </g>
          </svg>
          <svg viewBox="0 0 362 110" className="rset" aria-label="RSET" overflow="visible">
            {["R", "S", "E", "T"].map((l, i) => (
              <text
                key={l}
                x={i * 92}
                y="100"
                fontSize="130"
                textLength={86}
                lengthAdjust="spacingAndGlyphs"
                fill="var(--rset-white)"
                {...textProps}
                className={`rset-l ${phase >= 3 ? "in" : ""}`}
                style={{ transitionDelay: `${150 + i * 150}ms` }}
              >
                {l}
              </text>
            ))}
          </svg>
        </div>

        {/* Coming soon */}
        <div className="absolute left-1/2 top-[54%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8 sm:gap-12">
          <h1
            className={`coming whitespace-nowrap text-[11vw] font-black uppercase leading-none tracking-tight sm:text-[8.5vw] ${phase >= 5 ? "show" : ""}`}
          >
            Coming Soon
          </h1>
          <div
            className="grid transition-[grid-template-rows] duration-1000 ease-[cubic-bezier(.65,0,.25,1)]"
            style={{ gridTemplateRows: phase >= 7 ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden pb-4">
              <div
                className={`transition-all delay-300 duration-1000 ${phase >= 7 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
              >
                {phase >= 7 && (
                  <div className="flex flex-col items-center gap-4">
                    <Countdown />
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-foreground sm:text-base">
                      <span className="text-[color:var(--ted-red)]">●</span> January 8, 2027
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator prompt */}
        {phase >= 7 && (
          <button
            type="button"
            onClick={scrollToContact}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-[11px] font-medium tracking-[0.25em] uppercase text-muted-foreground transition-colors hover:text-white cursor-pointer group pointer-events-auto"
            aria-label="Scroll down to contact information"
          >
            <span className="group-hover:text-white transition-colors">Contact Details</span>
            <ArrowDown className="h-4 w-4 animate-bounce text-[var(--ted-red)] group-hover:scale-110 transition-transform" />
          </button>
        )}
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="relative w-full min-h-[100svh] text-foreground px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col justify-between z-10"
      >
        <div className="relative z-10 mx-auto w-full max-w-4xl space-y-12">
          {/* Section Header */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--ted-red)]">
                Connect With Us · TEDxRSET
              </p>
              <span className="hidden sm:inline text-white/20">·</span>
              <a
                href="https://www.ted.com/tedx/events/70800"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/80 hover:border-[var(--ted-red)] hover:text-white transition-all cursor-pointer"
                title="View on TED.com"
              >
                <span>Official TEDx Event</span>
                <ExternalLink className="h-3 w-3 text-[var(--ted-red)]" />
              </a>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-['Archivo',sans-serif]">
              Contact Details
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              For event inquiries, collaborations, speaking opportunities, or sponsorships, feel
              free to reach out to our organizing team. View our official event page on{" "}
              <a
                href="https://www.ted.com/tedx/events/70800"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--ted-red)] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                TED.com <ExternalLink className="h-3.5 w-3.5" />
              </a>
              .
            </p>
          </div>

          {/* Official Channels Grid (Email & Instagram) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Official Email Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-[var(--ted-red)]/50 transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ted-red)]/15 border border-[var(--ted-red)]/30 text-[var(--ted-red)] shadow-[0_0_15px_rgba(235,0,40,0.25)]">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Official Email
                  </div>
                  <a
                    href="mailto:tedxrset@rajagiritech.edu.in"
                    className="text-base sm:text-lg font-bold text-[var(--ted-red)] hover:text-[var(--soft-red)] transition-colors break-all"
                  >
                    tedxrset@rajagiritech.edu.in
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => copyToClipboard("tedxrset@rajagiritech.edu.in", "Official email")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                  aria-label="Copy official email"
                >
                  {copiedEmail === "tedxrset@rajagiritech.edu.in" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href="mailto:tedxrset@rajagiritech.edu.in"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ted-red)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 shadow-[0_0_15px_rgba(235,0,40,0.3)] transition-all cursor-pointer"
                >
                  <span>Send Email</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Official Instagram Card (No Copy Link button) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-pink-500/50 transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)]">
                  <Instagram className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Official Instagram
                  </div>
                  <a
                    href="https://www.instagram.com/tedxrset?vrfl=dGIwZWs5NGlxbjU4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg font-bold text-pink-400 hover:text-pink-300 transition-colors truncate block"
                  >
                    @tedxrset
                  </a>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <a
                  href="https://www.instagram.com/tedxrset?vrfl=dGIwZWs5NGlxbjU4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-pink-500/40 bg-gradient-to-r from-pink-600/30 to-purple-600/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-pink-200 hover:from-pink-600/50 hover:to-purple-600/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all cursor-pointer"
                >
                  <Instagram className="h-4 w-4 text-pink-300" />
                  <span>Don't Forget to Follow Us</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>

          {/* Organizers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organizer: Athul Raj */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-[var(--ted-red)]/50 transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-black text-white">
                    AR
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-['Archivo',sans-serif]">
                    Athul Raj
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-black/40 border border-white/10 p-2.5">
                    <a
                      href="mailto:u2503280@rajagiri.edu.in"
                      className="text-xs sm:text-sm font-mono font-semibold text-[var(--ted-red)] hover:underline transition-colors truncate"
                    >
                      u2503280@rajagiri.edu.in
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("u2503280@rajagiri.edu.in", "Athul's email")}
                      className="p-1 rounded text-muted-foreground hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy email"
                      aria-label="Copy Athul Raj's email"
                    >
                      {copiedEmail === "u2503280@rajagiri.edu.in" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <a
                  href="mailto:u2503280@rajagiri.edu.in"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--ted-red)]/50 bg-[var(--ted-red)]/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--ted-red)] hover:bg-[var(--ted-red)] hover:text-white shadow-[0_0_15px_rgba(235,0,40,0.2)] transition-all cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/athul-raj-p-r-424035383?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all cursor-pointer"
                >
                  <Linkedin className="h-3.5 w-3.5 text-sky-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Co-organizer: Malavika D Nair */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-[var(--ted-red)]/50 transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-black text-white">
                    MN
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-['Archivo',sans-serif]">
                    Malavika D Nair
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-black/40 border border-white/10 p-2.5">
                    <a
                      href="mailto:u2401124@rajagiri.edu.in"
                      className="text-xs sm:text-sm font-mono font-semibold text-[var(--ted-red)] hover:underline transition-colors truncate"
                    >
                      u2401124@rajagiri.edu.in
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard("u2401124@rajagiri.edu.in", "Malavika's email")
                      }
                      className="p-1 rounded text-muted-foreground hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy email"
                      aria-label="Copy Malavika D Nair's email"
                    >
                      {copiedEmail === "u2401124@rajagiri.edu.in" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <a
                  href="mailto:u2401124@rajagiri.edu.in"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--ted-red)]/50 bg-[var(--ted-red)]/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--ted-red)] hover:bg-[var(--ted-red)] hover:text-white shadow-[0_0_15px_rgba(235,0,40,0.2)] transition-all cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/malavika-d-nair-55944734a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all cursor-pointer"
                >
                  <Linkedin className="h-3.5 w-3.5 text-sky-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </div>
            </div>
          </div>

          {/* Section Footer */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-center sm:text-left text-xs text-muted-foreground">
              ©️2026 TEDxRSET. This independent TEDx event is operated under license from TED.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a
                href="mailto:tedxrset@rajagiritech.edu.in"
                className="flex items-center gap-1.5 hover:text-[var(--ted-red)] transition-colors"
                title="Send Email"
              >
                <Mail className="h-3.5 w-3.5 text-[var(--ted-red)]" />
                <span className="hidden sm:inline">tedxrset@rajagiritech.edu.in</span>
                <span className="sm:hidden">Email</span>
              </a>
              <span className="text-white/20">·</span>
              <a
                href="https://www.ted.com/tedx/events/70800"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title="Official TEDx Event on TED.com"
              >
                <span>Official TEDx Event</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
