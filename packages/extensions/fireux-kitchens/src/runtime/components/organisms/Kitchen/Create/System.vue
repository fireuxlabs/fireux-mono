<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">{{ headerTitle }}</div>
          <div class="text-sm text-dimmed">
            {{ headerDescription }}
          </div>
        </div>
      </template>

      <div
        v-if="showDevNotes"
        data-dev-note="true"
        :data-dev-note-title="developerNoteTitle"
        class="fireux-dev-note rounded-lg px-4 py-3 text-xs text-dimmed"
      >
        <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
          Developer Note
        </p>
        <ul data-dev-note-body class="list-disc space-y-1 pl-4">
          <li>Needs a confirmed real place selection.</li>
          <li v-if="isConsoleMode">Requires an authenticated user on the console route.</li>
          <li v-else>If entered from the kitchen CTA, the flow normally ensures a Chef profile first.</li>
          <li v-if="isConsoleMode">
            Ensures
            <code>kitchens/&lt;id&gt;</code>
            and
            <code>apps/&lt;appId&gt;/kitchens/&lt;id&gt;</code>.
          </li>
          <li v-else>
            Creates or ensures
            <code>kitchens/&lt;id&gt;</code>.
          </li>
          <li v-if="isConsoleMode">
            Ensures the app-scoped kitchen record and links the kitchen to the chef profile association.
          </li>
          <li v-else>Does not create the app-hosted kitchen console overlay.</li>
          <li v-if="isConsoleMode">
            Success routes to
            <code>{{ successTo }}</code>.
          </li>
          <li v-else>
            Success routes to
            <code>/kitchens/&lt;id&gt;</code>.
          </li>
        </ul>
      </div>

      <KitchenCreateWrite
        :mode="resolvedMode"
        :return-to="returnTo"
        :cancel-to="cancelTo"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { ConsoleCreateMode } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { computed } from 'vue'
import KitchenCreateWrite from './Write.vue'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  returnTo: '',
  cancelTo: '',
})

const { notesVisible } = useDevUi()

const resolvedMode = computed<ConsoleCreateMode>(() => props.mode)
const returnTo = computed(() => String(props.returnTo || '').trim())
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const isConsoleMode = computed(() => resolvedMode.value === 'console')
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() =>
  isConsoleMode.value ? 'Create Kitchen Console' : 'Create Kitchen'
)
const headerTitle = computed(() =>
  isConsoleMode.value ? 'Search for your venue' : 'Search for a venue'
)
const headerDescription = computed(() =>
  isConsoleMode.value
    ? 'We’ll connect this location to your console overlay. Nothing is duplicated.'
    : 'We’ll create the public kitchen entity for a real venue. Nothing is duplicated.'
)
const successTo = computed(() => {
  if (returnTo.value.startsWith('/')) return returnTo.value
  return isConsoleMode.value ? '/console/kitchen' : '/kitchens/<id>'
})
</script>
