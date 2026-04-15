<template>
  <div class="grid" :class="sizeClass">
    <!-- ── Top bar : recherche (RG1) + boutons taille ───────── -->
    <div class="top-bar">
      <!-- RG1 : champ de recherche au-dessus de la grille -->
      <div class="search-wrapper">
        <span class="search-icon"></span>
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="Rechercher une carte..."
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          ✕
        </button>
      </div>

      <div class="size-buttons">
        <button
          class="size-btn"
          :class="{ active: gridSize === 'sm' }"
          @click="gridSize = 'sm'"
        >
          SM
        </button>
        <button
          class="size-btn"
          :class="{ active: gridSize === 'md' }"
          @click="gridSize = 'md'"
        >
          MD
        </button>
      </div>
    </div>

    <!-- ── Grille filtrée (RG2 + RG3)  -->
    <div class="cards-grid">
      <!--
        RG2 : seules les cartes dont le nom correspond à la recherche sont affichées
        RG3 : les cartes déjà sélectionnées sont toujours incluses même hors filtre
      -->
      <div
        v-for="c in visibleCards"
        :key="c.id"
        class="wrapper"
        :class="{
          selected: modelValue.includes(c.id),
          disabled: isCardDisabled(c.id),
          'out-of-filter': !matchesSearch(c) && modelValue.includes(c.id),
        }"
        @click="toggle(c.id)"
      >
        <CardItem
          :card="c"
          :size="size"
          :selectable="selectable"
          :selected="modelValue.includes(c.id)"
          :disabled="isCardDisabled(c.id)"
          :current-hp="currentHp?.[c.id]"
        />
      </div>

      <div v-if="visibleCards.length === 0" class="empty-search">
        Aucune carte ne correspond à « {{ search }} »
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Card } from '@/types'

import CardItem from './CardItem.vue'

// ─── Props / emits

const props = defineProps<{
  cards: Card[]
  modelValue: number[]
  maxSelected?: number
  size?: 'sm' | 'md'
  selectable?: boolean
  currentHp?: Record<number, number>
}>()

const emit = defineEmits(['update:modelValue'])

// ─── State

const gridSize = ref<'sm' | 'md'>('md')
const search = ref('')

// ─── Props normalisés

const size = props.size ?? 'sm'
const selectable = props.selectable !== false

// ─── Computed

const sizeClass = computed(() =>
  gridSize.value === 'md' ? 'grid-md' : 'grid-sm',
)

/** Vérifie si une carte correspond à la recherche en cours (RG2) */
function matchesSearch(card: Card): boolean {
  if (!search.value.trim()) return true
  return card.name.toLowerCase().includes(search.value.trim().toLowerCase())
}

/**
 * Cartes à afficher dans la grille :
 * - RG2 : celles dont le nom correspond à la recherche
 * - RG3 : + celles déjà sélectionnées, même si elles ne correspondent pas
 */
const visibleCards = computed(() =>
  props.cards.filter(
    (c) => matchesSearch(c) || props.modelValue.includes(c.id),
  ),
)

// ─── Sélection

function isCardDisabled(id: number): boolean {
  if (!selectable) return false
  return !!(
    props.maxSelected &&
    props.modelValue.length >= props.maxSelected &&
    !props.modelValue.includes(id)
  )
}

function toggle(id: number) {
  if (!selectable || isCardDisabled(id)) return
  const next = props.modelValue.includes(id)
    ? props.modelValue.filter((x) => x !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', next)
}
</script>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Top bar  */
.top-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── Recherche (RG1)  */
.search-wrapper {
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1.5px solid #dde3ee;
  border-radius: 8px;
  padding: 5px 10px;
  transition: border-color 0.15s;
}

.search-wrapper:focus-within {
  border-color: #22c55e;
}

.search-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  color: #1a202c;
}

.search-input::placeholder {
  color: #adb5bd;
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #adb5bd;
  font-size: 12px;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}

.search-clear:hover {
  color: #64748b;
}

/* ── Boutons taille  */
.size-buttons {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.size-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1.5px solid #dde3ee;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  color: #64748b;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.size-btn.active {
  background: #1a202c;
  border-color: #1a202c;
  color: #fff;
}

/* ── Grille  */
.cards-grid {
  display: grid;
  gap: 12px;
}

.grid-sm .cards-grid {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.grid-md .cards-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

/* ── Wrapper carte  */
.wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.wrapper:hover {
  transform: scale(1.03);
}

.wrapper.disabled {
  opacity: 0.4;
  pointer-events: none;
}

/*
  RG3 : carte sélectionnée hors filtre
  Reste visible avec une bordure en tirets verte pour signaler
  qu'elle est sélectionnée mais ne correspond pas à la recherche
*/
.wrapper.out-of-filter {
  opacity: 0.65;
  outline: 2px dashed #22c55e;
  outline-offset: 3px;
}

.empty-search {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: #adb5bd;
  font-size: 13px;
  font-style: italic;
}
</style>
