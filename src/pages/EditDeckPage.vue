<template>
  <!-- RG3 : pleine largeur mobile, contrainte sur grand écran -->
  <div class="page-wrapper">
    <NCard title="Modifier le deck" class="form-card">
      <NForm>
        <NFormItem label="Nom du deck">
          <NInput v-model:value="name" placeholder="Nom du deck" />
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
          style="margin-top: 16px"
          :disabled="selected.length !== 10 || !name"
          @click="save"
        >
          Enregistrer
        </NButton>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NDivider, NForm, NFormItem, NInput } from 'naive-ui'
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

  cards.value = allCards
  name.value = deck.name

  await nextTick()

  selected.value = (deck.cards as unknown[]).map(
    (entry) => (entry as { cardId: number }).cardId,
  )
})

const save = async () => {
  const deckId = route.params.id as string
  await api.updateDeck(deckId, { name: name.value, cards: selected.value })
  router.push(ROUTES.HOME)
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

.form-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.counter {
  font-weight: bold;
}

.top-bar {
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .page-wrapper {
    padding: 0 8px;
  }
}
</style>
