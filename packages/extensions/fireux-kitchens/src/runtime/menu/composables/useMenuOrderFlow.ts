import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useMenu } from './useMenu'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useOrderExchange } from '../../kitchen/composables/useOrderExchange'
import { publicMenuServiceOpen } from '../utils/menu-ordering'
import { orderSubmissionIssues } from '../../kitchen/utils/order-submission'
import type {
  MenuManifestItem,
  MenuManifestPriceOption,
} from '../models/menu-detail.model'
import type { Order } from '../../kitchen/models/order.model'
import type { OrderSubmission } from '../../kitchen/models/order-submission.model'
import type { MenuOrderInput, CartLine } from '../models/menu-order-flow.model'
export function useMenuOrderFlow(props: MenuOrderInput) {
  const menu = useMenu(
    computed(() => props.menuId),
    { routeScope: computed(() => props.routeScope), menuContext: computed(() => props.context) }
  )
  const ordering = useRuntimeConfig().public.ordering as
    | { channels?: string[] }
    | undefined
  const websiteOrdering = ordering?.channels?.includes('website')
  const manifest = menu.manifest
  const serviceAvailable = computed(() =>
    Boolean(
      websiteOrdering &&
        manifest.value?.behaviour.availableOrderTypes.includes(
          props.context === 'table' ? 'dine_in' : props.context
        )
    )
  )
  const kitchenId = computed(() => manifest.value?.source.kitchenId || '')
  const { currentUser } = useAuth(),
    config = useFireUXConfig()
  const { request, pending, error, version } = useOrderExchange(
    kitchenId,
    computed(() =>
      JSON.stringify([props.menuId, props.context, props.routeScope])
    )
  )
  const cart = ref<CartLine[]>([]),
    name = ref(''),
    phone = ref(''),
    address = ref(''),
    location = ref(''),
    id = ref('')
  const submission = ref<OrderSubmission | null>(null)
  const title = computed(
    () =>
      ({
        collection: 'Collection',
        delivery: 'Delivery',
        table: 'Table ordering',
      })[props.context]
  )
  const money = (amount: number) =>
    `${manifest.value?.presentation.currencyCode || ''} ${amount.toFixed(2)}`
  const total = computed(
    () =>
      cart.value.reduce(
        (sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity,
        0
      ) / 100
  )
  function add(
    sectionId: string,
    item: MenuManifestItem,
    option?: MenuManifestPriceOption
  ) {
    const key = JSON.stringify([sectionId, item.id, option?.id]),
      existing = cart.value.find((line) => line.key === key)
    if (existing) {
      if (existing.quantity < 99) existing.quantity++
      return
    }
    if (cart.value.length >= 50) return
    cart.value.push({
      key,
      sectionId,
      itemId: item.id,
      ...(option ? { optionId: option.id } : {}),
      quantity: 1,
      name: item.name + (option ? ` — ${option.label}` : ''),
      unitPrice: option?.price ?? item.price,
    })
  }
  function adjust(key: string, delta: number) {
    const line = cart.value.find((line) => line.key === key)
    if (!line) return
    line.quantity += delta
    if (line.quantity < 1)
      cart.value = cart.value.filter((line) => line.key !== key)
  }
  const order = computed<Order>(() => ({
    id: id.value || 'pending',
    number: '',
    channel: 'website',
    fulfilment: props.context === 'table' ? 'on_site' : props.context,
    lines: cart.value.map((line, index) => ({
      id: `line-${index + 1}`,
      item: { id: line.itemId, name: line.name },
      quantity: line.quantity,
      unit_code: 'C62',
    })),
    ...(name.value.trim() || phone.value.trim()
      ? {
          customer: {
            ...(name.value.trim() ? { name: name.value.trim() } : {}),
            ...(phone.value.trim() ? { phone: phone.value.trim() } : {}),
          },
        }
      : {}),
    ...(address.value.trim() ? { delivery_address: address.value.trim() } : {}),
    ...(location.value.trim()
      ? { location: { name: location.value.trim() } }
      : {}),
  }))
  const servingNow = ref(new Date())
  const serviceOpen = computed(() =>
    Boolean(
      manifest.value &&
        publicMenuServiceOpen(
          manifest.value.behaviour.ordering,
          props.context === 'table' ? 'dine_in' : props.context,
          servingNow.value
        )
    )
  )
  const issues = computed(() => [
    ...orderSubmissionIssues(order.value),
    ...(!serviceAvailable.value
      ? ['This service is unavailable.']
      : !serviceOpen.value
        ? ['This service is closed. Please order during its serving hours.']
        : []),
  ])
  const storageKey = () =>
    `order:${config.appId}:${kitchenId.value}:${props.menuId}:${props.context}:${currentUser.value?.uid || ''}`
  function clear() {
    submission.value = null
    cart.value = []
    name.value = ''
    phone.value = ''
    address.value = ''
    location.value = ''
    id.value = crypto.randomUUID()
  }
  function reset() {
    sessionStorage.removeItem(storageKey())
    clear()
  }
  async function resume() {
    const selected = storageKey(),
      saved = sessionStorage.getItem(selected)
    if (!saved || !currentUser.value) return
    const result = await request('/api/ordering/response', { orderId: saved })
    if (result && !Array.isArray(result) && selected === storageKey())
      submission.value = result
  }
  async function submit() {
    if (issues.value.length || pending.value) return
    const result = await request('/api/ordering/menu-submit', {
      menuId: props.menuId,
      ...(props.routeScope.kind === 'directory'
        ? { kitchenSlug: props.routeScope.kitchenSlug }
        : {}),
      selections: cart.value.map(
        ({ sectionId, itemId, optionId, quantity }) => ({
          sectionId,
          itemId,
          ...(optionId ? { optionId } : {}),
          quantity,
        })
      ),
      order: JSON.parse(JSON.stringify(order.value)),
      expectedTotal: total.value,
    })
    if (result && !Array.isArray(result)) {
      submission.value = result
      sessionStorage.setItem(storageKey(), result.order.id)
    }
  }
  async function refresh() {
    const selected = submission.value?.order.id
    if (!selected || pending.value) return
    const result = await request('/api/ordering/response', {
      orderId: selected,
    })
    if (
      result &&
      !Array.isArray(result) &&
      submission.value?.order.id === selected
    )
      submission.value = result
  }
  watch([version, () => props.menuId, () => props.context], () => {
    clear()
    void resume()
  })
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    clear()
    void resume()
    timer = setInterval(() => {
      servingNow.value = new Date()
      if (
        submission.value &&
        !['completed', 'declined'].includes(submission.value.state)
      )
        void refresh()
    }, 4000)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
  const responseTitle = computed(
    () =>
      ({
        received: 'Order received',
        accepted: 'Order accepted',
        declined: 'Order declined',
        preparing: 'Your order is being prepared',
        ready: 'Your order is ready',
        completed: 'Order completed',
      })[submission.value?.state || 'received']
  )
  const responseMessage = computed(() => {
    const saved = submission.value
    if (!saved) return ''
    if (saved.state === 'received')
      return 'The kitchen is reviewing your order. Please wait for confirmation.'
    if (saved.state === 'declined')
      return 'The kitchen could not accept your order.'
    if (saved.state === 'ready')
      return props.context === 'delivery'
        ? 'Your order is ready for the driver.'
        : props.context === 'table'
          ? `Your order is ready for ${/^\d+$/.test(saved.order.location?.name || '') ? 'table ' : ''}${saved.order.location?.name}.`
          : 'Please go to the counter to collect your order.'
    if (saved.state === 'completed')
      return 'Thank you. Your order has been completed.'
    return 'The kitchen has your order. Updates will appear here.'
  })

  return {
    menu,
    manifest,
    serviceAvailable,
    serviceOpen,
    cart,
    name,
    phone,
    address,
    location,
    submission,
    title,
    money,
    total,
    issues,
    currentUser,
    pending,
    error,
    add,
    adjust,
    submit,
    reset,
    responseTitle,
    responseMessage,
  }
}
