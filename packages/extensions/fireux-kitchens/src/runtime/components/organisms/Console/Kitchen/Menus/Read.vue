<template>
  <OrganismsMenuCollectionManager
    :collection="menus"
    title="Menus"
    description="Browse menus for the selected kitchen."
    :link="false"
  />
</template>

<script setup lang="ts">
import type { Menu } from '../../../../../models/menu.model'

defineProps<{
  menus: Menu[]
}>()
</script>
