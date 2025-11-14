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

<style scoped>
.pill {
  align-self: flex-start;
  max-height: var(--fireux-pill-height, 3.5rem);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.profile-name,
.profile-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-title {
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
