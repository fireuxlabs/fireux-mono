<template>
  <div>
    <h1>Nuxt Playground</h1>
    <p>Welcome to the Nuxt playground!</p>

    <!-- Using FireUX Core component with the 'Fire' prefix -->
    <FireHello />
    <FireHello />
    <p>{{ greeting }}</p>
  </div>
</template>

<script setup>
const greeting = useGreeting()
</script>

<style>
/* Your styles here */
</style>
