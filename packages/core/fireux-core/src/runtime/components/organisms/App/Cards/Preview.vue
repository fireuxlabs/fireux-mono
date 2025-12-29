<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Preview.vue -->
<template>
  <div class="space-y-6">
    <section class="space-y-4">
      <template v-if="current">
        <div class="flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show Pill' : 'Show Cell' }}
          </UButton>
        </div>

        <div class="space-y-4">
          <OrganismsAppCardsPill
            v-if="!showCellView && currentPill"
            :app="currentPill"
          />
          <OrganismsAppCardsCell v-else-if="currentCell" :app="currentCell" />
        </div>
      </template>

      <p v-else class="text-sm text-slate-500">No app loaded.</p>
    </section>

    <OrganismsAppCardsProfile v-if="showExtended && profile" :app="profile" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useApp } from '../../../../composables/fireux/firestore/core/app/useApp'

const props = withDefaults(
  defineProps<{ app?: App | null; compact?: boolean }>(),
  { compact: true }
)

const { app: runtimeApp, pillProps, cellProps, profileProps } = useApp()

const current = computed<App | null>(
  () => props.app ?? runtimeApp.value ?? null
)

const currentPill = computed<AppCard.Pill | null>(() =>
  current.value ? pillProps(current.value) : null
)

const currentCell = computed<AppCard.Cell | null>(() =>
  current.value ? cellProps(current.value) : null
)

const profile = computed<AppCard.Profile | null>(() =>
  current.value ? profileProps(current.value) : null
)

const showExtended = computed(() => !props.compact)

const showCellView = ref(false)
const toggleView = () => {
  showCellView.value = !showCellView.value
}
</script>
