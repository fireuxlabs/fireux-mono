<template>
  <div class="cell card-profile supplier-theme">
    <div class="header">
      <img
        :src="
          supplier?.avatarUrl ||
          supplier?.profile_image?.url ||
          '/default-avatar.png'
        "
        :alt="`${supplier?.business_name || 'Supplier'} avatar`"
        class="avatar"
      />
      <div class="info">
        <h2 class="name">{{ supplier?.business_name || 'Loading...' }}</h2>
        <p v-if="supplier?.title" class="title">{{ supplier.title }}</p>
      </div>
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
      title: 'Supplier',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
