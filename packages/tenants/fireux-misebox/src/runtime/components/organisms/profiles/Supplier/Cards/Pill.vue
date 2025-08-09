<template>
  <div class="profile-pill supplier-theme">
    <img
      :src="
        supplier?.avatarUrl ||
        supplier?.profile_image?.url ||
        '/default-avatar.png'
      "
      :alt="`${supplier?.business_name || 'Supplier'} avatar`"
      class="pill-avatar"
    />
    <div class="pill-info">
      <h4 class="pill-name">{{ supplier?.business_name || 'Loading...' }}</h4>
      <p v-if="supplier?.title" class="pill-subtitle">{{ supplier.title }}</p>
      <p v-else-if="supplier?.specialties?.length" class="pill-subtitle">
        {{ supplier.specialties[0] }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  supplier: {
    type: Object,
    required: false,
    default: () => ({
      business_name: 'Loading...',
      specialties: [],
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
