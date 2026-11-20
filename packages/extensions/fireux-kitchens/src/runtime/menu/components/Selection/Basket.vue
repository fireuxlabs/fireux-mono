<template>
  <div class="service-basket">
    <p v-if="lines.length && !catalogueReady" role="status">
      Your basket is kept. Availability will be checked when food and drinks
      reload.
    </p>
    <p v-if="!lines.length">Your basket is empty.</p>
    <article v-for="line in lines" :key="line.key" class="service-basket__line">
      <div class="service-basket__identity">
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
        <span>{{ money((line.unitMinor * line.choices.quantity) / 100) }}</span>
      </div>
      <div class="service-basket__actions">
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
    <div v-if="lines.length" class="service-basket__total">
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
<style scoped>
.service-basket {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.service-basket__line {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding-block-end: calc(var(--spacing) * 5);
  border-bottom: 1px solid var(--ui-border);
}
.service-basket__identity {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) * 4);
}
.service-basket__identity h3 {
  font-weight: 600;
}
.service-basket__identity p {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.service-basket__identity > span {
  white-space: nowrap;
  font-weight: 600;
}
.service-basket__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
.service-basket__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  font-size: var(--text-lg);
  font-weight: 600;
}
</style>
