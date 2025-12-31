<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <div class="space-y-6">
    <OrganismsUserCreateSystem v-slot="slotProps">
      <div v-if="slotProps.shouldRender" class="space-y-3">
        <UPageCTA
          :title="slotProps.title"
          :description="slotProps.description"
          variant="naked"
        >
          <OrganismsUserCardsPreview />

          <template #links>
            <UButton
              v-if="slotProps.primary.kind === 'link'"
              color="primary"
              size="lg"
              :to="slotProps.primary.to"
            >
              {{ slotProps.primary.label }}
            </UButton>

            <UButton
              v-else-if="slotProps.primary.kind === 'action'"
              color="primary"
              size="lg"
              :loading="slotProps.primary.loading"
              :disabled="slotProps.primary.disabled"
              @click="slotProps.primary.onClick"
            >
              {{ slotProps.primary.label }}
            </UButton>
          </template>
        </UPageCTA>

        <p v-if="slotProps.error" class="text-sm text-red-600">
          {{ slotProps.error }}
        </p>
      </div>
    </OrganismsUserCreateSystem>
  </div>
</template>

<script setup lang="ts">
// CTA logic lives in OrganismsUserCreateSystem.
</script>
