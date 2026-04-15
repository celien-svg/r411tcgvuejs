export interface Room {
  id: string
  name: string
  hostId: number
  hostUsername: string
  guestId?: number
  guestUsername?: string
  status: 'waiting' | 'playing'
}

export interface PlayerState {
  id: number
  username: string
  deck: number[] // card ids
  hand: number[] // card ids
  activeCard?: number // card id
  hp: number
  score: number // KOs, 0-3
  deckRemaining: number
}

export interface GameState {
  roomId: string
  currentPlayerId: number
  player: PlayerState
  opponent: PlayerState
  status: 'playing' | 'finished'
  winner?: number // player id
}

export interface GameResult {
  winner: number
  reason: string
}
