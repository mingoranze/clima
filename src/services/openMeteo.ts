import type {
  CombinedWeatherData,
  CurrentWeather,
  CurrentWeatherUnits,
  ForecastApiResponse,
  GeocodingApiResponse,
  GeocodingResult,
  WeatherResult,
} from '../types/weather'

// Único módulo da aplicação que se comunica com a Open-Meteo (PRD §3.4).

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/** Campos numéricos solicitados em `current` e exigidos na resposta (PRD §3.3.2). */
const CURRENT_FIELDS = [
  'precipitation_probability',
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation',
  'weather_code',
] as const satisfies readonly (keyof CurrentWeather)[]

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== ''

/** Faz GET e devolve o JSON, ou `null` em erro de rede, status HTTP de erro ou JSON inválido. */
async function fetchJson<T>(url: URL): Promise<T | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

/** Busca uma cidade pelo nome (PRD §3.3.1). Retorna `null` se inválida ou não encontrada. */
export async function searchCity(cityName: string): Promise<GeocodingResult | null> {
  if (!isNonEmptyString(cityName)) return null

  const url = new URL(GEOCODING_URL)
  url.search = new URLSearchParams({
    name: cityName.trim(),
    count: '1',
    language: 'pt',
    format: 'json',
  }).toString()

  const data = await fetchJson<GeocodingApiResponse>(url)
  const result = data?.results?.[0]
  if (!result) return null

  const { name, latitude, longitude, country_code, timezone } = result
  if (
    !isNonEmptyString(name) ||
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(longitude) ||
    !isNonEmptyString(country_code) ||
    !isNonEmptyString(timezone)
  ) {
    return null
  }

  return { name, latitude, longitude, country_code, timezone }
}

/** Busca o clima atual por coordenadas (PRD §3.3.2). Retorna `null` se inválido ou incompleto. */
export async function getWeather(
  latitude: number,
  longitude: number,
  timezone: string,
): Promise<WeatherResult | null> {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude) || !isNonEmptyString(timezone)) {
    return null
  }

  const url = new URL(FORECAST_URL)
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS.join(','),
    timezone,
  }).toString()

  const data = await fetchJson<ForecastApiResponse>(url)
  const current = data?.current
  const units = data?.current_units
  if (!current || !units) return null

  const isComplete = CURRENT_FIELDS.every(
    (field) => isFiniteNumber(current[field]) && typeof units[field] === 'string',
  )
  if (!isComplete) return null

  return {
    current: current as CurrentWeather,
    current_units: units as CurrentWeatherUnits,
  }
}

/** Orquestra geocoding → forecast (PRD §4.1). Retorna `null` em qualquer falha. */
export async function searchWeather(cityName: string): Promise<CombinedWeatherData | null> {
  const city = await searchCity(cityName)
  if (!city) return null

  const weather = await getWeather(city.latitude, city.longitude, city.timezone)
  if (!weather) return null

  return { city, weather }
}
