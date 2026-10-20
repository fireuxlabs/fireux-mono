<template>
  <nav class="flex flex-wrap gap-2" aria-label="Food workspace">
    <UButton
      to="/workspace/kitchen/food-and-drink/menus"
      icon="i-lucide-book-open"
      color="neutral"
      variant="soft"
      active-variant="solid"
      >Menus</UButton
    >
    <UButton
      to="/workspace/kitchen/food-and-drink/items"
      icon="i-lucide-utensils"
      color="neutral"
      variant="soft"
      active-variant="solid"
      >Food &amp; drinks</UButton
    >
    <UButton
      to="/workspace/kitchen/prep/recipes"
      icon="i-lucide-notebook-tabs"
      color="neutral"
      variant="soft"
      active-variant="solid"
      >Recipes</UButton
    >
  </nav>
</template>
