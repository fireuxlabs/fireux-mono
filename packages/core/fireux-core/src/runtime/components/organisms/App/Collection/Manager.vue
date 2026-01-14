<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Apps</h2>
          <p class="text-xs text-gray-500">
            Browse apps available to this runtime.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search apps…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsAppCollectionList v-if="cards.length" :cards="cards" :variant="variant" />

    <p v-else class="fx-section__empty">
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>

    <div
      v-if="showDebug"
      class="pt-4 mt-4 border-t border-slate-200/70 max-w-3xl mx-auto space-y-2"
    >
      <component
        :is="DevJson"
        v-if="DevJson"
        title="Dev · App Collection Manager"
        :data="devPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { useAppCollection } from '../../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const DevJson = defineAsyncComponent(() =>
  import('../../../../components/dev/DevJson.vue')
)

const { devMode } = useFireUXConfig()
const showDebug = computed(() => Boolean(devMode) && import.meta.dev)

const { apps, count: totalCount } = useAppCollection()
const { card, searchText } = useAppInterface()

const query = ref('')

type Variant = 'pill' | 'cell'

const variant = ref<Variant>('pill')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const normalizedApps = computed<App[]>(() => apps.value ?? [])

const visibleApps = computed<App[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return normalizedApps.value

  return normalizedApps.value.filter((app) => searchText(app).includes(q))
})

const visibleCount = computed(() => visibleApps.value.length)

const cards = computed<AppCard.Card[]>(() =>
  visibleApps.value
    .map((app) => card(app))
    .filter((payload): payload is AppCard.Card => Boolean(payload))
)

const devPayload = computed(() => ({
  variant: variant.value,
  query: query.value,
  totalCount: totalCount.value,
  visibleCount: visibleCount.value,
  apps: normalizedApps.value,
  visible: visibleApps.value,
  cards: cards.value,
}))
</script>
