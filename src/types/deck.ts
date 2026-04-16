import type { Card } from './card'

export interface Deck {
  id: number
  name: string
  cards: Card[]
}

export interface DeckPayload {
  name: string
  cards: number[] // tableau de 10 cardId
}
