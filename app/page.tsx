import { DayOrganizer } from "@/components/day-organizer"
import { InstallPrompt } from "@/components/install-prompt"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background p-4 md:p-8">
        <DayOrganizer />
        <InstallPrompt />
      </main>
    </ErrorBoundary>
  )
}
