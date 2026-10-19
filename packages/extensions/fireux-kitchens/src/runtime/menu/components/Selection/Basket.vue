<template>
  <div class="space-y-5">
    <p v-if="!lines.length" class="text-muted">Your basket is empty.</p>
    <article
      v-for="line in lines"
      :key="line.key"
      class="space-y-3 border-b border-default pb-4"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="font-medium">{{ line.name }}</h3>
          <p v-if="line.details.length" class="mt-1 text-sm text-muted">
            {{ line.details.join(' · ') }}
          </p>
          <p
            v-if="staleKeys.includes(line.key)"
            class="mt-1 text-sm text-warning"
          >
            This selection has changed or is unavailable. Remove it and choose
            again.
          </p>
        </div>
        <span class="shrink-0 font-medium">{{
          money(
            ((line.unitMinor - line.depositUnitMinor) * line.choices.quantity) /
              100
          )
        }}</span>
      </div>
      <div
        v-if="line.choices.bottle"
        class="flex justify-between gap-4 text-sm text-muted"
      >
        <span>{{
          line.choices.bottle === 'exchange'
            ? 'Bottle exchange · no deposit'
            : `Bottle deposit · ${line.choices.quantity} bottle${line.choices.quantity === 1 ? '' : 's'}`
        }}</span>
        <span v-if="line.depositUnitMinor"
          >+{{
            money((line.depositUnitMinor * line.choices.quantity) / 100)
          }}</span
        >
      </div>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-minus"
          :aria-label="`Decrease ${line.name}`"
          color="neutral"
          variant="soft"
          @click="emit('adjust', line.key, -1)"
        />
        <span :aria-label="`${line.name} quantity`">{{
          line.choices.quantity
        }}</span>
        <UButton
          icon="i-lucide-plus"
          :aria-label="`Increase ${line.name}`"
          color="neutral"
          variant="soft"
          :disabled="
            line.choices.quantity >= 99 || staleKeys.includes(line.key)
          "
          @click="emit('adjust', line.key, 1)"
        />
        <UButton
          label="Remove"
          color="neutral"
          variant="ghost"
          class="ml-auto"
          @click="emit('remove', line.key)"
        />
      </div>
    </article>
    <div
      v-if="lines.length"
      class="flex items-center justify-between text-lg font-semibold"
    >
      <span>Total</span><span>{{ money(totalMinor / 100) }}</span>
    </div>
    <UButton
      label="Keep browsing"
      block
      color="neutral"
      variant="soft"
      @click="emit('close')"
    />
  </div>
</template>
<script setup lang="ts">
import type { ServiceBasketLine } from '../../utils/service-basket'
defineProps<{
  lines: ServiceBasketLine[]
  staleKeys: string[]
  totalMinor: number
  money: (value: number) => string
}>()
const emit = defineEmits<{
  adjust: [key: string, change: number]
  remove: [key: string]
  close: []
}>()
</script>
