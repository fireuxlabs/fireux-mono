<template>
  <client-only>
    <DashboardBaseSection :title="title" :description="description">
      <template #guard>
        <UPageCard v-if="guardMessage" variant="subtle">
          <p class="text-sm text-gray-500">{{ guardMessage }}</p>
        </UPageCard>
      </template>

      <template #hero>
        <UPageCard v-if="hero" variant="naked" orientation="horizontal">
          <div
            class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
          >
            <MoleculesPill
              v-if="hero?.pill"
              v-bind="hero.pill"
              :class="['md:max-w-sm', hero?.pillClass].filter(Boolean)"
            />
            <component
              :is="hero.cellComponent"
              v-bind="hero.cellProps"
              class="md:max-w-md"
            />
          </div>
        </UPageCard>
      </template>

      <template #content>
        <slot />
      </template>

      <template #dev>
        <!-- T0DO remove DevJsonPanel once diagnostics migrate elsewhere -->
        <DevJsonPanel v-if="devData" :data="devData" />
      </template>
    </DashboardBaseSection>
  </client-only>
</template>

<script setup lang="ts">
import DashboardBaseSection from './BaseSection.vue'
import type { Pill } from '../../../types/pill.model.ts'

defineProps<{
  title: string
  description?: string
  guardMessage?: string | null
  hero?: {
    pill?: Pill.Props | null
    pillClass?: string | null
    cellComponent: any
    cellProps: Record<string, any>
  } | null
  devData?: any
}>()
</script>
