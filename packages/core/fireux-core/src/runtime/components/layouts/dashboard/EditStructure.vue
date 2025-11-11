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
            <component
              v-if="hero?.pillComponent"
              :is="hero.pillComponent"
              v-bind="hero?.pillProps ?? {}"
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
defineProps<{
  title: string
  description?: string
  guardMessage?: string | null
  hero?: {
    pillComponent?: any
    pillProps?: Record<string, any> | null
    pillClass?: string | null
    cellComponent: any
    cellProps: Record<string, any>
  } | null
  devData?: any
}>()
</script>
