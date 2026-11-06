<template>
  <UCard v-if="dev" variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Dev</h2>
    </template>

    <div class="fx-card-body-stack">
      <div v-if="dev.endpoints?.length" class="grid gap-3 sm:grid-cols-2">
        <UCard v-for="endpoint in dev.endpoints" :key="endpoint.path">
          <div class="flex items-center gap-2">
            <UBadge :label="endpoint.method" color="neutral" variant="soft" />
            <code class="break-all">
              {{ endpoint.path }}
            </code>
          </div>
          <p class="mt-2 fx-type-caption">
            {{ endpoint.description }}
          </p>
        </UCard>
      </div>

      <div
        v-for="example in dev.examples"
        :key="example.title"
        class="overflow-hidden rounded-md border border-default bg-elevated"
      >
        <div class="border-b border-default px-4 py-2">
          {{ example.title }}
        </div>
        <pre class="overflow-x-auto p-4"><code>{{ example.code }}</code></pre>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  dev?: {
    endpoints?: {
      method: string
      path: string
      description: string
    }[]
    examples?: {
      title: string
      code: string
    }[]
  }
}>()
</script>
