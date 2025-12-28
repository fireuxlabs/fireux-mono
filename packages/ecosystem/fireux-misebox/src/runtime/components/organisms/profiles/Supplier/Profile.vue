<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="supplier?.avatar"
        :alt="supplier?.display_name || 'Supplier'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="supplier?.display_name" class="profile-name">
          {{ supplier.display_name }}
        </h4>
        <p v-if="supplier?.business_type" class="profile-subtitle">
          {{ supplier.business_type }}
        </p>
        <div v-if="supplier?.locations?.length" class="profile-location">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ formatLocation(supplier.locations[0]) }}</span>
        </div>
        <div v-if="supplier?.years_in_business" class="profile-meta">
          {{ supplier.years_in_business }}+ years in business
        </div>
      </div>
    </div>

    <p v-if="bioText" class="profile-bio">{{ bioText }}</p>

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

    <div v-if="supplier?.products_offered?.length" class="profile-section">
      <strong class="section-label">Products:</strong>
      <span
        v-for="product in supplier.products_offered.slice(0, 2)"
        :key="product"
        class="tag"
      >
        {{ product }}
      </span>
      <span v-if="supplier.products_offered.length > 2" class="tag-more">
        +{{ supplier.products_offered.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="supplier?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ supplier.employee_count }} employees</span>
      </div>
      <div v-if="supplier?.certifications?.length" class="profile-stat">
        <UIcon name="i-lucide-shield-check" />
        <span>{{ supplier.certifications.length }} certifications</span>
      </div>
      <div v-if="supplier?.delivery_range" class="profile-stat">
        <UIcon name="i-lucide-truck" />
        <span>{{ supplier.delivery_range }}km delivery</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '../../../../models/profiles/Supplier/Supplier.model.ts'

const props = defineProps<{
  supplier?: Partial<Supplier>
}>()

const supplier = computed(() => props.supplier ?? null)
const bioText = computed(
  () => supplier.value?.bio_long ?? supplier.value?.bio_short ?? ''
)

const formatLocation = (
  loc: { city?: string | null; country?: string | null } | undefined
) => {
  if (!loc) return ''
  if (loc.city && loc.country) return `${loc.city}, ${loc.country}`
  return loc.city || loc.country || ''
}
</script>
