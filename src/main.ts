import './style.css'
import { searchWeather } from './services/openMeteo'

type UiState = 'empty' | 'loading' | 'result'

const form = document.querySelector<HTMLFormElement>('#search-form')!
const input = document.querySelector<HTMLInputElement>('#search-input')!
const button = document.querySelector<HTMLButtonElement>('#search-button')!
const card = document.querySelector<HTMLElement>('#weather-card')!

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

  // Preenchimento da sidebar e da área principal: Tasks 14 e 15.
  setState('result')
  input.focus()
}

form.addEventListener('submit', handleSearch)

setState('empty')
