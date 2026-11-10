<template>
  <section
    :id="sectionId"
    ref="section"
    :aria-label="option.label"
    tabindex="-1"
    class="workspace-surface service-section"
  >
    <div>
      <UIcon :name="option.icon" aria-hidden="true" />
      <h2>{{ option.label }}</h2>
    </div>
    <KitchenMenuServicesRecord
      v-for="offering in offerings"
      :key="offering.id"
      :option="option"
      :offering="offering"
      :anchor="sectionId + '/' + offering.id"
    />
    <KitchenMenuServicesRecord v-if="!offerings.length" :option="option" />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useKitchenServicesContext } from '../../../composables/offerings/useKitchenServicesContext'
import {
  offeringsForOption,
  type KitchenOfferingOption,
} from '../../../utils/offering-options'
const props = defineProps<{ option: KitchenOfferingOption }>()
const { retained } = useKitchenServicesContext()
const offerings = computed(() =>
  offeringsForOption(retained.value?.offerings || [], props.option)
)
const sectionId = 'service-' + props.option.key
const section = ref<HTMLElement | null>(null)
const route = useRoute()
watch(
  [
    section,
    () => route.hash,
    () => JSON.stringify(offerings.value.map((row) => row.id)),
  ],
  ([element, hash]) => {
    if (!element) return
    const target =
      hash === '#' + sectionId
        ? element
        : hash.startsWith('#' + sectionId + '/')
          ? element.ownerDocument.getElementById(hash.slice(1))
          : null
    if (!target || !element.contains(target)) return
    target.scrollIntoView({ block: 'start' })
    target.focus({ preventScroll: true })
  },
  { flush: 'post' }
)
</script>
<style scoped>
.service-section {
  padding-block: 1rem;
}
</style>
