<template>
  <UPage>
    <UPageHero
      title="Blog"
      :description="`Product notes, field reports and useful ideas from ${appName} and the people building with it.`"
    >
      <template #links>
        <UButton
          to="#blog-stories"
          label="Browse stories"
          icon="i-lucide-arrow-down"
          color="neutral"
          variant="soft"
          size="lg"
        />
        <BlogCTA />
      </template>
    </UPageHero>

    <UPageBody>
      <BlogCollectionEditorialManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import BlogCTA from './CTA.vue'
import BlogCollectionEditorialManager from './Collection/EditorialManager.vue'

defineOptions({ name: 'BlogIndex' })

const { appName } = useFireUXConfig()
</script>
