<template>
  <div class="action-bar">
    <!-- RG3 : indicateur de tour -->
    <div class="turn-indicator" :class="isMyTurn ? 'my-turn' : 'opponent-turn'">
      {{ isMyTurn ? 'Votre tour' : "Tour de l'adversaire" }}
    </div>

    <!-- RG4 / RG5 / RG6 : boutons d'action -->
    <div class="actions">
      <button class="btn btn-draw" :disabled="!canDraw" @click="handleDraw">
        Piocher
      </button>

      <button
        class="btn btn-attack"
        :disabled="!canAttack"
        @click="handleAttack"
      >
        Attaquer
      </button>

      <button class="btn btn-end" :disabled="!isMyTurn" @click="handleEndTurn">
        Fin de tour
      </button>
    </div>

    <!-- RG7 : messages en temps réel -->
    <TransitionGroup name="msg" tag="div" class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        {{ msg.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useGameStore } from '@/store/game'

const gameStore = useGameStore()
const isMyTurn = computed(() => gameStore.isMyTurn)
const gameState = computed(() => gameStore.gameState)

// RG4 : Piocher désactivé si main pleine ou deck vide
const canDraw = computed(() => {
  if (!isMyTurn.value || !gameState.value) return false
  const { hand, deckRemaining } = gameState.value.player
  return hand.length < 5 && deckRemaining > 0
})

// RG5 : Attaquer désactivé si l'un des deux n'a pas de carte active
const canAttack = computed(() => {
  if (!isMyTurn.value || !gameState.value) return false
  const { player, opponent } = gameState.value
  return (
    player.activeCard !== null &&
    player.activeCard !== undefined &&
    opponent.activeCard !== null &&
    opponent.activeCard !== undefined
  )
})

//  Messages (RG7)

interface Message {
  id: number
  text: string
}
const messages = ref<Message[]>([])
let nextId = 0

function addMessage(text: string) {
  messages.value.unshift({ id: nextId++, text })
  if (messages.value.length > 4) messages.value.pop()
}

//  Actions

function handleDraw() {
  gameStore.drawCards()
  addMessage('Vous piochez une carte.')
}

function handleAttack() {
  gameStore.attack()
  addMessage('Vous attaquez !')
}

function handleEndTurn() {
  gameStore.endTurn()
  addMessage('Vous passez votre tour.')
}

//  Watch gameState pour messages automatiques (RG7)

watch(
  gameState,
  (next, prev) => {
    if (!next || !prev) return

    // Changement de tour
    if (next.currentPlayerId !== prev.currentPlayerId) {
      const myId = next.player.id
      addMessage(
        next.currentPlayerId === myId
          ? "C'est votre tour !"
          : "C'est le tour de l'adversaire.",
      )
    }

    // Carte jouée par le joueur
    if (
      next.player.activeCard !== prev.player.activeCard &&
      next.player.activeCard !== null &&
      next.player.activeCard !== undefined
    ) {
      addMessage(`Vous avez placé une carte sur le board !`)
    }

    if (
      next.opponent.activeCard !== prev.opponent.activeCard &&
      next.opponent.activeCard !== null &&
      next.opponent.activeCard !== undefined
    ) {
      addMessage("L'adversaire a placé une carte sur le board !")
    }

    // HP du joueur change
    if (next.player.hp !== prev.player.hp) {
      const diff = next.player.hp - prev.player.hp
      addMessage(
        `Vos PV : ${diff > 0 ? '+' : ''}${diff} (${next.player.hp} PV)`,
      )
    }

    // HP adversaire change
    if (next.opponent.hp !== prev.opponent.hp) {
      const diff = next.opponent.hp - prev.opponent.hp
      addMessage(
        `PV adversaire : ${diff > 0 ? '+' : ''}${diff} (${next.opponent.hp} PV)`,
      )
    }

    // KO joueur
    if (next.player.score !== prev.player.score) {
      addMessage(`Vous avez mis un Pokémon KO ! (${next.player.score}/3)`)
    }

    // KO adversaire
    if (next.opponent.score !== prev.opponent.score) {
      addMessage(
        `L'adversaire a mis un Pokémon KO ! (${next.opponent.score}/3)`,
      )
    }
  },
  { deep: true },
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  margin: 0 12px;
  background: #ffffff;
  border: 1.5px solid #dde3ee;
  border-radius: 12px;
  font-family: 'Nunito', sans-serif;
  flex-shrink: 0;
}

/*  Tour indicator (RG3)  */
.turn-indicator {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.my-turn {
  background: #dcfce7;
  color: #16a34a;
}

.opponent-turn {
  background: #fee2e2;
  color: #dc2626;
}

/*  Boutons  */
.actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn {
  padding: 5px 14px;
  border-radius: 8px;
  border: none;
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.btn:not(:disabled):hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}

.btn-draw {
  background: #e0f2fe;
  color: #0369a1;
}
.btn-attack {
  background: #fee2e2;
  color: #dc2626;
}
.btn-end {
  background: #fef9c3;
  color: #a16207;
}

/*  Messages (RG7)  */
.messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
}

.message {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Transition entrée message */
.msg-enter-active {
  transition: all 0.2s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.msg-leave-active {
  transition: all 0.15s ease;
}
.msg-leave-to {
  opacity: 0;
}
</style>
