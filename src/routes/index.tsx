import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Reveal, RevealHeading } from "@/components/Reveal";

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
    ],
  }),
  component: Index,
});

const TARGET = new Date(2027, 0, 8, 0, 0, 0).getTime();

// What the page is about, and who to contact. Kept as data so the markup stays small.
const OFFICIAL_EMAIL = "tedxrset@rajagiritech.edu.in";
const TEAM = [
  {
    role: "Organizer",
    name: "Athul Raj",
    email: "u2503280@rajagiri.edu.in",
    linkedin: "https://www.linkedin.com/in/athul-raj-p-r-424035383",
  },
  {
    role: "Co-organizer",
    name: "Malavika D Nair",
    email: "u2401124@rajagiri.edu.in",
    linkedin: "https://www.linkedin.com/in/malavika-d-nair-55944734a",
  },
];

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
    <span className="drum relative inline-block h-[1.2em] w-[0.66em] overflow-hidden leading-[1.2em]">
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
    <div className="flex gap-2 sm:gap-4" role="timer" aria-label="Time until 8 January 2027">
      {parts.map(([label, v]) => (
        <div
          key={label}
          className="flex w-[4.4rem] flex-col items-center border border-white/15 bg-white/[0.02] px-2 py-3 sm:w-28 sm:py-5"
        >
          <div className="flex text-3xl font-extrabold leading-none tabular-nums text-white sm:text-5xl">
            {String(v)
              .padStart(2, "0")
              .split("")
              .map((c, i, a) => (
                <Digit key={a.length - i} d={c} />
              ))}
          </div>
          <div className="mono mt-2 text-[10px] text-muted-foreground sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Main ---------------- */
// phases: 0 idle, 1 outline, 2 fill, 3 slide, 4 top, 5 headline, 6 settled, 7 countdown
function Index() {
  const [phase, setPhase] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showContactLink, setShowContactLink] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Hide the "Contact" link once the contact section is in view.
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("contact");
      setShowContactLink(el ? el.getBoundingClientRect().top > 200 : true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pause the mesh animation when the hero is off-screen.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => e && setHeroVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Intro: plays on every load, skippable by click or key, skipped for reduced motion.
  useEffect(() => {
    const stopListening = () => {
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
    function finish() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopListening();
      setSkipped(true);
      setPhase(7);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const steps: [number, number][] = [
      [300, 1],
      [4000, 2],
      [5900, 3],
      [7900, 4],
      [8900, 5],
      [9800, 6],
      [10400, 7],
    ];
    timers.current = steps.map(([t, p]) =>
      setTimeout(() => {
        setPhase(p);
        if (p === 7) {
          // Intro finished by itself: stop treating clicks and keys as "skip".
          stopListening();
        }
      }, t),
    );
    window.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("keydown", finish, { once: true });
    return () => {
      timers.current.forEach(clearTimeout);
      stopListening();
    };
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const copy = (text: string, label: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
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

  const introDone = phase >= 7;

  return (
    <MotionConfig reducedMotion="user">
      <main
        className={`relative min-h-[100svh] w-full overflow-x-hidden bg-background text-foreground ${skipped ? "is-skipped" : ""}`}
      >
        <Toaster position="bottom-right" theme="dark" />

        {/* Contact link: appears with the countdown, hides when the contact section is in view */}
        <header
          className={`fixed right-4 top-4 z-50 transition-opacity duration-500 sm:right-8 sm:top-6 ${
            introDone && showContactLink ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => scrollTo("contact")}
            className="mono link-underline cursor-pointer text-white hover:text-[var(--ted-red)]"
          >
            Contact ↓
          </button>
        </header>

        {/* Hero */}
        <section
          ref={heroRef}
          className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
        >
          <div
            className={`mesh ${phase >= 5 ? "on" : ""} ${heroVisible ? "" : "paused"}`}
            aria-hidden
          >
            <i />
            <i />
            <i />
          </div>

          {/* Lockup (co-lead's logo, unchanged) */}
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

          {/* Headline + countdown */}
          <div className="absolute left-1/2 top-[60%] flex w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 px-4 text-center sm:gap-8">
            <div
              className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${
                phase >= 5 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <p className="mono text-muted-foreground">
                Rajagiri School of Engineering &amp; Technology
              </p>
              <h1 className="display text-[clamp(3.25rem,14vw,10rem)] text-white">
                Coming <span className="text-[var(--ted-red)]">soon</span>
              </h1>
            </div>
            <div
              className={`flex flex-col items-center gap-5 transition-all duration-700 ease-out ${
                introDone ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <Countdown />
              <p className="mono text-white">8 January 2027</p>
            </div>
          </div>

          {/* Intro hint / scroll cue */}
          {!introDone ? (
            <p className="mono absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
              Click anywhere to skip
            </p>
          ) : (
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="mono absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer text-muted-foreground hover:text-white"
            >
              Scroll ↓
            </button>
          )}
        </section>

        {/* What is TEDx */}
        <section
          id="about"
          className="relative border-t border-white/10 px-4 py-24 sm:px-6 sm:py-36 lg:px-8"
        >
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <RevealHeading className="display text-[clamp(2.25rem,6vw,4.5rem)]">
                What is TEDx?
              </RevealHeading>
              <Reveal delay={0.1} className="mt-6">
                <a
                  href="https://www.ted.com/tedx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono link-underline text-[var(--ted-red)] hover:text-white"
                >
                  TEDx program →
                </a>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="md:col-span-6 md:col-start-7">
              <p className="max-w-[65ch] text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-lg">
                In the spirit of ideas worth spreading, TED has created a program called TEDx. TEDx
                is a program of local, self-organized events that bring people together to share a
                TED-like experience. Our event is called TEDxRSET, where x = independently organized
                TED event. At our TEDxRSET event, TED Talks video and live speakers will combine to
                spark deep discussion and connection. The TED Conference provides general guidance
                for the TEDx program, but individual TEDx events, including ours, are
                self-organized.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="relative border-t border-white/10 px-4 py-24 sm:px-6 sm:py-36 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <RevealHeading className="display text-[clamp(2.25rem,6vw,4.5rem)]">
              Contact
            </RevealHeading>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[55ch] text-muted-foreground">
                For event enquiries, collaborations, speaking opportunities or sponsorships, reach
                out to our organizing team.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-14 border-t border-white/15">
              <div className="flex flex-col gap-3 border-b border-white/15 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mono text-muted-foreground">Official email</p>
                  <a
                    href={`mailto:${OFFICIAL_EMAIL}`}
                    className="mt-1 inline-block break-all text-xl font-semibold text-white hover:text-[var(--ted-red)] sm:text-2xl"
                  >
                    {OFFICIAL_EMAIL}
                  </a>
                </div>
                <CopyButton
                  active={copied === OFFICIAL_EMAIL}
                  onClick={() => copy(OFFICIAL_EMAIL, "Official email")}
                  label="Copy official email"
                />
              </div>

              {TEAM.map((p) => (
                <div
                  key={p.email}
                  className="grid gap-4 border-b border-white/15 py-6 sm:grid-cols-12 sm:items-center"
                >
                  <p className="mono text-muted-foreground sm:col-span-3">{p.role}</p>
                  <p className="display text-2xl text-white sm:col-span-3">{p.name}</p>
                  <div className="flex items-center gap-3 sm:col-span-4">
                    <a
                      href={`mailto:${p.email}`}
                      className="font-mono text-sm text-white hover:text-[var(--ted-red)]"
                    >
                      {p.email}
                    </a>
                    <CopyButton
                      active={copied === p.email}
                      onClick={() => copy(p.email, `${p.name}'s email`)}
                      label={`Copy ${p.name}'s email`}
                    />
                  </div>
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono link-underline text-white hover:text-[var(--ted-red)] sm:col-span-2 sm:text-right"
                  >
                    LinkedIn →
                  </a>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 TEDxRSET. This independent TEDx event is operated under license from TED.</p>
            <p>Website developed and maintained by the TEDxRSET team</p>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}

function CopyButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="mono shrink-0 cursor-pointer border border-white/25 px-3 py-1.5 text-white transition-colors hover:border-white hover:bg-white hover:text-black"
    >
      {active ? "Copied" : "Copy"}
    </button>
  );
}
