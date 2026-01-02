import SpendingDashboard from "@/components/spending-dashboard"
import { CreditsProvider } from "@/lib/credits-context"

export default function Home() {
  return (
    <CreditsProvider>
      <SpendingDashboard />
    </CreditsProvider>
  )
}
