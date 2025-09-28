<script setup lang="ts">
// Redirect legacy /dashboard/orders to /dashboard/purchases
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/purchases')
</script>

<template>
  <div class="p-4 text-sm text-dimmed">Redirecting to Purchases…</div>
</template>
