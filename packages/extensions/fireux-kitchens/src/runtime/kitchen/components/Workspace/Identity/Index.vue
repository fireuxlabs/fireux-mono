<template>
  <USkeleton v-if="identity.status.value === 'pending'" class="h-40" />
  <UAlert
    v-else-if="identity.status.value === 'empty'"
    title="No Kitchen selected"
    description="Choose a Kitchen to continue."
  />
  <UAlert
    v-else-if="identity.status.value === 'error'"
    title="Venue identity unavailable"
    description="Your venue details could not be loaded. Try again."
    color="error"
  />
  <UAlert
    v-else-if="identity.status.value === 'missing'"
    title="Venue details unavailable"
    description="This Kitchen’s venue details could not be found."
    color="warning"
  />
  <div v-else class="mx-auto w-full max-w-6xl space-y-6">
    <div
      class="flex flex-wrap items-center justify-between gap-4 border-b border-default pb-5"
    >
      <KitchenEditPublication
        :key="identity.kitchenId.value"
        :kitchen="identity.selectedKitchen.value"
        :kitchen-id="identity.kitchenId.value"
        :can-write="identity.canWrite.value"
      />
      <div class="flex flex-wrap items-center gap-2">
        <PlaceEditGoogleReview
          v-if="identity.canWrite.value && identity.place.value"
          :place="identity.place.value"
        />
        <UButton
          :to="publicTo"
          label="View public page"
          icon="i-lucide-arrow-up-right"
          target="_blank"
          color="neutral"
          variant="ghost"
        />
      </div>
    </div>
    <PlaceDetail
      v-if="identity.place.value"
      :key="identity.placeId.value"
      :place="identity.place.value"
      :show-management="false"
    >
      <template v-if="identity.canWrite.value" #edit-actions>
        <div
          class="flex flex-wrap gap-2"
          role="group"
          aria-label="Edit identity sections"
        >
          <UButton
            v-for="item in sections"
            :key="item.value"
            :label="item.label"
            :icon="item.icon"
            :aria-label="`Edit ${item.label.toLowerCase()}`"
            color="neutral"
            variant="soft"
            @click="section = item.value"
          />
        </div>
      </template>
    </PlaceDetail>
  </div>
  <USlideover
    :open="Boolean(section) && identity.canWrite.value"
    :title="identity.fields.value.name || 'Identity'"
    :ui="{ content: 'sm:max-w-xl' }"
    @update:open="
      (open) => {
        if (!open) section = null
      }
    "
  >
    <template #body>
      <PlaceEdit
        v-if="section && identity.canWrite.value"
        :key="`${identity.placeId.value}:${section}`"
        :section="section"
        :place="identity.place.value"
        :show-business-hours="false"
        :show-currency="false"
        :mutation-authority="identity.mutationAuthority.value"
      >
        <template #settings><KitchenEditCurrency /></template>
      </PlaceEdit>
      <UButton
        v-if="section === 'visit'"
        to="/workspace/kitchen/identity/operating-hours"
        label="Operating hours"
        icon="i-lucide-clock"
        color="neutral"
        variant="link"
        class="mt-4"
      />
      <UButton
        v-if="section === 'brand'"
        to="/workspace/kitchen/identity/appearance"
        label="Colours and appearance"
        icon="i-lucide-palette"
        color="neutral"
        variant="link"
        class="mt-4"
      />
    </template>
  </USlideover>
  <PlaceEditIdentity
    ref="editor"
    :place="identity.place.value"
    :can-write="identity.canWrite.value"
    :mutation-authority="identity.mutationAuthority.value"
  />
  <ClientOnly>
    <DevDebugPanel
      v-bind="debug"
      title="Identity debug"
      class="mx-auto mt-6 w-full max-w-6xl"
    />
  </ClientOnly>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import {
  identityKitchenDebug,
  identityPlaceDebug,
  identityPresenceDebug,
} from '../../../utils/identity-debug'
import PlaceDetail from 'fireux-places/runtime/place/components/Detail.vue'
import PlaceEdit from 'fireux-places/runtime/place/components/Edit.vue'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import PlaceEditGoogleReview from 'fireux-places/runtime/place/components/Edit/GoogleReview.vue'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
import type { PlaceIdentitySection } from 'fireux-places/runtime/place/models/identity-edit'
import { readKitchenVisibility } from '../../../utils/kitchen-readers'
const props = defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const route = useRoute()
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'passed',
    objects: {
      kitchen: identityKitchenDebug(props.identity.selectedKitchen.value),
      place: identityPlaceDebug(props.identity.place.value),
    },
    derived: {
      route: route.path,
      kitchenId: props.identity.kitchenId.value,
      placeId: props.identity.placeId.value,
      status: props.identity.status.value,
      reads: {
        kitchen: props.identity.outcome.value,
        place: props.identity.placeOutcome.value,
      },
      canWrite: props.identity.canWrite.value,
      availableActions: [...props.identity.availableActions.value],
      editorSection: section.value,
      publicPath: publicTo.value,
      present: identityPresenceDebug(props.identity.place.value),
    },
  })
)
const section = ref<PlaceIdentitySection | null>(null)
const sections: Array<{
  value: PlaceIdentitySection
  label: string
  icon: string
}> = [
  { value: 'profile', label: 'Profile', icon: 'i-lucide-type' },
  { value: 'brand', label: 'Brand', icon: 'i-lucide-shapes' },
  { value: 'photos', label: 'Photos', icon: 'i-lucide-images' },
  { value: 'contact', label: 'Contact', icon: 'i-lucide-contact' },
  { value: 'visit', label: 'Visit', icon: 'i-lucide-map-pin' },
]
const publicTo = computed(() => {
  const kitchen = props.identity.selectedKitchen.value
  const slug = String(kitchen?.slug || '').trim()
  return slug && readKitchenVisibility(kitchen)
    ? `/kitchens/${encodeURIComponent(slug)}`
    : `/places/${encodeURIComponent(props.identity.placeId.value)}`
})
watch([props.identity.kitchenId, props.identity.canWrite], () => {
  section.value = null
})
const editor = ref<InstanceType<typeof PlaceEditIdentity>>()
defineExpose({
  openAction: (intent: KitchenIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent.fields)
  },
})
</script>
