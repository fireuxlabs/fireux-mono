<template>
  <UContainer>
    <UPage>
      <!-- Left: docs navigation -->
      <template #left>
        <UPageAside class="w-64 shrink-0">
          <UContentNavigation highlight :navigation="navigation" />
        </UPageAside>
      </template>

      <!-- Main: current docs page -->
      <UPageBody>
        <UPageMain class="min-w-0">
          <NuxtPage />
        </UPageMain>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

defineOptions({ name: 'docs' })
</script>
