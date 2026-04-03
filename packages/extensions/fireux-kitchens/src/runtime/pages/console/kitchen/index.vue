<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activeKitchenPill"
          color="primary"
          variant="soft"
          :title="activeKitchenPill.title"
          :description="activeKitchenPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo kitchen"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo kitchens"
        />

        <div v-if="showSelector" class="space-y-2">
          <KitchenCardsPill
            v-for="item in kitchenPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectKitchen(item.id)"
          />
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useState } from '#imports'
import type { Kitchen } from '../../../models/kitchen.model'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { computed, onScopeDispose, watchEffect } from 'vue'
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen',
    label: 'Kitchen',
    icon: 'i-lucide-chef-hat',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

type ConsoleHeaderPill = {
  component: string
  props: Record<string, unknown>
}

const { runtime, scenarios, setActiveKitchen } = useRuntimeKitchenConsole()
const { interface: toKitchenCard } = useKitchenInterface()

type KitchenPill = NonNullable<ReturnType<typeof toKitchenCard>>

const buildKitchenPill = (target?: Kitchen | null): KitchenPill | null =>
  toKitchenCard(target as Kitchen | null)

const kitchenPills = computed(() =>
  scenarios.value
    .map((entry) => buildKitchenPill(entry.kitchen as Kitchen))
    .filter((entry): entry is KitchenPill => Boolean(entry))
)

const activeKitchenPill = computed(() =>
  kitchenPills.value.find((item) => item.id === runtime.id.value) ??
  buildKitchenPill(runtime.kitchen.value as Kitchen | null)
)

const showSelector = computed(() => scenarios.value.length > 1)
const kitchenHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-kitchen',
  () => null
)

watchEffect(() => {
  const pill = activeKitchenPill.value

  kitchenHeaderPill.value = pill
    ? {
        component: 'KitchenCardsPill',
        props: {
          ...pill,
          link: false,
          showBadges: false,
        },
      }
    : null
})

onScopeDispose(() => {
  kitchenHeaderPill.value = null
})

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    const scenarioId = String((scenarios.value[0]?.kitchen as any)?.id || scenarios.value[0]?.id || '').trim()
    if (!scenarioId) return
    setActiveKitchen(scenarioId)
  })
}

const selectKitchen = (kitchenId: string) => {
  setActiveKitchen(kitchenId)
}
</script>
