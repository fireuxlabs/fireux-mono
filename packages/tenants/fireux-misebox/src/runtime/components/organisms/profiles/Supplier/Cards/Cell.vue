<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="props.supplier.avatar"
        :alt="props.supplier.title || 'Supplier'"
        :text="props.supplier.initials"
        size="md"
      />
      <div class="profile-info">
        <h4 class="profile-name">
          {{ props.supplier.title || 'Supplier' }}
        </h4>
        <p v-if="props.supplier.subtitle" class="profile-subtitle">
          {{ props.supplier.subtitle }}
        </p>
      </div>
    </div>

    <p v-if="props.supplier.bio_short" class="profile-bio">
      {{ props.supplier.bio_short }}
    </p>

    <div v-if="props.supplier.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in props.supplier.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="props.supplier.specialties.length > 3" class="tag-more">
        +{{ props.supplier.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../models/profiles/Supplier.model'

const props = defineProps<{ supplier: SupplierCard.Cell }>()
</script>
