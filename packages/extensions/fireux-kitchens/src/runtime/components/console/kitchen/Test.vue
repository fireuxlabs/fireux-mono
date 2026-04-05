<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeKitchenPill)"
      :has-options="testKitchenPills.length > 0"
      select-title="Select a test kitchen"
      empty-title="No test kitchens"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activeKitchenPill?.title || ''"
          :description="activeKitchenPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <div v-if="testKitchenPills.length" class="space-y-2">
      <KitchenCardsPill
        v-for="item in testKitchenPills"
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

<script setup lang="ts">
import { useState } from '#imports'
import { computed, ref, watch, watchEffect } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenCreate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

const { runtime } = useRuntimeKitchenConsole()
const kitchenSelection = useRuntimeKitchenSelection()
const { uid, currentUser, isAuthenticated, hasAuthState } = useAuth()
const { ensureKitchen } = useKitchenCreate({ test: true, ensurePlace: false })
const { interface: toKitchenCard } = useKitchenInterface()
const { kitchens: testKitchens } = useKitchenFetch({ collectionPath: 'test-kitchens' })

type KitchenPill = NonNullable<ReturnType<typeof toKitchenCard>>

const stripTestKitchenSuffix = (value: unknown): string =>
  String(value || '').trim().replace(/\s+test kitchen$/i, '').trim()

const buildKitchenPill = (target?: Kitchen | null): KitchenPill | null => {
  const pill = toKitchenCard(target as Kitchen | null)
  if (!pill) return null
  return {
    ...pill,
    title:
      String(currentUser.value?.displayName || '').trim() ||
      stripTestKitchenSuffix(target?.name) ||
      'Your',
    subtitle: 'Test Kitchen',
  }
}

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

const activeKitchenPill = computed(() =>
  testKitchenPills.value.find((item) => item.id === runtime.id.value) ??
  buildKitchenPill(runtime.kitchen.value as Kitchen | null)
)

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
    [hasAuthState, isAuthenticated, uid],
    async ([authReady, authenticated, currentUid]) => {
      const resolvedUid = String(currentUid || '').trim()
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
    mode: 'test',
  })
}
</script>
