<template>
  <section v-if="operation.keywords?.length" :aria-labelledby="headingId">
    <div>
      <h2 :id="headingId">Guiding literature</h2>
      <p>
        These searches guide problem research, product literature, records,
        tools, and workflows for {{ operation.headline || operation.title }}.
      </p>
    </div>

    <ul>
      <li v-for="keyword in operation.keywords" :key="keyword">
        {{ keyword }}
      </li>
    </ul>

    <div v-if="operation.guidingLiterature">
      <p>
        {{ operation.guidingLiterature.summary }}
      </p>
      <div>
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
