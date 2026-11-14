<template>
  <UPage>
    <UPageHeader :title="name" :description="brief.outcome" />
    <UPageBody>
      <UAlert
        title="Choose a real Menu"
        description="Open an existing Menu to inspect its guest presentation."
        color="neutral"
      />
      <UButton to="/menus" label="Browse Menus" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { brief, name } from '../ignition/brief'
useSeo({ title: name, description: brief.outcome, path: '/' })
</script>
