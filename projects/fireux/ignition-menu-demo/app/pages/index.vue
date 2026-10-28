<template>
  <UPage>
    <UPageHeader :title="name" :description="brief.outcome" />
    <UPageBody>
      <UAlert title="Read-only Menu demo" description="Fictional Kitchen data. This starting App does not place orders." color="neutral" />
      <MenuDetailCatalogue
        :sections="menu.content.sections"
        :currency-code="menu.presentation.currencyCode"
        :currency-format="menu.presentation.currencyFormat"
        :copy="copy"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { featuredMenuDemoManifest as menu } from 'fireux-kitchens/runtime/kitchen/demo/presentation/index'
import { resolveMenuBrowseSurfaceCopy } from 'fireux-kitchens/runtime/menu/utils/menu-surface-copy'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { brief, name } from '../ignition/brief'
const copy = resolveMenuBrowseSurfaceCopy()
useSeo({ title: name, description: brief.outcome, path: '/' })
</script>
