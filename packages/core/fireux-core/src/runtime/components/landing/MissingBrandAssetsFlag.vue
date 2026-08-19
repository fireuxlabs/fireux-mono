<template>
  <ClientOnly>
    <UAlert
      v-if="showFlag"
      color="error"
      variant="soft"
      icon="i-lucide-image-minus"
      title="Missing local app assets"
      class="mx-auto mb-6 w-full max-w-5xl"
    >
      <template #description>
        <div class="space-y-2">
          <p>
            Some required files are missing from <code>/public/img/app</code>.
            Shared fallbacks may keep the UI alive, but this app is not fully branded yet.
          </p>
          <ul class="list-disc pl-5">
            <li v-for="entry in missingPaths" :key="entry">
              <code>{{ entry }}</code>
            </li>
          </ul>
        </div>
      </template>
    </UAlert>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRequiredBrandAssetsStatus } from '../../app/composables/brand/useRequiredBrandAssetsStatus'

const { pending, hasMissingAssets, missingPaths } = useRequiredBrandAssetsStatus()
const showFlag = computed(
  () => import.meta.dev && !pending.value && hasMissingAssets.value
)
</script>
