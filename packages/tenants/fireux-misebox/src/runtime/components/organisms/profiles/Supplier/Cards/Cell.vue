<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="supplier.avatar" :alt="supplier.name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ supplier.name }}</h4>
        <p v-if="supplier.title" class="profile-subtitle">
          {{ supplier.title }}
        </p>
      </div>
    </div>

    <p v-if="supplier.bioShort" class="profile-bio">
      {{ supplier.bioShort }}
    </p>

    <div v-if="supplier.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in supplier.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="supplier.specialties.length > 3" class="tag-more">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCellProps } from '../../../../../models/profiles/Supplier.model'
defineProps<{ supplier: SupplierCellProps }>()
</script>
