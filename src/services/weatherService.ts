export interface HourlyWeather {
  time: string; // "2024-01-01 08:00"
  temp_c: number;
  humidity: number;
  wind_kph: number;
  precip_mm: number;
  will_it_rain: number;
  chance_of_rain: number;
  uv: number;
  cloud: number;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime?: string; // "2024-01-01 14:30" in the city's local time
  };
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    uv: number;
    cloud: number;
    condition: { text: string };
    feelslike_c: number;
  };
  forecast?: {
    forecastday: Array<{ hour: HourlyWeather[] }>;
  };
}

export interface WeatherInput {
  temp_c: number;
  humidity: number;
  wind_kph: number;
  precip_mm: number;
  uv: number;
  cloud: number;
  chance_of_rain?: number; // 0–100; only available in hourly forecast, not current conditions
}

// Mock hourly data: great morning, decent afternoon, bad evening
const MOCK_HOURS: HourlyWeather[] = [
  { time: "2024-01-01 00:00", temp_c: 19, humidity: 70, wind_kph: 5, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 0, cloud: 30 },
  { time: "2024-01-01 01:00", temp_c: 18, humidity: 72, wind_kph: 4, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 0, cloud: 35 },
  { time: "2024-01-01 02:00", temp_c: 18, humidity: 74, wind_kph: 4, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 0, cloud: 40 },
  { time: "2024-01-01 03:00", temp_c: 17, humidity: 75, wind_kph: 3, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 0, cloud: 40 },
  { time: "2024-01-01 04:00", temp_c: 17, humidity: 74, wind_kph: 4, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 0, cloud: 35 },
  { time: "2024-01-01 05:00", temp_c: 18, humidity: 72, wind_kph: 5, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 0, cloud: 30 },
  { time: "2024-01-01 06:00", temp_c: 20, humidity: 55, wind_kph: 8, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 2, cloud: 20 },
  { time: "2024-01-01 07:00", temp_c: 22, humidity: 48, wind_kph: 12, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 3, cloud: 15 },
  { time: "2024-01-01 08:00", temp_c: 24, humidity: 42, wind_kph: 16, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 5, cloud: 10 },
  { time: "2024-01-01 09:00", temp_c: 26, humidity: 38, wind_kph: 20, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 6, cloud: 10 },
  { time: "2024-01-01 10:00", temp_c: 28, humidity: 36, wind_kph: 22, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 7, cloud: 15 },
  { time: "2024-01-01 11:00", temp_c: 30, humidity: 38, wind_kph: 20, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 8, cloud: 20 },
  { time: "2024-01-01 12:00", temp_c: 32, humidity: 40, wind_kph: 18, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 8, cloud: 25 },
  { time: "2024-01-01 13:00", temp_c: 33, humidity: 44, wind_kph: 14, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 7, cloud: 35 },
  { time: "2024-01-01 14:00", temp_c: 34, humidity: 50, wind_kph: 10, precip_mm: 0, will_it_rain: 0, chance_of_rain: 0, uv: 6, cloud: 45 },
  { time: "2024-01-01 15:00", temp_c: 34, humidity: 56, wind_kph: 8,  precip_mm: 0, will_it_rain: 0, chance_of_rain: 5, uv: 5, cloud: 60 },
  { time: "2024-01-01 16:00", temp_c: 33, humidity: 64, wind_kph: 6,  precip_mm: 0.2, will_it_rain: 1, chance_of_rain: 40, uv: 3, cloud: 75 },
  { time: "2024-01-01 17:00", temp_c: 30, humidity: 70, wind_kph: 5,  precip_mm: 0.8, will_it_rain: 1, chance_of_rain: 65, uv: 1, cloud: 85 },
  { time: "2024-01-01 18:00", temp_c: 27, humidity: 76, wind_kph: 4,  precip_mm: 1.5, will_it_rain: 1, chance_of_rain: 75, uv: 0, cloud: 90 },
  { time: "2024-01-01 19:00", temp_c: 25, humidity: 80, wind_kph: 4,  precip_mm: 2.0, will_it_rain: 1, chance_of_rain: 80, uv: 0, cloud: 95 },
  { time: "2024-01-01 20:00", temp_c: 24, humidity: 80, wind_kph: 3,  precip_mm: 1.0, will_it_rain: 1, chance_of_rain: 70, uv: 0, cloud: 95 },
  { time: "2024-01-01 21:00", temp_c: 23, humidity: 79, wind_kph: 3,  precip_mm: 0, will_it_rain: 0, chance_of_rain: 30, uv: 0, cloud: 80 },
  { time: "2024-01-01 22:00", temp_c: 22, humidity: 77, wind_kph: 3,  precip_mm: 0, will_it_rain: 0, chance_of_rain: 10, uv: 0, cloud: 70 },
  { time: "2024-01-01 23:00", temp_c: 21, humidity: 75, wind_kph: 4,  precip_mm: 0, will_it_rain: 0, chance_of_rain: 5,  uv: 0, cloud: 60 },
];

const MOCK_DATA: WeatherData = {
  location: { name: "Demo City", region: "Laundry District", country: "Laundry Land", lat: 0, lon: 0 },
  current: {
    temp_c: 22,
    humidity: 45,
    wind_kph: 18,
    precip_mm: 0,
    uv: 5,
    cloud: 20,
    condition: { text: "Partly Cloudy" },
    feelslike_c: 21,
  },
  forecast: { forecastday: [{ hour: MOCK_HOURS }, { hour: MOCK_HOURS }] },
};

function mockWithName(name: string): WeatherData {
  return { ...MOCK_DATA, location: { ...MOCK_DATA.location, name } };
}

export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const key = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
  if (!key) return MOCK_DATA;
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=2&aqi=no&alerts=no`
  );
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const key = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
  if (!key) return mockWithName(city);
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city)}&days=2&aqi=no&alerts=no`
  );
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export function extractWeatherInput(data: WeatherData): WeatherInput {
  return {
    temp_c: data.current.temp_c,
    humidity: data.current.humidity,
    wind_kph: data.current.wind_kph,
    precip_mm: data.current.precip_mm,
    uv: data.current.uv,
    cloud: data.current.cloud,
  };
}

export function extractHours(data: WeatherData): HourlyWeather[] {
  return data.forecast?.forecastday?.[0]?.hour ?? [];
}

export function extractTomorrowHours(data: WeatherData): HourlyWeather[] {
  return data.forecast?.forecastday?.[1]?.hour ?? [];
}

// Returns the current hour in the queried city's local timezone, not the browser's.
export function extractLocalHour(data: WeatherData): number {
  if (data.location.localtime) {
    const h = parseInt(data.location.localtime.split(" ")[1].split(":")[0], 10);
    if (!isNaN(h)) return h;
  }
  return new Date().getHours();
}
