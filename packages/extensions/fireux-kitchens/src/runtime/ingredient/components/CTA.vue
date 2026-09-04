<template>
  <UPageCTA
    class="cta"
    data-entity-cta-family="workspace-managed"
    title="Ingredients"
    description="Browse ingredients that kitchens can use in recipes, menus, and stock."
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
import { useUser } from 'fireux-core/runtime/user/composables/useUser'

const { isAdmin } = useUserSession()
</script>
