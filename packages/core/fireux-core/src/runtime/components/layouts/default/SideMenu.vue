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

<script setup>
defineProps({
  menuState: {
    type: String,
    required: true,
    validator: (value) => ['icons', 'full'].includes(value)
  },
  links: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
}

.menu-icon {
  font-size: 1.5rem;
}

.menu-link {
  text-decoration: none;
}
</style>