import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppScreen = "onboarding" | "role" | "main";
type MainTab = "home" | "dashboard" | "journey" | "rewards";
type UserRole = "student" | "staff" | "professor";
type ScanPhase =
  | "qr_scan"
  | "qr_done"
  | "item_scan"
  | "item_analyzing"
  | "result"
  | "throwing"
  | "success";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ITEMS = [
  {
    name: "Plastic Bottle",
    bin: "Recycling",
    binColor: "#4FC3F7",
    emoji: "🍶",
    co2: 0.05,
    pts: 10,
    tip: "Rinse before placing in the blue bin.",
  },
  {
    name: "Apple Core",
    bin: "Organic",
    binColor: "#66BB6A",
    emoji: "🍎",
    co2: 0.02,
    pts: 8,
    tip: "No need to remove stickers.",
  },
  {
    name: "Newspaper",
    bin: "Paper",
    binColor: "#FFA726",
    emoji: "📰",
    co2: 0.03,
    pts: 8,
    tip: "Flatten to save space in the bin.",
  },
  {
    name: "Glass Bottle",
    bin: "Glass",
    binColor: "#AB47BC",
    emoji: "🍾",
    co2: 0.1,
    pts: 15,
    tip: "Remove metal caps first.",
  },
  {
    name: "Coffee Cup",
    bin: "General",
    binColor: "#78909C",
    emoji: "☕",
    co2: 0.01,
    pts: 5,
    tip: "Separate lid — it can be recycled.",
  },
  {
    name: "Cardboard Box",
    bin: "Paper",
    binColor: "#FFA726",
    emoji: "📦",
    co2: 0.06,
    pts: 9,
    tip: "Flatten and remove any tape.",
  },
  {
    name: "Banana Peel",
    bin: "Organic",
    binColor: "#66BB6A",
    emoji: "🍌",
    co2: 0.02,
    pts: 8,
    tip: "Great for campus composting.",
  },
  {
    name: "Aluminium Can",
    bin: "Recycling",
    binColor: "#4FC3F7",
    emoji: "🥤",
    co2: 0.08,
    pts: 12,
    tip: "Crush to save space in the bin.",
  },
];

const JOURNEY_STEPS = [
  {
    icon: "🗑️",
    title: "Correctly Sorted",
    desc: "Item placed in the right bin on campus.",
  },
  {
    icon: "🚛",
    title: "Collected",
    desc: "Campus waste team picks up bins every morning.",
  },
  {
    icon: "🏭",
    title: "Processing Facility",
    desc: "Sorted at the regional recycling centre.",
  },
  {
    icon: "♻️",
    title: "Material Recovery",
    desc: "Materials are extracted and prepared for reuse.",
  },
  {
    icon: "🌿",
    title: "New Life",
    desc: "Turned into new products or organic compost.",
  },
  {
    icon: "🌍",
    title: "Impact Logged",
    desc: "Your CO₂ savings are recorded on your profile.",
  },
];

const CAMPUS_LEADERBOARD = [
  { name: "IE Tower", kg: 3420, flag: "🏙️" },
  { name: "Segovia Design", kg: 2890, flag: "🎨" },
  { name: "María de Molina IE", kg: 2540, flag: "📚" },
  { name: "Segovia", kg: 1980, flag: "🏰" },
  { name: "IE New York", kg: 1450, flag: "🗽" },
];

const BADGES = [
  { icon: "🌱", name: "First Sort", earned: true },
  { icon: "🔥", name: "5-Day Streak", earned: true },
  { icon: "♻️", name: "Recycle Pro", earned: true },
  { icon: "🌍", name: "Eco Champion", earned: false },
  { icon: "🏆", name: "Campus Hero", earned: false },
  { icon: "💎", name: "Zero Waster", earned: false },
];

const STUDENT_REWARDS = [
  { icon: "☕", name: "Free Coffee", pts: 150 },
  { icon: "🥗", name: "Lunch Discount 10%", pts: 300 },
  { icon: "📚", name: "Library Late Pass", pts: 200 },
  { icon: "🎽", name: "Eco Tote Bag", pts: 500 },
];

const PROFESSOR_REWARDS = [
  { icon: "☕", name: "Free Coffee", pts: 150 },
  { icon: "🚆", name: "Train Ticket (Madrid)", pts: 350 },
  { icon: "🚌", name: "Bus Pass (Monthly)", pts: 500 },
  { icon: "🎟️", name: "Rail Voucher €20", pts: 280 },
];

const STAFF_ALERTS = [
  {
    bin: "Recycling",
    location: "Main Hall — Floor 1",
    icon: "♻️",
    color: "#4FC3F7",
    urgent: true,
  },
  {
    bin: "Organic",
    location: "Cafeteria East Wing",
    icon: "🌿",
    color: "#66BB6A",
    urgent: true,
  },
  {
    bin: "General",
    location: "Library — 3rd Floor",
    icon: "🗑️",
    color: "#78909C",
    urgent: false,
  },
  {
    bin: "Paper",
    location: "Admin Block — Room 204",
    icon: "📄",
    color: "#FFA726",
    urgent: false,
  },
];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background:#0B1A10; font-family:'Plus Jakarta Sans',sans-serif; color:#E8F5E9; min-height:100dvh; overflow:hidden; display:flex; justify-content:center; }
  #root { width:100%; max-width:430px; min-height:100dvh; position:relative; overflow:hidden; background:#0B1A10; }
  ::-webkit-scrollbar { display:none; }
  .screen { position:absolute; inset:0; display:flex; flex-direction:column; }
  .btn-primary { background:#C8FF4E; color:#0B1A10; border:none; border-radius:16px; padding:16px 32px; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; cursor:pointer; width:100%; transition:transform 0.15s,box-shadow 0.15s; letter-spacing:0.02em; }
  .btn-primary:hover  { transform:translateY(-2px); box-shadow:0 8px 24px rgba(200,255,78,0.35); }
  .btn-primary:active { transform:translateY(0); box-shadow:none; }
  .input-field { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.14); border-radius:14px; padding:15px 18px; color:#E8F5E9; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; width:100%; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .input-field::placeholder { color:rgba(232,245,233,0.4); }
  .input-field:focus { border-color:#C8FF4E; box-shadow:0 0 0 3px rgba(200,255,78,0.15); }
  .glass-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; backdrop-filter:blur(12px); }

  @keyframes scanBeam { 0%{top:8%} 50%{top:85%} 100%{top:8%} }
  .scan-beam { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#C8FF4E,transparent); animation:scanBeam 2s ease-in-out infinite; box-shadow:0 0 12px 3px rgba(200,255,78,0.6); }
  @keyframes qrBeam { 0%{top:8%} 50%{top:85%} 100%{top:8%} }
  .qr-beam { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#ffffff,transparent); animation:qrBeam 1.6s ease-in-out infinite; box-shadow:0 0 10px 3px rgba(255,255,255,0.5); }

  @keyframes pulseRing { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(1.8);opacity:0} }
  .pulse-ring { position:absolute; border-radius:50%; border:2px solid #C8FF4E; animation:pulseRing 1.5s ease-out infinite; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp 0.5s ease forwards; }
  .delay-1 { animation-delay:0.1s; opacity:0; }
  .delay-2 { animation-delay:0.2s; opacity:0; }
  .delay-3 { animation-delay:0.3s; opacity:0; }
  .delay-4 { animation-delay:0.4s; opacity:0; }
  .delay-5 { animation-delay:0.5s; opacity:0; }

  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { animation:spin 1s linear infinite; }

  @keyframes fillBar { from{width:0} to{width:var(--target-width)} }
  .progress-fill { height:100%; border-radius:99px; animation:fillBar 1.2s ease forwards; animation-delay:0.3s; width:0; }

  @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
  .confetti-piece { position:fixed; width:10px; height:10px; border-radius:2px; animation:confettiFall linear forwards; pointer-events:none; z-index:9999; }

  .journey-line { position:absolute; left:22px; top:40px; bottom:0; width:2px; background:linear-gradient(to bottom,#C8FF4E,rgba(200,255,78,0.1)); }

  .tab-bar { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:430px; background:rgba(11,26,16,0.92); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-around; padding:10px 0 calc(10px + env(safe-area-inset-bottom)); z-index:100; }
  .tab-item { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:4px 12px; border-radius:12px; transition:all 0.2s; border:none; background:none; color:rgba(232,245,233,0.4); font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:500; }
  .tab-item.active { color:#C8FF4E; }
  .tab-item:hover { background:rgba(255,255,255,0.05); }
  .tab-icon { font-size:20px; line-height:1; }
  .scan-tab-btn { width:60px; height:60px; border-radius:50%; background:#C8FF4E; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:26px; margin-top:-18px; box-shadow:0 4px 20px rgba(200,255,78,0.5); transition:transform 0.15s,box-shadow 0.15s; flex-shrink:0; }
  .scan-tab-btn:hover  { transform:scale(1.08); box-shadow:0 6px 28px rgba(200,255,78,0.65); }
  .scan-tab-btn:active { transform:scale(0.95); }

  .scroll-area { height:calc(100dvh - 72px); overflow-y:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
  .scroll-area::-webkit-scrollbar { display:none; }

  @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  .pop-in { animation:popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  @keyframes dotPulse { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }
  .dot { animation:dotPulse 1.4s ease-in-out infinite; }
  .dot:nth-child(2) { animation-delay:0.2s; }
  .dot:nth-child(3) { animation-delay:0.4s; }

  @keyframes bounceIn { 0%{transform:scale(0.3) translateY(40px);opacity:0} 60%{transform:scale(1.15);opacity:1} 80%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
  .bounce-in { animation:bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  @keyframes notifPop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .notif-dot { animation:notifPop 0.3s ease forwards; }
  @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  .slide-down { animation:slideDown 0.25s ease forwards; }

  @keyframes sensorWave { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
  .sensor-wave { position:absolute; border-radius:50%; border:2px solid #C8FF4E; animation:sensorWave 1.8s ease-out infinite; }
`;

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 48 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${1.5 + Math.random() * 2}s`,
    color: ["#C8FF4E", "#66BB6A", "#4FC3F7", "#FFA726", "#F48FB1", "#CE93D8"][
      i % 6
    ],
    size: `${8 + Math.random() * 8}px`,
  }));
  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: "-10px",
            background: p.color,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function OnboardingScreen({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext(email);
    }, 1400);
  };
  return (
    <div
      className="screen"
      style={{ padding: "0 24px", justifyContent: "center", gap: 32 }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(200,255,78,0.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(102,187,106,0.1) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="fade-up" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "linear-gradient(135deg,#1E3D2A,#2D5A3D)",
            border: "1px solid rgba(200,255,78,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 20px",
          }}
        >
          ♻️
        </div>
        <h1
          style={{
            fontFamily: "Syne",
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Green<span style={{ color: "#C8FF4E" }}>Loop</span>
        </h1>
        <p
          style={{
            color: "rgba(232,245,233,0.55)",
            marginTop: 10,
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          AI-powered waste sorting for
          <br />a smarter campus.
        </p>
      </div>
      <div className="glass-card fade-up delay-2" style={{ padding: 28 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "rgba(232,245,233,0.5)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Sign in with university email
        </p>
        <input
          className="input-field"
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          style={{ marginBottom: 16 }}
        />
        <button className="btn-primary" onClick={go} disabled={loading}>
          {loading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span
                className="spin"
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #0B1A10",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              Verifying…
            </span>
          ) : (
            "Continue →"
          )}
        </button>
      </div>
      <p
        className="fade-up delay-3"
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "rgba(232,245,233,0.3)",
        }}
      >
        By continuing you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}

// ─── Role Screen ──────────────────────────────────────────────────────────────
function RoleScreen({
  email,
  onNext,
}: {
  email: string;
  onNext: (role: UserRole) => void;
}) {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const roles: { id: UserRole; emoji: string; title: string; desc: string }[] =
    [
      {
        id: "student",
        emoji: "🎓",
        title: "Student",
        desc: "Track your personal impact & earn rewards",
      },
      {
        id: "staff",
        emoji: "🏢",
        title: "Staff",
        desc: "Manage campus bins and get full-bin alerts",
      },
      {
        id: "professor",
        emoji: "📖",
        title: "Professor",
        desc: "Engage your class with sustainability data",
      },
    ];
  return (
    <div className="screen" style={{ padding: "60px 24px 40px", gap: 24 }}>
      <div className="fade-up">
        <p
          style={{
            color: "#C8FF4E",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          WELCOME
        </p>
        <h2
          style={{
            fontFamily: "Syne",
            fontSize: 28,
            fontWeight: 800,
            marginTop: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Who are you?
        </h2>
        <p
          style={{ color: "rgba(232,245,233,0.5)", marginTop: 8, fontSize: 14 }}
        >
          Signed in as <span style={{ color: "#C8FF4E" }}>{email}</span>
        </p>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}
      >
        {roles.map((r, i) => (
          <button
            key={r.id}
            className={`glass-card fade-up delay-${i + 1}`}
            onClick={() => setSelected(r.id)}
            style={{
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              border: "1px solid",
              borderColor:
                selected === r.id ? "#C8FF4E" : "rgba(255,255,255,0.1)",
              background:
                selected === r.id
                  ? "rgba(200,255,78,0.08)"
                  : "rgba(255,255,255,0.04)",
              transition: "all 0.2s",
              width: "100%",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 32 }}>{r.emoji}</span>
            <div>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>
                {r.title}
              </p>
              <p
                style={{
                  color: "rgba(232,245,233,0.5)",
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {r.desc}
              </p>
            </div>
            {selected === r.id && (
              <span
                style={{ marginLeft: "auto", color: "#C8FF4E", fontSize: 20 }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
      <button
        className="btn-primary fade-up delay-4"
        onClick={() => selected && onNext(selected)}
        style={{ opacity: selected ? 1 : 0.4 }}
      >
        Let's Go →
      </button>
    </div>
  );
}

// ─── Staff Bell ───────────────────────────────────────────────────────────────
function StaffNotificationBell() {
  const [open, setOpen] = useState(false);
  const urgentCount = STAFF_ALERTS.filter((a) => a.urgent).length;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: open ? "rgba(200,255,78,0.15)" : "rgba(255,255,255,0.07)",
          border:
            "1px solid " +
            (open ? "rgba(200,255,78,0.4)" : "rgba(255,255,255,0.12)"),
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          position: "relative",
          transition: "all 0.2s",
        }}
      >
        🔔
        {urgentCount > 0 && (
          <span
            className="notif-dot"
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FF5252",
              border: "2px solid #0B1A10",
            }}
          />
        )}
      </button>
      {open && (
        <div
          className="slide-down glass-card"
          style={{
            position: "absolute",
            top: 50,
            right: 0,
            width: 280,
            zIndex: 200,
            padding: 16,
            background: "rgba(10,24,14,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          }}
        >
          <p
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 12,
              color: "rgba(232,245,233,0.7)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Bin Alerts
          </p>
          {STAFF_ALERTS.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 0",
                borderBottom:
                  i < STAFF_ALERTS.length - 1
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: `${a.color}22`,
                  border: `1px solid ${a.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{a.bin} Bin</p>
                  {a.urgent && (
                    <span
                      style={{
                        fontSize: 10,
                        background: "#FF5252",
                        color: "#fff",
                        borderRadius: 4,
                        padding: "1px 5px",
                        fontWeight: 700,
                      }}
                    >
                      FULL
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(232,245,233,0.5)",
                    marginTop: 2,
                  }}
                >
                  📍 {a.location}
                </p>
              </div>
            </div>
          ))}
          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "8px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "rgba(232,245,233,0.5)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({
  email,
  role,
  stats,
  onScan,
}: {
  email: string;
  role: UserRole;
  stats: StatsState;
  onScan: () => void;
}) {
  const name = email
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const campusPct = 73;
  return (
    <div
      className="scroll-area"
      style={{
        padding: "56px 20px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ color: "rgba(232,245,233,0.5)", fontSize: 13 }}>
            Good morning,
          </p>
          <h2
            style={{
              fontFamily: "Syne",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginTop: 2,
            }}
          >
            {name}{" "}
            {role === "staff" ? "🏢" : role === "professor" ? "📖" : "👋"}
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {role === "staff" && <StaffNotificationBell />}
          <div
            className="glass-card"
            style={{
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>🔥</span>
            <span
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                color: "#C8FF4E",
                fontSize: 16,
              }}
            >
              {stats.streak}
            </span>
            <span style={{ fontSize: 11, color: "rgba(232,245,233,0.5)" }}>
              streak
            </span>
          </div>
        </div>
      </div>

      {/* Points card */}
      <div
        className="glass-card fade-up delay-1"
        style={{
          padding: 24,
          background:
            "linear-gradient(135deg,rgba(200,255,78,0.12),rgba(102,187,106,0.06))",
          border: "1px solid rgba(200,255,78,0.25)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(232,245,233,0.5)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Your Points
        </p>
        <p
          style={{
            fontFamily: "Syne",
            fontSize: 52,
            fontWeight: 800,
            color: "#C8FF4E",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginTop: 4,
          }}
        >
          {stats.points}
        </p>
        <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
          {[
            { label: "Items sorted", val: stats.items },
            { label: "CO₂ saved", val: `${stats.co2.toFixed(2)} kg` },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>
                {s.val}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(232,245,233,0.5)",
                  marginTop: 2,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div
        className="fade-up delay-2"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        {[
          { icon: "🏫", label: "Campus rank", val: "#12" },
          { icon: "📦", label: "This week", val: `${stats.items} items` },
          {
            icon: "🌲",
            label: "Trees equiv.",
            val: `${(stats.co2 / 21).toFixed(2)}`,
          },
          {
            icon: "💧",
            label: "Water saved",
            val: `${(stats.co2 * 40).toFixed(0)}L`,
          },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: 16 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: 20,
                marginTop: 8,
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(232,245,233,0.5)",
                marginTop: 2,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Campus progress */}
      <div className="glass-card fade-up delay-3" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <p style={{ fontFamily: "Syne", fontWeight: 700 }}>Campus Goal</p>
          <p style={{ color: "#C8FF4E", fontWeight: 600, fontSize: 14 }}>
            {campusPct}%
          </p>
        </div>
        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            className="progress-fill"
            style={{
              background: "linear-gradient(90deg,#66BB6A,#C8FF4E)",
              ["--target-width" as string]: `${campusPct}%`,
            }}
          />
        </div>
        <p
          style={{
            fontSize: 12,
            color: "rgba(232,245,233,0.45)",
            marginTop: 10,
          }}
        >
          1,284 kg of waste correctly sorted this month · Goal: 1,750 kg
        </p>
      </div>

      {/* Staff urgent panel */}
      {role === "staff" && (
        <div
          className="glass-card fade-up delay-3"
          style={{
            padding: 20,
            border: "1px solid rgba(255,82,82,0.25)",
            background: "rgba(255,82,82,0.04)",
          }}
        >
          <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>
            🔴 &nbsp;Bins Needing Attention
          </p>
          {STAFF_ALERTS.filter((a) => a.urgent).map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom:
                  i < 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>
                  {a.bin} Bin — FULL
                </p>
                <p style={{ fontSize: 12, color: "rgba(232,245,233,0.5)" }}>
                  📍 {a.location}
                </p>
              </div>
              <span
                style={{
                  fontSize: 10,
                  background: "#FF5252",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontWeight: 700,
                }}
              >
                URGENT
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Scan CTA */}
      <button
        className="btn-primary fade-up delay-4"
        onClick={onScan}
        style={{
          padding: "20px",
          fontSize: 17,
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(200,255,78,0.4)",
        }}
      >
        📷 &nbsp; Scan Waste Item
      </button>

      {/* Recent activity */}
      <div className="fade-up delay-5">
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>
          Recent Activity
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ITEMS.slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(232,245,233,0.5)",
                    marginTop: 1,
                  }}
                >
                  → {item.bin} bin ·{" "}
                  {i === 0 ? "Just now" : `${i * 2 + 1}h ago`}
                </p>
              </div>
              <span style={{ color: "#C8FF4E", fontWeight: 700, fontSize: 14 }}>
                +{item.pts}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ["Scan Bin QR", "Scan Item", "Confirm", "Throw"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "20px 24px 0",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
      }}
    >
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  i < current
                    ? "#C8FF4E"
                    : i === current
                      ? "rgba(200,255,78,0.3)"
                      : "rgba(255,255,255,0.1)",
                color:
                  i < current
                    ? "#0B1A10"
                    : i === current
                      ? "#C8FF4E"
                      : "rgba(232,245,233,0.3)",
                border: i === current ? "1px solid #C8FF4E" : "none",
                transition: "all 0.3s",
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <p
              style={{
                fontSize: 9,
                color: i === current ? "#C8FF4E" : "rgba(232,245,233,0.3)",
                whiteSpace: "nowrap",
                fontWeight: i === current ? 600 : 400,
              }}
            >
              {s}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: 28,
                height: 1,
                marginBottom: 14,
                background: i < current ? "#C8FF4E" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Corner Brackets ─────────────────────────────────────────────────────────
function CornerBrackets({ color = "#C8FF4E" }: { color?: string }) {
  return (
    <>
      {[
        ["0", "0", "auto", "auto"],
        ["0", "auto", "auto", "0"],
        ["auto", "0", "0", "auto"],
        ["auto", "auto", "0", "0"],
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: pos[0] !== "auto" ? 0 : "auto",
            right: pos[1] !== "auto" ? 0 : "auto",
            bottom: pos[2] !== "auto" ? 0 : "auto",
            left: pos[3] !== "auto" ? 0 : "auto",
            width: 28,
            height: 28,
            borderTop: i < 2 ? `3px solid ${color}` : "none",
            borderBottom: i >= 2 ? `3px solid ${color}` : "none",
            borderLeft: [0, 2].includes(i) ? `3px solid ${color}` : "none",
            borderRight: [1, 3].includes(i) ? `3px solid ${color}` : "none",
          }}
        />
      ))}
    </>
  );
}

// ─── Scan Screen ─────────────────────────────────────────────────────────────
function ScanScreen({
  onDone,
  onBack,
}: {
  onDone: (item: (typeof ITEMS)[0]) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<ScanPhase>("qr_scan");
  const [item] = useState(
    () => ITEMS[Math.floor(Math.random() * ITEMS.length)],
  );
  const [analyzeLabel, setAnalyzeLabel] = useState("Detecting waste item");
  const [throwProgress, setThrowProgress] = useState(0);

  useEffect(() => {
    if (phase === "qr_scan") {
      const t = setTimeout(() => setPhase("qr_done"), 2800);
      return () => clearTimeout(t);
    }
    if (phase === "qr_done") {
      const t = setTimeout(() => setPhase("item_scan"), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "item_scan") {
      const labels = [
        "Detecting waste item",
        "Identifying material",
        "Checking database",
        "Suggesting disposal",
      ];
      let idx = 0;
      const t1 = setTimeout(() => {
        setPhase("item_analyzing");
        const iv = setInterval(() => {
          idx++;
          if (idx < labels.length) setAnalyzeLabel(labels[idx]);
          else clearInterval(iv);
        }, 600);
      }, 2500);
      const t2 = setTimeout(() => setPhase("result"), 5200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (phase === "throwing") {
      let p = 0;
      const iv = setInterval(() => {
        p += 4;
        setThrowProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(iv);
          setPhase("success");
        }
      }, 60);
      return () => clearInterval(iv);
    }
  }, [phase]);

  const backBtn = (
    <button
      onClick={onBack}
      style={{
        position: "absolute",
        top: 52,
        left: 20,
        zIndex: 10,
        background: "rgba(255,255,255,0.1)",
        border: "none",
        borderRadius: 12,
        padding: "8px 14px",
        color: "#E8F5E9",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      ← Back
    </button>
  );

  // QR SCAN
  if (phase === "qr_scan" || phase === "qr_done") {
    return (
      <div
        className="screen"
        style={{ background: "#050E08", position: "relative" }}
      >
        {backBtn}
        <StepBar current={0} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "70%",
              aspectRatio: "1/1",
              position: "relative",
              border: `2px solid ${phase === "qr_done" ? "#C8FF4E" : "rgba(255,255,255,0.4)"}`,
              borderRadius: 20,
              overflow: "hidden",
              background: "linear-gradient(145deg,#0D1A12,#0A1410)",
              transition: "border-color 0.4s, box-shadow 0.4s",
              boxShadow:
                phase === "qr_done" ? "0 0 30px rgba(200,255,78,0.3)" : "none",
            }}
          >
            <CornerBrackets
              color={phase === "qr_done" ? "#C8FF4E" : "#ffffff"}
            />
            {phase === "qr_scan" && <div className="qr-beam" />}
            {/* Fake QR pattern */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 4,
                width: 90,
                opacity: phase === "qr_done" ? 0.6 : 0.2,
                transition: "opacity 0.4s",
              }}
            >
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 2,
                    background: [
                      0, 1, 2, 5, 9, 10, 11, 12, 13, 15, 19, 20, 22, 23, 24,
                    ].includes(i)
                      ? phase === "qr_done"
                        ? "#C8FF4E"
                        : "#fff"
                      : "transparent",
                  }}
                />
              ))}
            </div>
            {phase === "qr_done" && (
              <div
                className="pop-in"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(200,255,78,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#C8FF4E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  ✓
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "16px 24px 60px", textAlign: "center" }}>
          <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20 }}>
            {phase === "qr_done" ? "Bin QR Verified ✓" : "Scan Bin QR Code"}
          </p>
          <p
            style={{
              color: "rgba(232,245,233,0.5)",
              marginTop: 8,
              fontSize: 14,
            }}
          >
            {phase === "qr_done"
              ? "Recycling bin · Tower 3, Floor 2 — linked"
              : "Point the camera at the QR label on the bin"}
          </p>
        </div>
      </div>
    );
  }

  // ITEM SCAN
  if (phase === "item_scan" || phase === "item_analyzing") {
    return (
      <div
        className="screen"
        style={{ background: "#050E08", position: "relative" }}
      >
        {backBtn}
        <StepBar current={1} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "80%",
              aspectRatio: "3/4",
              position: "relative",
              border: "2px solid rgba(200,255,78,0.5)",
              borderRadius: 20,
              overflow: "hidden",
              background: "linear-gradient(145deg,#0D2018,#0A1810)",
            }}
          >
            <CornerBrackets />
            {phase === "item_scan" && <div className="scan-beam" />}
            {phase === "item_analyzing" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10,26,16,0.7)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="pulse-ring"
                    style={{ width: 60, height: 60 }}
                  />
                  <div
                    className="pulse-ring"
                    style={{ width: 60, height: 60, animationDelay: "0.5s" }}
                  />
                  <span style={{ fontSize: 30 }}>🔍</span>
                </div>
                <p
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 700,
                    color: "#C8FF4E",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {analyzeLabel}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="dot"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#C8FF4E",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontSize: 72,
                opacity: 0.25,
                filter: "blur(2px)",
              }}
            >
              {item.emoji}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px 60px", textAlign: "center" }}>
          <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20 }}>
            {phase === "item_scan" ? "Point at waste item" : "AI Analysing…"}
          </p>
          <p
            style={{
              color: "rgba(232,245,233,0.5)",
              marginTop: 8,
              fontSize: 14,
            }}
          >
            {phase === "item_scan"
              ? "Keep the item centred in the frame"
              : analyzeLabel + "…"}
          </p>
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === "result") {
    return (
      <div
        className="screen"
        style={{
          padding: "80px 24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <StepBar current={2} />
        <div
          className="pop-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#C8FF4E,#66BB6A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🤖
          </div>
          <div>
            <p style={{ fontFamily: "Syne", fontWeight: 700 }}>AI Verified</p>
            <p style={{ fontSize: 12, color: "rgba(232,245,233,0.5)" }}>
              98.3% confidence
            </p>
          </div>
        </div>
        <div
          className="glass-card pop-in"
          style={{
            padding: 22,
            textAlign: "center",
            border: `1px solid ${item.binColor}40`,
          }}
        >
          <p style={{ fontSize: 56 }}>{item.emoji}</p>
          <h2
            style={{
              fontFamily: "Syne",
              fontSize: 24,
              fontWeight: 800,
              marginTop: 8,
              letterSpacing: "-0.02em",
            }}
          >
            {item.name}
          </h2>
        </div>
        <div
          className="fade-up delay-1"
          style={{
            borderRadius: 20,
            padding: 18,
            background: `${item.binColor}18`,
            border: `1px solid ${item.binColor}50`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: item.binColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            🗑️
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                color: "rgba(232,245,233,0.5)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Place in
            </p>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 22,
                color: item.binColor,
                letterSpacing: "-0.02em",
              }}
            >
              {item.bin} Bin
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(232,245,233,0.6)",
                marginTop: 2,
              }}
            >
              💡 {item.tip}
            </p>
          </div>
        </div>
        <div
          className="fade-up delay-2"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div
            className="glass-card"
            style={{ padding: 14, textAlign: "center" }}
          >
            <p style={{ fontSize: 22 }}>🌍</p>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: 18,
                marginTop: 4,
              }}
            >
              {item.co2} kg
            </p>
            <p style={{ fontSize: 11, color: "rgba(232,245,233,0.5)" }}>
              CO₂ saved
            </p>
          </div>
          <div
            className="glass-card"
            style={{ padding: 14, textAlign: "center" }}
          >
            <p style={{ fontSize: 22 }}>⭐</p>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: 18,
                color: "#C8FF4E",
                marginTop: 4,
              }}
            >
              +{item.pts}
            </p>
            <p style={{ fontSize: 11, color: "rgba(232,245,233,0.5)" }}>
              points
            </p>
          </div>
        </div>
        <button
          className="btn-primary fade-up delay-3"
          onClick={() => setPhase("throwing")}
          style={{ marginTop: "auto" }}
        >
          ✅ &nbsp; I've Thrown the Item
        </button>
      </div>
    );
  }

  // THROWING — sensor loading
  if (phase === "throwing") {
    return (
      <div
        className="screen"
        style={{
          background: "#050E08",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: 32,
        }}
      >
        <StepBar current={3} />
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="sensor-wave" style={{ width: 80, height: 80 }} />
          <div
            className="sensor-wave"
            style={{ width: 80, height: 80, animationDelay: "0.6s" }}
          />
          <div
            className="sensor-wave"
            style={{ width: 80, height: 80, animationDelay: "1.2s" }}
          />
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#1E3D2A,#2D5A3D)",
              border: "2px solid rgba(200,255,78,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              zIndex: 1,
            }}
          >
            📡
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.02em",
            }}
          >
            Detecting throw…
          </p>
          <p
            style={{
              color: "rgba(232,245,233,0.5)",
              marginTop: 8,
              fontSize: 14,
            }}
          >
            Bin sensor is waiting to detect the item
          </p>
        </div>
        <div style={{ width: "100%", maxWidth: 300 }}>
          <div
            style={{
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: "linear-gradient(90deg,#66BB6A,#C8FF4E)",
                width: `${throwProgress}%`,
                transition: "width 0.06s linear",
              }}
            />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: 12,
              color: "rgba(232,245,233,0.4)",
            }}
          >
            {throwProgress < 40
              ? "Listening for impact…"
              : throwProgress < 80
                ? "Impact detected…"
                : "Verifying…"}
          </p>
        </div>
      </div>
    );
  }

  // SUCCESS
  return (
    <div
      className="screen"
      style={{
        background: "#050E08",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 32,
      }}
    >
      <div
        className="bounce-in"
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#C8FF4E,#66BB6A)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 50,
          boxShadow: "0 0 40px rgba(200,255,78,0.5)",
        }}
      >
        ✅
      </div>
      <div className="fade-up" style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "-0.02em",
            color: "#C8FF4E",
          }}
        >
          Throw Successful!
        </p>
        <p
          style={{ color: "rgba(232,245,233,0.6)", marginTop: 8, fontSize: 15 }}
        >
          Sensor confirmed: {item.name} detected in {item.bin} bin
        </p>
      </div>
      <div
        className="glass-card fade-up delay-1"
        style={{
          width: "100%",
          padding: 20,
          textAlign: "center",
          background: "rgba(200,255,78,0.07)",
          border: "1px solid rgba(200,255,78,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 32,
                color: "#C8FF4E",
              }}
            >
              +{item.pts}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(232,245,233,0.5)",
                marginTop: 2,
              }}
            >
              points earned
            </p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 32,
                color: "#66BB6A",
              }}
            >
              {item.co2}kg
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(232,245,233,0.5)",
                marginTop: 2,
              }}
            >
              CO₂ saved
            </p>
          </div>
        </div>
      </div>
      <button
        className="btn-primary fade-up delay-2"
        onClick={() => onDone(item)}
        style={{ width: "100%" }}
      >
        Done 🎉
      </button>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ stats }: { stats: StatsState }) {
  const weeks = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const barData = [4, 7, 3, 8, 6, 5, stats.items > 5 ? stats.items : 9];
  const max = Math.max(...barData);
  const breakdown = [
    { label: "Recycling", pct: 42, color: "#4FC3F7" },
    { label: "Organic", pct: 28, color: "#66BB6A" },
    { label: "Paper", pct: 18, color: "#FFA726" },
    { label: "Glass", pct: 7, color: "#AB47BC" },
    { label: "General", pct: 5, color: "#78909C" },
  ];
  return (
    <div
      className="scroll-area"
      style={{
        padding: "56px 20px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div className="fade-up">
        <p
          style={{
            color: "#C8FF4E",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          YOUR IMPACT
        </p>
        <h2
          style={{
            fontFamily: "Syne",
            fontSize: 28,
            fontWeight: 800,
            marginTop: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Dashboard
        </h2>
      </div>
      <div
        className="fade-up delay-1"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        {[
          {
            icon: "♻️",
            label: "Items Sorted",
            val: stats.items,
            unit: "total",
          },
          {
            icon: "🌿",
            label: "CO₂ Saved",
            val: `${stats.co2.toFixed(2)}`,
            unit: "kg",
          },
          {
            icon: "⭐",
            label: "Points Earned",
            val: stats.points,
            unit: "pts",
          },
          { icon: "🔥", label: "Day Streak", val: stats.streak, unit: "days" },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: 18 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 24,
                marginTop: 8,
                color: "#C8FF4E",
                letterSpacing: "-0.02em",
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(232,245,233,0.5)",
                marginTop: 1,
              }}
            >
              {s.label} · {s.unit}
            </p>
          </div>
        ))}
      </div>
      <div className="glass-card fade-up delay-2" style={{ padding: 20 }}>
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 16 }}>
          Weekly Sorting Activity
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            height: 80,
          }}
        >
          {barData.map((val, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${(val / max) * 72}px`,
                  borderRadius: "6px 6px 0 0",
                  background: i === 6 ? "#C8FF4E" : "rgba(200,255,78,0.3)",
                }}
              />
              <span style={{ fontSize: 10, color: "rgba(232,245,233,0.4)" }}>
                {weeks[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card fade-up delay-3" style={{ padding: 20 }}>
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 16 }}>
          Waste Breakdown
        </p>
        {breakdown.map((b) => (
          <div key={b.label} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
                fontSize: 13,
              }}
            >
              <span style={{ color: "rgba(232,245,233,0.75)" }}>{b.label}</span>
              <span style={{ color: b.color, fontWeight: 600 }}>{b.pct}%</span>
            </div>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                className="progress-fill"
                style={{
                  background: b.color,
                  ["--target-width" as string]: `${b.pct}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card fade-up delay-4" style={{ padding: 20 }}>
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 4 }}>
          Department Leaderboard
        </p>
        <p
          style={{
            fontSize: 12,
            color: "rgba(232,245,233,0.45)",
            marginBottom: 14,
          }}
        >
          Your department ranking
        </p>
        {["Engineering", "Business", "Sciences", "Arts", "Medicine"].map(
          (dept, i) => (
            <div
              key={dept}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom:
                  i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: 18,
                  width: 28,
                  color: i < 3 ? "#C8FF4E" : "rgba(232,245,233,0.4)",
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1, fontSize: 14 }}>{dept}</span>
              <span style={{ fontSize: 13, color: "rgba(232,245,233,0.6)" }}>
                {[1284, 1102, 986, 741, 498][i]} kg
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ─── Journey Tab ──────────────────────────────────────────────────────────────
function JourneyTab() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActiveStep((s) => (s + 1) % JOURNEY_STEPS.length),
      2000,
    );
    return () => clearInterval(t);
  }, []);

  const partners = [
    { name: "EcoSort GmbH", type: "Processing", icon: "🏭" },
    { name: "Green Loop Co.", type: "Upcycling", icon: "♻️" },
    { name: "City Composters", type: "Organic", icon: "🌱" },
    { name: "Replas Ltd.", type: "Plastics", icon: "🧴" },
  ];

  const maxKg = CAMPUS_LEADERBOARD[0].kg;

  return (
    <div
      className="scroll-area"
      style={{
        padding: "56px 20px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div className="fade-up">
        <p
          style={{
            color: "#C8FF4E",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          TRANSPARENCY
        </p>
        <h2
          style={{
            fontFamily: "Syne",
            fontSize: 28,
            fontWeight: 800,
            marginTop: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Waste Journey
        </h2>
        <p
          style={{ color: "rgba(232,245,233,0.5)", fontSize: 14, marginTop: 6 }}
        >
          See what happens after you sort correctly.
        </p>
      </div>

      {/* Timeline */}
      <div
        className="fade-up delay-1"
        style={{ position: "relative", paddingLeft: 52 }}
      >
        <div className="journey-line" />
        {JOURNEY_STEPS.map((step, i) => (
          <div
            key={i}
            onClick={() => setActiveStep(i)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: i < JOURNEY_STEPS.length - 1 ? 24 : 0,
              cursor: "pointer",
              transition: "opacity 0.3s",
              opacity: activeStep === i ? 1 : 0.55,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background:
                  activeStep === i
                    ? "linear-gradient(135deg,#C8FF4E,#66BB6A)"
                    : "rgba(255,255,255,0.07)",
                border:
                  activeStep === i ? "none" : "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
                transition: "background 0.3s",
                boxShadow:
                  activeStep === i ? "0 0 20px rgba(200,255,78,0.4)" : "none",
              }}
            >
              {step.icon}
            </div>
            <div style={{ flex: 1, paddingTop: 8 }}>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
                {step.title}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(232,245,233,0.55)",
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* IE Campus Leaderboard */}
      <div className="glass-card fade-up delay-2" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 22 }}>🏫</span>
          <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 17 }}>
            IE Campus Leaderboard
          </p>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "rgba(232,245,233,0.45)",
            marginBottom: 16,
          }}
        >
          Total recycled this semester (kg)
        </p>
        {CAMPUS_LEADERBOARD.map((campus, i) => (
          <div key={campus.name} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: 16,
                  width: 22,
                  color:
                    i === 0
                      ? "#FFD700"
                      : i === 1
                        ? "#C0C0C0"
                        : i === 2
                          ? "#CD7F32"
                          : "rgba(232,245,233,0.4)",
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 18 }}>{campus.flag}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
                {campus.name}
              </span>
              <span
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: 14,
                  color: i === 0 ? "#C8FF4E" : "rgba(232,245,233,0.7)",
                }}
              >
                {campus.kg.toLocaleString()} kg
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                className="progress-fill"
                style={{
                  background:
                    i === 0
                      ? "linear-gradient(90deg,#66BB6A,#C8FF4E)"
                      : i === 1
                        ? "#4FC3F7"
                        : i === 2
                          ? "#FFA726"
                          : "rgba(200,255,78,0.3)",
                  ["--target-width" as string]: `${(campus.kg / maxKg) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Partners */}
      <div className="fade-up delay-3">
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>
          Recycling Partners
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {partners.map((p) => (
            <div key={p.name} className="glass-card" style={{ padding: 16 }}>
              <span style={{ fontSize: 28 }}>{p.icon}</span>
              <p style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>
                {p.name}
              </p>
              <p style={{ fontSize: 12, color: "#C8FF4E", marginTop: 2 }}>
                {p.type}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Last item tracked */}
      <div
        className="glass-card fade-up delay-4"
        style={{
          padding: 18,
          background: "rgba(200,255,78,0.06)",
          border: "1px solid rgba(200,255,78,0.2)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(232,245,233,0.5)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Last item tracked
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 36 }}>🍶</span>
          <div>
            <p style={{ fontFamily: "Syne", fontWeight: 700 }}>
              Plastic Bottle
            </p>
            <p style={{ fontSize: 13, color: "#66BB6A", marginTop: 2 }}>
              📍 Currently at: Processing Facility
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rewards Tab ──────────────────────────────────────────────────────────────
function RewardsTab({ stats, role }: { stats: StatsState; role: UserRole }) {
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const rewards = role === "professor" ? PROFESSOR_REWARDS : STUDENT_REWARDS;

  const handleRedeem = (name: string, pts: number) => {
    if (stats.points < pts || redeemed.has(name)) return;
    setRedeeming(name);
    setTimeout(() => {
      setRedeeming(null);
      setRedeemed((s) => new Set([...s, name]));
    }, 1500);
  };

  return (
    <div
      className="scroll-area"
      style={{
        padding: "56px 20px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div className="fade-up">
        <p
          style={{
            color: "#C8FF4E",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          REWARDS
        </p>
        <h2
          style={{
            fontFamily: "Syne",
            fontSize: 28,
            fontWeight: 800,
            marginTop: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Your Points
        </h2>
        {role === "professor" && (
          <p
            style={{
              fontSize: 13,
              color: "rgba(232,245,233,0.5)",
              marginTop: 6,
            }}
          >
            📖 Professor perks — mobility & coffee
          </p>
        )}
      </div>

      {/* Balance */}
      <div
        className="glass-card fade-up delay-1"
        style={{
          padding: 24,
          textAlign: "center",
          background:
            "linear-gradient(135deg,rgba(200,255,78,0.12),rgba(102,187,106,0.06))",
          border: "1px solid rgba(200,255,78,0.25)",
        }}
      >
        <p
          style={{
            fontFamily: "Syne",
            fontSize: 64,
            fontWeight: 800,
            color: "#C8FF4E",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {stats.points}
        </p>
        <p style={{ color: "rgba(232,245,233,0.55)", marginTop: 6 }}>
          Available Points
        </p>
      </div>

      {/* Rewards list */}
      <div className="fade-up delay-2">
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>
          Redeem Rewards
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rewards.map((r) => {
            const canAfford = stats.points >= r.pts;
            const isRedeemed = redeemed.has(r.name);
            const isLoading = redeeming === r.name;
            return (
              <div
                key={r.name}
                className="glass-card"
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: !canAfford && !isRedeemed ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 32 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</p>
                  <p style={{ fontSize: 12, color: "#C8FF4E", marginTop: 2 }}>
                    {r.pts} pts
                  </p>
                </div>
                <button
                  onClick={() => handleRedeem(r.name, r.pts)}
                  disabled={!canAfford || isRedeemed || !!isLoading}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: isRedeemed
                      ? "#1E3D2A"
                      : canAfford
                        ? "#C8FF4E"
                        : "rgba(255,255,255,0.08)",
                    color: isRedeemed
                      ? "#66BB6A"
                      : canAfford
                        ? "#0B1A10"
                        : "rgba(232,245,233,0.4)",
                    fontFamily: "Syne",
                    fontWeight: 700,
                    fontSize: 13,
                    transition: "all 0.2s",
                  }}
                >
                  {isLoading
                    ? "…"
                    : isRedeemed
                      ? "✓ Done"
                      : canAfford
                        ? "Redeem"
                        : "Locked"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="fade-up delay-3">
        <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>
          Badges
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
          }}
        >
          {BADGES.map((b) => (
            <div
              key={b.name}
              className="glass-card"
              style={{
                padding: 16,
                textAlign: "center",
                border: b.earned
                  ? "1px solid rgba(200,255,78,0.35)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: b.earned
                  ? "rgba(200,255,78,0.07)"
                  : "rgba(255,255,255,0.03)",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  filter: b.earned ? "none" : "grayscale(1) opacity(0.4)",
                }}
              >
                {b.icon}
              </span>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 8,
                  color: b.earned ? "#E8F5E9" : "rgba(232,245,233,0.35)",
                }}
              >
                {b.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Interface ──────────────────────────────────────────────────────────
interface StatsState {
  points: number;
  co2: number;
  items: number;
  streak: number;
}

// ─── Success Overlay ──────────────────────────────────────────────────────────
function SuccessOverlay({
  item,
  onClose,
}: {
  item: (typeof ITEMS)[0];
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="glass-card pop-in"
        style={{
          padding: 36,
          textAlign: "center",
          margin: 24,
          background: "rgba(14,40,22,0.95)",
          border: "1px solid rgba(200,255,78,0.4)",
        }}
      >
        <div style={{ fontSize: 64 }}>🎉</div>
        <h3
          style={{
            fontFamily: "Syne",
            fontSize: 26,
            fontWeight: 800,
            marginTop: 12,
            letterSpacing: "-0.02em",
          }}
        >
          Well done!
        </h3>
        <p
          style={{ color: "rgba(232,245,233,0.6)", marginTop: 8, fontSize: 15 }}
        >
          {item.name} correctly disposed
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 28,
                color: "#C8FF4E",
              }}
            >
              +{item.pts}
            </p>
            <p style={{ fontSize: 12, color: "rgba(232,245,233,0.5)" }}>
              points
            </p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: 28,
                color: "#66BB6A",
              }}
            >
              +{item.co2}kg
            </p>
            <p style={{ fontSize: 12, color: "rgba(232,245,233,0.5)" }}>
              CO₂ saved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>("onboarding");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [scanning, setScanning] = useState(false);
  const [successItem, setSuccessItem] = useState<(typeof ITEMS)[0] | null>(
    null,
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [stats, setStats] = useState<StatsState>({
    points: 240,
    co2: 1.24,
    items: 18,
    streak: 5,
  });

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const handleScanDone = useCallback((item: (typeof ITEMS)[0]) => {
    setScanning(false);
    setSuccessItem(item);
    setShowConfetti(true);
    setStats((s) => ({
      points: s.points + item.pts,
      co2: parseFloat((s.co2 + item.co2).toFixed(2)),
      items: s.items + 1,
      streak: s.streak,
    }));
    setTimeout(() => setShowConfetti(false), 3500);
  }, []);

  const handleSuccessClose = useCallback(() => {
    setSuccessItem(null);
    setActiveTab("home");
  }, []);

  if (appScreen === "onboarding")
    return (
      <OnboardingScreen
        onNext={(e) => {
          setEmail(e);
          setAppScreen("role");
        }}
      />
    );
  if (appScreen === "role")
    return (
      <RoleScreen
        email={email}
        onNext={(r) => {
          setRole(r);
          setAppScreen("main");
        }}
      />
    );
  if (scanning)
    return (
      <ScanScreen onDone={handleScanDone} onBack={() => setScanning(false)} />
    );

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: -100,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(200,255,78,0.06) 0%,transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(102,187,106,0.05) 0%,transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "calc(100dvh - 72px)",
          overflow: "hidden",
        }}
      >
        {activeTab === "home" && (
          <HomeTab
            email={email}
            role={role}
            stats={stats}
            onScan={() => setScanning(true)}
          />
        )}
        {activeTab === "dashboard" && <DashboardTab stats={stats} />}
        {activeTab === "journey" && <JourneyTab />}
        {activeTab === "rewards" && <RewardsTab stats={stats} role={role} />}
      </div>

      <nav className="tab-bar">
        {(["home", "dashboard"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-icon">{tab === "home" ? "🏠" : "📊"}</span>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button className="scan-tab-btn" onClick={() => setScanning(true)}>
          📷
        </button>
        {(["journey", "rewards"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-icon">{tab === "journey" ? "🗺️" : "🎁"}</span>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <Confetti active={showConfetti} />
      {successItem && (
        <SuccessOverlay item={successItem} onClose={handleSuccessClose} />
      )}
    </>
  );
}
