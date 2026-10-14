<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: cull stale scenario viewers from Kitchen dev navigation. -->
<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Kitchens (Ext)"
      description="Model and collection tools for ingredients and chefs."
    />
    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Ingredients</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('ingredients')"
            >
              {{ openSections.ingredients ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.ingredients" class="mt-4">
            <DiagnosticsIngredientSystem />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Chefs</div>
            <UButton variant="ghost" size="xs" @click="toggleSection('chefs')">
              {{ openSections.chefs ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.chefs" class="mt-4">
            <DiagnosticsChefSystem />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const openSections = reactive({
  ingredients: false,
  chefs: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-kitchens',
    label: 'Kitchens (Ext)',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})
</script>
