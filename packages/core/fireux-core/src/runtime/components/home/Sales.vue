<script setup lang="ts">
defineProps<{ period: any; range: { start: Date; end: Date } }>()
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">Recent sales</p>
    </template>
    <template #default>
      <ul class="divide-y divide-default">
        <li class="py-2 text-sm">Jane Doe — Pro Plan — $29</li>
        <li class="py-2 text-sm">Acme Inc — Enterprise — $299</li>
        <li class="py-2 text-sm">John Smith — Add-on — $9</li>
      </ul>
    </template>
  </UCard>
</template>
