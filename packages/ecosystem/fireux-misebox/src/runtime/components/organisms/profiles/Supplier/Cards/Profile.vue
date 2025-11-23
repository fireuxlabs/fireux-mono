<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="(supplier as any)?.avatar"
        :alt="(supplier as any)?.display_name || 'Supplier'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="(supplier as any)?.display_name" class="profile-name">
          {{ (supplier as any)?.display_name }}
        </h4>
        <p v-if="(supplier as any)?.business_type" class="profile-subtitle">
          {{ (supplier as any).business_type }}
        </p>
        <div
          v-if="(supplier as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon name="i-lucide-map-pin" />
          <span>{{ formatLocation((supplier as any).locations[0]) }}</span>
        </div>
        <div v-if="(supplier as any)?.years_in_business" class="profile-meta">
          {{ (supplier as any).years_in_business }}+ years in business
        </div>
      </div>
    </div>
    <p
      v-if="(supplier as any)?.bio_long || (supplier as any)?.bio_short"
      class="profile-bio"
    >
      {{ (supplier as any)?.bio_long || (supplier as any)?.bio_short }}
    </p>

    <div v-if="(supplier as any)?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in (supplier as any).specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="(supplier as any)?.specialties?.length > 3" class="tag-more">
        +{{ (supplier as any)?.specialties?.length - 3 }} more
      </span>
    </div>

    <div
      v-if="(supplier as any)?.products_offered?.length"
      class="profile-section"
    >
      <strong class="section-label">Products:</strong>
      <span
        v-for="product in (supplier as any).products_offered.slice(0, 2)"
        :key="product"
        class="tag"
      >
        {{ product }}
      </span>
      <span
        v-if="(supplier as any).products_offered.length > 2"
        class="tag-more"
      >
        +{{ (supplier as any).products_offered.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="(supplier as any)?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ (supplier as any).employee_count }} employees</span>
      </div>
      <div
        v-if="(supplier as any)?.certifications?.length"
        class="profile-stat"
      >
        <UIcon name="i-lucide-shield-check" />
        <span
          >{{ (supplier as any).certifications.length }} certifications</span
        >
      </div>
      <div v-if="(supplier as any)?.delivery_range" class="profile-stat">
        <UIcon name="i-lucide-truck" />
        <span>{{ (supplier as any).delivery_range }}km delivery</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Supplier } from '../../../../../models/profiles/Supplier.model'

const props = defineProps<{
  supplier?: Partial<Supplier>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.supplier) {
    props.navigate(props.supplier)
  }
}

const formatLocation = (
  loc: { city?: string; country?: string } | undefined
) => {
  if (!loc) return ''
  if (loc.city && loc.country) return `${loc.city}, ${loc.country}`
  return loc.city || loc.country || ''
}
</script>
