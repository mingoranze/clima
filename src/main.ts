import './style.css'
import sunIcon from './assets/sun.svg'
import moonIcon from './assets/moon.svg'
import { searchWeather } from './services/openMeteo'
import type { CombinedWeatherData } from './types/weather'
import { getWeatherDescription } from './utils/weatherCode'
import { getCardinalDirection } from './utils/windDirection'

type UiState = 'empty' | 'loading' | 'result'

const form = document.querySelector<HTMLFormElement>('#search-form')!
const input = document.querySelector<HTMLInputElement>('#search-input')!
const button = document.querySelector<HTMLButtonElement>('#search-button')!
const card = document.querySelector<HTMLElement>('#weather-card')!

const byId = (id: string): HTMLElement => document.getElementById(id)!

const fields = {
  temperature: byId('temperature'),
  location: byId('location'),
  currentDate: byId('current-date'),
  dayNightIcon: byId('day-night-icon'),
  dayNightLabel: byId('day-night-label'),
  condition: byId('condition'),
  humidity: byId('humidity'),
  apparentTemperature: byId('apparent-temperature'),
  precipitation: byId('precipitation'),
  wind: byId('wind'),
}

/** Data longa em português no fuso da cidade (PRD §4.4). */
function formatDate(timeZone: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date())
}

function renderWeather({ city, weather }: CombinedWeatherData): void {
  const { current, current_units: units } = weather
  const isDay = current.is_day === 1

  // Sidebar (PRD §2.4, §5.3)
  fields.temperature.textContent = `${current.temperature_2m}${units.temperature_2m}`
  fields.location.textContent = `${city.name}, ${city.country_code}`
  fields.currentDate.textContent = formatDate(city.timezone)
  fields.dayNightIcon.innerHTML = `<img src="${isDay ? sunIcon : moonIcon}" alt="" width="24" height="24" />`
  fields.dayNightLabel.textContent = isDay ? 'Dia' : 'Noite'
  fields.condition.textContent = getWeatherDescription(current.weather_code)

  // Área principal (PRD §2.4, §5.4)
  fields.humidity.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`
  fields.apparentTemperature.textContent = `${current.apparent_temperature}${units.apparent_temperature}`
  fields.precipitation.textContent = `${current.precipitation_probability}${units.precipitation_probability}`
  fields.wind.textContent =
    `${current.wind_speed_10m} ${units.wind_speed_10m} · ` +
    `${current.wind_direction_10m}° (${getCardinalDirection(current.wind_direction_10m)})`
}

function setState(state: UiState): void {
  card.dataset.state = state

  const isLoading = state === 'loading'
  input.disabled = isLoading
  button.disabled = isLoading
  card.setAttribute('aria-busy', String(isLoading))
}

async function handleSearch(event: SubmitEvent): Promise<void> {
  event.preventDefault()

  const cityName = input.value.trim()
  if (!cityName) return

  setState('loading')
  const data = await searchWeather(cityName)

  if (!data) {
    setState('empty')
    input.focus()
    return
  }

  renderWeather(data)
  setState('result')
  input.focus()
}

form.addEventListener('submit', handleSearch)

setState('empty')
