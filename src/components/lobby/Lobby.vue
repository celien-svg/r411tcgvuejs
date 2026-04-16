<template>
  <div class="lobby">
    <div class="lobby-header">
      <div>
        <h2>Jouer</h2>
        <p>
          Choisissez un deck, créez une room ou rejoignez une partie existante.
        </p>
      </div>
      <span
        class="connection-status"
        :class="{ online: isConnected, offline: !isConnected }"
      >
        {{ isConnected ? 'Connecté' : 'Déconnecté' }}
      </span>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <!-- Responsive : 1 colonne mobile, 2 colonnes desktop -->
    <div class="lobby-grid">
      <NCard title="Créer une partie" class="panel-card" size="large">
        <div class="panel-content">
          <p>Votre deck sera utilisé lorsque vous créerez la room.</p>

          <div class="deck-selection">
            <NSelect
              v-model:value="selectedDeckId"
              :options="deckOptions"
              placeholder="Sélectionnez un deck"
              style="width: 100%"
            />
          </div>

          <div class="actions">
            <NButton
              type="primary"
              block
              :disabled="!selectedDeckId || !isConnected"
              @click="createRoom"
            >
              Créer une partie
            </NButton>
          </div>
        </div>
      </NCard>

      <NCard title="Parties disponibles" class="panel-card" size="large">
        <div class="panel-content rooms-list">
          <div v-if="rooms.length === 0" class="no-rooms">
            Aucune partie disponible pour l'instant.
          </div>

          <NCard
            v-for="room in rooms"
            :key="room.id"
            class="room-card"
            size="small"
          >
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-host">Hôte : {{ room.hostUsername }}</div>
              <div class="room-status">
                {{ room.status === 'waiting' ? 'En attente' : 'En cours' }}
              </div>
            </div>
            <template #action>
              <NButton
                size="small"
                :disabled="
                  !selectedDeckId || room.status !== 'waiting' || !isConnected
                "
                @click="joinRoom(room.id)"
              >
                Rejoindre
              </NButton>
            </template>
          </NCard>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NSelect } from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'LobbyPage' })

import { useApi } from '@/composables/useApi'
import { useGameStore } from '@/store/game'
import type { Deck } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const api = useApi()

const selectedDeckId = ref<number | null>(null)
const decks = ref<Deck[]>([])

const deckOptions = computed(() =>
  decks.value.map((deck) => ({ label: deck.name, value: deck.id })),
)

const isConnected = computed(() => gameStore.isConnected)
const rooms = computed(() => gameStore.rooms)
const error = computed(() => gameStore.error)

async function loadDecks() {
  decks.value = await api.getMyDecks()
}

function createRoom() {
  if (selectedDeckId.value) gameStore.createRoom(selectedDeckId.value)
}

function joinRoom(roomId: string) {
  if (selectedDeckId.value) gameStore.joinRoom(roomId, selectedDeckId.value)
}

watch(
  () => gameStore.gameState,
  (next) => {
    if (next) router.push('/game')
  },
)

onMounted(async () => {
  await loadDecks()
  gameStore.connect()
  gameStore.loadRooms()
})
</script>

<style scoped>
.lobby {
  width: 100%;
  border-radius: 16px;
}

.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.lobby-header h2 {
  margin: 0;
  font-size: 26px;
}

.lobby-header p {
  margin: 8px 0 0;
  color: #666;
}

.connection-status {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.connection-status.online {
  background: #e6ffed;
  color: #1f9d55;
}
.connection-status.offline {
  background: #ffe6e9;
  color: #c9190b;
}

/* RG2 : 1 col mobile, 2 col desktop */
.lobby-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .lobby-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.panel-card {
  min-height: 260px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.deck-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions {
  display: flex;
  justify-content: flex-start;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-rooms {
  padding: 28px 0;
  text-align: center;
  color: #999;
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.room-name {
  font-weight: 700;
}

.room-host,
.room-status {
  color: #666;
  font-size: 13px;
}

/* ── Mobile ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .lobby-header h2 {
    font-size: 20px;
  }
}
</style>
