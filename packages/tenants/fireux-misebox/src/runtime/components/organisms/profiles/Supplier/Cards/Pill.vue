<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="props.supplier.avatar"
        :alt="props.supplier.title || 'Supplier'"
        :text="props.supplier.initials"
        size="sm"
      />
      <div class="profile-info">
        <h4 class="profile-name">
          {{ props.supplier.title || 'Supplier' }}
        </h4>
        <p v-if="props.supplier.subtitle" class="profile-title">
          {{ props.supplier.subtitle }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../models/profiles/Supplier.model'

const props = defineProps<{ supplier: SupplierCard.Pill }>()
</script>
