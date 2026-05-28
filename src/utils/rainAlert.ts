import type { WeatherData } from "@/services/weatherService";

export interface RainAlertData {
  type: "now" | "soon";
  rainHour?: number; // absolute local hour when rain is expected to arrive
}

export function checkRainAlert(data: WeatherData, localHour: number): RainAlertData | null {
  // Currently raining
  if (data.current.precip_mm > 0) return { type: "now" };

  // Scan rest of today for the first hour where rain is likely
  const hours = data.forecast?.forecastday?.[0]?.hour ?? [];
  for (const h of hours) {
    const hr = parseInt(h.time.split(" ")[1].split(":")[0], 10);
    if (hr <= localHour) continue;
    if (h.will_it_rain === 1 || h.chance_of_rain > 60) {
      return { type: "soon", rainHour: hr };
    }
  }

  return null;
}
