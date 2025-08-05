<template>
  <div class="cell card-profile supplier-theme">
    <div class="header">
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
        <h2 class="name">{{ supplier.business_name }}</h2>
        <p v-if="supplier.title" class="title">{{ supplier.title }}</p>
      </div>
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
