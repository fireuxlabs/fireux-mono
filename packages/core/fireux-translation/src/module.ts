import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'fireux-translation',
    configKey: 'fireuxTranslation',
    compatibility: { nuxt: '^4.0.0' },
  },
})

export * from './runtime/languages'
export * from './runtime/useTranslate'
