"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const isIOS = () => {
    if (typeof window === "undefined") return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rounded-2xl border-2 border-dashed border-[#4a4adc]/30 bg-white p-4 shadow-lg">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-6">
          <h3 className="font-mono text-lg font-bold text-[#4a4adc]">Install Day Organizer</h3>
          <p className="mt-1 font-mono text-sm text-gray-600">
            Add to your home screen for quick access and offline use
          </p>

          {isIOS() ? (
            <p className="mt-3 font-mono text-xs text-gray-500">Tap the share button and select "Add to Home Screen"</p>
          ) : (
            <button
              onClick={handleInstall}
              className="mt-3 w-full rounded-full border-2 border-[#4a4adc] bg-[#4a4adc] px-4 py-2 font-mono text-sm font-bold text-white transition-colors hover:bg-[#4a4adc]/90"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
