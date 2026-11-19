<template>
  <FireState
    v-if="['pending', 'idle'].includes(source.outcome.value)"
    entity="Kitchen services"
    outcome="pending"
  />
  <UAlert
    v-else-if="source.outcome.value === 'error'"
    title="Unable to load kitchen services"
    :description="String(source.error.value || 'Services could not be loaded.')"
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        :message="
          [
            'Unable to load kitchen services',
            String(source.error.value || 'Services could not be loaded.'),
          ]
            .filter(Boolean)
            .join('\n')
        "
      />
    </template>
  </UAlert>
  <UAlert
    v-else-if="!retained"
    title="Choose a Kitchen to configure services"
  />
</template>
<script setup lang="ts">
import { useKitchenServicesContext } from '../../../composables/offerings/useKitchenServicesContext'
const { source, retained } = useKitchenServicesContext()
</script>
