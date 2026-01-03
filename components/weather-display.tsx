"use client"

import { useEffect, useState } from "react"

interface WeatherData {
  date: string
  tempHigh: number
  tempLow: number
  weatherCode: number
}

interface WeatherDisplayProps {
  mode: "day" | "week"
  selectedDate: Date
}

const weatherCodeToIcon: Record<number, string> = {
  0: "sun",
  1: "sun",
  2: "partlyCloudy",
  3: "cloud",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  61: "rain",
  63: "rain",
  65: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  95: "storm",
  96: "storm",
  99: "storm",
}

function WeatherIcon({ type, size = 24 }: { type: string; size?: number }) {
  const strokeWidth = 1.5

  switch (type) {
    case "sun":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )
    case "partlyCloudy":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="8" cy="8" r="3" />
          <path d="M8 2v1M8 12v1M3 8h1M12 8h1M4.5 4.5l.7.7M11.5 11.5l-.7-.7M4.5 11.5l.7-.7" />
          <path d="M6 16a4 4 0 0 1 8 0 3 3 0 0 1 3 3H5a3 3 0 0 1 1-6z" />
        </svg>
      )
    case "cloud":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      )
    case "rain":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M16 13V7a4 4 0 0 0-8 0v6" />
          <path d="M8 13a4 4 0 1 0 8 0" />
          <path d="M12 21v-4M8 19v-2M16 19v-2" />
        </svg>
      )
    case "drizzle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          <path d="M10 18v2M14 18v2" strokeDasharray="2 2" />
        </svg>
      )
    case "snow":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          <circle cx="9" cy="18" r="1" />
          <circle cx="13" cy="20" r="1" />
          <circle cx="15" cy="17" r="1" />
        </svg>
      )
    case "fog":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M4 14h16M4 18h12M6 10h14" />
        </svg>
      )
    case "storm":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          <path d="M13 11l-2 4h3l-2 4" />
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
  }
}

export function WeatherDisplay({ mode, selectedDate }: WeatherDisplayProps) {
  const [forecast, setForecast] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true)
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America/Los_Angeles&forecast_days=14",
        )
        const data = await response.json()

        const weatherData: WeatherData[] = data.daily.time.map((date: string, i: number) => ({
          date,
          tempHigh: Math.round(data.daily.temperature_2m_max[i]),
          tempLow: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weather_code[i],
        }))

        setForecast(weatherData)
      } catch (error) {
        console.error("Failed to fetch weather:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-foreground/40 font-mono text-xs">
        <div className="w-4 h-4 border border-dashed border-foreground/30 rounded-full animate-spin" />
        loading weather...
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  const getIconType = (code: number) => weatherCodeToIcon[code] || "sun"

  if (mode === "day") {
    const todayStr = selectedDate.toISOString().split("T")[0]
    const todayWeather = forecast.find((f) => f.date === todayStr)
    const tomorrowDate = new Date(selectedDate)
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrowStr = tomorrowDate.toISOString().split("T")[0]
    const tomorrowWeather = forecast.find((f) => f.date === tomorrowStr)

    return (
      <div className="flex items-center gap-6 font-mono text-xs">
        {todayWeather && (
          <div className="flex items-center gap-2">
            <span className="text-foreground/50">today</span>
            <WeatherIcon type={getIconType(todayWeather.weatherCode)} size={18} />
            <span>
              {todayWeather.tempHigh}° / {todayWeather.tempLow}°
            </span>
          </div>
        )}
        {tomorrowWeather && (
          <div className="flex items-center gap-2">
            <span className="text-foreground/50">tomorrow</span>
            <WeatherIcon type={getIconType(tomorrowWeather.weatherCode)} size={18} />
            <span>
              {tomorrowWeather.tempHigh}° / {tomorrowWeather.tempLow}°
            </span>
          </div>
        )}
      </div>
    )
  }

  // Week mode - show 7 days starting from selectedDate's week
  const startOfWeek = new Date(selectedDate)
  const dayOfWeek = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

  const weekDays: WeatherData[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split("T")[0]
    const dayWeather = forecast.find((f) => f.date === dateStr)
    if (dayWeather) {
      weekDays.push(dayWeather)
    }
  }

  return (
    <div className="flex items-center gap-3 font-mono text-xs overflow-x-auto">
      {weekDays.map((day) => (
        <div key={day.date} className="flex flex-col items-center gap-1 min-w-[48px]">
          <span className="text-foreground/50">{formatDate(day.date)}</span>
          <WeatherIcon type={getIconType(day.weatherCode)} size={20} />
          <span className="text-[10px]">
            {day.tempHigh}°/{day.tempLow}°
          </span>
        </div>
      ))}
    </div>
  )
}
