import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { computed, ref } from 'vue'

import type { GameResult, GameState, Room } from '@/types'

import { useAuthStore } from './auth'

// ─── Socket event types ───────────────────────────────────────────────────────

interface ServerToClientEvents {
  roomsList: (data: Room[]) => void
  roomsListUpdated: () => void
  roomCreated: (roomId: string) => void
  gameStarted: (data: GameState) => void
  gameStateUpdated: (data: GameState) => void
  gameEnded: (result: GameResult) => void
  opponentDisconnected: () => void
  error: (err: string) => void
}

interface ClientToServerEvents {
  getRooms: () => void
  createRoom: (data: { deckId: number }) => void
  joinRoom: (data: { roomId: string; deckId: number }) => void
  drawCards: () => void
  playCard: (data: { cardId: number }) => void
  attack: () => void
  endTurn: () => void
}

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = defineStore('game', () => {
  const authStore = useAuthStore()

  // Socket
  const socket = ref<GameSocket | null>(null)
  const isConnected = ref(false)

  // Lobby
  const rooms = ref<Room[]>([])
  const currentRoomId = ref<string | null>(null)
  const selectedDeckId = ref<number | null>(null)
  const error = ref<string | null>(null)

  // Game
  const gameState = ref<GameState | null>(null)
  const gameResult = ref<GameResult | null>(null)
  const opponentDisconnected = ref(false)

  // ─── Computed ───────────────────────────────────────────────────────────────

  const isMyTurn = computed(
    () => gameState.value?.currentPlayerId === authStore.user?.id,
  )

  const currentRoom = computed(
    () => rooms.value.find((r) => r.id === currentRoomId.value) ?? null,
  )

  const playerRole = computed<'host' | 'guest' | null>(() => {
    if (!currentRoom.value || !authStore.user) return null
    return currentRoom.value.hostId === authStore.user.id ? 'host' : 'guest'
  })

  const playerState = computed(() => gameState.value?.player ?? null)
  const opponentState = computed(() => gameState.value?.opponent ?? null)
  const isPlaying = computed(() => gameState.value?.status === 'playing')

  const isHost = computed(() => {
    if (!currentRoom.value || !authStore.user) return false
    return currentRoom.value.hostId === authStore.user.id
  })
  // ─── Reset ──────────────────────────────────────────────────────────────────

  function resetGame(): void {
    gameState.value = null
    gameResult.value = null
    opponentDisconnected.value = false
    currentRoomId.value = null
    selectedDeckId.value = null
  }

  function reset(): void {
    rooms.value = []
    error.value = null
    resetGame()
  }
  // ─── Socket ─────────────────────────────────────────────────────────────────

  function connect(): void {
    if (socket.value?.connected) return

    const token = authStore.token
    if (!token) {
      error.value = 'No authentication token'
      return
    }

    const s: GameSocket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
      { auth: { token } },
    )

    s.on('connect', () => {
      isConnected.value = true
      error.value = null
    })

    s.on('disconnect', () => {
      isConnected.value = false
    })

    s.on('error', (err) => {
      error.value = err
    })

    // Lobby
    s.on('roomsList', (data) => {
      rooms.value = data
    })

    s.on('roomsListUpdated', () => {
      s.emit('getRooms')
    })

    s.on('roomCreated', (roomId) => {
      currentRoomId.value = roomId
    })

    // Game
    s.on('gameStarted', (data) => {
      gameState.value = data
    })

    s.on('gameStateUpdated', (data) => {
      gameState.value = data
    })

    s.on('gameEnded', (result) => {
      gameResult.value = result
    })

    s.on('opponentDisconnected', () => {
      opponentDisconnected.value = true
    })

    socket.value = s
  }

  function disconnect(): void {
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
    reset()
  }

  // ─── Lobby actions ──────────────────────────────────────────────────────────

  function loadRooms(): void {
    if (!socket.value) connect()
    socket.value?.emit('getRooms')
  }

  function createRoom(deckId: number): void {
    selectedDeckId.value = deckId
    socket.value?.emit('createRoom', { deckId })
  }

  function joinRoom(roomId: string, deckId: number): void {
    selectedDeckId.value = deckId
    socket.value?.emit('joinRoom', { roomId, deckId })
  }

  // ─── Game actions ───────────────────────────────────────────────────────────

  function drawCards(): void {
    socket.value?.emit('drawCards')
  }

  function playCard(cardId: number): void {
    socket.value?.emit('playCard', { cardId })
  }

  function attack(): void {
    socket.value?.emit('attack')
  }

  function endTurn(): void {
    socket.value?.emit('endTurn')
  }

  // ─── Expose ─────────────────────────────────────────────────────────────────

  return {
    // State
    isConnected,
    rooms,
    currentRoomId,
    selectedDeckId,
    error,
    gameState,
    gameResult,
    opponentDisconnected,

    // Computed
    isMyTurn,
    isHost,
    playerRole,
    playerState,
    opponentState,
    currentRoom,
    isPlaying,

    // Actions
    connect,
    disconnect,
    loadRooms,
    createRoom,
    joinRoom,
    drawCards,
    playCard,
    attack,
    endTurn,
    resetGame,
    reset,
  }
})
