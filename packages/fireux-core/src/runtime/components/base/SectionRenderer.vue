<template>
  <component :is="getComponent(type)" :data="data" :config="config" />
</template>

<script setup lang="ts">
import TextSection from './sections/TextSection.vue'
import ContactSection from './sections/ContactSection.vue'
import StatsSection from './sections/StatsSection.vue'
import CompanyStatsSection from './sections/CompanyStatsSection.vue'
import LanguagesGridSection from './sections/LanguagesGridSection.vue'
import ExperienceListSection from './sections/ExperienceListSection.vue'

interface Props {
  type: string
  data: any
  config?: Record<string, any>
}

defineProps<Props>()

// Component mapping for different section types
const componentMap = {
  text: TextSection,
  contact: ContactSection,
  stats: StatsSection,
  'company-stats': CompanyStatsSection,
  'languages-grid': LanguagesGridSection,
  'experience-list': ExperienceListSection,
}

function getComponent(type: string) {
  return componentMap[type as keyof typeof componentMap] || TextSection
}
</script>
