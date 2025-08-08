<template>
  <UCard class="pill-card">
    <div class="pill-content">
      <UAvatar
        :src="professional?.avatarUrl || professional?.profile_image?.url"
        :alt="professional?.professional_name || 'Professional'"
        size="sm"
      />
      <div class="pill-info">
        <h4 v-if="professional?.professional_name" class="pill-name">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="pill-subtitle">
          {{ professional.title }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  professional?: Partial<Professional>
}>()
</script>
