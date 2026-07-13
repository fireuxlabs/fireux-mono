<template>
  <UCard v-if="canWrite">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Staff POS</h2>
          <p class="text-sm text-dimmed">
            Fast order entry for dine in, eat in, and takeaway.
          </p>
        </div>
      </div>
    </template>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div class="space-y-4">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <UFormField label="Menu">
            <USelect
              v-model="selectedMenuId"
              :items="menuOptions"
              :disabled="!menuOptions.length"
            />
          </UFormField>

          <UFormField label="Mode">
            <UButtonGroup>
              <UButton
                v-for="mode in modes"
                :key="mode.value"
                :color="orderType === mode.value ? 'primary' : 'neutral'"
                :variant="orderType === mode.value ? 'solid' : 'soft'"
                :icon="mode.icon"
                @click="orderType = mode.value"
              >
                {{ mode.label }}
              </UButton>
            </UButtonGroup>
          </UFormField>
        </div>

        <UAlert
          v-if="!selectedMenu"
          color="neutral"
          variant="soft"
          title="No menu selected"
          description="Confirm a menu draft or select a menu before using Staff POS."
        />

        <div v-else class="space-y-5">
          <ConsoleKitchenOperationsOrdersWriteSection
            v-for="section in sections"
            :key="section.id"
            :section="section"
            :menu-id="selectedMenuId"
            :kitchen-id="kitchenId"
            :kitchen-collection-path="rootCollection"
            :database-id="databaseId"
            :dishes="dishes"
            @add="addItem"
          />
        </div>
      </div>

      <aside class="space-y-3 rounded-lg border border-default bg-default p-3">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-highlighted">Basket</h3>
          <UBadge color="neutral" variant="soft">{{ totalQuantity }}</UBadge>
        </div>

        <UFormField :label="nameLabel">
          <UInput
            v-model="customerName"
            :placeholder="namePlaceholder"
          />
        </UFormField>

        <div v-if="basket.length" class="space-y-2">
          <div
            v-for="line in basket"
            :key="line.lineId"
            class="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ line.label }}
              </p>
              <p class="text-xs text-dimmed">
                {{ money(line.price) }}
              </p>
            </div>

            <div class="flex items-center gap-1">
              <UButton
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-lucide-minus"
                @click="changeQuantity(line.lineId, -1)"
              />
              <span class="w-6 text-center text-sm font-semibold">
                {{ line.quantity }}
              </span>
              <UButton
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-lucide-plus"
                @click="changeQuantity(line.lineId, 1)"
              />
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-dimmed">
          Tap picture tiles to build an order.
        </p>

        <div class="flex items-center justify-between border-t border-default pt-3">
          <span class="text-sm text-dimmed">Total</span>
          <strong class="text-base text-highlighted">{{ money(total) }}</strong>
        </div>

        <UButton
          block
          icon="i-lucide-send"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="submitOrder"
        >
          Send to kitchen
        </UButton>

        <p v-if="message" class="text-sm text-success">{{ message }}</p>
        <p v-if="error" class="text-sm text-error">{{ error }}</p>
      </aside>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'
import { useMenuSectionCollection } from '../../../../../composables/fireux/firestore/menu/fetch/useMenuSectionCollection'
import { useKitchenOrderCreate } from '../../../../../composables/fireux/console/kitchen/operations/Orders/mutations/useKitchenOrderCreate'
import type { KitchenOrderType } from '../../../../../models/kitchen/order.model'
import type { StaffPosItemRow } from './Write/Section.vue'

type BasketLine = {
  lineId: string
  menuId: string
  dishId: string
  label: string
  price: number
  quantity: number
}
type MenuOption = {
  label: string
  value: string
}

const modes: { value: KitchenOrderType, label: string, icon: string }[] = [
  { value: 'dine_in', label: 'Table service', icon: 'i-lucide-qr-code' },
  { value: 'eat_in', label: 'Eat here', icon: 'i-lucide-utensils' },
  { value: 'takeaway', label: 'Take away', icon: 'i-lucide-shopping-bag' },
]
const {
  menus,
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
  currencyCode,
} = useKitchenConsoleMenus()
const { dishes } = useKitchenConsoleDishes()
const { createOrder } = useKitchenOrderCreate()
const { currentUser } = useAuth()
const selectedMenuId = ref('')
const orderType = ref<KitchenOrderType>('eat_in')
const customerName = ref('')
const basket = ref<BasketLine[]>([])
const submitting = ref(false)
const message = ref('')
const error = ref('')
const selectedMenu = computed(() =>
  menus.value.find((menu) => menu.id === selectedMenuId.value) ?? null
)
const menuOptions = computed<MenuOption[]>(() =>
  menus.value.map((menu) => ({
    label: menu.name || menu.id,
    value: menu.id,
  }))
)
const sectionState = useMenuSectionCollection(kitchenId, selectedMenuId, {
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const sections = computed(() => sectionState.sections.value)
const totalQuantity = computed<number>(() =>
  basket.value.reduce(
    (sum: number, line: BasketLine) => sum + line.quantity,
    0
  )
)
const total = computed<number>(() =>
  basket.value.reduce(
    (sum: number, line: BasketLine) => sum + line.quantity * line.price,
    0
  )
)
const nameLabel = computed(() =>
  orderType.value === 'dine_in' ? 'Table or guest' : 'Counter name'
)
const namePlaceholder = computed(() =>
  orderType.value === 'dine_in' ? 'Table 7' : 'Daniel'
)
const canSubmit = computed(() =>
  Boolean(
    canWrite.value &&
      kitchenId.value &&
      selectedMenuId.value &&
      currencyCode.value &&
      basket.value.length &&
      !submitting.value
  )
)

watch(menuOptions, (options: MenuOption[]) => {
  if (selectedMenuId.value || !options[0]?.value) return
  selectedMenuId.value = options[0].value
}, { immediate: true })

function addItem(row: StaffPosItemRow) {
  const lineId = row.id
  const existing = basket.value.find((line: BasketLine) => line.lineId === lineId)
  if (existing) {
    existing.quantity += 1
    return
  }

  basket.value.push({
    lineId,
    menuId: row.menuId,
    dishId: row.dishId,
    label: row.label,
    price: row.price,
    quantity: 1,
  })
}

function changeQuantity(lineId: string, delta: number) {
  const existing = basket.value.find((line: BasketLine) => line.lineId === lineId)
  if (!existing) return
  existing.quantity += delta
  basket.value = basket.value.filter((line: BasketLine) => line.quantity > 0)
}

async function submitOrder() {
  if (!canSubmit.value) return

  submitting.value = true
  message.value = ''
  error.value = ''

  try {
    const uid = currentUser.value?.uid || ''
    const orderId = await createOrder({
      kitchenId: kitchenId.value,
      kitchenCollectionPath: rootCollection.value,
      currency_code: currencyCode.value,
      order_type: orderType.value,
      creator_id: uid,
      customer: customerName.value.trim()
        ? { name: customerName.value.trim() }
        : {},
      items: basket.value.map((line: BasketLine, index: number) => ({
        id: `item-${index + 1}`,
        menu_id: line.menuId,
        dish_id: line.dishId,
        label: line.label,
        unit_price: line.price,
        quantity: line.quantity,
        checked: false,
      })),
    })

    basket.value = []
    customerName.value = ''
    message.value = `Order ${orderId} sent.`
  } catch (cause) {
    error.value = cause instanceof Error
      ? cause.message
      : 'Order was not sent.'
  } finally {
    submitting.value = false
  }
}

const money = (value: number) =>
  value
    ? new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: 'CHF',
      }).format(value)
    : 'CHF 0.00'
</script>
