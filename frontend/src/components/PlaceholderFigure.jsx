// A simple drawn character, used until the real art is ready.
// It still moves like stop-motion: each frame is nudged a tiny bit,
// the mouth opens and closes while talking, and the eyes blink.

const LOOKS = {
  tribe: {
    skin: "#8a5a3c",
    outline: "#4a2e1f",
    top: "#8a5a3c", // bare chest, same as skin
    legs: "#8a5a3c",
    hair: "#1c1410",
  },
  translator: {
    skin: "#c99570",
    outline: "#6b4630",
    top: "#d9a53a", // mustard hoodie
    legs: "#6b6b3a", // olive pants
    hair: "#2a1d15",
  },
};

// How far each arm turns from hanging straight down, in degrees.
// Positive turns the left arm outward; negative turns the right arm outward.
const ARMS = {
  idle: [10, -10],
  talking: [12, -125],
  welcome: [140, -140],
  pointing: [10, -92],
  laughing: [28, -28],
  confused: [10, -165],
  explaining: [10, -95], // points at the tribe member, who stands to the right
  listening: [10, -150],
};

// Tiny nudges, one per frame. Real stop-motion puppets never sit perfectly still.
const WOBBLE = [
  [0, 0, 0],
  [0.6, -0.5, 0.4],
  [-0.4, 0.3, -0.3],
];

function Arm({ side, angle, look }) {
  const shoulderX = side === "left" ? 66 : 134;
  const shoulderY = 112;
  return (
    <g transform={`rotate(${angle} ${shoulderX} ${shoulderY})`}>
      <rect
        x={shoulderX - 8}
        y={shoulderY}
        width="16"
        height="76"
        rx="8"
        fill={look.top}
        stroke={look.outline}
        strokeWidth="2"
      />
      <circle cx={shoulderX} cy={shoulderY + 80} r="10" fill={look.skin} stroke={look.outline} strokeWidth="2" />
    </g>
  );
}

export default function PlaceholderFigure({ who, pose, frame }) {
  const look = LOOKS[who];
  const [left, right] = ARMS[pose] ?? ARMS.idle;
  const [dx, dy, turn] = WOBBLE[frame % WOBBLE.length];
  const talking = pose === "talking" && frame % 2 === 0;
  const blinking = frame % 37 === 0;
  const tilt = pose === "laughing" ? -6 : pose === "confused" || pose === "listening" ? 6 : 0;

  return (
    <svg viewBox="0 0 200 300" className="h-full w-full overflow-visible">
      {/* Shadow on the ground */}
      <ellipse cx="100" cy="292" rx="52" ry="7" fill="#000" opacity="0.35" />

      <g transform={`translate(${dx} ${dy}) rotate(${turn} 100 290)`}>
        {/* Legs and feet */}
        <rect x="78" y="188" width="17" height="96" rx="8" fill={look.legs} stroke={look.outline} strokeWidth="2" />
        <rect x="105" y="188" width="17" height="96" rx="8" fill={look.legs} stroke={look.outline} strokeWidth="2" />
        {who === "translator" ? (
          <>
            <ellipse cx="84" cy="285" rx="14" ry="7" fill="#f2f2ee" stroke={look.outline} strokeWidth="2" />
            <ellipse cx="116" cy="285" rx="14" ry="7" fill="#f2f2ee" stroke={look.outline} strokeWidth="2" />
          </>
        ) : (
          <>
            <ellipse cx="84" cy="285" rx="12" ry="6" fill={look.skin} stroke={look.outline} strokeWidth="2" />
            <ellipse cx="116" cy="285" rx="12" ry="6" fill={look.skin} stroke={look.outline} strokeWidth="2" />
            {/* Vine bracelet */}
            <rect x="103" y="262" width="21" height="4" rx="2" fill="#4f7a3a" />
          </>
        )}

        {/* Body */}
        <rect x="62" y="100" width="76" height="100" rx="28" fill={look.top} stroke={look.outline} strokeWidth="2" />

        {who === "tribe" ? (
          <>
            {/* Moss-green wrap */}
            <path d="M60 172 L140 172 L150 236 L50 236 Z" fill="#5f7d3a" stroke="#34491f" strokeWidth="2" />
            <path d="M70 186 L130 186 M66 204 L134 204 M62 222 L138 222" stroke="#46612b" strokeWidth="2" />
            {/* Rust-orange sash */}
            <path d="M70 106 L84 102 L136 176 L122 182 Z" fill="#c8642c" stroke="#7d3b17" strokeWidth="2" />
            {/* Wooden beads */}
            <circle cx="88" cy="112" r="5" fill="#a97a4a" stroke="#5b3d21" strokeWidth="1.5" />
            <circle cx="100" cy="117" r="5" fill="#a97a4a" stroke="#5b3d21" strokeWidth="1.5" />
            <circle cx="112" cy="112" r="5" fill="#a97a4a" stroke="#5b3d21" strokeWidth="1.5" />
          </>
        ) : (
          <>
            {/* Hoodie pocket, strings, and bag strap */}
            <path d="M78 160 Q100 152 122 160 L118 184 Q100 180 82 184 Z" fill="#c8932c" stroke={look.outline} strokeWidth="1.5" />
            <path d="M94 106 L92 132 M106 106 L108 132" stroke="#f6f1e4" strokeWidth="2" strokeLinecap="round" />
            <path d="M72 108 L132 180" stroke="#6b4a2e" strokeWidth="5" strokeLinecap="round" />
            <rect x="124" y="172" width="22" height="18" rx="4" fill="#7a5433" stroke="#4a3120" strokeWidth="1.5" />
          </>
        )}

        <Arm side="left" angle={left} look={look} />
        <Arm side="right" angle={right} look={look} />

        {/* Head */}
        <g transform={`rotate(${tilt} 100 96)`}>
          <rect x="92" y="90" width="16" height="16" fill={look.skin} />
          <circle cx="100" cy="68" r="34" fill={look.skin} stroke={look.outline} strokeWidth="2" />

          {who === "tribe" ? (
            <>
              {/* Curly hair */}
              {[70, 82, 94, 106, 118, 130].map((x, i) => (
                <circle key={x} cx={x} cy={i % 2 ? 38 : 42} r="10" fill={look.hair} />
              ))}
              {/* Leaf behind the right ear */}
              <ellipse cx="136" cy="58" rx="6" ry="13" fill="#6fa04a" stroke="#3b5f25" strokeWidth="1.5" transform="rotate(25 136 58)" />
              {/* Three white dots under each eye */}
              {[82, 88, 94, 106, 112, 118].map((x) => (
                <circle key={x} cx={x} cy="80" r="1.8" fill="#f6f1e4" />
              ))}
            </>
          ) : (
            <>
              {/* Short neat hair */}
              <path d="M66 62 Q68 32 100 32 Q132 32 134 62 Q126 44 100 44 Q74 44 66 62 Z" fill={look.hair} />
              {/* Short beard */}
              <path d="M70 76 Q72 104 100 104 Q128 104 130 76 Q124 92 100 92 Q76 92 70 76 Z" fill={look.hair} opacity="0.85" />
              {/* Round glasses */}
              <circle cx="87" cy="66" r="10" fill="none" stroke="#111" strokeWidth="2" />
              <circle cx="113" cy="66" r="10" fill="none" stroke="#111" strokeWidth="2" />
              <path d="M97 66 L103 66" stroke="#111" strokeWidth="2" />
            </>
          )}

          {/* Eyes */}
          {blinking ? (
            <>
              <path d="M83 67 L91 67" stroke="#1a120c" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M109 67 L117 67" stroke="#1a120c" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="87" cy="67" r="5.5" fill="#fbf8f0" />
              <circle cx="113" cy="67" r="5.5" fill="#fbf8f0" />
              <circle cx="88" cy="67.5" r="3.2" fill="#1a120c" />
              <circle cx="114" cy="67.5" r="3.2" fill="#1a120c" />
            </>
          )}

          {/* Mouth */}
          {talking || pose === "laughing" ? (
            <ellipse cx="100" cy="86" rx="7" ry={pose === "laughing" ? 7 : 5} fill="#3a1a12" />
          ) : pose === "confused" ? (
            <path d="M92 87 Q100 83 108 88" stroke="#3a1a12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M90 84 Q100 92 110 84" stroke="#3a1a12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  );
}
