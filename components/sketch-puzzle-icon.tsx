export function SketchPuzzleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 8h4a2 2 0 0 0 2-2V4" strokeLinecap="round" />
      <path d="M4 8v8a2 2 0 0 0 2 2h8" strokeLinecap="round" />
      <path d="M14 18h4a2 2 0 0 0 2-2V8" strokeLinecap="round" />
      <path d="M14 4v2a2 2 0 0 0 2 2h4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
