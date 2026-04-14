<template>
  <div class="grid" :class="sizeClass">
    <div class="top-bar">
      <div class="size-buttons">
        <NButton
          type="primary"
          :ghost="gridSize !== 'sm'"
          @click="gridSize = 'sm'"
        >
          SM
        </NButton>

        <NButton
          type="primary"
          :ghost="gridSize !== 'md'"
          @click="gridSize = 'md'"
        >
          MD
        </NButton>
      </div>
    </div>
    <div
      v-for="c in cards"
      :key="c.id"
      class="wrapper"
      :class="{
        selected: modelValue.includes(c.id),
        disabled: isCardDisabled(c.id),
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Card } from '@/types'

import CardItem from './CardItem.vue'

const gridSize = ref<'sm' | 'md'>('md')

const props = defineProps<{
  cards: Card[]
  modelValue: number[]
  maxSelected?: number
  size?: 'sm' | 'md'
  selectable?: boolean
  currentHp?: Record<number, number>
}>()

const emit = defineEmits(['update:modelValue'])

const size = props.size || 'sm'
const selectable = props.selectable !== false
const currentHp = props.currentHp || undefined

const sizeClass = computed(() =>
  gridSize.value === 'md' ? 'grid-md' : 'grid-sm',
)

const selectedCount = () => props.modelValue.length

const isCardDisabled = (id: number): boolean => {
  if (!selectable) return false

  if (
    props.maxSelected &&
    selectedCount() >= props.maxSelected &&
    !props.modelValue.includes(id)
  ) {
    return true
  }
  return false
}

const toggle = (id: number) => {
  if (!selectable) return
  if (isCardDisabled(id)) return

  const selected = props.modelValue.includes(id)
    ? props.modelValue.filter((x) => x !== id)
    : [...props.modelValue, id]

  emit('update:modelValue', selected)
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 12px;
}

.grid-sm {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.grid-md {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

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
</style>
