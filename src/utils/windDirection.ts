export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO'

const DIRECTIONS: readonly CardinalDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

/**
 * Converte graus (0–360) em direção cardinal (PRD §2.6).
 * Cada setor tem 45°, centrado no ponto cardeal; bordas (ex.: 22.5°) pertencem ao setor seguinte.
 */
export function getCardinalDirection(degrees: number): CardinalDirection {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.floor((normalized + 22.5) / 45) % 8
  return DIRECTIONS[index]
}
