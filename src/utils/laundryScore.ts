import type { WeatherInput } from "@/services/weatherService";

// Magnus formula — saturation vapor pressure in kPa
function satVP(T: number): number {
  return 0.6112 * Math.exp((17.67 * T) / (T + 243.5));
}

// VPD (kPa): how much more moisture the air can absorb — primary drying driver
function calcVPD(temp_c: number, humidity: number): number {
  return Math.max(0, satVP(temp_c) - (humidity / 100) * satVP(temp_c));
}

// Approximate dew point (Magnus simplification)
function dewPoint(temp_c: number, humidity: number): number {
  return temp_c - (100 - humidity) / 5;
}

export function calculateLaundryScore(w: WeatherInput): number {
  const vpd = calcVPD(w.temp_c, w.humidity);

  // VPD score (45%) — core evaporation potential
  let vpdScore: number;
  if (vpd < 0.3)       vpdScore = 0;                                      // saturated, drying impossible
  else if (vpd < 1.0)  vpdScore = (vpd / 1.0) * 65;                       // suboptimal: 0–65
  else if (vpd < 2.0)  vpdScore = 65 + ((vpd - 1.0) / 1.0) * 25;         // good: 65–90
  else                 vpdScore = Math.min(100, 90 + (vpd - 2.0) * 10);   // excellent: 90–100

  // Wind score (25%) — removes saturated boundary layer from fabric
  const k = w.wind_kph;
  let windScore: number;
  if (k < 3)       windScore = (k / 3) * 30;
  else if (k < 8)  windScore = 30 + ((k - 3) / 5) * 40;
  else if (k < 15) windScore = 70 + ((k - 8) / 7) * 20;
  else if (k < 40) windScore = 90 + ((k - 15) / 25) * 8;
  else             windScore = 90; // very strong wind: marginal gain + risk of clothes blowing off

  // Sun score (15%) — cloud cover primary, UV secondary radiation signal
  const cloudScore = (1 - w.cloud / 100) * 100;
  const uvScore = Math.min((w.uv / 8) * 100, 100);
  const sunScore = w.uv > 0 ? (cloudScore + uvScore) / 2 : cloudScore;

  // Temperature score (15%) — affects evaporation rate, less important than VPD
  const t = w.temp_c;
  let tempScore: number;
  if (t < 5)       tempScore = 0;
  else if (t < 10) tempScore = ((t - 5) / 5) * 40;
  else if (t < 15) tempScore = 40 + ((t - 10) / 5) * 30;
  else if (t < 25) tempScore = 70 + ((t - 15) / 10) * 25;
  else             tempScore = 95;

  const base = vpdScore * 0.45 + windScore * 0.25 + sunScore * 0.15 + tempScore * 0.15;

  // Rain multiplier — multiplicative so any real rain collapses the score
  const rainChance = w.chance_of_rain ?? 0;
  let rainMult: number;
  if (w.precip_mm > 0.1)  rainMult = 0;
  else if (rainChance > 60) rainMult = 0.3;
  else if (rainChance > 40) rainMult = 0.6;
  else if (rainChance > 20) rainMult = 0.85;
  else                      rainMult = 1.0;

  // Dew point depression — if air is near saturation, clothes re-absorb moisture
  const dpDepression = w.temp_c - dewPoint(w.temp_c, w.humidity);
  const dpMult = dpDepression < 2 ? 0.5 : dpDepression < 5 ? 0.85 : 1.0;

  return Math.max(0, Math.min(100, Math.round(base * rainMult * dpMult)));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#F4C430";
  if (score >= 20) return "#f97316";
  if (score >= 10) return "#ef4444";
  return "#991b1b";
}
