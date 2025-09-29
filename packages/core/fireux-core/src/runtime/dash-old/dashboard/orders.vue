<!-- Archived from pages/dashboard/orders.vue on 2025-09-26 -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/purchases')
</script>

<template>
  <div class="p-4 text-sm text-dimmed">Redirecting to Purchases…</div>
</template>
