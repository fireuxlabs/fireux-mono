<template>
  <UPageCTA
    class="cta"
    title="Ingredients"
    description="Manage global ingredient records for this runtime."
    variant="naked"
  >
    <template #default>
      <div class="space-y-3">
        <UAlert
          v-if="!props.canCreate"
          color="neutral"
          title="Admin action"
          description="Only admins can add ingredients."
        />

        <div v-else class="space-y-3">
          <div class="flex justify-end">
            <UButton
              size="sm"
              color="primary"
              icon="i-lucide-plus"
              @click="showCreate = !showCreate"
            >
              {{ showCreate ? 'Hide add' : 'Add ingredient' }}
            </UButton>
          </div>

          <IngredientCreateSystem v-if="showCreate" @created="showCreate = false" />
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    canCreate?: boolean
  }>(),
  {
    canCreate: false,
  }
)

const showCreate = ref(false)
</script>
