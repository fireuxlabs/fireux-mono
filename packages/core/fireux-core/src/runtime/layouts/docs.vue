<template>
  <UContainer>
    <UPage>
      <!-- Left: docs navigation -->
      <template #left>
        <UPageAside class="w-64 shrink-0">
          <UContentNavigation
            highlight
            :navigation="navigation"
            :default-open="[]"
          />
        </UPageAside>
      </template>

      <!-- Main: current docs page -->
      <UPageBody class="min-w-0">
        <NuxtPage />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import { fetchContentNavigation } from '#imports'

defineOptions({ name: 'docs' })

const { data: navigation } = await useAsyncData('fireux-docs-navigation', () =>
  fetchContentNavigation({ source: 'fireuxDocs' })
)
</script>
