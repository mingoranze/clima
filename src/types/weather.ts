// Geocoding API — https://geocoding-api.open-meteo.com/v1/search (PRD §3.3.1)

/** Item de `results` retornado pela API de geocoding (apenas campos utilizados). */
export type GeocodingApiResult = {
  name: string
  latitude: number
  longitude: number
  country_code: string
  timezone: string
}

/** Resposta bruta da API de geocoding. `results` é omitido quando nada é encontrado. */
export type GeocodingApiResponse = {
  results?: GeocodingApiResult[]
}

/** Resultado normalizado de `searchCity`. */
export type GeocodingResult = GeocodingApiResult

// Forecast API — https://api.open-meteo.com/v1/forecast (PRD §3.3.2)

/** Campos solicitados no parâmetro `current`. */
export type CurrentWeather = {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  /** 1 = dia, 0 = noite */
  is_day: 0 | 1
  wind_speed_10m: number
  wind_direction_10m: number
  precipitation_probability: number
  precipitation: number
  weather_code: number
}

/** Unidades de cada campo de `current` (ex.: "°C", "%", "km/h"). */
export type CurrentWeatherUnits = {
  [K in keyof CurrentWeather]: string
}

/** Resposta bruta da API de forecast. `current` pode faltar em respostas inválidas. */
export type ForecastApiResponse = {
  latitude: number
  longitude: number
  timezone: string
  current?: Partial<CurrentWeather>
  current_units?: Partial<CurrentWeatherUnits>
}

/** Resultado validado de `getWeather`. */
export type WeatherResult = {
  current: CurrentWeather
  current_units: CurrentWeatherUnits
}

// Dados combinados para a UI (PRD §3.4)

/** Resultado de `searchWeather`: geocoding + forecast necessários à interface. */
export type CombinedWeatherData = {
  city: GeocodingResult
  weather: WeatherResult
}
