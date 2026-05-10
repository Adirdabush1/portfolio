import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driveStore, useDriveStore } from "./useDriveStore";
import type { BillboardKind } from "./constants";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(8, 12, 16, 0.7)",
  backdropFilter: "blur(8px)",
  zIndex: 50,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "max(40px, env(safe-area-inset-top)) 16px max(40px, env(safe-area-inset-bottom))",
  fontFamily: "Poppins, system-ui, sans-serif",
  color: "#fff",
  overflowY: "auto",
};

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #14181f 0%, #0c0f14 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "28px 28px 32px",
  maxWidth: 720,
  width: "100%",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  position: "relative",
  marginTop: "auto",
  marginBottom: "auto",
};

const closeStyle: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 16,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.85)",
  fontSize: 22,
  cursor: "pointer",
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  opacity: 0.55,
  fontWeight: 700,
  marginBottom: 10,
};

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.5,
  margin: "0 0 16px 0",
  lineHeight: 1.15,
};

const paraStyle: React.CSSProperties = {
  lineHeight: 1.65,
  opacity: 0.85,
  fontSize: 15,
  margin: "10px 0",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  opacity: 0.6,
  marginTop: 26,
  marginBottom: 12,
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(315deg, #55A5FE, #A469FF, #CC5FB8)",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "12px 22px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  marginTop: 14,
  fontFamily: "Poppins, system-ui, sans-serif",
};

const linkButton: React.CSSProperties = {
  ...buttonStyle,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

function PillList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((s) => (
        <span
          key={s}
          style={{
            padding: "7px 13px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 13,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function HeroContent() {
  return (
    <>
      <div style={eyebrow}>About me</div>
      <h2 style={titleStyle}>Hey, I'm Adir 👋</h2>
      <p style={paraStyle}>
        I'm a software engineer working at the intersection of mobile, web, and
        creative 3D. I've spent the last few years shipping product end-to-end —
        from designing APIs and database schemas, through building responsive
        cross-platform UIs, to crafting interactive experiences like this
        portfolio you're driving in right now.
      </p>
      <p style={paraStyle}>
        Currently I'm at <strong>MSApps</strong>, where I lead mobile development
        for several cross-platform titles used by millions of people. Before
        that I built internal tools, dashboards, and the occasional 3D toy on
        the side.
      </p>
      <p style={paraStyle}>
        What I care about: 60fps everywhere (yes, even on phones), animation
        timing that feels right, code that other engineers can read at 11pm,
        and explaining technical decisions to non-technical stakeholders without
        being condescending.
      </p>

      <div style={sectionTitle}>What's around</div>
      <p style={paraStyle}>
        Drive to the <strong>Skills</strong> sign for a breakdown of what I
        work with. <strong>Projects</strong> shows what I've built. The big
        purple <strong>AI Assistant</strong> sign opens a real conversation
        with my voice clone — you can ask it anything about me.
      </p>
    </>
  );
}

function SkillsContent() {
  return (
    <>
      <div style={eyebrow}>What I work with</div>
      <h2 style={titleStyle}>Skills, by category</h2>
      <p style={paraStyle}>
        I'm a generalist with depth. I can hold a stack end-to-end, but I lean
        most into <strong>interactive frontend</strong> and <strong>creative
        3D</strong>. Three sub-signs go deeper into Frontend, Backend, and
        Creative — drive over to peek into each.
      </p>

      <div style={sectionTitle}>Languages</div>
      <PillList items={["TypeScript", "JavaScript", "Python", "C# (Unity)", "GLSL", "SQL"]} />

      <div style={sectionTitle}>Day-to-day</div>
      <PillList items={["React", "React Native", "Three.js", "Node.js", "MongoDB", "Express", "Vite", "Git"]} />

      <div style={sectionTitle}>Specialties</div>
      <PillList items={["Mobile (iOS + Android)", "Real-time 3D", "WebGL shaders", "AI / LLM integration", "Voice synthesis"]} />
    </>
  );
}

function FrontendContent() {
  return (
    <>
      <div style={eyebrow}>Frontend</div>
      <h2 style={titleStyle}>The pixels you see</h2>
      <p style={paraStyle}>
        This is where I spend most of my time. I've shipped React apps ranging
        from internal spreadsheet-style tools to full 3D experiences like the
        one you're driving in. I care about animation timing, micro-interactions,
        and not breaking on a 5-year-old phone.
      </p>
      <p style={paraStyle}>
        I keep performance budgets in mind from the start: bundle splitting,
        critical CSS, lazy-loaded routes, and aggressive caching. If something
        feels slow, I profile before I rewrite.
      </p>

      <div style={sectionTitle}>Stack</div>
      <PillList items={["React", "TypeScript", "Vite", "Three.js", "R3F + drei", "Rapier physics", "GSAP", "Framer Motion", "Tailwind"]} />
    </>
  );
}

function BackendContent() {
  return (
    <>
      <div style={eyebrow}>Backend</div>
      <h2 style={titleStyle}>The plumbing</h2>
      <p style={paraStyle}>
        Backend isn't where I spend most of my hours, but it's where I make
        sure the frontend has rock-solid foundations. I've built Node/Express
        APIs, Python pipelines for inference and ETL, and Mongo schemas tuned
        for real workloads.
      </p>
      <p style={paraStyle}>
        For this portfolio, the backend ([backend/index.js](backend/index.js))
        is a small Express app that handles ElevenLabs TTS streaming, Groq LLM
        calls for the AI Assistant, and a contact form via Nodemailer — all
        rate-limited and deployed on Render.
      </p>

      <div style={sectionTitle}>Stack</div>
      <PillList items={["Node.js", "Express", "TypeScript", "Python", "MongoDB", "REST", "WebSockets", "Docker", "Render"]} />
    </>
  );
}

function CreativeContent() {
  return (
    <>
      <div style={eyebrow}>Creative</div>
      <h2 style={titleStyle}>The fun layer</h2>
      <p style={paraStyle}>
        I started in 3D as a hobby — modelling spaceships in Blender after work.
        Over time it became a superpower: I can prototype an interactive
        experience end-to-end (model, scene, physics, shaders, UI) without
        handoffs.
      </p>
      <p style={paraStyle}>
        The Cybertruck you're driving was generated procedurally in Blender via
        a Python script (see
        [portfolio/blender/cybertruck.py](portfolio/blender/cybertruck.py))
        and exported as a 46KB GLB. The AI Assistant avatar uses ARKit
        morph-target lip-sync mapped to incoming text characters in real time.
      </p>

      <div style={sectionTitle}>Stack</div>
      <PillList items={["Blender", "three.js", "R3F", "drei", "Rapier physics", "GLSL shaders", "GSAP", "ElevenLabs TTS", "ARKit blendshapes", "MCP for tooling"]} />
    </>
  );
}

interface Project {
  name: string;
  blurb: string;
  desc: string;
  tags: string[];
}

const PROJECTS: Project[] = [
  {
    name: "AI Voice Assistant",
    blurb: "Talk to a 3D avatar of me",
    desc: "Realtime conversational AI with my own ElevenLabs voice clone. Groq-hosted LLM with my background and personality baked into the system prompt. The 3D head lip-syncs in real time using ARKit blendshapes mapped to incoming text characters. I built it because writing 'About me' pages feels stiff — I'd rather let visitors actually talk to me.",
    tags: ["React", "Three.js", "ElevenLabs", "Groq", "ARKit blendshapes"],
  },
  {
    name: "Drive Portfolio (this site)",
    blurb: "Three.js + Rapier driving game",
    desc: "An interactive 3D portfolio inspired by Bruno Simon's classic driving showcase. Procedurally generated low-poly Cybertruck (46KB GLB), Rapier WASM physics, GSAP-driven cinematic Tour Mode, and a chase camera. Mobile-first with virtual joystick + gesture-aware billboard modals.",
    tags: ["R3F", "Rapier", "Blender", "GSAP"],
  },
  {
    name: "MSApps Mobile Titles",
    blurb: "Cross-platform mobile games",
    desc: "Lead mobile development across multiple titles in production. Cross-platform React Native apps with native modules where the platform required it (camera, AR, low-level audio). Combined active install base measured in millions.",
    tags: ["React Native", "iOS", "Android", "Native modules"],
  },
  {
    name: "PocketProof",
    blurb: "Field documentation for teams in motion",
    desc: "Mobile-first product for field teams to capture inspections, sign off, and sync to back-office. Designed for spotty connectivity and gloved hands. Built end-to-end from mobile UI through API design.",
    tags: ["React Native", "TypeScript", "Offline-first", "PDF generation"],
  },
];

function ProjectsContent() {
  return (
    <>
      <div style={eyebrow}>Selected projects</div>
      <h2 style={titleStyle}>Things I've built</h2>
      <p style={paraStyle}>
        Highlights from the past few years. The first two are visible right
        here — the AI Assistant lives behind its sign, and you're driving in
        the third one.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
        {PROJECTS.map((p) => (
          <div
            key={p.name}
            style={{
              padding: 18,
              borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{p.name}</div>
              <div style={{ opacity: 0.55, fontSize: 12 }}>{p.blurb}</div>
            </div>
            <div style={{ opacity: 0.78, fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>
              {p.desc}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {p.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(85,165,254,0.1)",
                    border: "1px solid rgba(85,165,254,0.2)",
                    fontSize: 11,
                    color: "#8fc4ff",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AIContent({ onGo }: { onGo: () => void }) {
  return (
    <>
      <div style={eyebrow}>AI Assistant</div>
      <h2 style={titleStyle}>Have a conversation, not a read</h2>
      <p style={paraStyle}>
        I trained an <strong>ElevenLabs voice clone of myself</strong> and
        wired it to a Groq-hosted LLM with my CV, work history, and personality
        notes baked into the system prompt. The 3D head you'll see lip-syncs in
        real time using ARKit-style morph targets mapped to characters as the
        TTS streams in.
      </p>
      <p style={paraStyle}>
        Ask it about my background, what I'm working on, what stack I'd reach
        for in your domain, or anything you'd ask me in person. It speaks both
        Hebrew and English.
      </p>
      <p style={{ ...paraStyle, opacity: 0.6, fontSize: 13 }}>
        Note: the voice generation runs through a backend rate limiter (10
        requests/minute per IP). If you hit a wall, give it a few seconds.
      </p>
      <button style={buttonStyle} onClick={onGo}>
        Open AI Assistant →
      </button>
    </>
  );
}

function ContactContent() {
  return (
    <>
      <div style={eyebrow}>Contact</div>
      <h2 style={titleStyle}>Drop a line — I read everything</h2>
      <p style={paraStyle}>
        Whether you're hiring, want to collaborate, or just want to talk
        shop about three.js and physics engines, I'd love to hear from you.
      </p>
      <p style={paraStyle}>
        Fastest way is email. I respond to every message that isn't obvious
        spam, usually within a day.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        <a
          href="mailto:adir.dabush@msapps.mobi"
          style={{ ...buttonStyle, display: "inline-block", textAlign: "center", textDecoration: "none" }}
        >
          📧 adir.dabush@msapps.mobi
        </a>
        <a
          href="https://github.com/adirdabush"
          target="_blank"
          rel="noreferrer"
          style={{ ...linkButton, display: "inline-block", textAlign: "center", textDecoration: "none" }}
        >
          GitHub ↗
        </a>
        <a
          href="https://www.linkedin.com/in/adir-dabush/"
          target="_blank"
          rel="noreferrer"
          style={{ ...linkButton, display: "inline-block", textAlign: "center", textDecoration: "none" }}
        >
          LinkedIn ↗
        </a>
      </div>
    </>
  );
}

const renderers: Record<BillboardKind, React.FC<{ onGo: () => void }>> = {
  hero: () => <HeroContent />,
  skills: () => <SkillsContent />,
  frontend: () => <FrontendContent />,
  backend: () => <BackendContent />,
  creative: () => <CreativeContent />,
  projects: () => <ProjectsContent />,
  ai: ({ onGo }) => <AIContent onGo={onGo} />,
  contact: () => <ContactContent />,
};

export default function BillboardModal() {
  const open = useDriveStore((s) => s.openBillboard);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") driveStore.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  const Render = renderers[open];

  return (
    <div style={overlayStyle} onClick={() => driveStore.close()}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeStyle} onClick={() => driveStore.close()} aria-label="Close">
          ×
        </button>
        <Render onGo={() => navigate("/ask")} />
      </div>
    </div>
  );
}
