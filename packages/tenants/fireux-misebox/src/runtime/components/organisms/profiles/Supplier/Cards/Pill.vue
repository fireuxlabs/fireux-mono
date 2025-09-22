<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="supplier.avatar" :alt="supplier.display_name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ supplier.display_name }}</h4>
        <p v-if="supplier.title" class="profile-title">{{ supplier.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../models/profiles/Supplier.model'

defineProps<{ supplier: SupplierCard.Pill }>()
</script>
