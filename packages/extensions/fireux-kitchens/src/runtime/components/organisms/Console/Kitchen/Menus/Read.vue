<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading menus"
    description="Fetching menus for the selected kitchen."
  />

  <OrganismsMenuCollectionManager
    v-else
    :collection="menus"
    title="Menus"
    description="Browse menus for the selected kitchen."
    :link="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'

const props = defineProps<{
  menus: Menu[]
  pending: boolean
}>()

const countLabel = computed(() => String(props.menus.length))
</script>
