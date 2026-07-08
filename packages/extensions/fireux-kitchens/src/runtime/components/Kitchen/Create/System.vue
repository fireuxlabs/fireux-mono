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
          <li v-else>If entered from the kitchen CTA, a Chef profile may be offered later for public credit.</li>
          <li>
            The kitchen mutation creates
            <code>kitchens/&lt;id&gt;</code>.
          </li>
          <li v-if="isConsoleMode">
            Console activation separately creates
            <code>apps/&lt;appId&gt;/kitchens/&lt;id&gt;</code>.
          </li>
          <li>
            Public kitchen creation does not create a console kitchen.
          </li>
          <li v-if="isConsoleMode">
            Console entry selects the kitchen for runtime. Chef profile links stay optional display/authorship data.
          </li>
          <li v-if="isConsoleMode">
            Success routes to
            <code>{{ successTo }}</code>.
          </li>
          <li v-else>
            Success routes to
            <code>/kitchens/&lt;id&gt;/edit</code>.
          </li>
        </ul>
      </div>

      <KitchenCreateWrite
        :mode="resolvedMode"
        :existing-root-id="existingRootId"
        :return-to="returnTo"
        :cancel-to="cancelTo"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { ConsoleCreateMode } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { computed } from 'vue'
import KitchenCreateWrite from './Write.vue'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  existingRootId?: string
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  existingRootId: '',
  returnTo: '',
  cancelTo: '',
})

const { notesVisible } = useDevUi()

const resolvedMode = computed<ConsoleCreateMode>(() => props.mode)
const existingRootId = computed(() => String(props.existingRootId || '').trim())
const returnTo = computed(() => String(props.returnTo || '').trim())
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const isConsoleMode = computed(() => resolvedMode.value === 'console')
const isExistingConsoleActivation = computed(() =>
  isConsoleMode.value && Boolean(existingRootId.value)
)
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() =>
  isExistingConsoleActivation.value
    ? 'Activate Existing Kitchen Console'
    : isConsoleMode.value
      ? 'Create Kitchen Console'
      : 'Create Kitchen'
)
const headerTitle = computed(() =>
  isExistingConsoleActivation.value
    ? 'Making kitchen console'
    : isConsoleMode.value
      ? 'Search for your venue'
      : 'Search for a venue'
)
const headerDescription = computed(() =>
  isExistingConsoleActivation.value
    ? 'We’ll connect this existing kitchen to your console.'
    : isConsoleMode.value
    ? 'We’ll activate this location for your console. Nothing is duplicated.'
    : 'We’ll create the public kitchen entity for a real venue. Setup continues on the kitchen edit page.'
)
const successTo = computed(() => {
  if (returnTo.value.startsWith('/')) return returnTo.value
  if (isExistingConsoleActivation.value) return '/console/kitchen/overview'
  return isConsoleMode.value ? '/console/kitchen' : '/kitchens/<id>/edit'
})
</script>
