<template>
  <UCard class="pill-card">
    <div class="pill-content">
      <UAvatar
        :src="supplier?.avatarUrl"
        :alt="supplier?.business_name || 'Supplier'"
        size="sm"
      />
      <div class="pill-info">
        <h4 v-if="supplier?.business_name" class="pill-name">
          {{ supplier.business_name }}
        </h4>
        <p v-if="supplier?.specialties?.length" class="pill-subtitle">
          {{ supplier.specialties[0] }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../../../../models/profiles/Supplier.model'

defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
