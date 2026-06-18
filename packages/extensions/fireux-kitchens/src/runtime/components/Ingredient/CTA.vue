<template>
  <UPageCTA
    class="cta"
    data-entity-cta-family="console-managed"
    title="Ingredient registry"
    description="Create and curate the global ingredient records that kitchen runtimes attach to operational inventory."
    variant="naked"
  >
    <template #default>
      <div class="space-y-3">
        <UAlert
          v-if="!isAdmin"
          color="neutral"
          title="Admin action"
          description="Only admins can add ingredients."
        />

        <div v-else class="space-y-3">
          <div class="flex justify-end">
            <UButton
              to="/ingredients/add"
              size="sm"
              color="primary"
              icon="i-lucide-plus"
            >
              Add ingredient
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>
<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

const { isAdmin } = useUser()
</script>
