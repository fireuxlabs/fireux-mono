<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup>
// Get Misebox-specific routes when user is authenticated
const miseboxRoutes = (await getMiseboxRoutes()) || []

</script>
