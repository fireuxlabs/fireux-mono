<template>
  <USlideover v-if="menuState === 'icons'" side="left" class="icons">
    <div class="menu-container">
      <div v-for="link in links" :key="link.to" class="menu-item">
        <UIcon :name="link.icon" class="menu-icon" />
      </div>
    </div>
  </USlideover>
  
  <USlideover v-if="menuState === 'full'" side="left" class="full">
    <div class="menu-container">
      <div v-for="link in links" :key="link.to" class="menu-item">
        <UIcon :name="link.icon" class="menu-icon" />
        <NuxtLink :to="link.to" class="menu-link">{{ link.label }}</NuxtLink>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
type MenuState = 'icons' | 'full'
type SideMenuLink = { to: string; icon: string; label: string }

defineProps<{
  menuState: MenuState
  links: SideMenuLink[]
}>()
</script>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  padding: calc(var(--spacing) * 4);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
}

.menu-icon {
  font-size: 1.5rem;
}

.menu-link {
  text-decoration: none;
}
</style>