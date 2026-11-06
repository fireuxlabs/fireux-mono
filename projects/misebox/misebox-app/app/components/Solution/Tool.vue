<template>
  <section>
    <ClientOnly>
      <div class="flex justify-center">
        <slot />
      </div>

      <template #fallback>
        <UCard variant="subtle">
          <div class="fx-card-body-stack">
            <USkeleton />
            <USkeleton />
            <USkeleton />
          </div>
        </UCard>
      </template>
    </ClientOnly>
  </section>
</template>
