<template>
  <div v-if="data" class="profile-display-card">
    <!-- Standard header (works for all profiles) -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="config.getAvatar(data)"
          :alt="config.getDisplayName(data)"
          size="xl"
        />
      </div>
      <div class="profile-info-section">
        <h1 class="profile-name">{{ config.getDisplayName(data) }}</h1>
        <p v-if="config.getSubtitle?.(data)" class="profile-subtitle">
          {{ config.getSubtitle(data) }}
        </p>
        <!-- Allow custom header content via slot -->
        <slot name="header-extra" :data="data" />
      </div>
    </div>

    <!-- Dynamic content sections based on config -->
    <div
      v-for="section in config.sections"
      :key="section.key"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">{{ section.title }}</h3>

      <!-- Try custom slot first, fallback to generic renderer -->
      <slot
        :name="`section-${section.key}`"
        :data="getSectionData(data, section)"
        :section="section"
      >
        <SectionRenderer
          :type="section.type"
          :data="getSectionData(data, section)"
          :config="section"
        />
      </slot>
    </div>

    <!-- Additional custom sections via slots -->
    <slot name="extra-sections" :data="data" />
  </div>

  <!-- Loading state -->
  <div v-else>
    <div class="profile-loading-state">
      <div class="profile-loading-content">
        <UIcon
          :name="config.loadingIcon || 'i-heroicons-user'"
          class="profile-loading-icon"
        />
        <p>{{ config.loadingText || 'Loading profile...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProfileDisplayConfig } from '../../types/profile-config'

interface Props {
  data?: any | null
  config: ProfileDisplayConfig
}

const props = defineProps<Props>()

// Helper to get section data from the main data object
function getSectionData(data: any, section: any) {
  if (section.field) {
    return data[section.field]
  }
  return data[section.key]
}
</script>

<style scoped>
/* Uses shared profile.scss styles */
</style>
