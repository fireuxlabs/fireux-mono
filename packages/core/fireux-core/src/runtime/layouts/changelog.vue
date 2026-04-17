<script setup lang="ts">
import { inject, type Ref } from 'vue'

// Optional content navigation for changelog pages
const navigation = inject<Ref<any[]> | undefined>('navigation')
defineOptions({ name: 'changelog' })
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside v-if="navigation">
            <DocsNavigation :items="navigation" />
          </UPageAside>
        </template>

        <NuxtPage />
      </UPage>
    </UContainer>
  </UMain>
</template>
