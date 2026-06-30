<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-eye" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <p class="text-sm font-medium text-highlighted">
              Menu Preview
            </p>
            <p v-if="previewMenu?.name" class="text-xs text-dimmed">
              {{ previewMenu.name }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <div class="flex rounded-md border border-default p-0.5">
            <UButton
              v-for="mode in previewModes"
              :key="mode.value"
              color="neutral"
              :variant="previewMode === mode.value ? 'solid' : 'ghost'"
              size="sm"
              :icon="mode.icon"
              @click="previewMode = mode.value"
            >
              {{ mode.label }}
            </UButton>
          </div>

          <UButton
            v-if="publicMenuUrl"
            :to="publicMenuUrl"
            target="_blank"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-external-link"
          >
            Go to menu
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Menu preview spine: mirror Menu/Detail/Index.vue so this edits the same page_style data public menus consume. -->
      <section
        class="menu-preview-frame"
        :class="themeClassName"
        :style="themeStyleVars"
      >
        <section v-if="previewMenu" class="menu-preview-surface">
          <MenuDetailHeading
            :kitchen-name="kitchenName"
            :name="previewMenu.name"
            :description="previewDescription"
          />

          <UAlert
            v-if="!previewSections.length"
            color="neutral"
            variant="soft"
            title="Menu preview unavailable"
            description="This menu has no public sections yet."
          />

          <MenuDetailSectionList
            v-else
            :sections="previewSections"
          />
        </section>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No menu selected"
          description="Publish a menu before previewing menu display."
        />
      </section>

      <UCollapsible>
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          trailing-icon="i-lucide-chevron-down"
        >
          Theme snapshot
        </UButton>

        <template #content>
          <pre class="mt-3 overflow-auto rounded-lg border border-default bg-muted p-3 text-xs text-highlighted">{{ snapshotJson }}</pre>
        </template>
      </UCollapsible>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { MenuManifestSection } from '../../../../composables/fireux/menu/useMenuManifest'
import { useMenuThemeSurface } from '../../../../composables/fireux/menu/useMenuThemeSurface'
import type { Menu } from '../../../../models/kitchen/menu/menu.model'

const props = defineProps<{
  kitchenName: string
  menu?: Menu | null
  sections?: MenuManifestSection[]
  pageStyle: Partial<PageStyle>
  publicMenuUrl?: string
}>()

const previewMode = ref<'light' | 'dark'>('light')
const previewModes = [
  {
    label: 'Light',
    value: 'light' as const,
    icon: 'i-lucide-sun',
  },
  {
    label: 'Dark',
    value: 'dark' as const,
    icon: 'i-lucide-moon',
  },
]

const text = (value: unknown) => String(value ?? '').trim()
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle: computed(() => props.pageStyle),
  colorMode: previewMode,
})
const previewDescription = computed(() => text(props.menu?.description))
const previewMenu = computed(() => props.menu ?? null)
const previewSections = computed(() =>
  props.sections?.length ? props.sections : []
)

const snapshot = computed(() => ({
  kitchenName: props.kitchenName,
  menuId: previewMenu.value?.id || '',
  previewMode: previewMode.value,
  menuStyle: {
    backgroundColorLight: props.pageStyle.background_color_light ?? '',
    backgroundColorDark: props.pageStyle.background_color_dark ?? '',
    fontColorLight: props.pageStyle.font_color_light ?? '',
    fontColorDark: props.pageStyle.font_color_dark ?? '',
    titleColorLight: props.pageStyle.title_color_light ?? '',
    titleColorDark: props.pageStyle.title_color_dark ?? '',
    primaryColor: props.pageStyle.primary_color ?? '',
    secondaryColor: props.pageStyle.secondary_color ?? '',
    titleFontSource: props.pageStyle.title_font_source ?? '',
    titleFontFamily: props.pageStyle.title_font_family ?? '',
    fontSource: props.pageStyle.font_source ?? '',
    fontFamily: props.pageStyle.font_family ?? '',
  },
}))

const snapshotJson = computed(() => JSON.stringify(snapshot.value, null, 2))
</script>

<style scoped>
.menu-preview-frame {
  --menu-bg-light: #f8fafc;
  --menu-bg-dark: #0f172a;
  --menu-text-light: #0f172a;
  --menu-text-dark: #f8fafc;
  --menu-title-light: var(--menu-text-light);
  --menu-title-dark: var(--menu-text-dark);
  --menu-primary-source: #0f766e;
  --menu-primary: var(--menu-primary-source);
  --menu-bg: var(--menu-bg-light);
  --menu-text: var(--menu-text-light);
  --menu-title: var(--menu-title-light);
  --menu-muted: color-mix(in srgb, var(--menu-text) 72%, var(--menu-bg));
  --menu-secondary: #64748b;
  --menu-font: ui-sans-serif, system-ui, sans-serif;
  --menu-title-font: var(--menu-font);

  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: 1rem;
  background: var(--menu-bg);
  color: var(--menu-text);
  font-family: var(--menu-font);
  overflow: hidden;
}

.menu-preview-frame.public-menu--light {
  --menu-bg: var(--menu-bg-light);
  --menu-text: var(--menu-text-light);
  --menu-title: var(--menu-title-light);
  --menu-primary: var(--menu-primary-source);
}

.menu-preview-frame.public-menu--dark {
  --menu-bg: var(--menu-bg-dark);
  --menu-text: var(--menu-text-dark);
  --menu-title: var(--menu-title-dark);
  --menu-primary: color-mix(in srgb, var(--menu-primary-source) 58%, var(--menu-text));
}

.menu-preview-surface {
  /* Console preview spine: keep the page layout compact, but preserve public menu breathing room inside the preview itself. */
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
  color: var(--menu-text);
  text-align: center;
}

.menu-preview-surface :deep(.menu-sections.menu-sections) {
  /* The preview crops to one section/item, so it should not inherit the public two-column menu layout. */
  display: grid;
  width: 100%;
  column-count: initial;
  column-gap: 0;
}
</style>
