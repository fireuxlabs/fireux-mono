import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'

export type CollectionRendezvousMode = 'queue' | 'scheduled'

export function useRendezvous(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const mode = ref<CollectionRendezvousMode>('queue')
  const scheduledSlot = ref('')
  const status = computed(() =>
    toValue(order).policy?.message ||
    'Choose whether to join the kitchen queue now or schedule collection for later.'
  )
  const scheduleSlots = [
    '18:00',
    '18:30',
    '19:00',
    '19:30',
  ]
  const timingContext = [
    {
      label: 'Kitchen / place opening times',
      value: 'Linked Google place hours',
      note: 'Used on the kitchen profile; the funnel still needs this data loaded directly.',
    },
    {
      label: 'Menu service times',
      value: 'Not configured yet',
      note: 'Needs a menu-level service window so collection can differ from venue opening hours.',
    },
  ]
  const options = [
    {
      label: 'Join the queue',
      description: 'Ask the kitchen for the next available collection slot.',
      icon: 'i-lucide-list-plus',
      value: 'queue',
    },
    {
      label: 'Scheduled',
      description: 'Choose a collection time for later.',
      icon: 'i-lucide-calendar-clock',
      value: 'scheduled',
    },
  ] as const

  return {
    mode,
    options,
    scheduledSlot,
    scheduleSlots,
    timingContext,
    ready: computed(() => mode.value === 'queue' || Boolean(scheduledSlot.value)),
    status,
  }
}
