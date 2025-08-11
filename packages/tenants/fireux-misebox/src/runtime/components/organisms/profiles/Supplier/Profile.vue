<template>
  <div class="profile-card">
    <p>Supplier Profile Component - Coming Soon</p>
  </div>
</template>

<script setup lang="ts">
import type { Supplier } from '../../../../models/profiles/Supplier.model'

defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
