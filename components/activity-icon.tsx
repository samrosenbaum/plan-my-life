import type React from "react"
interface ActivityIconProps {
  icon: string
  color: string
  className?: string
}

export function ActivityIcon({ icon, color, className }: ActivityIconProps) {
  const icons: Record<string, React.ReactNode> = {
    barbell: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M6 12h12" strokeLinecap="round" strokeWidth="2.5" />
        <rect x="2" y="9" width="3" height="6" rx="1" />
        <rect x="19" y="9" width="3" height="6" rx="1" />
        <rect x="5" y="7" width="2" height="10" rx="0.5" />
        <rect x="17" y="7" width="2" height="10" rx="0.5" />
      </svg>
    ),
    focus: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" strokeDasharray="4 2" />
        <path d="M12 2v3" strokeLinecap="round" />
        <path d="M12 19v3" strokeLinecap="round" />
        <path d="M2 12h3" strokeLinecap="round" />
        <path d="M19 12h3" strokeLinecap="round" />
      </svg>
    ),
    create: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M12 20h9" strokeLinecap="round" />
        <path
          d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    dumbbell: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M6.5 6.5h11" strokeLinecap="round" />
        <path d="M6.5 17.5h11" strokeLinecap="round" />
        <rect x="2" y="8" width="4" height="8" rx="1" />
        <rect x="18" y="8" width="4" height="8" rx="1" />
        <path d="M6.5 6.5v11" strokeLinecap="round" />
        <path d="M17.5 6.5v11" strokeLinecap="round" />
        <path d="M4 12h16" strokeLinecap="round" />
      </svg>
    ),
    car: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path
          d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-5H9L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    bus: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <rect x="4" y="3" width="16" height="16" rx="2" />
        <path d="M4 11h16" strokeLinecap="round" />
        <path d="M12 3v8" strokeLinecap="round" />
        <circle cx="7.5" cy="15.5" r="1.5" />
        <circle cx="16.5" cy="15.5" r="1.5" />
        <path d="M4 19h2" strokeLinecap="round" />
        <path d="M18 19h2" strokeLinecap="round" />
      </svg>
    ),
    sparkles: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path
          d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M18 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M5 18l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    dog: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path
          d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"
          strokeLinecap="round"
        />
        <path
          d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"
          strokeLinecap="round"
        />
        <path d="M8 14v.5" strokeLinecap="round" />
        <path d="M16 14v.5" strokeLinecap="round" />
        <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
        <ellipse cx="12" cy="13" rx="6" ry="5" />
        <path d="M7 18c-1.657 0-3 1.343-3 3v1h16v-1c0-1.657-1.343-3-3-3" strokeLinecap="round" />
      </svg>
    ),
    star: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    heart: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    book: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    coffee: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round" />
        <line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round" />
        <line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round" />
      </svg>
    ),
    music: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    sun: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" />
        <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
        <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" />
        <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
      </svg>
    ),
    moon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    zap: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        style={{ color }}
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }

  return icons[icon] || icons.star
}
