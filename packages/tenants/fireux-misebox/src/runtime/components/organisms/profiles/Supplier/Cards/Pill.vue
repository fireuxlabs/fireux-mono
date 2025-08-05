<template>
  <div class="cell card-pill supplier-theme">
    <img
      :src="
        supplier.avatarUrl ||
        supplier.profile_image?.url ||
        '/default-avatar.png'
      "
      :alt="`${supplier.business_name} avatar`"
      class="avatar"
    />
    <div class="info">
      <h4 class="name">{{ supplier.business_name }}</h4>
      <p v-if="supplier.title" class="subtitle">{{ supplier.title }}</p>
      <p v-else-if="supplier.specialties?.length" class="subtitle">
        {{ supplier.specialties[0] }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})
</script>
