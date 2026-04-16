<template>
  <div class="game-page">
    <!-- Zone adversaire -->
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
              ❤ {{ opponent?.hp ?? 0 }}/{{ opponentCard.hp }} &nbsp;·&nbsp; ⚔
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

      <!-- Main du joueur -->
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

const router = useRouter()
const gameStore = useGameStore()
const api = useApi()

const gameState = computed(() => gameStore.gameState)
const player = computed(() => gameState.value?.player ?? null)
const opponent = computed(() => gameState.value?.opponent ?? null)

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

function getCardById(id: number): Card {
  return cards.value.find((c) => c.id === id) ?? FALLBACK_CARD
}

provide('getCardById', getCardById)

const playerCard = computed<Card | null>(() =>
  player.value?.activeCard !== null && player.value?.activeCard !== undefined
    ? getCardById(player.value.activeCard)
    : null,
)

const opponentCard = computed<Card | null>(() =>
  opponent.value?.activeCard !== null &&
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

onMounted(async () => {
  if (!gameState.value) {
    router.push('/')
    return
  }
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
  /* RG4 : scroll vertical autorisé sur mobile si le contenu dépasse */
  overflow-y: auto;
}

/*  Zones  */
.game-zone {
  flex: 1;
  /* RG4 : hauteur minimale pour rester lisible sur petit écran */
  min-height: 160px;
  display: flex;
  flex-direction: column;
  background: var(--clr-zone);
  border: 1.5px solid var(--clr-border);
  border-radius: var(--radius);
  margin: 6px 8px;
  padding: 10px 12px;
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
  margin-bottom: 6px;
}

.zone-label {
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--clr-label);
}

.score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--clr-label);
}

/*  Board  */
.board-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

/*  Active card  */
.active-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1.5px solid var(--clr-border);
  border-radius: 12px;
  min-width: 110px;
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
  font-size: 10px;
  color: var(--clr-label);
  font-weight: 700;
}

.card-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.12));
}

.card-name {
  font-size: 13px;
  font-weight: 900;
  color: var(--clr-text);
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

/*  HP bar  */
.hp-bar-wrapper {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 3px;
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
  font-size: 10px;
  font-weight: 700;
  color: var(--clr-label);
  margin-top: 2px;
}

/* ── Placeholder  */
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60px;
}

.placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--clr-placeholder);
  font-size: 12px;
  font-weight: 600;
  font-style: italic;
}

.placeholder-icon {
  width: 36px;
  height: 36px;
  border: 2px dashed var(--clr-placeholder);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-style: normal;
}

/*  RG4 : adaptations mobile  */
@media (max-width: 640px) {
  .game-page {
    /* Sur très petit écran, on laisse défiler plutôt que tout comprimer */
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .game-zone {
    margin: 4px 6px;
    padding: 8px 10px;
    min-height: 140px;
  }

  .card-img {
    width: 52px;
    height: 52px;
  }

  .card-name {
    font-size: 12px;
  }
}

/*  Desktop : tailles plus généreuses  */
@media (min-width: 768px) {
  .game-zone {
    margin: 8px 12px;
    padding: 12px 16px;
  }

  .card-img {
    width: 80px;
    height: 80px;
  }

  .card-name {
    font-size: 15px;
  }
  .zone-label {
    font-size: 13px;
  }
  .score {
    font-size: 13px;
  }
}
</style>
