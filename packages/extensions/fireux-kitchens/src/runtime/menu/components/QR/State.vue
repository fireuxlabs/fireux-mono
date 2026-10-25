<template>
  <FireStateCard
    class="menu-qr__failure"
    entity="Menu"
    kind="document"
    surface="bare"
    :loading="pending"
    :state="failure?.statusCode === 404 ? 'empty' : 'error'"
    :title="pending ? 'Loading menu' : failure?.title || 'Menu unavailable'"
    :description="pending ? '' : failure?.description || ''"
  >
    <template #title>
      <span
        :id="pending ? 'menu-qr-loading-title' : 'menu-qr-failure-title'"
        class="menu-qr__failure-title"
        role="heading"
        aria-level="1"
        >{{
          pending ? 'Loading menu' : failure?.title || 'Menu unavailable'
        }}</span
      >
    </template>
    <template v-if="!pending" #actions>
      <UButton
        class="menu-qr__action"
        color="neutral"
        variant="ghost"
        :to="indexPath"
        data-menu-action="index"
        >Back to menus</UButton
      >
    </template>
  </FireStateCard>
</template>
<script setup lang="ts">
import type { MenuLoadFailure } from '../../composables/useMenu'
defineProps<{
  pending: boolean
  failure: MenuLoadFailure | null
  indexPath: string
}>()
</script>
