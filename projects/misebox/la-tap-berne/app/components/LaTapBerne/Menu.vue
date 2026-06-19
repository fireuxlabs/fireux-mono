<template>
  <section>
    <h1>hello LaTapBerneMenu</h1>

    <pre>{{ debug }}</pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { laTapBerneMenuSections } from '../../menu'

const props = defineProps<{
  menu?: { sections?: unknown[] } | null
  pending?: boolean
}>()

const sections = computed(() =>
  Array.isArray(props.menu?.sections) && props.menu.sections.length
    ? props.menu.sections
    : laTapBerneMenuSections
)
const debug = computed(() => ({
  props,
  derived: {
    sectionsCount: sections.value.length,
    usingLocalSections: !props.menu?.sections?.length,
  },
  sections: sections.value,
}))
</script>
