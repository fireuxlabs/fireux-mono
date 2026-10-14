<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Places (Ext)"
      description="Collection-first view; filter by extra fields (against the runtime Place model)."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Places</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('places')"
            >
              {{ openSections.places ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.places" class="mt-4">
            <DiagnosticsPlaceSystem />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const openSections = reactive({
  places: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-places',
    label: 'Places (Ext)',
    icon: 'i-lucide-map-pin',
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})
</script>
