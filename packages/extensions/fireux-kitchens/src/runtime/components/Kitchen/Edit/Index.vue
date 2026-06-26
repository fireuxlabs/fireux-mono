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
          <UPageCard variant="subtle">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="space-y-2">
                <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
                  Editing kitchen
                </p>
                <p class="text-sm font-medium text-highlighted">
                  {{ kitchenTitle }}
                </p>
                <p v-if="kitchenSubtitle" class="text-xs text-dimmed">
                  {{ kitchenSubtitle }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  size="xs"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-eye"
                  :to="detailTo"
                >
                  View public page
                </UButton>
                <UButton
                  v-if="placeEditTo"
                  size="xs"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-map-pin"
                  :to="placeEditTo"
                >
                  Edit linked place
                </UButton>
              </div>
            </div>
          </UPageCard>

          <template v-if="canEdit">
            <KitchenEditIdentity
              :kitchen="hydratedKitchen"
              :kitchen-id="kitchenId"
              :can-write="canEdit"
            />
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/useKitchen'

const props = defineProps<{
  locator: string
}>()

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Kitchen` })

const locator = computed(() => String(props.locator || '').trim())
const { kitchen, pending } = useKitchenFetch(locator)
const loading = computed(() => Boolean(locator.value) && pending.value)
const hydratedKitchen = computed(() => kitchen.value as any | null)
const kitchenId = computed(() =>
  String(hydratedKitchen.value?.id || locator.value || '').trim()
)
const detailTo = computed(() => {
  const slug = String(hydratedKitchen.value?.slug ?? '').trim()
  return slug ? `/kitchens/${encodeURIComponent(slug)}` : '/kitchens'
})

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() =>
  String(hydratedKitchen.value?.claimed_by ?? '').trim()
)
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy.value)
})

const clean = (value: unknown) => String(value ?? '').trim()
const kitchenTitle = computed(() =>
  clean(hydratedKitchen.value?.display_name || hydratedKitchen.value?.name) || 'Kitchen'
)
const kitchenSubtitle = computed(() => clean(hydratedKitchen.value?.tagline))
const placeLocator = computed(() =>
  clean(hydratedKitchen.value?.place_id)
)
const placeEditTo = computed(() =>
  placeLocator.value
    ? `/places/${encodeURIComponent(placeLocator.value)}/edit`
    : ''
)

const pageTitle = computed(
  () =>
    String(
      hydratedKitchen.value?.display_name ||
        hydratedKitchen.value?.name ||
        'Edit kitchen'
    )
)
const pageSubtitle = computed(() =>
  kitchenId.value ? `Kitchen: ${kitchenId.value}` : 'Edit a kitchen'
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
