<template>
  <div>
    <p v-if="lines.length && !catalogueReady" role="status">
      Your basket is kept. Availability will be checked when food and drinks
      reload.
    </p>
    <p v-if="!lines.length">Your basket is empty.</p>
    <article v-for="line in lines" :key="line.key">
      <div>
        <div>
          <h3>{{ line.name }}</h3>
          <p v-if="line.details.length">
            {{ line.details.join(' · ') }}
          </p>
          <p v-if="staleKeys.includes(line.key)">
            This selection has changed or is unavailable. Remove it and choose
            again.
          </p>
        </div>
        <span>{{
          money(
            ((line.unitMinor - line.depositUnitMinor) * line.choices.quantity) /
              100
          )
        }}</span>
      </div>
      <div v-if="line.choices.bottle">
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
      <div>
        <UButton
          icon="i-lucide-minus"
          :aria-label="`Decrease ${line.name}`"
          color="neutral"
          variant="soft"
          :disabled="disabled"
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
            disabled ||
            !catalogueReady ||
            line.choices.quantity >= 99 ||
            staleKeys.includes(line.key)
          "
          @click="emit('adjust', line.key, 1)"
        />
        <UButton
          label="Edit"
          :aria-label="`Edit ${line.name}`"
          color="neutral"
          variant="ghost"
          :disabled="
            disabled || !catalogueReady || staleKeys.includes(line.key)
          "
          @click="emit('edit', line.key)"
        />
        <UButton
          label="Remove"
          color="neutral"
          variant="ghost"
          :disabled="disabled"
          @click="emit('remove', line.key)"
        />
      </div>
    </article>
    <div v-if="lines.length">
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
import type { ServiceBasketLine } from '../../utils/ordering/basket'
defineProps<{
  disabled?: boolean
  catalogueReady: boolean
  lines: ServiceBasketLine[]
  staleKeys: string[]
  totalMinor: number
  money: (value: number) => string
}>()
const emit = defineEmits<{
  edit: [key: string]
  adjust: [key: string, change: number]
  remove: [key: string]
  close: []
}>()
</script>
