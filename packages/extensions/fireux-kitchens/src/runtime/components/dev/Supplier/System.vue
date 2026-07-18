<template>
  <section class="space-y-10">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Suppliers ownership
          </p>
          <p class="text-xs text-muted">
            Supplier model + collection are currently owned by Misebox.
          </p>
        </div>
      </template>

      <UAlert
        icon="i-lucide-info"
        color="neutral"
        variant="soft"
        title="Supplier drift is tracked in Misebox"
        description="Use the Misebox dev page to review supplier model drift."
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Supplier tools
          </p>
          <p class="text-xs text-muted">
            Open supplier dev/index pages in their owning module.
          </p>
        </div>
      </template>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          to="/dev/fireux-misebox"
          size="sm"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-up-right"
        >
          Open supplier drift
        </UButton>
        <UButton
          to="/suppliers"
          size="sm"
          color="neutral"
          variant="ghost"
        >
          Open suppliers index
        </UButton>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevSupplierSystem' })
</script>
