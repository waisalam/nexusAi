import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showWord?: boolean;
  wordClassName?: string;
}

/** Nexus AI mark — a connected node graph (the "nexus") in red. */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nx-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f87171" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z"
        stroke="url(#nx-grad)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <line x1="16" y1="16" x2="16" y2="6" stroke="url(#nx-grad)" strokeWidth="1.4" />
      <line x1="16" y1="16" x2="24" y2="20.5" stroke="url(#nx-grad)" strokeWidth="1.4" />
      <line x1="16" y1="16" x2="8" y2="20.5" stroke="url(#nx-grad)" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="3.4" fill="url(#nx-grad)" />
      <circle cx="16" cy="6" r="2.1" fill="#f87171" />
      <circle cx="24" cy="20.5" r="2.1" fill="#ef4444" />
      <circle cx="8" cy="20.5" r="2.1" fill="#dc2626" />
    </svg>
  );
}

/** GitHub mark — lucide's brand icon isn't available in this version. */
export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function Logo({ className, size = 28, showWord = true, wordClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showWord && (
        <span className={cn("text-lg font-bold tracking-tight text-white", wordClassName)}>
          Nexus<span className="text-red-500"> AI</span>
        </span>
      )}
    </div>
  );
}
