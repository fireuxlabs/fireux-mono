<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Join Requests</h3>
          <p>
            Admins can approve new members or clear pending invites.
          </p>
        </div>
      </div>
    </template>

    <div v-if="items.length" class="section__item">
      <MoleculesFormsFirestoreListActions
        :items="items"
        :action-approve="onApprove"
        :action-reject="onRemove"
        approve-label="Approve"
        reject-label="Remove"
      />
    </div>
    <p v-else class="section__empty">No pending requests.</p>
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
  items: Item[]
  onApprove: (id: string) => Promise<unknown>
  onRemove: (id: string) => Promise<unknown>
}>()
</script>
