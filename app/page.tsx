import { DayOrganizer } from "@/components/day-organizer"
import { InstallPrompt } from "@/components/install-prompt"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <DayOrganizer />
      <InstallPrompt />
    </main>
  )
}
