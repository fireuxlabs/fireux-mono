<template>
  <div class="profile-pill professional-theme">
    <img
      :src="professional?.avatarUrl || '/default-avatar.png'"
      :alt="`${professional?.professional_name || professional?.displayName || 'Professional'} avatar`"
      class="pill-avatar"
    />
    <div class="pill-info">
      <h4 class="pill-name">
        {{
          professional?.professional_name ||
          professional?.displayName ||
          'Loading...'
        }}
      </h4>
      <p class="pill-subtitle">
        {{ professional?.title || 'Professional' }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  professional: {
    type: Object,
    required: false,
    default: () => ({
      professional_name: 'Loading...',
      displayName: 'Loading...',
      title: 'Professional',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>

<style scoped>
.professional-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.professional-pill:hover {
  border-color: var(--professional-primary, #3b82f6);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.pill-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.pill-info {
  flex: 1;
  min-width: 0;
}

.professional-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.professional-title {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill-status {
  flex-shrink: 0;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

@media (max-width: 768px) {
  .professional-pill {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .avatar-image {
    width: 32px;
    height: 32px;
  }
}
</style>
