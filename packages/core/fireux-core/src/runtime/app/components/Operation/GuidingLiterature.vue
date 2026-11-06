<template>
  <section
    v-if="operation.keywords?.length"
    class="grid gap-4 p-4 sm:p-5"
    :aria-labelledby="headingId"
  >
    <div class="grid gap-1">
      <h2 :id="headingId">Guiding literature</h2>
      <p>
        These searches guide problem research, product literature, records,
        tools, and workflows for {{ operation.headline || operation.title }}.
      </p>
    </div>

    <ul class="grid gap-2 sm:grid-cols-2">
      <li
        v-for="keyword in operation.keywords"
        :key="keyword"
        class="px-4 py-3"
      >
        {{ keyword }}
      </li>
    </ul>

    <div v-if="operation.guidingLiterature" class="grid gap-3">
      <p>
        {{ operation.guidingLiterature.summary }}
      </p>
      <div class="grid gap-2">
        <h3>What people need</h3>
        <ul class="fx-list-stack">
          <li v-for="need in operation.guidingLiterature.needs" :key="need">
            {{ need }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FireuxMetaOperation } from '../../../../config/app/meta-content'

const props = defineProps<{ operation: FireuxMetaOperation }>()
const headingId = computed(
  () => `operation-${props.operation.slug || props.operation.id}-literature`
)
</script>
