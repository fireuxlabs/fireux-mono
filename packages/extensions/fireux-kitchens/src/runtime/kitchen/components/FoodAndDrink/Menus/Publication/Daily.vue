<template>
  <UCard v-if="menu">
    <template #header>
      <h2 class="fx-type-card-heading">Publish a date</h2>
      <p class="fx-type-caption">
        Guests see today's published selections at the same Menu and QR link.
      </p>
    </template>
    <div class="workspace-surface workspace-surface--compact">
      <UFormField
        label="Menu date"
        :help="
          timezone ? `Dates use ${timezone}.` : 'Set the Place timezone first.'
        "
      >
        <UInput v-model="date" type="date" />
      </UFormField>
      <FireCopyError v-if="sectionsError" :message="String(sectionsError)" />
      <p v-else-if="sectionsPending" role="status">Loading selections…</p>
      <template v-else>
        <UBadge :color="published ? 'success' : 'neutral'">{{
          published ? 'Published for this date' : 'Private for this date'
        }}</UBadge>
        <ul v-if="selectedSections.length" class="fx-list-stack">
          <li v-for="section in selectedSections" :key="section.id">
            {{ section.label }}
          </li>
        </ul>
        <p v-else>No selections saved for this date.</p>
      </template>
      <p class="fx-type-caption">
        Browse only. Changes to published selections appear live.
      </p>
      <div class="menu-editor-actions">
        <UButton
          label="Review selections"
          color="neutral"
          variant="soft"
          @click="select('content')"
        />
        <UButton
          v-if="!published"
          label="Publish this date"
          icon="i-lucide-send"
          :loading="busy"
          :disabled="
            !canWrite ||
            !timezone ||
            !isMenuDate(date) ||
            !selectedSections.length ||
            sectionsPending ||
            Boolean(sectionsError) ||
            busy
          "
          @click="save(true)"
        />
        <UButton
          v-else
          label="Unpublish this date"
          color="neutral"
          variant="outline"
          :loading="busy"
          :disabled="!canManage || busy"
          @click="confirmWithdrawal = true"
        />
        <UButton
          v-if="menu.status === 'published'"
          :to="publicUrl"
          label="Open today's Menu"
          target="_blank"
          color="neutral"
          variant="soft"
        />
        <UButton
          v-if="menu.status === 'published'"
          :to="qrUrl"
          label="Print Menu QR"
          target="_blank"
          icon="i-lucide-qr-code"
          color="neutral"
          variant="soft"
        />
      </div>
      <p v-if="message" class="menu-editor-success" role="status">
        {{ message }}
      </p>
      <FireCopyError v-if="error" :message="error" />
    </div>
    <UModal
      v-model:open="confirmWithdrawal"
      title="Unpublish this date?"
      description="Only this date's selections will be hidden. Other published dates and the stable Menu link stay available."
    >
      <template #body>
        <div class="menu-editor-actions">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="confirmWithdrawal = false"
          />
          <UButton
            label="Unpublish date"
            color="warning"
            :loading="busy"
            @click="save(false)"
          />
        </div>
      </template>
    </UModal>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useState, useRequestURL } from '#imports'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuRecordView } from '../../../../composables/workspace/menus/useMenuRecordView'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useMenuMutation } from '../../../../../menu/composables/firestore/mutations/useMenuMutation'
import { isMenuDate } from '../../../../../menu/utils/menu-date'
import {
  menuLocalDate,
  publishedMenuDates,
} from '../../../../../menu/utils/daily-menu'
import {
  menuRoutePath,
  menuRouteQrPath,
  tenantMenuRouteScope,
  directoryMenuRouteScope,
} from '../../../../../menu/utils/menu-route'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { menuWebsiteOrigin } from '../../../../utils/menu-website-snippet'
const {
  menu,
  kitchenId,
  menuId,
  selectedKitchen,
  timezone,
  sections,
  sectionsPending,
  sectionsError,
  canWrite,
  canManage,
} = useKitchenMenuRecordContext()
const { select } = useMenuRecordView()
const { mutate } = useMenuMutation()
const date = useState('kitchen-menu-calendar-date', () => {
  try {
    return menuLocalDate(timezone.value)
  } catch {
    return ''
  }
})
const selectedSections = computed(() =>
  sections.value.filter((section) => section.date === date.value)
)
const published = computed(() =>
  publishedMenuDates(menu.value?.published_dates).includes(date.value)
)
const busy = ref(false),
  error = ref(''),
  message = ref(''),
  confirmWithdrawal = ref(false)
const captureScope = useMenuEditorScope(
  [kitchenId, menuId, date, timezone],
  () => {
    busy.value = false
    error.value = ''
    message.value = ''
    confirmWithdrawal.value = false
  }
)
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const routeInput = computed(() => ({
  scope: fireux.isTenant
    ? tenantMenuRouteScope()
    : directoryMenuRouteScope(selectedKitchen.value?.slug),
  menuId: menu.value?.slug,
}))
const publicUrl = computed(() => {
  const path = menuRoutePath(routeInput.value)
  return path && origin ? new URL(path, origin).href : ''
})
const qrUrl = computed(() => {
  const path = menuRouteQrPath(routeInput.value)
  return path && origin ? new URL(path, origin).href : ''
})
async function save(published: boolean) {
  if (
    !(published ? canWrite.value : canManage.value) ||
    busy.value ||
    !isMenuDate(date.value)
  )
    return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    await mutate(
      'daily-publication',
      'POST',
      {
        kitchenId: kitchenId.value,
        menuId: menuId.value,
        date: date.value,
        published,
      },
      isCurrent
    )
    if (!isCurrent()) return
    confirmWithdrawal.value = false
    message.value = published
      ? `Published ${date.value}.`
      : `Unpublished ${date.value}.`
  } catch (cause) {
    if (isCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Could not update this date.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
