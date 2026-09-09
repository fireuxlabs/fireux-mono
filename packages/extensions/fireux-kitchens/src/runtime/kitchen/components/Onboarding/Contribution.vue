<template>
  <UPageCard
    :title="
      result.created_root ? 'Kitchen added' : 'This kitchen already exists'
    "
    description="Adding a listing does not give you access to manage this kitchen."
    variant="subtle"
  >
    <div class="flex flex-wrap gap-3">
      <UButton
        :to="`/kitchens/${encodeURIComponent(result.slug || result.kitchen_id)}`"
        >View kitchen</UButton
      >
      <UButton color="neutral" variant="soft" @click="emit('associate')"
        >Add to My Kitchens</UButton
      >
    </div>
  </UPageCard>
</template>
<script setup lang="ts">
import type { KitchenDirectoryContributionResult } from '../../models/kitchen-onboarding.model.ts'
defineProps<{ result: KitchenDirectoryContributionResult }>()
const emit = defineEmits<{ (event: 'associate'): void }>()
</script>
