<template>
  <section class="console-surface space-y-4">
    <UAlert
      v-if="!kitchenState.id.value"
      color="neutral"
      variant="soft"
      title="No kitchen selected"
      description="Select a kitchen on /console/kitchen first."
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Kitchen Menu Storage Debug</div>
            <p class="text-sm text-dimmed">
              Temporary migration view for checking root and app-scoped menu records.
            </p>
          </div>
        </template>

        <div class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
          <div>
            Kitchen ID:
            <span class="font-medium text-default">{{ kitchenState.id.value }}</span>
          </div>

          <div>
            App ID:
            <span class="font-medium text-default">{{ appId }}</span>
          </div>

          <div class="sm:col-span-2">
            Root path:
            <span class="font-medium text-default break-all">{{ rootMenuPath }}</span>
          </div>

          <div class="sm:col-span-2">
            App path:
            <span class="font-medium text-default break-all">{{ appMenuPath }}</span>
          </div>

          <div>
            Root menus:
            <span class="font-medium text-default">{{ rootMenus.length }}</span>
          </div>

          <div>
            App menus:
            <span class="font-medium text-default">{{ appMenus.length }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Root Menus</div>
            <p class="text-sm text-dimmed">
              Stored at kitchens/{{ kitchenState.id.value }}/menus
            </p>
          </div>
        </template>

        <pre class="text-xs overflow-x-auto whitespace-pre-wrap">{{ rootDump }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">App Menus</div>
            <p class="text-sm text-dimmed">
              Stored at apps/{{ appId }}/kitchens/{{ kitchenState.id.value }}/menus
            </p>
          </div>
        </template>

        <pre class="text-xs overflow-x-auto whitespace-pre-wrap">{{ appDump }}</pre>
      </UCard>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import type { Menu } from '../../../models/menu.model'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menus',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    position: 'top',
    requiresSelection: true,
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { appId } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()
const { kitchenState } = useKitchenConsole({ publishHeader: true })

const kitchenId = computed(() => String(kitchenState.id.value || '').trim())
const resolvedAppId = computed(() => String(appId || '').trim())

const rootMenuPath = computed(() =>
  kitchenId.value ? `kitchens/${kitchenId.value}/menus` : ''
)

const appMenuPath = computed(() =>
  kitchenId.value && resolvedAppId.value
    ? `apps/${resolvedAppId.value}/kitchens/${kitchenId.value}/menus`
    : ''
)

const rootMenusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>
const appMenusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  rootMenuPath,
  (nextPath) => {
    rootMenusRef.value = nextPath ? firestoreFetchCollection<Menu>(nextPath) : null
  },
  { immediate: true }
)

watch(
  appMenuPath,
  (nextPath) => {
    appMenusRef.value = nextPath ? firestoreFetchCollection<Menu>(nextPath) : null
  },
  { immediate: true }
)

const rootMenus = computed(() => rootMenusRef.value?.value ?? [])
const appMenus = computed(() => appMenusRef.value?.value ?? [])

const rootDump = computed(() =>
  JSON.stringify(rootMenus.value, null, 2)
)

const appDump = computed(() =>
  JSON.stringify(appMenus.value, null, 2)
)
</script>