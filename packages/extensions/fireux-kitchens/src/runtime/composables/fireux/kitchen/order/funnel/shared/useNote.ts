import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useFunnelCustomer } from './useCustomer'
import type { KitchenOrderCustomer } from '../../../../../../models/kitchen/order.model'

type UseNoteOptions = {
  initial?: MaybeRefOrGetter<Partial<KitchenOrderCustomer> | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useNote(options: UseNoteOptions = {}) {
  const { customer, pending } = useFunnelCustomer()
  const hydrated = ref(false)
  const phone = ref('')
  const notes = ref('')
  const note = computed<KitchenOrderCustomer>(() => ({
    ...(text(phone.value) ? { phone: text(phone.value) } : {}),
    ...(text(notes.value) ? { notes: text(notes.value) } : {}),
  }))
  const hasNote = computed(() =>
    Boolean(text(phone.value) || text(notes.value))
  )

  watch(
    [customer, computed(() => toValue(options.initial))],
    ([profileCustomer, initial]) => {
      if (hydrated.value) return

      phone.value = text(initial?.phone || profileCustomer.phone)
      notes.value = text(initial?.notes || profileCustomer.notes)
      hydrated.value = true
    },
    { immediate: true }
  )

  return {
    hasNote,
    note,
    notes,
    pending,
    phone,
  }
}
