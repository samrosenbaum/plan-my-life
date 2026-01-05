"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  handleReset = () => {
    // Clear potentially corrupted localStorage
    if (confirm("Reset all data? This will clear your schedule and start fresh.")) {
      localStorage.removeItem("day-organizer-activities")
      localStorage.removeItem("day-organizer-schedules")
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="max-w-md rounded-3xl bg-card p-6 shadow-lg text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mb-2 font-mono text-xl text-foreground">something went wrong</h1>
            <p className="mb-4 font-mono text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-primary px-6 py-2.5 font-mono text-sm text-primary-foreground transition-all hover:bg-primary/90"
              >
                reload page
              </button>
              <button
                onClick={this.handleReset}
                className="rounded-full border-2 border-dashed border-border bg-secondary px-6 py-2.5 font-mono text-sm text-foreground transition-all hover:border-destructive hover:text-destructive"
              >
                reset data
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
