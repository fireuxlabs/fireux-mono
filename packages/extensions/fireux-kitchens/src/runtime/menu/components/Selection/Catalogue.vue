<template>
  <div class="space-y-8">
    <section
      v-for="(section, index) in sections"
      :key="section.key"
      :id="`service-section-${index}`"
      class="scroll-mt-6"
    >
      <h2 class="mb-2 text-xl font-semibold">{{ section.label }}</h2>
      <div class="grid gap-x-8 md:grid-cols-2">
        <button
          v-for="row in section.items"
          :key="row.key"
          type="button"
          :disabled="disabled"
          class="flex w-full items-start gap-4 border-b border-default py-4 text-left transition-colors hover:bg-elevated/40 focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="`Choose ${row.item.name}`"
          @click="emit('select', row)"
        >
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold">{{ row.item.name }}</h3>
            <p
              v-if="row.item.description"
              class="mt-1 line-clamp-2 text-sm text-muted"
            >
              {{ row.item.description }}
            </p>
            <p class="mt-2 font-medium">
              {{ row.item.priceOptions.length ? 'From ' : ''
              }}{{
                money(
                  row.item.priceOptions.length
                    ? Math.min(
                        ...row.item.priceOptions.map((option) => option.price)
                      )
                    : row.item.price
                )
              }}
            </p>
            <p v-if="row.item.bottleDeposit" class="mt-1 text-xs text-muted">
              Bottle deposit +{{ money(row.item.bottleDeposit) }} or exchange
            </p>
            <p v-if="row.item.promotionLabel" class="mt-1 text-xs text-muted">
              {{ row.item.promotionLabel }}
            </p>
          </div>
          <UIcon
            name="i-lucide-plus"
            class="mt-1 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type {
  MenuServiceSection,
  MenuServiceOffer,
} from '../../utils/service-sections'
defineProps<{
  disabled?: boolean
  sections: MenuServiceSection[]
  money: (value: number) => string
}>()
const emit = defineEmits<{ select: [offer: MenuServiceOffer] }>()
</script>
