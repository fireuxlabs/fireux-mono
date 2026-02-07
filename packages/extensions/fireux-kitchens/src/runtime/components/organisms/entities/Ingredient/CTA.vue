<template>
  <UPageCTA
    class="cta"
    title="Ingredients"
    description="Manage global ingredient records and attach them to your active kitchen."
    variant="naked"
  >
    <template #default>
      <div class="space-y-3">
        <UAlert
          v-if="!canCreate"
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
              :disabled="!resolvedKitchenId"
              @click="showCreate = !showCreate"
            >
              {{ showCreate ? 'Hide add' : 'Add ingredient' }}
            </UButton>
          </div>

          <UAlert
            v-if="!resolvedKitchenId"
            color="amber"
            title="Kitchen not resolved"
            description="Set a runtime kitchen to add ingredients."
          />

          <KitchenIngredientsCreateSystem
            v-else-if="showCreate"
            :kitchen-id="resolvedKitchenId"
            @created="showCreate = false"
          />
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    kitchenId?: string
    canCreate?: boolean
  }>(),
  {
    kitchenId: '',
    canCreate: false,
  }
)

const showCreate = ref(false)
const resolvedKitchenId = computed(() => String(props.kitchenId || '').trim())
</script>
