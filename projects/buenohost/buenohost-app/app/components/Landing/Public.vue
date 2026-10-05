<template>
  <DirectoryHome
    eyebrow="BuenoHost"
    title="Find your next stay"
    description="Explore places to stay and discover the properties behind BuenoHost."
    icon="i-lucide-house"
    workspace-title="Property Workspace"
    workspace-description="Manage your properties, reservations and guest experience."
    workspace-to="/workspace/property"
  >
    <PropertyDirectory />
  </DirectoryHome>
</template>
<script setup lang="ts">
import DirectoryHome from 'fireux-core/runtime/components/landing/DirectoryHome.vue'
import PropertyDirectory from 'fireux-properties/runtime/property/components/Directory.vue'
</script>
