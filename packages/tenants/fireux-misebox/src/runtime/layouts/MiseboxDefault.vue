<template>
  <CoreDefault :extras="miseboxRoutes">
    <slot />
  </CoreDefault>
</template>

<script setup>
// Explicit import to ensure it's available
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { appUser } = await useAppUser()

// Get Misebox-specific routes when user is authenticated
const miseboxRoutes = appUser ? getMiseboxRoutes() || [] : []
</script>