import type { NuxtConfig } from '@nuxt/schema'

export const FIREUX_DESIGN_PACK_PRESETS = ['sci-fire'] as const

export type FireuxDesignPackPreset =
  (typeof FIREUX_DESIGN_PACK_PRESETS)[number]

export type FireuxDesignPackConfig = {
  preset: FireuxDesignPackPreset
}

const SCI_FIRE_STYLESHEET =
  'fireux-core/runtime/assets/styles/design-packs/sci-fire.css'

const appendClass = (current: unknown, className: string) =>
  [typeof current === 'string' ? current.trim() : '', className]
    .filter(Boolean)
    .join(' ')

function addSlotClass(
  component: Record<string, any>,
  slot: string,
  className: string
) {
  const slots = ((component.slots ||= {}) as Record<string, unknown>)
  slots[slot] = appendClass(slots[slot], className)
}

function addVariantSlotClass(
  component: Record<string, any>,
  variant: string,
  value: string,
  slot: string,
  className: string
) {
  const variants = ((component.variants ||= {}) as Record<string, any>)
  const variantsForName = ((variants[variant] ||= {}) as Record<string, any>)
  const variantValue = ((variantsForName[value] ||= {}) as Record<string, unknown>)
  variantValue[slot] = appendClass(variantValue[slot], className)
}

function configureSciFireUi(nuxt: NuxtConfig) {
  const appConfig = (((nuxt as any).appConfig ||= {}) as Record<string, any>)
  const ui = ((appConfig.ui ||= {}) as Record<string, any>)

  const header = ((ui.header ||= {}) as Record<string, any>)
  addSlotClass(header, 'root', 'fx-sci-fire-header')

  const pageHeader = ((ui.pageHeader ||= {}) as Record<string, any>)
  addSlotClass(pageHeader, 'root', 'fx-sci-fire-page-header')

  const card = ((ui.card ||= {}) as Record<string, any>)
  const pageCard = ((ui.pageCard ||= {}) as Record<string, any>)
  const pageCTA = ((ui.pageCTA ||= {}) as Record<string, any>)

  for (const component of [card, pageCard, pageCTA]) {
    for (const variant of ['outline', 'soft', 'subtle']) {
      addVariantSlotClass(
        component,
        'variant',
        variant,
        'root',
        'fx-sci-fire-surface'
      )
    }
  }

  addSlotClass(pageCard, 'leading', 'fx-sci-fire-icon-well')
  addVariantSlotClass(
    pageCard,
    'to',
    'true',
    'root',
    'fx-sci-fire-interactive'
  )
}

export function validateAppDesignPack(
  designPack?: FireuxDesignPackConfig
): void {
  if (!designPack) return

  if (
    !designPack.preset ||
    !FIREUX_DESIGN_PACK_PRESETS.includes(designPack.preset)
  ) {
    throw new Error(
      `[fireux] app.designPack.preset must be one of: ${FIREUX_DESIGN_PACK_PRESETS.join(', ')}.`
    )
  }
}

export function configureAppDesignPack(
  nuxt: NuxtConfig,
  designPack?: FireuxDesignPackConfig
) {
  if (!designPack) return

  validateAppDesignPack(designPack)

  if (designPack.preset === 'sci-fire') {
    nuxt.css = [...(nuxt.css || []), SCI_FIRE_STYLESHEET]
    configureSciFireUi(nuxt)
  }
}
