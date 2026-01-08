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
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppCollection } from '../../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const { apps, count: totalCount } = useAppCollection()
const { card } = useAppInterface()

const query = ref('')

const variant = ref<'pill' | 'cell'>('pill')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const normalizedApps = computed<App[]>(() => apps.value ?? [])

const visibleApps = computed<App[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return normalizedApps.value

  return normalizedApps.value.filter((app) => {
    const name = (app.app_name ?? '').toLowerCase()
    const eco = (app.ecosystem ?? '').toLowerCase()
    const short = (app.app_short_name ?? '').toLowerCase()
    return name.includes(q) || eco.includes(q) || short.includes(q)
  })
})

const visibleCount = computed(() => visibleApps.value.length)

const cards = computed<AppCard.Card[]>(() =>
  visibleApps.value
    .map((app) => card(app))
    .filter((payload): payload is AppCard.Card => Boolean(payload))
)
</script>
