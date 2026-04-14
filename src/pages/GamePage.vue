<template>
  <div class="game-page">
    <!--  Zone adversaire  -->
    <div class="game-zone opponent-zone">
      <div class="zone-header">
        <span class="zone-label">Adversaire</span>
        <span class="score">
          <span class="score-icon">☠</span>
          {{ opponent?.score ?? 0 }}/3 KO
        </span>
      </div>

      <div class="board-area">
        <template v-if="opponentCard">
          <div class="active-card">
            <div class="card-number">#{{ opponentCard.pokedexNumber }}</div>
            <img
              :src="opponentCard.imgUrl"
              :alt="opponentCard.name"
              class="card-img"
            />
            <div class="card-name">{{ opponentCard.name }}</div>
            <span
              class="type-badge"
              :style="{ background: opponentCard.typeColor }"
            >
              {{ opponentCard.type }}
            </span>
            <div class="hp-bar-wrapper">
              <div
                class="hp-bar-fill opponent-hp"
                :style="{ width: opponentHpPercent + '%' }"
              />
            </div>
            <div class="hp-text">
              {{ opponent?.hp ?? 0 }}/{{ opponentCard.hp }}
              &nbsp;·&nbsp;
              {{ opponentCard.attack }}
            </div>
          </div>
        </template>
        <div v-else class="placeholder">
          <div class="placeholder-inner">
            <span class="placeholder-icon">?</span>
            <span>Aucune carte active</span>
          </div>
        </div>
      </div>
    </div>

    <!--  Barre d'actions  -->
    <ActionBar />

    <!--  Zone joueur  -->
    <div class="game-zone player-zone">
      <div class="zone-header">
        <span class="zone-label">Vous</span>
        <span class="score">
          <span class="score-icon">☠</span>
          {{ player?.score ?? 0 }}/3 KO
        </span>
      </div>

      <div class="board-area">
        <template v-if="playerCard">
          <div class="active-card">
            <div class="card-number">#{{ playerCard.pokedexNumber }}</div>
            <img
              :src="playerCard.imgUrl"
              :alt="playerCard.name"
              class="card-img"
            />
            <div class="card-name">{{ playerCard.name }}</div>
            <span
              class="type-badge"
              :style="{ background: playerCard.typeColor }"
            >
              {{ playerCard.type }}
            </span>
            <div class="hp-bar-wrapper">
              <div
                class="hp-bar-fill player-hp"
                :style="{ width: playerHpPercent + '%' }"
              />
            </div>
            <div class="hp-text">
              ❤ {{ player?.hp ?? 0 }}/{{ playerCard.hp }} &nbsp;·&nbsp; ⚔
              {{ playerCard.attack }}
            </div>
          </div>
        </template>
        <div v-else class="placeholder">
          <div class="placeholder-inner">
            <span class="placeholder-icon">?</span>
            <span>Aucune carte active</span>
          </div>
        </div>
      </div>

      <!-- Main du joueur (injecte getCardById via provide) -->
      <PlayerHand />
    </div>

    <EndGameModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import { useRouter } from 'vue-router'

import ActionBar from '@/components/game/ActionBar.vue'
import EndGameModal from '@/components/game/EndGameModal.vue'
import PlayerHand from '@/components/game/PlayerHand.vue'
import { useApi } from '@/composables/useApi'
import { useGameStore } from '@/store/game'
import type { Card } from '@/types'

//  Store / router

const router = useRouter()
const gameStore = useGameStore()
const api = useApi()

const gameState = computed(() => gameStore.gameState)
const player = computed(() => gameState.value?.player ?? null)
const opponent = computed(() => gameState.value?.opponent ?? null)

//  Cards cache

const cards = ref<Card[]>([])

const FALLBACK_CARD: Card = {
  id: 0,
  name: 'Unknown',
  hp: 0,
  attack: 0,
  type: 'Normal',
  pokedexNumber: 0,
  imgUrl: '',
  typeColor: '#aaa',
}

/**
 * Résout une carte par son id.
 * La fonction est déclarée ici (niveau racine du setup) pour que provide()
 * puisse être appelé de façon synchrone — obligation de Vue 3.
 * Comme cards est un ref réactif, les composants enfants obtiendront
 * automatiquement les bonnes données après le chargement async.
 */
function getCardById(id: number): Card {
  return cards.value.find((c) => c.id === id) ?? FALLBACK_CARD
}

// provide() doit être SYNCHRONE au niveau racine du setup (pas dans onMounted)
provide('getCardById', getCardById)

//  Computed active cards

const playerCard = computed<Card | null>(() =>
  player.value?.activeCard !== undefined
    ? getCardById(player.value.activeCard)
    : null,
)

const opponentCard = computed<Card | null>(() =>
  opponent.value?.activeCard !== undefined
    ? getCardById(opponent.value.activeCard)
    : null,
)

const playerHpPercent = computed(() => {
  if (!playerCard.value || playerCard.value.hp === 0) return 0
  return Math.max(
    0,
    Math.min(100, ((player.value?.hp ?? 0) / playerCard.value.hp) * 100),
  )
})

const opponentHpPercent = computed(() => {
  if (!opponentCard.value || opponentCard.value.hp === 0) return 0
  return Math.max(
    0,
    Math.min(100, ((opponent.value?.hp ?? 0) / opponentCard.value.hp) * 100),
  )
})

//  Lifecycle

onMounted(async () => {
  if (!gameState.value) {
    router.push('/')
    return
  }
  // Mise à jour réactive : computed + PlayerHand se recalculent automatiquement
  cards.value = await api.getCards()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

/*  Variables  */
.game-page {
  --clr-bg: #eef1f7;
  --clr-zone: #ffffff;
  --clr-border: #dde3ee;
  --clr-label: #8492a6;
  --clr-text: #1a202c;
  --clr-player-hp: #22c55e;
  --clr-opponent-hp: #ef4444;
  --clr-placeholder: #cbd5e1;
  --radius: 14px;

  font-family: 'Nunito', sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--clr-bg);
  overflow: hidden;
}

/*  Zones  */
.game-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--clr-zone);
  border: 1.5px solid var(--clr-border);
  border-radius: var(--radius);
  margin: 8px 12px;
  padding: 12px 16px;
  overflow: hidden;
}

.opponent-zone {
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.06);
}
.player-zone {
  box-shadow: 0 2px 12px rgba(34, 197, 94, 0.06);
}

/*  Header  */
.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.zone-label {
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--clr-label);
}

.score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--clr-label);
}

/*  Board  */
.board-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/*  Active card  */
.active-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1.5px solid var(--clr-border);
  border-radius: 12px;
  min-width: 130px;
  animation: card-in 0.3s ease;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-number {
  font-size: 11px;
  color: var(--clr-label);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.card-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.12));
}

.card-name {
  font-size: 15px;
  font-weight: 900;
  color: var(--clr-text);
}

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}

/*  HP bar  */
.hp-bar-wrapper {
  width: 100%;
  height: 7px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 4px;
}

.hp-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

.player-hp {
  background: var(--clr-player-hp);
}
.opponent-hp {
  background: var(--clr-opponent-hp);
}

.hp-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--clr-label);
  margin-top: 2px;
}

/*  Placeholder  */
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 80px;
}

.placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--clr-placeholder);
  font-size: 13px;
  font-weight: 600;
  font-style: italic;
}

.placeholder-icon {
  width: 44px;
  height: 44px;
  border: 2.5px dashed var(--clr-placeholder);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-style: normal;
}
</style>
