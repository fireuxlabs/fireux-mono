<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Join Requests</h3>
          <p>Admins can approve new AppUsers or clear pending invites.</p>
        </div>
      </div>
    </template>

    <div v-if="items.length" class="section__item">
      <FireFormsEditableListActions
        :items="items"
        :action-approve="onApprove"
        :action-reject="onRemove"
        approve-label="Approve"
        reject-label="Remove"
      />
    </div>
    <p v-else class="section__empty">No pending requests.</p>
    <UButton
      v-if="hasMore"
      class="mt-4"
      variant="soft"
      @click="$emit('load-more')"
    >
      Load more requests
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
type Item = {
  id: string
  title: string
  subtitle?: string
  to?: string
  pill?: unknown
}

defineProps<{
  hasMore?: boolean
  items: Item[]
  onApprove: (id: string) => Promise<unknown>
  onRemove: (id: string) => Promise<unknown>
}>()
defineEmits<{ 'load-more': [] }>()
</script>
