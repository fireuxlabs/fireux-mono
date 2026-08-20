<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
        <div class="space-y-1">
          <div class="text-base font-semibold text-highlighted">
            Workspace typography
          </div>
          <p class="text-sm text-dimmed">
            Choose the optional title and body families used by Workspace menus.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <MoleculesDisclosurePanel title="Fonts" :default-open="false">
        <div class="mt-3 grid gap-4 lg:grid-cols-2">
            <UFormField label="Main title font">
              <div class="grid gap-2">
                <UButton
                  v-for="font in fontChoices"
                  :key="`title-${font.id}`"
                  color="neutral"
                  :variant="activeTitleFontId === font.id ? 'solid' : 'soft'"
                  :class="[
                    'h-16 justify-start overflow-hidden',
                    activeTitleFontId === font.id ? 'theme-font-option--selected' : '',
                  ]"
                  :disabled="!canWrite"
                  @click="updateTitleFont(font.id)"
                >
                  <span class="grid w-full min-w-0 text-left">
                    <span
                      class="block truncate text-lg leading-none"
                      :style="{ fontFamily: font.cssFamily }"
                    >
                      {{ font.label }}
                    </span>
                  </span>
                  <UBadge
                    v-if="activeTitleFontId === font.id"
                    size="sm"
                    color="primary"
                    variant="soft"
                  >
                    Selected
                  </UBadge>
                </UButton>
              </div>
            </UFormField>

            <UFormField label="Menu font">
              <div class="grid gap-2">
                <UButton
                  v-for="font in fontChoices"
                  :key="`menu-${font.id}`"
                  color="neutral"
                  :variant="activeMenuFontId === font.id ? 'solid' : 'soft'"
                  :class="[
                    'h-16 justify-start overflow-hidden',
                    activeMenuFontId === font.id ? 'theme-font-option--selected' : '',
                  ]"
                  :disabled="!canWrite"
                  @click="updateMenuFont(font.id)"
                >
                  <span class="grid w-full min-w-0 text-left">
                    <span
                      class="block truncate text-sm leading-none"
                      :style="{ fontFamily: font.cssFamily }"
                    >
                      {{ font.label }}
                    </span>
                  </span>
                  <UBadge
                    v-if="activeMenuFontId === font.id"
                    size="sm"
                    color="primary"
                    variant="soft"
                  >
                    Selected
                  </UBadge>
                </UButton>
              </div>
            </UFormField>
        </div>
      </MoleculesDisclosurePanel>

      <UAlert
        v-if="!canWrite"
        color="neutral"
        variant="soft"
        title="Theme is read-only"
        description="Select a writable kitchen before editing menu display values."
      />

      <p v-else-if="saveState" class="text-xs text-dimmed">
        {{ saveState }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import { computed } from 'vue'
import {
  menuThemeFontFromId,
  menuThemeFontOptions,
  resolveMenuPageStyle,
  resolveMenuFont,
  resolveMenuTitleFont,
} from '../../../../menu/composables/useMenuTheme'

const props = defineProps<{
  style: Partial<PageStyle>
  canWrite: boolean
  saveState: string
}>()

const emit = defineEmits<{
  'update:style': [style: Partial<PageStyle>]
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
// Theme editor spine: keep fields aligned with PageStyle and useMenuThemeSurface; full tenant app chrome stays outside this editor.
const normalizeStyle = (style: Partial<PageStyle>): Partial<PageStyle> => {
  const resolved = resolveMenuPageStyle(style)
  const fontSource = normalizeString(style.font_source) === 'google' ? 'google' : 'system'
  const titleFontSource =
    normalizeString(style.title_font_source) === 'google' ? 'google' : 'system'
  const hasTitleFont = Boolean(
    normalizeString(style.title_font_source) || normalizeString(style.title_font_family)
  )
  const font = resolveMenuFont({
    font_source: fontSource,
    font_family: normalizeString(style.font_family),
  })
  const titleFont = hasTitleFont
    ? resolveMenuTitleFont({
        title_font_source: titleFontSource,
        title_font_family: normalizeString(style.title_font_family),
      })
    : font

  return {
    ...resolved,
    title_font_source: titleFont.source,
    title_font_family: titleFont.family,
    font_source: font.source,
    font_family: font.family,
  }
}
const style = computed(() => normalizeStyle(props.style))
const activeTitleFont = computed(() => resolveMenuTitleFont(style.value))
const activeMenuFont = computed(() => resolveMenuFont(style.value))
const activeTitleFontId = computed(() => activeTitleFont.value.id)
const activeMenuFontId = computed(() => activeMenuFont.value.id)
const fontChoices = menuThemeFontOptions.map((option) => ({
  ...option,
  ...resolveMenuFont({
    font_source: option.source,
    font_family: option.family,
  }),
}))
const fontStylesheetLinks = [
  ...new Set(fontChoices.map((font) => font.stylesheetUrl).filter(Boolean)),
].map((href) => ({
  rel: 'stylesheet',
  href,
}))

useHead({
  link: fontStylesheetLinks,
})

function updateTitleFont(id: string) {
  const font = menuThemeFontFromId(id)

  emit('update:style', normalizeStyle({
    ...style.value,
    title_font_source: font.source,
    title_font_family: font.family,
  }))
}

function updateMenuFont(id: string) {
  const font = menuThemeFontFromId(id)

  emit('update:style', normalizeStyle({
    ...style.value,
    font_source: font.source,
    font_family: font.family,
  }))
}

</script>

<style scoped>
.theme-font-option--selected {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 44%, transparent);
}

</style>
