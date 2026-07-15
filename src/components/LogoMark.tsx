/** The YK brand mark: a sharp four-point spark with the site gradient. */
export default function LogoMark({ size = 22 }: { size?: number }) {
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
          id="lm-spark"
          x1="12"
          y1="12"
          x2="52"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#9BE7FF" />
          <stop offset="1" stopColor="#B3A6FF" />
        </linearGradient>
      </defs>
      <path
        d="M32 11 C34.5 26.5 37.5 29.5 53 32 C37.5 34.5 34.5 37.5 32 53 C29.5 37.5 26.5 34.5 11 32 C26.5 29.5 29.5 26.5 32 11 Z"
        fill="url(#lm-spark)"
      />
    </svg>
  );
}
