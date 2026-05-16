interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Plate circle */}
      <circle cx="24" cy="24" r="22" fill="#0d9488" />
      <circle cx="24" cy="24" r="18" fill="#14b8a6" />
      <circle cx="24" cy="24" r="14" fill="#0d9488" opacity="0.3" />

      {/* Fork (left) */}
      <g transform="translate(14, 10)">
        <rect x="0" y="0" width="2" height="18" rx="1" fill="white" />
        <rect x="0" y="0" width="2" height="7" rx="1" fill="white" />
        <rect x="3.5" y="0" width="2" height="7" rx="1" fill="white" />
        <rect x="1" y="6" width="4.5" height="2" rx="1" fill="white" />
        <rect x="2" y="6" width="2" height="14" rx="1" fill="white" />
      </g>

      {/* Knife (right) */}
      <g transform="translate(30, 10)">
        <rect x="1" y="4" width="2.5" height="16" rx="1.25" fill="white" />
        <path d="M1 4 C1 1.5 2.25 0 3.5 0 C3.5 0 3.5 4 3.5 4 Z" fill="white" />
      </g>

      {/* MP text */}
      <text
        x="24"
        y="27"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.5"
      >
        MP
      </text>
    </svg>
  );
}

/**
 * Generate a base64 data URI of the logo for embedding in PDFs.
 * Uses a simplified version without text rendering issues.
 */
export function getLogoDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="#0d9488"/>
    <circle cx="24" cy="24" r="18" fill="#14b8a6"/>
    <circle cx="24" cy="24" r="14" fill="#0d9488" opacity="0.3"/>
    <g transform="translate(14,10)">
      <rect x="0" y="0" width="2" height="7" rx="1" fill="white"/>
      <rect x="3.5" y="0" width="2" height="7" rx="1" fill="white"/>
      <rect x="1" y="6" width="4.5" height="2" rx="1" fill="white"/>
      <rect x="2" y="6" width="2" height="14" rx="1" fill="white"/>
    </g>
    <g transform="translate(30,10)">
      <rect x="1" y="4" width="2.5" height="16" rx="1.25" fill="white"/>
      <path d="M1 4 C1 1.5 2.25 0 3.5 0 C3.5 0 3.5 4 3.5 4 Z" fill="white"/>
    </g>
    <text x="24" y="27" text-anchor="middle" fill="white" font-size="10" font-weight="800" font-family="sans-serif" letter-spacing="0.5">MP</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
