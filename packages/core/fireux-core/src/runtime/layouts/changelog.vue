<script setup lang="ts">
import { inject, type Ref } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'

// Optional content navigation for changelog pages
const navigation = inject<Ref<ContentNavigationItem[]> | undefined>('navigation')
defineOptions({ name: 'CoreChangelog' })
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside v-if="navigation">
            <UContentNavigation :navigation="navigation" highlight />
          </UPageAside>
        </template>

        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>
