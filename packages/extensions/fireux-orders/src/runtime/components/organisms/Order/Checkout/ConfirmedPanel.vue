<template>
  <div class="space-y-6">
    <UAlert
      color="success"
      variant="soft"
      title="Order confirmed"
      :description="`Order id: ${orderId}`"
    />

    <UCard>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm text-dimmed">Status</div>
          <div class="font-medium">Submitted</div>
        </div>

        <UButton color="neutral" variant="soft" :to="backToMenu">
          Back to menu
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  orderId: string
  backToMenu: string
}>()
</script>
