<template>
  <ClientOnly>
    <div v-if="chef" class="space-y-6">
      <UCard>
        <p class="text-sm opacity-70">
          App-specific chef settings are not available yet.
        </p>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="chef app profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ChefCore } from '../../../../../models/profiles/Chef/Chef.model.ts'

defineProps<{
  chef: Partial<ChefCore> | null | undefined
}>()
</script>
