<template>
  <UCard v-if="dev" variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Dev</h2>
    </template>

    <div class="fx-card-body-stack">
      <div v-if="dev.endpoints?.length" class="pagebody">
        <UCard v-for="endpoint in dev.endpoints" :key="endpoint.path">
          <div>
            <UBadge :label="endpoint.method" color="neutral" variant="soft" />
            <code>
              {{ endpoint.path }}
            </code>
          </div>
          <p class="fx-type-caption">
            {{ endpoint.description }}
          </p>
        </UCard>
      </div>

      <UCard v-for="example in dev.examples" :key="example.title">
        <div>
          {{ example.title }}
        </div>
        <pre class="overflow-x-auto"><code>{{ example.code }}</code></pre>
      </UCard>
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
