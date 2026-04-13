<template>
  <div class="home">
    <div class="header">
      <h1>Mes decks</h1>

      <NButton type="primary" size="large" @click="goCreate">
        Créer un deck
      </NButton>
    </div>

    <NGrid :cols="3" :x-gap="16" :y-gap="16">
      <NGi v-for="deck in decks" :key="deck.id">
        <NCard :title="deck.name" size="large">
          <div class="cards-preview">
            <img
              v-for="card in deck.cards"
              :key="card.id"
              :src="card.imgUrl"
              class="card-thumb"
            />
          </div>

          <template #action>
            <div class="deck-actions">
              <NButton size="small" @click="goDetail(deck.id)">Voir</NButton>
              <NButton size="small" @click="goEdit(deck.id)">Modifier</NButton>
              <NButton size="small" type="error" @click="remove(deck.id)">Supprimer</NButton>
            </div>
          </template>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { ROUTES } from '@/router'
import type { Deck } from '@/types'

const router = useRouter()
const api = useApi()

const decks = ref<Deck[]>([])

async function loadDecks() {
  decks.value = await api.getMyDecks()
}

onMounted(async () => {
  await loadDecks()
})

const goCreate = () => {
  router.push(ROUTES.DECK_CREATE)
}

const goDetail = (id: number) => {
  router.push(`/decks/${id}`)
}

const goEdit = (id: number) => {
  router.push(`/decks/${id}/edit`)
}

const remove = async (id: number) => {
  await api.deleteDeck(id)
  await loadDecks()
}
</script>

<style scoped>
.home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.cards-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.card-thumb {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
}

.deck-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
