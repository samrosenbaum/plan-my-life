import SpendingDashboard from "@/components/spending-dashboard"
import { CreditsProvider } from "@/lib/credits-context"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <CreditsProvider>
        <SpendingDashboard />
      </CreditsProvider>
    </ErrorBoundary>
  )
}
