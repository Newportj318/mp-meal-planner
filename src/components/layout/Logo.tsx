interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="#0d9488" />

      {/* Leaf / plate accent */}
      <ellipse cx="20" cy="18" rx="12" ry="10" fill="#14b8a6" opacity="0.4" />

      {/* M */}
      <path
        d="M10 28V14l5 8 5-8v14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* P */}
      <path
        d="M24 28V14h4.5a4 4 0 0 1 0 8H24"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
