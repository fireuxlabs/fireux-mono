<template>
  <div class="space-y-6">
    <UCard v-if="hasProfile">
      <template #header>
        <h2>{{ header }}</h2>
        <p v-if="description" class="text-sm opacity-70">{{ description }}</p>
      </template>

      <div class="space-y-4">
        <component
          v-if="cardCellComponent && Object.keys(cellBindings).length"
          :is="cardCellComponent"
          v-bind="cellBindings"
          :class="cellClass"
        />
        <component
          v-if="cardPillComponent && Object.keys(pillBindings).length"
          :is="cardPillComponent"
          v-bind="pillBindings"
          :class="pillClass"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">{{ emptyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

type GenericComponent = Component | string | null | undefined

type UnknownRecord = Record<string, unknown>

const props = withDefaults(
  defineProps<{
    cell: unknown | null
    pill: unknown | null
    cardCellComponent?: GenericComponent
    cardCellProp?: string
    cardPillComponent?: GenericComponent
    cardPillProp?: string
    cellClass?: string
    pillClass?: string
    emptyMessage?: string
    headerTitle?: string | null
    headerDescription?: string | null
    hasProfile?: boolean | null
  }>(),
  {
    cardCellComponent: null,
    cardCellProp: 'item',
    cardPillComponent: null,
    cardPillProp: 'item',
    cellClass: 'max-w-xl',
    pillClass: 'max-w-md',
    emptyMessage: 'No profile loaded.',
    headerTitle: null,
    headerDescription: null,
    hasProfile: null,
  }
)

const { coreUser } = useUser()

const header = computed(
  () => props.headerTitle ?? coreUser.value?.display_name ?? 'Profile'
)

const description = computed(() => props.headerDescription ?? '')

const hasProfile = computed(() => {
  if (typeof props.hasProfile === 'boolean') return props.hasProfile
  return Boolean(props.cell || props.pill)
})

const cellBindings = computed<UnknownRecord>(() => {
  if (!props.cell || !props.cardCellProp) return {}
  return { [props.cardCellProp]: props.cell }
})

const pillBindings = computed<UnknownRecord>(() => {
  if (!props.pill || !props.cardPillProp) return {}
  return { [props.cardPillProp]: props.pill }
})

const cardCellComponent = computed(() => props.cardCellComponent)
const cardPillComponent = computed(() => props.cardPillComponent)
const cellClass = computed(() => props.cellClass)
const pillClass = computed(() => props.pillClass)
const emptyMessage = computed(() => props.emptyMessage ?? 'No profile loaded.')
</script>
