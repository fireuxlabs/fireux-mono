<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="supplier?.avatarUrl || supplier?.profile_image?.url"
        :alt="supplier?.company_name || 'Supplier'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="supplier?.company_name" class="profile-name">
          {{ supplier.company_name }}
        </h4>
        <p v-if="supplier?.business_type" class="profile-subtitle">
          {{ supplier.business_type }}
        </p>
      </div>
    </div>

    <p v-if="supplier?.bio_short" class="profile-bio">
      {{ supplier.bio_short }}
    </p>

    <div v-if="supplier?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="tag-more">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../../../../models/profiles/Supplier.model'

defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
