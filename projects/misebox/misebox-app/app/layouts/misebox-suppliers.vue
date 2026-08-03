<template>
  <div class="fx-layout-shell" data-misebox-suppliers-layout>
    <LayoutsDefaultHeader />

    <div class="border-b border-default bg-default/80 backdrop-blur">
      <UContainer
        class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <NuxtLink
          to="/suppliers"
          class="inline-flex items-center gap-2 font-semibold text-highlighted"
        >
          <span
            class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-truck" aria-hidden="true" />
          </span>
          Misebox Suppliers
        </NuxtLink>

        <nav
          class="flex items-center gap-1 overflow-x-auto"
          aria-label="Misebox Suppliers"
        >
          <UButton to="/suppliers" color="neutral" variant="ghost" size="sm">
            Browse suppliers
          </UButton>
          <UButton
            to="/suppliers/learn-more"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            How it works
          </UButton>
          <UButton
            to="/console/supplier"
            color="neutral"
            variant="soft"
            size="sm"
          >
            Supplier Console
          </UButton>
        </nav>
      </UContainer>
    </div>

    <main class="fx-layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'misebox-suppliers' })
</script>
