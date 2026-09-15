<template>
  <UDashboardPanel id="workspace-kitchen-detail">
    <template #header>
      <LayoutsWorkspaceNavbar title="Kitchen" />
    </template>
    <template #body>
      <section class="workspace-surface workspace-surface--compact">
        <UButton
          :to="workspaceEntryPath"
          label="Back to Kitchens"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          class="w-fit"
        />
        <template v-if="kitchen && !loading && !error">
          <UAvatar
            :src="kitchen.identity?.image_url || undefined"
            :alt="kitchen.identity?.display_name"
            icon="i-lucide-chef-hat"
            size="3xl"
          />
          <div>
            <h1 class="text-2xl font-semibold text-highlighted">
              {{ kitchen.identity?.display_name }}
            </h1>
            <p v-if="kitchen.identity?.tagline" class="mt-1 text-muted">
              {{ kitchen.identity?.tagline }}
            </p>
          </div>
        </template>
        <USkeleton v-else-if="loading" class="h-32 w-full rounded-xl" />
        <MoleculesCopyError v-else-if="error" :message="errorMessage" />
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-lucide-file-question"
          title="Kitchen not found"
          description="Return to Kitchens and choose an available record."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { computed } from 'vue'
import { useKitchenAccess } from '../../../kitchen/composables/useKitchenAccess'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenInterface } from '../../../kitchen/composables/useKitchenInterface'
import { useKitchenRead } from '../../../kitchen/composables/firestore/useKitchenRead'

const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')

const access = useKitchenAccess()
const kitchenId = useRouteParam('kitchenId')
const permittedId = computed(() => {
  if (access.pending.value || access.error.value) return ''
  const id = kitchenId.value
  return access.ids.value.includes(id) ? id : ''
})
const source = useKitchenRead(permittedId)
const { surface } = useKitchenInterface()
const kitchen = computed(() =>
  permittedId.value && source.kitchen.value?.id === permittedId.value
    ? surface({ kitchen: source.kitchen.value, place: source.place.value, routeScope: 'live' })
    : null
)
const loading = computed(() => access.pending.value || source.pending.value)
const error = computed(
  () => access.error.value || (permittedId.value ? source.error.value : null)
)
const errorMessage = computed(() =>
  error.value instanceof Error
    ? error.value.message
    : 'Unable to load this Kitchen.'
)

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
