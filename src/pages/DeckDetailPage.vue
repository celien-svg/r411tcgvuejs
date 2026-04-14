<template>
  <NCard :title="deck?.name" style="max-width: 800px; margin: auto">
    <div class="actions">
      <NButton type="primary" @click="goEdit">Modifier</NButton>
      <NButton @click="resetHp">Réinitialiser les PV</NButton>
    </div>

    <NDivider />

    <div v-if="deckCards.length > 0" class="cards-wrapper">
      <div v-for="card in deckCards" :key="card.id" class="card-entry">
        <CardItem
          :card="card"
          :selectable="false"
          :current-hp="currentHp[card.id]"
          size="md"
        />
        <div class="hp-controls">
          <NButton size="small" @click="changeHp(card.id, -10)">-10</NButton>
          <NButton size="small" @click="changeHp(card.id, -1)">-1</NButton>
          <span class="hp-value">{{ currentHp[card.id] }} / {{ card.hp }}</span>
          <NButton size="small" @click="changeHp(card.id, +1)">+1</NButton>
          <NButton size="small" @click="changeHp(card.id, +10)">+10</NButton>
        </div>
      </div>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardItem from '@/components/cards/CardItem.vue'
import { useApi } from '@/composables/useApi'
import type { Card, Deck } from '@/types'

const api = useApi()
const route = useRoute()
const router = useRouter()

const deck = ref<Deck | null>(null)
const allCards = ref<Card[]>([])

const deckCards = computed<Card[]>(() => {
  if (!deck.value || allCards.value.length === 0) return []
  return deck.value.cards
    .map((entry: unknown) => allCards.value.find((c) => c.id === entry.cardId))
    .filter(Boolean) as Card[]
})

const currentHp = reactive<Record<number, number>>({})

const initHp = () => {
  deckCards.value.forEach((card) => {
    currentHp[card.id] = card.hp
  })
}

const changeHp = (cardId: number, amount: number) => {
  const card = deckCards.value.find((c) => c.id === cardId)
  if (!card) return
  currentHp[cardId] = Math.min(card.hp, Math.max(0, currentHp[cardId] + amount))
}

const resetHp = () => initHp()

onMounted(async () => {
  const deckId = route.params.id as string

  const [deckData, cards] = await Promise.all([
    api.getDeck(deckId),
    api.getCards(),
  ])

  deck.value = deckData
  allCards.value = cards

  initHp()
})

const goEdit = () => router.push(`/decks/${route.params.id}/edit`)
</script>

<style scoped>
.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.card-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hp-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hp-value {
  font-weight: bold;
  min-width: 70px;
  text-align: center;
  font-size: 13px;
}
</style>
