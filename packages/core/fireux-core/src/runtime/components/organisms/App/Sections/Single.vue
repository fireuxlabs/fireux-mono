<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard class="fx-section">
      <template #header>
        <div class="fx-section__header">
          <div class="fx-section__copy">
            <h2 class="text-base font-semibold">App</h2>
            <p class="text-xs text-gray-500">
              Details for the scoped app in this runtime.
            </p>
          </div>
        </div>
      </template>

      <template v-if="current">
        <MoleculesPill v-bind="pill" class="max-w-md" />
        <OrganismsAppCardsCell
          :app="current"
          :to="appLink"
          class="max-w-md mt-3"
        />

        <section class="fx-section__item">
          <h3 class="fx-section__label font-semibold">Computed</h3>
          <ul class="text-sm">
            <li v-for="([key, val], index) in flagEntries" :key="index">
              <strong>{{ key }}:</strong> {{ String(val) }}
            </li>
          </ul>
        </section>
      </template>

      <p v-else class="fx-section__empty">No app loaded.</p>
    </UCard>

    <OrganismsAppCardsProfile v-if="profile" :app="profile" class="max-w-2xl" />

    <OrganismsAppSectionsSubcollection :app-id="subcollectionAppId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppFetch } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppFetch.ts'
import type { AppCard } from 'fireux-core/runtime/models/core/app.model.ts'

const props = defineProps<{ appId?: string | null }>()

const { app: runtimeApp, pillProps, profileProps } = useApp()
const { app: overrideApp } = useAppFetch(props.appId ?? null)

const current = computed(() => {
  return (props.appId ? overrideApp.value : runtimeApp.value) ?? null
})

const pill = computed(() =>
  current.value ? pillProps(current.value) : pillProps()
)
const appLink = computed(() => pill.value?.to || null)
const computedFlags = computed(() => ({
  isInitialized: Boolean(current.value?.admin_ids?.length),
}))

const flagEntries = computed<[string, unknown][]>(() =>
  Object.entries(computedFlags.value)
)

const profile = computed<AppCard.Profile | null>(() =>
  current.value ? profileProps(current.value) : null
)

const subcollectionAppId = computed(
  () => props.appId ?? current.value?.id ?? null
)
</script>
