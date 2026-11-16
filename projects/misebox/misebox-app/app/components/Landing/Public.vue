<template>
  <UPage>
    <PublicKitchenIntro
      eyebrow="Misebox"
      title="Discover your next favourite Kitchen"
      description="Find Kitchens, explore their Menus and see what is cooking."
      icon="i-lucide-chef-hat"
    />
    <UPageBody id="directory">
      <FireState v-bind="page.state" retryable @retry="refresh()" />
      <PublicKitchenCollection v-show="page.ready" :kitchens="kitchens" />
      <LandingWorkspaceEntry />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'
import { useKitchens } from 'fireux-kitchens/runtime/kitchen/composables/useKitchens'

const { collection: kitchens, outcome, error, refresh } = useKitchens()
const page = useCollectionPage({
  entity: 'kitchens',
  title: 'Kitchens',
  collection: { records: kitchens, outcome, error },
})
</script>
