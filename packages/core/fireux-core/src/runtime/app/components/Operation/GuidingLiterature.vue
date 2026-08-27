<template>
  <section
    v-if="operation.keywords?.length"
    class="grid gap-4 rounded-xl border border-default bg-elevated/30 p-4 sm:p-5"
    :aria-labelledby="headingId"
  >
    <div class="grid gap-1">
      <h2 :id="headingId" class="m-0 text-lg font-semibold text-highlighted">
        Guiding literature
      </h2>
      <p class="m-0 text-sm text-muted">
        These searches guide problem research, product literature, records,
        tools, and workflows for {{ operation.headline || operation.title }}.
      </p>
    </div>

    <ul class="grid gap-2 sm:grid-cols-2">
      <li
        v-for="keyword in operation.keywords"
        :key="keyword"
        class="rounded-lg border border-default bg-default px-4 py-3 text-sm text-highlighted"
      >
        {{ keyword }}
      </li>
    </ul>

    <div v-if="operation.guidingLiterature" class="grid gap-3">
      <p class="m-0 text-sm leading-6 text-toned">
        {{ operation.guidingLiterature.summary }}
      </p>
      <div class="grid gap-2">
        <h3 class="m-0 text-sm font-semibold text-highlighted">
          What people need
        </h3>
        <ul class="m-0 grid gap-2 pl-5 text-sm leading-6 text-toned">
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
