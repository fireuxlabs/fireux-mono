<template>
  <DirectoryHome
    eyebrow="Granite"
    title="Discover properties"
    description="Explore published properties across the Granite ecosystem."
    icon="i-lucide-building-2"
    workspace-title="Portfolio Workspace"
    workspace-description="Organise your portfolio, properties and team."
    workspace-to="/workspace/portfolio"
  >
    <PropertyDirectory />
  </DirectoryHome>
</template>
<script setup lang="ts">
import DirectoryHome from 'fireux-core/runtime/components/landing/DirectoryHome.vue'
import PropertyDirectory from 'fireux-properties/runtime/property/components/Directory.vue'
</script>
