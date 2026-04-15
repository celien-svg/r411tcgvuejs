<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="null">
        <div class="modal-card">
          <!-- Résultat (RG8) -->
          <div class="result-icon">{{ isWinner ? '🏆' : '😞' }}</div>
          <h2 class="result-title" :class="isWinner ? 'win' : 'loss'">
            {{ isWinner ? 'Victoire !' : 'Défaite' }}
          </h2>

          <p v-if="gameResult" class="reason">{{ gameResult.reason }}</p>

          <!-- Scores -->
          <div class="scores">
            <div class="score-row">
              <span class="score-label">Vous</span>
              <span class="score-value">{{ finalPlayerScore }} KO</span>
            </div>
            <div class="score-divider">—</div>
            <div class="score-row">
              <span class="score-label">Adversaire</span>
              <span class="score-value">{{ finalOpponentScore }} KO</span>
            </div>
          </div>

          <!-- RG9 : retour au lobby -->
          <button class="btn-lobby" @click="returnToLobby">
            Retour au lobby
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/store/auth'
import { useGameStore } from '@/store/game'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

const showModal = ref(false)
const gameResult = computed(() => gameStore.gameResult)
const gameState = computed(() => gameStore.gameState)

const isWinner = computed(() => gameResult.value?.winner === authStore.user?.id)

const finalPlayerScore = computed(() => gameState.value?.player.score ?? 0)
const finalOpponentScore = computed(() => gameState.value?.opponent.score ?? 0)

// RG9
function returnToLobby() {
  showModal.value = false
  gameStore.resetGame()
  router.push('/')
}

// RG8 : affichage automatique
watch(
  () => gameStore.gameResult,
  (result) => {
    if (result) showModal.value = true
  },
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

/*  Overlay  */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/*  Card  */
.modal-card {
  font-family: 'Nunito', sans-serif;
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 40px;
  min-width: 300px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.result-icon {
  font-size: 52px;
  line-height: 1;
}

.result-title {
  font-size: 28px;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
}

.result-title.win {
  color: #16a34a;
}
.result-title.loss {
  color: #dc2626;
}

.reason {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

/*  Scores  */
.scores {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1.5px solid #dde3ee;
  border-radius: 12px;
  padding: 12px 20px;
  width: 100%;
  justify-content: center;
}

.score-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.score-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8492a6;
}

.score-value {
  font-size: 18px;
  font-weight: 900;
  color: #1a202c;
}

.score-divider {
  font-size: 18px;
  color: #dde3ee;
  font-weight: 900;
}

/*  Bouton lobby (RG9)  */
.btn-lobby {
  margin-top: 4px;
  width: 100%;
  padding: 11px 0;
  border-radius: 10px;
  border: none;
  background: #1a202c;
  color: #fff;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition:
    background 0.18s,
    transform 0.15s;
}

.btn-lobby:hover {
  background: #2d3748;
  transform: translateY(-1px);
}

/*  Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card {
  transform: scale(0.92) translateY(12px);
}
.modal-leave-to .modal-card {
  transform: scale(0.92) translateY(12px);
}
</style>
