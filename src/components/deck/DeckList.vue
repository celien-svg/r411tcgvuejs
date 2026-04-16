<template>
  <div class="deck-list">
    <!-- RG2 : 1 colonne mobile → 2 tablette → 3 desktop -->
    <NGrid responsive="screen" cols="1 s:2 m:3" :x-gap="16" :y-gap="16">
      <NGi v-for="d in decks" :key="d.id">
        <NCard :title="d.name" size="large">
          <div class="cards-preview">
            <img
              v-for="c in d.cards"
              :key="c.id"
              :src="c.imgUrl"
              class="card-thumb"
            />
          </div>

          <template #action>
            <div class="actions">
              <NButton size="small" @click="goDetail(d.id)">Voir</NButton>
              <NButton size="small" @click="goEdit(d.id)">Modifier</NButton>
              <NButton size="small" @click="remove(d.id)">Supprimer</NButton>
            </div>
          </template>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NGi, NGrid } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { ROUTES } from '@/router'
import type { Deck } from '@/types'

const api = useApi()
const router = useRouter()

const decks = ref<Deck[]>([])

const load = async () => {
  decks.value = await api.getMyDecks()
}

onMounted(load)

const goDetail = (id: number) => router.push(ROUTES.DECK_DETAIL(id))
const goEdit = (id: number) => router.push(ROUTES.DECK_EDIT(id))
const remove = async (id: number) => {
  await api.deleteDeck(id)
  await load()
}
</script>

<style scoped>
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

.actions {
  display: flex;
  justify-content: space-between;
}
</style>
