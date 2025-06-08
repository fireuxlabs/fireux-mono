<template>
  <div>
    <header>
      <h1>Default Layout</h1>
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <p>&copy; 2025 Fireux App</p>
    </footer>
  </div>
</template>

<script setup>
// Default layout script setup (if needed)
</script>

<style scoped>
header {
  background-color: #4caf50;
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  margin: 2rem;
}

footer {
  background-color: #f1f1f1;
  padding: 1rem;
  text-align: center;
}
</style>
