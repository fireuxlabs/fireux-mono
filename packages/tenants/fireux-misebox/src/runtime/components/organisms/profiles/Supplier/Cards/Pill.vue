<template>
  <UCard>
    <UAvatar
      :src="supplier?.avatarUrl || supplier?.profile_image?.url"
      :alt="supplier?.business_name || 'Supplier'"
      size="md"
    />
    <div class="info">
      <h4 v-if="supplier?.business_name" class="card-header">
        {{ supplier.business_name }}
      </h4>
      <p v-if="supplier?.title" class="card-subtitle">{{ supplier.title }}</p>
      <p v-if="supplier?.specialties?.length" class="tags">
        {{ supplier.specialties[0] }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../../models/profiles/Supplier.model'

defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
