<template>
  <UPage>
    <UPageHeader
      :title="`${appName} assets`"
      description="Inspect and download this App’s artwork."
    />
    <UPageBody>
      <div class="fx-card-body-stack">
        <section
          v-for="group in groups"
          :key="group.key"
          class="fx-card-body-stack"
          :aria-labelledby="`app-assets-${group.key}`"
        >
          <header>
            <h2 :id="`app-assets-${group.key}`" class="fx-type-section-title">
              {{ group.title }}
            </h2>
            <p class="fx-type-body">{{ group.description }}</p>
          </header>
          <UPageGrid>
            <AppAssetsCard
              v-for="asset in group.items"
              :key="asset.key"
              :asset="asset"
            />
          </UPageGrid>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import {
  APP_ASSET_GROUPS,
  readAdditionalAppAssets,
  type AppAssetGroup,
} from '../../models/asset-catalogue'

const fireux = useFireUXConfig()
const appConfig = useAppConfig() as { fireuxAssets?: { catalogue?: unknown } }
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const groups = computed<AppAssetGroup[]>(() => {
  const additional = readAdditionalAppAssets(appConfig.fireuxAssets?.catalogue)
  return [
    ...APP_ASSET_GROUPS,
    ...(additional.length
      ? [
          {
            key: 'additional',
            title: 'More artwork',
            description: 'Additional artwork supplied by this App.',
            items: additional,
          },
        ]
      : []),
  ]
})
</script>
