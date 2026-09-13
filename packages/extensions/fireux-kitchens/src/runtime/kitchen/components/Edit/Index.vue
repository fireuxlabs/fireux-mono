<!-- Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: edit raw Kitchen overrides while presenting the Place-hydrated Kitchen surface. -->
<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="detailTo"
        >
          Back to details
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-copy"
          :disabled="!kitchenId"
          aria-label="Copy kitchen id"
          @click="onCopyKitchenId"
        />
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading kitchen…</p>
        </UPageCard>

        <UAlert
          v-else-if="!kitchen"
          color="error"
          variant="soft"
          title="Kitchen not found"
          description="We could not find this kitchen. Return to the kitchens list and try again."
        />

        <div v-else class="space-y-6">
          <KitchenEditSummary
            :kitchen="hydratedKitchen"
            :kitchen-id="kitchenId"
            :detail-to="detailTo"
            :place-edit-to="placeEditTo"
          />

          <template v-if="canEdit">
            <KitchenDetailOperatorPanel :kitchen="hydratedKitchen" />

            <div
              class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
            >
              <KitchenEditPublication
                :kitchen="rootKitchen"
                :kitchen-id="kitchenId"
                :can-write="canEdit"
              />

              <KitchenEditSetup
                :kitchen="hydratedKitchen"
                :place-edit-to="placeEditTo"
              />
            </div>
          </template>
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Edit access required"
            description="Use an operator or admin account to edit this kitchen and its linked place details."
          />
        </div>

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading kitchen…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed } from 'vue'
import { useKitchenInterface } from '../../composables/useKitchenInterface'
import { useKitchenRead } from '../../composables/firestore/useKitchenRead'

const props = defineProps<{
  locator: string
}>()

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Kitchen` })

const locator = computed(() => String(props.locator || '').trim())
const { kitchen: rootKitchen, place, pending } = useKitchenRead(locator)
const { surface } = useKitchenInterface()
const kitchen = computed(() => surface({ kitchen: rootKitchen.value, place: place.value, routeScope: 'live' }))
const loading = computed(() => Boolean(locator.value) && pending.value)
const hydratedKitchen = computed(() => kitchen.value as any | null)
const kitchenId = computed(() =>
  String(hydratedKitchen.value?.id || locator.value || '').trim()
)
const detailTo = computed(() => {
  const slug = String(hydratedKitchen.value?.slug ?? '').trim()
  return slug ? `/kitchens/${encodeURIComponent(slug)}` : '/kitchens'
})

const { currentUser, isAdmin } = useUserSession()
const claimedBy = computed(() =>
  String(hydratedKitchen.value?.claimed_by ?? '').trim()
)
const operatorIds = computed(() =>
  Array.isArray(hydratedKitchen.value?.operator_ids)
    ? hydratedKitchen.value.operator_ids.map((value: unknown) =>
        String(value || '').trim()
      )
    : []
)
const canEdit = computed(() => {
  const uid = String(currentUser.value?.id || '').trim()
  return Boolean(
    isAdmin.value ||
      (uid && claimedBy.value === uid) ||
      (uid && operatorIds.value.includes(uid))
  )
})

const clean = (value: unknown) => String(value ?? '').trim()
const kitchenTitle = computed(
  () =>
    clean(hydratedKitchen.value?.display_name || hydratedKitchen.value?.name) ||
    'Kitchen'
)
const address = computed(
  () =>
    clean(hydratedKitchen.value?.formatted_address) ||
    clean(hydratedKitchen.value?.short_address)
)
const placeLocator = computed(() => kitchenId.value)
const placeEditTo = computed(() =>
  placeLocator.value
    ? `/places/${encodeURIComponent(placeLocator.value)}/edit`
    : ''
)

const pageTitle = computed(() =>
  String(
    hydratedKitchen.value?.display_name ||
      hydratedKitchen.value?.name ||
      'Edit kitchen'
  )
)
const pageSubtitle = computed(
  () => address.value || 'Finish this kitchen profile.'
)

const toast = useToastify()

async function onCopyKitchenId() {
  if (!kitchenId.value) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(kitchenId.value)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = kitchenId.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    toast.success('Kitchen ID copied')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to copy kitchen ID: ${msg}`)
  }
}
</script>
