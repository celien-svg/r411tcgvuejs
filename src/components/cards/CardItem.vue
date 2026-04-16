<template>
  <div
    class="card-item"
    :class="[size, { selected, disabled }]"
    @click="handleClick"
  >
    <img :src="card.imgUrl" class="card-img" />

    <div class="info">
      <div class="dex">#{{ card.pokedexNumber }}</div>

      <div class="hp">{{ card.hp }} HP</div>

      <div class="name">{{ card.name }}</div>

      <div class="type" :style="{ backgroundColor: card.typeColor }">
        {{ card.type }}
      </div>

      <span class="atk">{{ card.attack }} ATK</span>

      <div v-if="currentHp !== undefined" class="hp-bar">
        <div class="hp-fill" :style="{ width: hpPercent + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '@/types'

const props = defineProps<{
  card: Card
  size?: 'sm' | 'md'
  selectable?: boolean
  disabled?: boolean
  selected?: boolean
  currentHp?: number
}>()

const emit = defineEmits(['click'])

const hpPercent = computed(() => {
  if (props.currentHp === undefined || props.card.hp <= 0) {
    return 0
  }

  const raw = (props.currentHp / props.card.hp) * 100
  return Math.min(100, Math.max(0, raw))
})

const handleClick = () => {
  if (!props.disabled && props.selectable) emit('click', props.card.id)
}
</script>

<style scoped>
.card-item {
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: 0.2s;
}
.card-item.selected {
  border-color: #18a058;
}
.card-item.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.card-item.sm {
  width: 120px;
}
.card-item.md {
  width: 180px;
}
.card-img {
  width: 100%;
}
.hp-bar {
  height: 6px;
  background: #ddd;
  border-radius: 4px;
  margin-top: 4px;
}
.hp-fill {
  height: 100%;
  background: #18a058;
  border-radius: 4px;
}
</style>
