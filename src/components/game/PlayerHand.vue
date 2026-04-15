<template>
  <div class="player-hand">
    <!-- Cartes en main (RG1) -->
    <div class="hand-header">
      <span class="hand-title">Main ({{ player?.hand.length ?? 0 }}/5)</span>
      <span class="deck-count"
        >Deck : {{ player?.deckRemaining ?? 0 }} cartes</span
      >
    </div>

    <div class="hand-cards">
      <div
        v-for="cardId in player?.hand ?? []"
        :key="cardId"
        class="hand-card"
        :class="{ playable: canPlayCard, disabled: !canPlayCard }"
        @click="playCard(cardId)"
      >
        <img
          :src="getCardById(cardId).imgUrl"
          :alt="getCardById(cardId).name"
          class="card-img"
        />
        <div class="card-footer">
          <span class="card-name">{{ getCardById(cardId).name }}</span>
          <span
            class="type-badge"
            :style="{ background: getCardById(cardId).typeColor }"
          >
            {{ getCardById(cardId).type }}
          </span>
          <span class="card-stats">
            ❤ {{ getCardById(cardId).hp }} &nbsp;·&nbsp; ⚔
            {{ getCardById(cardId).attack }}
          </span>
        </div>
      </div>

      <div v-if="!player?.hand.length" class="empty-hand">
        Aucune carte en main
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { useGameStore } from '@/store/game'
import type { Card } from '@/types'

const gameStore = useGameStore()

const gameState = computed(() => gameStore.gameState)
const player = computed(() => gameState.value?.player ?? null)
const isMyTurn = computed(() => gameStore.isMyTurn)

// RG2 : jouable uniquement si c'est le tour du joueur et qu'il n'a pas de carte active
const canPlayCard = computed(
  () => isMyTurn.value && player.value?.activeCard === null,
)

// Fourni par GamePage via provide()
const getCardById = inject<(id: number) => Card>('getCardById')

if (!getCardById) {
  throw new Error("getCardById n'a pas été fourni")
}

function playCard(cardId: number) {
  if (!canPlayCard.value) return
  gameStore.playCard(cardId)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

.player-hand {
  margin-top: 12px;
  border-top: 1.5px solid #eef1f7;
  padding-top: 10px;
}

/*  Header  */
.hand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hand-title {
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8492a6;
}

.deck-count {
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #8492a6;
}

/*  Cards  */
.hand-cards {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.hand-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #dde3ee;
  background: #f8fafc;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
  width: 100px;
}

/* RG2 : feedback visuel jouable */
.hand-card.playable {
  cursor: pointer;
}

.hand-card.playable:hover {
  transform: translateY(-6px);
  border-color: #22c55e;
  box-shadow: 0 6px 18px rgba(34, 197, 94, 0.2);
}

.hand-card.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(30%);
}

.card-img {
  width: 100%;
  height: 90px;
  object-fit: contain;
  background: #f1f5f9;
  padding: 6px;
}

.card-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  background: white;
}

.card-name {
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-weight: 900;
  color: #1a202c;
  text-align: center;
  line-height: 1.2;
}

.type-badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

.card-stats {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #8492a6;
}

/*  Empty state  */
.empty-hand {
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-style: italic;
  color: #cbd5e1;
  padding: 12px 0;
}
</style>
