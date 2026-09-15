<template>
  <section v-if="kitchenId" class="space-y-8">
    <WorkspaceKitchenMenusCrud />
    <div
      v-if="derived.status === 'loading'"
      class="space-y-4"
      aria-label="Loading menus"
      aria-busy="true"
    >
      <USkeleton class="h-10 w-48" />
      <USkeleton class="h-40 w-full rounded-2xl" />
    </div>
    <MoleculesCopyError
      v-else-if="derived.status === 'error'"
      :message="String(error || 'Menus could not be loaded.')"
    />
    <WorkspaceCapability v-else collection-label="Menus">
      <template #collection><WorkspaceKitchenMenusList /></template>
      <template #selected-tools>
        <UButton
          v-if="selectedMenu"
          :to="selectedPath"
          icon="i-lucide-settings-2"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Menu settings"
        />
      </template>
      <template #selected>
        <UCard v-if="selectedMenu" :ui="{ body: 'space-y-5' }">
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-xl font-semibold text-highlighted">
              {{ selectedMenu.name || selectedMenu.id }}
            </h2>
            <UBadge
              :color="
                selectedMenu.status === 'published' ? 'success' : 'neutral'
              "
              variant="subtle"
              size="sm"
              >{{
                selectedMenu.status === 'published'
                  ? 'Published'
                  : 'Unpublished'
              }}</UBadge
            >
          </div>
          <p v-if="selectedMenu.description" class="text-sm text-muted">
            {{ selectedMenu.description }}
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              :to="`${selectedPath}/content`"
              icon="i-lucide-list-tree"
              size="sm"
              >Items &amp; prices</UButton
            >
            <UButton
              :to="`${selectedPath}/publishing`"
              icon="i-lucide-globe"
              color="neutral"
              variant="soft"
              size="sm"
              >Publishing</UButton
            >
            <UButton
              :to="selectedPath"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              >Details</UButton
            >
          </div>
          <p v-if="!canWrite" class="text-sm text-muted">
            Editing requires access to this kitchen.
          </p>
        </UCard>
        <UButton
          v-else-if="derived.capability.primitives.create.available"
          icon="i-lucide-plus"
          class="justify-self-start"
          @click="actions.openCreate"
          >Add menu</UButton
        >
        <p v-else-if="menuCreateBlockedMessage" class="text-sm text-muted">
          {{ menuCreateBlockedMessage }}
        </p>
      </template>
    </WorkspaceCapability>
  </section>
  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Choose a kitchen"
    :actions="[{ label: 'Choose kitchen', to: workspaceEntryPath }]"
  />
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'

const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const {
  kitchenId,
  selectedMenu,
  canWrite,
  derived,
  error,
  actions,
  menuCreateBlockedMessage,
} = useKitchenMenusContext()
const selectedPath = computed(
  () =>
    `/workspace/kitchen/menus/${encodeURIComponent(selectedMenu.value?.id || '')}`
)
</script>
