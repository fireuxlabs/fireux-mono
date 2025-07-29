<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup>
const miseboxRoutes = await getMiseboxRoutes()
</script>
