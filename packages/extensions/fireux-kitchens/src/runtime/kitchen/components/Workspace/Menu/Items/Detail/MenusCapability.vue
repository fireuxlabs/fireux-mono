<template>
  <section aria-labelledby="item-menus-heading">
    <h2 id="item-menus-heading">Menus</h2>
    <FireDisclosurePanel title="Placements" variant="ghost">
      <ItemMenuPlacements />
    </FireDisclosurePanel>
  </section>
</template>

<script setup lang="ts">
import ItemMenuPlacements from './ItemMenuPlacements.vue'
</script>
