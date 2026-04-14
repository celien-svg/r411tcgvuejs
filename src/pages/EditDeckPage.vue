<template>
  <NCard title="Modifier le deck" style="max-width: 800px; margin: auto">
    <NForm>
      <NFormItem label="Nom du deck">
        <NInput v-model:value="name" />
      </NFormItem>

      <NDivider />

      <div class="top-bar">
        <div class="counter">{{ selected.length }} / 10 cartes</div>
      </div>

      <CardGrid
        v-if="cards.length > 0"
        v-model:model-value="selected"
        :cards="cards"
        :max-selected="10"
        :size="gridSize"
        :selectable="true"
      />

      <NButton
        type="primary"
        block
        :disabled="selected.length !== 10 || !name"
        @click="save"
      >
        Enregistrer
      </NButton>
    </NForm>
  </NCard>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '@/components/cards/CardGrid.vue'
import { useApi } from '@/composables/useApi'
import { ROUTES } from '@/router'
import type { Card, Deck } from '@/types'

const api = useApi()
const route = useRoute()
const router = useRouter()

const cards = ref<Card[]>([])
const selected = ref<number[]>([])
const name = ref('')
const gridSize = ref<'sm' | 'md'>('md')

onMounted(async () => {
  const deckId = route.params.id as string

  const [allCards, deck]: [Card[], Deck] = await Promise.all([
    api.getCards(),
    api.getDeck(deckId),
  ])

  // 1) On peuple toutes les cartes disponibles
  cards.value = allCards
  name.value = deck.name

  // 2) On attend que le CardGrid soit monté dans le DOM
  await nextTick()

  // 3) On récupère les vrais cardId (pas les id de jointure)
  selected.value = (deck.cards as unknown[]).map((entry) => entry.cardId)
})

const save = async () => {
  const deckId = route.params.id as string

  await api.updateDeck(deckId, {
    name: name.value,
    cards: selected.value, // number[] de cardId
  })

  router.push(ROUTES.HOME)
}
</script>

<style scoped>
.counter {
  font-weight: bold;
}

.top-bar {
  margin-bottom: 12px;
}
</style>
