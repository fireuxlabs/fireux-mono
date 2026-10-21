import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { MenuServiceOffer } from '../utils/service-sections'
import {
  serviceItemSignature,
  type ServiceItemChoices,
} from '../utils/service-basket'
import type { useServiceBasket } from './useServiceBasket'

/** Local selector lifecycle. Basket replacement stays with the basket owner. */
export function useServiceItemEditor(input: {
  basket: ReturnType<typeof useServiceBasket>
  offers: MaybeRefOrGetter<MenuServiceOffer[]>
  locked: MaybeRefOrGetter<boolean>
  onClose: (editing: boolean) => void
}) {
  const selection = ref<{
    offer: MenuServiceOffer
    key?: string
    choices?: ServiceItemChoices
  } | null>(null)
  const error = ref('')
  function select(offer: MenuServiceOffer) {
    if (toValue(input.locked)) return
    error.value = ''
    selection.value = { offer }
  }
  function edit(key: string) {
    if (toValue(input.locked) || input.basket.staleKeys.value.includes(key))
      return false
    const line = input.basket.lines.value.find((row) => row.key === key)
    const offer = toValue(input.offers).find(
      (row) => serviceItemSignature(row) === line?.signature
    )
    if (!line || !offer) return false
    error.value = ''
    selection.value = { offer, key, choices: line.choices }
    return true
  }
  function close() {
    const editing = Boolean(selection.value?.key)
    selection.value = null
    error.value = ''
    input.onClose(editing)
  }
  function save(choices: ServiceItemChoices) {
    const current = selection.value
    if (!current || toValue(input.locked)) return
    try {
      if (current.key) input.basket.update(current.key, current.offer, choices)
      else input.basket.add(current.offer, choices)
      close()
    } catch (cause) {
      error.value =
        cause instanceof Error
          ? cause.message
          : 'Please choose this item again.'
    }
  }
  return {
    selection,
    error,
    open: computed(() => Boolean(selection.value)),
    select,
    edit,
    close,
    save,
  }
}
