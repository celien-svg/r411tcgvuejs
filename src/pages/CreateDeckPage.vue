<template>
  <NCard title="Créer un deck" style="max-width: 800px; margin: auto">
    <NForm>
      <NFormItem label="Nom du deck">
        <NInput v-model:value="name" />
      </NFormItem>

      <NDivider />

      <div class="top-bar">
        <div class="counter">{{ selected.length }} / 10 cartes</div>
      </div>
      <CardGrid
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
        @click="submit"
      >
        Créer
      </NButton>
    </NForm>
  </NCard>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CardGrid from '@/components/cards/CardGrid.vue'
import { useApi } from '@/composables/useApi'
import { ROUTES } from '@/router'
import type { Card } from '@/types'

const api = useApi()
const router = useRouter()

const cards = ref<Card[]>([])
const selected = ref<number[]>([])
const name = ref('')
const gridSize = ref<'sm' | 'md'>('md')

onMounted(async () => {
  cards.value = await api.getCards()
})

const submit = async () => {
  await api.createDeck({ name: name.value, cards: selected.value })
  router.push(ROUTES.HOME)
}
</script>

<style scoped>
.counter {
  margin-bottom: 12px;
  font-weight: bold;
}
</style>
