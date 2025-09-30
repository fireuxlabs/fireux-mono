<template>
  <CoreDefault :routes="routes" />
 </template>

<script setup lang="ts">
import { useMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { routes } = useMiseboxRoutes()
</script>