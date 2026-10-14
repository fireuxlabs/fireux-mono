<template>
  <fieldset :disabled="pending" class="space-y-6">
    <slot />
    <section v-for="section in sections" :key="section.id" class="space-y-3">
      <h2 class="text-xl font-semibold">{{ section.label }}</h2>
      <article
        v-for="item in section.items"
        :key="item.id"
        class="rounded-xl border border-default p-4"
      >
        <h3 class="font-semibold">{{ item.name }}</h3>
        <p v-if="item.description" class="mt-1 text-sm text-muted">
          {{ item.description }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UButton
            v-if="!item.priceOptions.length"
            :label="`Add · ${money(item.price)}`"
            size="lg"
            variant="soft"
            @click="emit('add', section.id, item)"
          />
          <UButton
            v-for="option in item.priceOptions"
            :key="option.id"
            :label="`${option.label} · ${money(option.price)}`"
            size="lg"
            variant="soft"
            @click="emit('add', section.id, item, option)"
          />
        </div>
      </article>
    </section>
  </fieldset>
</template>
<script setup lang="ts">
import type {
  MenuManifestSection,
  MenuManifestItem,
  MenuManifestPriceOption,
} from '../../models/menu-detail.model'
defineProps<{
  sections: MenuManifestSection[]
  pending: boolean
  money: (amount: number) => string
}>()
const emit = defineEmits<{
  add: [
    sectionId: string,
    item: MenuManifestItem,
    option?: MenuManifestPriceOption,
  ]
}>()
</script>
