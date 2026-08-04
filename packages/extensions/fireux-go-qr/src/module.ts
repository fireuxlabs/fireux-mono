import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { configureComponents } from './config/module/components-config'

export type FireuxGoQrModuleOptions = {
  enabled?: boolean
  providerBaseUrl?: string
}

function setGoQrRuntime(nuxt: any, options: FireuxGoQrModuleOptions) {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  const current =
    fireux.goQr &&
    typeof fireux.goQr === 'object' &&
    !Array.isArray(fireux.goQr)
      ? fireux.goQr
      : {}

  fireux.goQr = {
    ...current,
    enabled: options.enabled ?? true,
    providerBaseUrl:
      options.providerBaseUrl ||
      process.env.NUXT_PUBLIC_GO_QR_PROVIDER_BASE_URL ||
      process.env.GO_QR_PROVIDER_BASE_URL ||
      current.providerBaseUrl ||
      'https://go-qr.web.app',
  }
}

export default defineNuxtModule<FireuxGoQrModuleOptions>({
  meta: {
    name: 'fireux-go-qr',
    version: '0.1.0',
    configKey: 'fireuxGoQr',
    compatibility: { nuxt: '^4.4.0' },
  },
  defaults: {
    enabled: true,
    providerBaseUrl: '',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => setGoQrRuntime(nuxt, options),
      components: configureComponents,
    })
  },
})
