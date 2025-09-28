<!-- Archived from pages/dashboard/settings/security.vue on 2025-09-26 -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/settings/authentication')
</script>

<template>
  <div class="p-4 text-sm text-dimmed">Redirecting to Authentication…</div>

  <!-- Back-compat note: this route moved to /dashboard/settings/authentication -->
</template>
