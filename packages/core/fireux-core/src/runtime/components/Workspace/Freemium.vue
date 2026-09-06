<template>
  <section
    v-if="visible"
    class="shrink-0 space-y-2"
    :class="{ 'freemium-selector-end': besideSelector }"
    :aria-label="`${pageLabel} plan allowance`"
  >
    <NuxtLink
      to="/pricing"
      class="inline-flex"
      aria-label="Upgrade now — view pricing"
    >
      <UBadge color="primary" variant="soft">
        <span v-if="besideSelector" class="freemium-mobile-label">Upgrade</span>
        <span :class="{ 'freemium-desktop-label': besideSelector }"
          >Upgrade now</span
        >
      </UBadge>
    </NuxtLink>
    <p v-if="!hideDescription" class="text-sm text-muted">
      {{ currentAllowance
      }}<template v-if="capability !== 'test' && capability !== 'team'">
        {{ ' ' + upgradeAllowance }}</template
      >
    </p>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAppSession } from '../../app/composables/useAppSession'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
const props = defineProps<{
  besideSelector?: boolean
  hideDescription?: boolean
  family: string
  capability?: string
  usedCount?: number
  pageLabel: string
  placement: 'top' | 'bottom' | 'discovery'
}>()
const session = useAppSession()
const config = useFireUXConfig()
const plan = computed(() => session.membership.value?.subscription || 'free')
const visible = computed(
  () =>
    !session.pending.value &&
    !session.error.value &&
    (props.capability !== 'test' || props.usedCount !== undefined) &&
    ((plan.value === 'free' && props.placement === 'top') ||
      (plan.value === 'premium' && props.placement === 'bottom') ||
      (plan.value !== 'business' && props.placement === 'discovery'))
)
const planLabel = computed(() =>
  plan.value === 'premium' ? 'Premium' : 'Free'
)
const scopedCapacity = computed(() =>
  props.capability
    ? config.subscriptionCapacity[`${props.family}.${props.capability}`]
    : undefined
)
const capacity = computed(
  () => scopedCapacity.value || config.subscriptionCapacity[props.family]
)
const unit = computed(() =>
  scopedCapacity.value
    ? props.capability === 'team'
      ? 'team members'
      : 'Test records'
    : 'workspaces'
)
const upgrade = computed(() => {
  const limits = capacity.value
  if (plan.value === 'premium' || !limits || limits.premium === limits.free)
    return 'business'
  return 'premium'
})
const upgradeLabel = computed(() =>
  upgrade.value === 'business' ? 'Business' : 'Premium'
)
function allowance(limit: number | null | undefined) {
  return limit === null
    ? `unlimited ${unit.value}`
    : limit === undefined
      ? ''
      : `up to ${limit} ${limit === 1 ? unit.value.replace(/s$/, '') : unit.value}`
}
const currentAllowance = computed(() => {
  if (
    (props.capability === 'test' || props.capability === 'team') &&
    props.usedCount !== undefined
  ) {
    const limit = capacity.value?.[plan.value]
    if (typeof limit === 'number') {
      const remaining = Math.max(0, limit - props.usedCount)
      if (props.capability === 'team')
        return `${remaining} team ${remaining === 1 ? 'place' : 'places'} left.`
      return `You have ${remaining} Test ${remaining === 1 ? 'record' : 'records'} remaining.`
    }
  }
  const value = allowance(capacity.value?.[plan.value])
  return value
    ? `${planLabel.value} includes ${value}${scopedCapacity.value ? ' in this workspace' : ''}.`
    : `${props.pageLabel} is included in your workspace.`
})
const upgradeAllowance = computed(() => {
  const value = allowance(capacity.value?.[upgrade.value])
  return value
    ? `${upgradeLabel.value} supports ${value}${scopedCapacity.value ? ' in this workspace' : ''}.`
    : 'See pricing for the available plans and their benefits.'
})
</script>

<style scoped>
.freemium-selector-end {
  text-align: right;
}
.freemium-mobile-label {
  display: none;
}
@media (max-width: 639px) {
  .freemium-selector-end p,
  .freemium-desktop-label {
    display: none;
  }
  .freemium-mobile-label {
    display: inline;
  }
}
</style>
