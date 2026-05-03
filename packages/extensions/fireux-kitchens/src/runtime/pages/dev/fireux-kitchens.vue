<template>
  <UPage>
    <UPageHeader
      title="Dev · Kitchens (Ext)"
      description="Model and collection tools for kitchens, ingredients, and chefs."
    />
    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">
              Dash Dev
            </div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('dash-dev')"
            >
              {{ openSections['dash-dev'] ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections['dash-dev']" class="mt-4">
            <DevConsoleSystem />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">
              Kitchens
            </div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('kitchens')"
            >
              {{ openSections.kitchens ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.kitchens" class="mt-4">
            <DevKitchenSystem />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">
              Simulation Kitchens
            </div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('simulation-kitchens')"
            >
              {{ openSections['simulation-kitchens'] ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections['simulation-kitchens']" class="mt-4">
            <DevKitchenTestSystem />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">
              Ingredients
            </div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('ingredients')"
            >
              {{ openSections.ingredients ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.ingredients" class="mt-4">
            <DevIngredientSystem />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">
              Menu Stack
            </div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('menu-stack')"
            >
              {{ openSections['menu-stack'] ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections['menu-stack']" class="mt-4">
            <DevMenuStackSystem />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">
              Chefs
            </div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('chefs')"
            >
              {{ openSections.chefs ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.chefs" class="mt-4">
            <DevChefSystem />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const openSections = reactive({
  'dash-dev': false,
  kitchens: false,
  'simulation-kitchens': false,
  ingredients: false,
  'menu-stack': false,
  chefs: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-kitchens',
    label: 'Kitchens (Ext)',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
