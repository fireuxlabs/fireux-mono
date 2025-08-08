<template>
  <UCard>
    <UAvatar
      :src="professional?.avatarUrl || professional?.profile_image?.url"
      :alt="professional?.professional_name || 'Professional'"
      size="md"
    />
    <div class="info">
      <h4 v-if="professional?.professional_name" class="card-header">
        {{ professional.professional_name }}
      </h4>
      <p v-if="professional?.title" class="card-subtitle">
        {{ professional.title }}
      </p>
      <p v-if="professional?.cuisine_types?.length" class="tags">
        {{ professional.cuisine_types[0] }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Professional } from '../../../models/profiles/Professional.model'

defineProps<{
  professional?: Partial<Professional>
}>()
</script>
