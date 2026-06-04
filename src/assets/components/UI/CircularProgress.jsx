const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getStrokeColor(pct) {
  if (pct >= 100) return "#639922";
  if (pct >= 60) return "#1D9E75";
  return "#378ADD";
}

export default function CircularProgress({ percent = 0, currentStep = "", size = 180 }) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  const scale = size / 180; // Coefficient pour adapter dynamiquement le contenu

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>

      {/* Anneau */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 180 180"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Fond : Gris fin et léger */}
          <circle
            cx="90" cy="90" r={RADIUS}
            fill="none"
            stroke="#e9ecef"
            strokeWidth="8"
          />
          {/* Progression */}
          <circle
            cx="90" cy="90" r={RADIUS}
            fill="none"
            stroke={getStrokeColor(percent)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.4s ease" }}
          />
        </svg>

        {/* Pourcentage au centre */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}>
          <span style={{ fontSize: 32 * scale, fontWeight: 500, lineHeight: 1, color: "var(--text-primary, #000)" }}>
            {Math.round(percent)}
          </span>
          <span style={{ fontSize: 13 * scale, color: "var(--text-secondary, #6c757d)" }}>%</span>
        </div>
      </div>

      {/* Étape en cours */}
      <p style={{
        fontSize: 14,
        color: "var(--text-secondary, #6c757d)",
        textAlign: "center",
        maxWidth: size * 1.5,
        minHeight: 18,
        margin: 0,
      }}>
        {currentStep || "En attente..."}
      </p>
    </div>
  );
}
