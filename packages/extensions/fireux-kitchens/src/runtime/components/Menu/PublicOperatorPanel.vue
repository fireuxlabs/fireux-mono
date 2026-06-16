<template>
  <section class="space-y-3">
    <MenuOwnerPanel :menu="menu" :menu-id="menuId" />
  </section>
</template>

<script setup lang="ts">
type MenuOperatorSource = {
  created_by?: string
}

defineProps<{
  menu: MenuOperatorSource
  menuId: string
}>()
</script>
