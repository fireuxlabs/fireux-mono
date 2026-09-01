<template>
  <UDashboardPanel id="workspace-kitchen-detail">
    <template #header>
      <LayoutsWorkspaceNavbar title="Kitchen" />
    </template>
    <template #body>
      <section class="workspace-surface workspace-surface--compact">
        <UButton
          to="/workspace/kitchen"
          label="Back to Kitchens"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          class="w-fit"
        />
        <template v-if="kitchen">
          <UAvatar
            :src="kitchen.identity.image_url || undefined"
            :alt="kitchen.identity.display_name"
            icon="i-lucide-chef-hat"
            size="3xl"
          />
          <div>
            <h1 class="text-2xl font-semibold text-highlighted">
              {{ kitchen.identity.display_name }}
            </h1>
            <p v-if="kitchen.identity.tagline" class="mt-1 text-muted">
              {{ kitchen.identity.tagline }}
            </p>
          </div>
        </template>
        <USkeleton v-else-if="loading" class="h-32 w-full rounded-xl" />
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
import { computed } from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenWorkspaceChoices } from '../../../kitchen/composables/workspace/index/useKitchenWorkspaceChoices'

const appContext = useCurrentAppContext()
const kitchenId = useRouteParam('kitchenId')
const kitchenIds = computed(() => appContext.membership.value?.kitchens || [])
const choices = useKitchenWorkspaceChoices(true, kitchenIds)
const kitchen = computed(() =>
  choices.kitchens.value.find((candidate) => candidate.id === kitchenId.value)
)
const loading = computed(
  () =>
    appContext.pending.value ||
    (kitchenIds.value.includes(kitchenId.value) && !kitchen.value)
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
