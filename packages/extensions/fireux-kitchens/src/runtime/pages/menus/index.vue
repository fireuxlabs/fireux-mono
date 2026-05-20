<template>
  <main class="mx-auto w-full max-w-2xl px-4 py-10">
    <UCard>
      <template #header>
        <h1 class="text-xl font-semibold text-highlighted">Menus</h1>
      </template>

      <p class="text-sm text-dimmed">
        Public menus belong to kitchens. Open a kitchen page to view its published menus.
      </p>

      <template #footer>
        <UButton to="/kitchens" icon="i-lucide-utensils">
          Browse kitchens
        </UButton>
      </template>
    </UCard>
  </main>
</template>
