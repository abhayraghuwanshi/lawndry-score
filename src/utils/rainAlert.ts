import type { WeatherData } from "@/services/weatherService";

export interface RainAlertData {
  type: "now" | "soon";
  hoursUntil?: number; // for "soon" — 1 or 2
}

export function checkRainAlert(data: WeatherData, localHour: number): RainAlertData | null {
  // Currently raining
  if (data.current.precip_mm > 0) return { type: "now" };

  // Check next 2 hours in today's forecast
  const hours = data.forecast?.forecastday?.[0]?.hour ?? [];
  for (const h of hours) {
    const hr = parseInt(h.time.split(" ")[1].split(":")[0], 10);
    if (hr <= localHour || hr > localHour + 2) continue;
    if (h.will_it_rain === 1 || h.chance_of_rain > 60) {
      return { type: "soon", hoursUntil: hr - localHour };
    }
  }

  return null;
}
