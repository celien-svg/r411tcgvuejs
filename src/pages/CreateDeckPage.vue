<template>
  <!-- RG3 : pleine largeur mobile, contrainte sur grand écran -->
  <div class="page-wrapper">
    <NCard title="Créer un deck" class="form-card">
      <NForm>
        <NFormItem label="Nom du deck">
          <NInput v-model:value="name" placeholder="Nom du deck" />
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
          style="margin-top: 16px"
          :disabled="selected.length !== 10 || !name"
          @click="submit"
        >
          Créer
        </NButton>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NDivider, NForm, NFormItem, NInput } from 'naive-ui'
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
/* RG3 : pleine largeur sur mobile, max-width sur desktop */
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
  margin-bottom: 12px;
}

.top-bar {
  margin-bottom: 12px;
}

/* Sur mobile : padding réduit dans la card */
@media (max-width: 640px) {
  .page-wrapper {
    padding: 0 8px;
  }
}
</style>
