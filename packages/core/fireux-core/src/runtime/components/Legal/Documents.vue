<template>
  <div class="fx-card-body-stack">
    <FireDisclosureCard
      v-for="section in legalSections"
      :key="section.value"
      :id="section.value"
      :title="section.label"
      :description="section.description"
      :icon="section.icon"
      :open="openLegalSection === section.value"
      @update:open="setOpenLegalSection(section.value, $event)"
    >
      <component :is="section.component" />
    </FireDisclosureCard>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, resolveComponent } from 'vue'

type LegalSection = 'privacy' | 'terms' | 'browser-storage'

const legalSections: Array<{
  label: string
  description: string
  icon: string
  value: LegalSection
  component: ReturnType<typeof resolveComponent>
}> = [
  {
    label: 'Privacy Policy',
    description: 'How personal information is collected, used, and protected.',
    icon: 'i-lucide-shield-check',
    value: 'privacy',
    component: resolveComponent('FireLegalPrivacyPolicy'),
  },
  {
    label: 'Terms of Service',
    description: 'The terms governing FireUX-powered apps.',
    icon: 'i-lucide-file-text',
    value: 'terms',
    component: resolveComponent('FireLegalTermsOfService'),
  },
  {
    label: 'Cookies and browser storage',
    description: 'Browser storage for appearance and requested features.',
    icon: 'i-lucide-cookie',
    value: 'browser-storage',
    component: resolveComponent('FireLegalBrowserStorage'),
  },
]

const route = useRoute()
const openLegalSection = ref<LegalSection | undefined>('privacy')

onMounted(() => openLegalSectionFromHash(route.hash))
watch(() => route.hash, openLegalSectionFromHash)

function setOpenLegalSection(section: LegalSection, open: boolean) {
  openLegalSection.value = open ? section : undefined
}

async function openLegalSectionFromHash(hash: string) {
  const section = legalSectionFromHash(hash)
  if (!section) return

  openLegalSection.value = section
  await nextTick()
  if (route.hash !== hash) return
  document.getElementById(section)?.scrollIntoView({ block: 'start' })
}

function legalSectionFromHash(hash: string): LegalSection | undefined {
  const section = hash.slice(1)
  return section === 'privacy' ||
    section === 'terms' ||
    section === 'browser-storage'
    ? section
    : undefined
}
</script>
