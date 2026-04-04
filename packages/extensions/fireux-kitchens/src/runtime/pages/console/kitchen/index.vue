<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen">
        <template #right>
          <UButton
            v-if="runtime.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-toned">
            Mode
          </span>

          <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/60 p-1">
            <UButton
              v-for="option in modeOptions"
              :key="option.value"
              size="xs"
              :color="selectedMode === option.value ? 'primary' : 'neutral'"
              :variant="selectedMode === option.value ? 'solid' : 'ghost'"
              :aria-pressed="selectedMode === option.value"
              @click="selectMode(option.value)"
            >
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <UAlert
          v-if="activeKitchenPill"
          color="primary"
          variant="soft"
          :title="activeKitchenPill.title"
          :description="activeKitchenPill.subtitle || ''"
        />

        <UAlert
          v-else-if="availableKitchenPills.length"
          color="neutral"
          variant="soft"
          :title="selectTitle"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          :title="emptyTitle"
        />

        <div v-if="availableKitchenPills.length" class="space-y-2">
          <KitchenCardsPill
            v-for="item in availableKitchenPills"
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
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenCreate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { computed, ref, watch, watchEffect } from 'vue'
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

const modeOptions = [
  { value: 'read-only', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const { runtime, scenarios } = useRuntimeKitchenConsole()
const kitchenSelection = useRuntimeKitchenSelection()
const { uid, currentUser, isAuthenticated, hasAuthState } = useAuth()
const { ensureKitchen } = useKitchenCreate({ test: true, ensurePlace: false })
const { interface: toKitchenCard } = useKitchenInterface()
const { kitchens: liveKitchens } = useKitchenFetch()
const { kitchens: testKitchens } = useKitchenFetch({ collectionPath: 'test-kitchens' })
const selectedMode = kitchenSelection.mode

type KitchenPill = NonNullable<ReturnType<typeof toKitchenCard>>
type ConsoleMode = (typeof modeOptions)[number]['value']

const stripTestKitchenSuffix = (value: unknown): string =>
  String(value || '').trim().replace(/\s+test kitchen$/i, '').trim()

const buildKitchenPill = (target?: Kitchen | null): KitchenPill | null => {
  const pill = toKitchenCard(target as Kitchen | null)
  if (!pill) return null

  return {
    ...pill,
    title:
      selectedMode.value === 'test'
        ? String(currentUser.value?.displayName || '').trim() ||
          stripTestKitchenSuffix(target?.name) ||
          'Your'
        : pill.title,
    subtitle:
      selectedMode.value === 'test'
        ? 'Test Kitchen'
        : pill.subtitle,
  }
}

const demoKitchenPills = computed(() =>
  scenarios.value
    .map((entry) => buildKitchenPill(entry.kitchen as Kitchen))
    .filter((entry): entry is KitchenPill => Boolean(entry))
)

const liveKitchenPills = computed(() =>
  liveKitchens.value
    .map((entry) => buildKitchenPill(entry as Kitchen))
    .filter((entry): entry is KitchenPill => Boolean(entry))
)

const ownedTestKitchens = computed(() => {
  const currentUid = String(uid.value || '').trim()
  if (!currentUid) return []
  return testKitchens.value.filter((entry) => String(entry?.id || '').trim() === currentUid)
})

const testKitchenPills = computed(() =>
  ownedTestKitchens.value
    .map((entry) => buildKitchenPill(entry as Kitchen))
    .filter((entry): entry is KitchenPill => Boolean(entry))
)

const availableKitchenPills = computed(() => {
  if (selectedMode.value === 'live') return liveKitchenPills.value
  if (selectedMode.value === 'test') return testKitchenPills.value
  return demoKitchenPills.value
})

const activeKitchenPill = computed(() =>
  availableKitchenPills.value.find((item) => item.id === runtime.id.value) ??
  buildKitchenPill(runtime.kitchen.value as Kitchen | null)
)
const selectTitle = computed(() => {
  if (selectedMode.value === 'live') return 'Select a real kitchen'
  if (selectedMode.value === 'test') return 'Select a test kitchen'
  return 'Select a demo kitchen'
})
const emptyTitle = computed(() => {
  if (selectedMode.value === 'live') return 'No real kitchens'
  if (selectedMode.value === 'test') return 'No test kitchens'
  return 'No demo kitchens'
})

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activeKitchenPill.value
    ? {
        component: 'KitchenCardsPill',
        props: {
          ...activeKitchenPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})

if (import.meta.client) {
  const ensuringTestKitchen = ref(false)
  const ensuredTestKitchenUid = ref('')

  watch(
    [selectedMode, hasAuthState, isAuthenticated, uid],
    async ([mode, authReady, authenticated, currentUid]) => {
      const resolvedUid = String(currentUid || '').trim()
      if (mode !== 'test') return
      if (!authReady || !authenticated || !resolvedUid) return
      if (ensuringTestKitchen.value) return
      if (ensuredTestKitchenUid.value === resolvedUid) return

      ensuringTestKitchen.value = true
      try {
        await ensureKitchen(
          {
            id: resolvedUid,
            is_test_kitchen: true,
          } as any,
          {
            mode: 'public',
            existingRootId: resolvedUid,
          }
        )
        ensuredTestKitchenUid.value = resolvedUid
      } finally {
        ensuringTestKitchen.value = false
      }
    },
    { immediate: true }
  )
}

const selectKitchen = (kitchenId: string) => {
  const resolvedId = String(kitchenId || '').trim()
  if (!resolvedId) return
  kitchenSelection.setRuntimeKitchen({
    kitchenId: resolvedId,
    mode: selectedMode.value,
  })
}

const selectMode = (mode: ConsoleMode) => {
  kitchenSelection.setRuntimeKitchen({
    mode,
  })
}

const clearSelection = () => {
  kitchenSelection.setRuntimeKitchen({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
