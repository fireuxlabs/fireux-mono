<template>
  <section v-if="kitchenId" class="space-y-5">
    <WorkspaceCapability collection-label="Menus">
      <template #collection-panel
        ><WorkspaceKitchenMenusCrud /><WorkspaceKitchenMenusList
      /></template>
      <template #selected-panel>
        <UCard v-if="selectedMenu">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Selected menu
              </p>
              <h2 class="mt-1 text-2xl font-semibold text-highlighted">
                {{ selectedMenu.name || selectedMenu.id }}
              </h2>
              <p
                v-if="selectedMenu.description"
                class="mt-2 text-sm text-muted"
              >
                {{ selectedMenu.description }}
              </p>
            </div>
            <UBadge
              :color="
                selectedMenu.status === 'published' ? 'success' : 'neutral'
              "
              variant="soft"
              >{{
                selectedMenu.status === 'published' ? 'Live' : 'Draft'
              }}</UBadge
            >
          </div>
          <WorkspaceCrudToolbar
            v-if="canWrite"
            label="Selected menu"
            :available="
              derived.capability.availableActions.filter(
                (action) => action === 'update' || action === 'delete'
              )
            "
            @update="navigateTo(selectedPath)"
            @delete="navigateTo(`${selectedPath}#delete-menu`)"
            class="mt-4"
          />
          <div class="mt-5 flex flex-wrap gap-2">
            <UButton :to="`${selectedPath}/content`" icon="i-lucide-list-tree"
              >Items &amp; prices</UButton
            >
            <UButton
              :to="`${selectedPath}/publishing`"
              color="neutral"
              variant="soft"
              icon="i-lucide-globe"
              >Publishing</UButton
            >
            <UButton
              :to="selectedPath"
              color="neutral"
              variant="ghost"
              icon="i-lucide-settings-2"
              >Menu details</UButton
            >
          </div>
          <p v-if="!canWrite" class="mt-4 text-sm text-muted">
            You can view these menus. Editing requires access to this kitchen.
          </p>
        </UCard>
      </template>
    </WorkspaceCapability>
    <MoleculesDisclosurePanel title="Primary menu & daily specials"
      ><WorkspaceKitchenMenusRoles
    /></MoleculesDisclosurePanel>
  </section>
  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Choose a kitchen"
    description="Return to the start to choose the kitchen whose menus you want to manage."
    :actions="[{ label: 'Choose kitchen', to: '/' }]"
  />
</template>
<script setup lang="ts">
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { navigateTo } from '#imports'
import { computed } from 'vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const { kitchenId, selectedMenu, canWrite, derived } =
  useKitchenMenusContext()
const selectedPath = computed(
  () =>
    `/workspace/kitchen/menus/${encodeURIComponent(selectedMenu.value?.id || '')}`
)
</script>
