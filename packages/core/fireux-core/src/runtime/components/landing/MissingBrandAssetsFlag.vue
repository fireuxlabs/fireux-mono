<template>
  <ClientOnly>
    <UAlert
      v-if="showFlag"
      color="error"
      variant="soft"
      icon="i-lucide-image-minus"
      title="Missing local app assets"
    >
      <template #description>
        <div class="pagebody">
          <p>
            Some required files are missing from <code>/public/img/app</code>.
            Shared fallbacks may keep the UI alive, but this app is not fully
            branded yet.
          </p>
          <ul class="fx-list-stack">
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

const { pending, hasMissingAssets, missingPaths } =
  useRequiredBrandAssetsStatus()
const showFlag = computed(
  () => import.meta.dev && !pending.value && hasMissingAssets.value
)
</script>
