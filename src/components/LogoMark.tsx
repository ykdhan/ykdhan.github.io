/** The YK brand mark: gradient core orb, tilted orbit ring, orbiting node. */
export default function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="lm-ring"
          x1="10"
          y1="18"
          x2="54"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#9BE7FF" />
          <stop offset="1" stopColor="#B3A6FF" />
        </linearGradient>
        <radialGradient id="lm-core" cx="0.35" cy="0.28" r="1.05">
          <stop offset="0" stopColor="#D2F5FF" />
          <stop offset="0.5" stopColor="#9BE7FF" />
          <stop offset="1" stopColor="#7E68F4" />
        </radialGradient>
      </defs>
      <path
        d="M 52.55 22.85 A 22.5 8.2 -24 0 0 11.45 41.15"
        stroke="url(#lm-ring)"
        strokeWidth="3"
        opacity="0.4"
      />
      <circle cx="32" cy="32" r="10.5" fill="url(#lm-core)" />
      <path
        d="M 52.55 22.85 A 22.5 8.2 -24 0 1 11.45 41.15"
        stroke="url(#lm-ring)"
        strokeWidth="3"
      />
      <circle cx="15.87" cy="43.68" r="3.4" fill="#D2F5FF" />
    </svg>
  );
}
