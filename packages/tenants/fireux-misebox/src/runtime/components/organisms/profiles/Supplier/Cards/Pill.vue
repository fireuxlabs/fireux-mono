<template>
  <UCard class="profile-cell profile-pill supplier-cell">
    <div class="profile-header">
      <UAvatar
        :src="supplier?.avatarUrl"
        :alt="supplier?.business_name || 'Supplier'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="supplier?.business_name" class="profile-name">
          {{ supplier.business_name }}
        </h4>
        <p v-if="supplier?.specialties?.length" class="profile-title">
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
