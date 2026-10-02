<template>
  <UPageCard
    :title="
      result.created_root ? 'Kitchen added' : 'This kitchen already exists'
    "
    description="This is a directory listing. Management access and ordering are set up separately."
    variant="subtle"
  >
    <p class="text-sm text-muted">Management access must be reviewed separately. If you cannot continue, ask a Misebox administrator.</p>
    <UAlert v-if="error" title="Management access could not be checked" color="error">
      <template #description><MoleculesCopyError :message="error" /></template>
    </UAlert>
    <div class="flex flex-wrap gap-3">
      <UButton
        :to="`/kitchens/${encodeURIComponent(result.slug || result.kitchen_id)}`"
        >View kitchen</UButton
      >
      <UButton color="neutral" variant="soft" :loading="pending" :disabled="pending" @click="emit('associate')"
        >Check management access</UButton
      >
      <UButton color="neutral" variant="link" @click="emit('back')">Choose another Kitchen</UButton>
    </div>
  </UPageCard>
</template>
<script setup lang="ts">
import type { KitchenDirectoryContributionResult } from '../../models/kitchen-onboarding.model.ts'
defineProps<{ result: KitchenDirectoryContributionResult; pending?: boolean; error?: string }>()
const emit = defineEmits<{ (event: 'associate'): void; (event: 'back'): void }>()
</script>
