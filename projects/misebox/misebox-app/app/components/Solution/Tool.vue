<template>
  <section>
    <ClientOnly>
      <div>
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
