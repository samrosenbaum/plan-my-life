"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(standalone)

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // Listen for install prompt (Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Show iOS instructions after a delay
    if (ios && !standalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeinstallprompt", handler)
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("install-prompt-dismissed", "true")
  }

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) return null
  if (typeof window !== "undefined" && localStorage.getItem("install-prompt-dismissed")) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rounded-2xl bg-card p-4 shadow-lg border border-dashed border-primary/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 rounded-xl bg-primary/10 p-2">
            <svg
              className="h-6 w-6 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-mono text-sm font-medium text-foreground">install app</h3>
            {isIOS ? (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                tap the share button <span className="inline-block">⬆︎</span> then "Add to Home Screen" to install
              </p>
            ) : (
              <p className="mt-1 font-mono text-xs text-muted-foreground">install for quick access and offline use</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 rounded-full bg-primary px-4 py-2 font-mono text-xs text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-full bg-muted px-4 py-2 font-mono text-xs text-muted-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isIOS ? "got it" : "not now"}
          </button>
        </div>
      </div>
    </div>
  )
}
