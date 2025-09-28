<script setup lang="ts">
defineProps<{ period: any; range: { start: Date; end: Date } }>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <UCard
      ><template #default
        ><p class="text-sm">Revenue</p>
        <p class="text-2xl font-semibold">$12,345</p></template
      ></UCard
    >
    <UCard
      ><template #default
        ><p class="text-sm">Orders</p>
        <p class="text-2xl font-semibold">248</p></template
      ></UCard
    >
    <UCard
      ><template #default
        ><p class="text-sm">Visitors</p>
        <p class="text-2xl font-semibold">5,123</p></template
      ></UCard
    >
    <UCard
      ><template #default
        ><p class="text-sm">Conversion</p>
        <p class="text-2xl font-semibold">2.8%</p></template
      ></UCard
    >
  </div>
</template>
