<template>
  <UPageCTA
    class="cta"
    data-entity-cta-family="profile-managed"
    :title="title"
    :description="description"
    variant="subtle"
    orientation="horizontal"
  >
    <div v-if="hasProfile" class="cta__body space-y-4">
      <slot name="profile" />

      <div class="flex flex-wrap gap-2">
        <UButton v-if="profileTo" color="primary" :to="profileTo">
          View profile
        </UButton>
        <UButton
          v-if="manageTo"
          color="neutral"
          variant="soft"
          :to="manageTo"
        >
          Manage profile
        </UButton>
      </div>
    </div>

    <div v-else class="cta__body space-y-2">
      <slot name="create" />
    </div>
  </UPageCTA>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  hasProfile?: boolean
  profileTo?: string
  manageTo?: string
}>()
</script>
