<template>
  <div class="menu-overview-heading">
    <h2 class="fx-type-label">Your menus</h2>
    <UButton
      @click="emit('create')"
      :disabled="!canCreateMenu"
      label="Create menu"
      icon="i-lucide-plus"
      size="sm"
    />
  </div>
  <WorkspaceKitchenCollectionToolbar
    v-model="query"
    label="menus"
    singular="menu"
    :count="count"
  >
    <template #controls>
      <UButton
        v-if="hasArchived"
        :label="showArchived ? 'Hide archived' : 'Show archived'"
        variant="ghost"
        color="neutral"
        :aria-pressed="showArchived"
        @click="showArchived = !showArchived"
      />
    </template>
  </WorkspaceKitchenCollectionToolbar>
  <p v-if="createBlockedMessage" class="fx-type-caption">
    {{ createBlockedMessage }}
  </p>
</template>
<script setup lang="ts">
defineProps<{
  canCreateMenu: boolean
  createBlockedMessage: string
  hasArchived: boolean
  count: number
}>()
const query = defineModel<string>('query', { required: true })
const showArchived = defineModel<boolean>('showArchived', { required: true })
const emit = defineEmits<{ create: [] }>()
</script>
<style scoped>
.menu-overview-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.menu-overview-heading h2 {
  margin: 0;
}
</style>
