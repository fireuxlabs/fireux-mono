import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import { configureComponents } from './config/module/components-config'

export type FireuxSproochliModuleOptions = {
  enabled?: boolean
}

function setSproochliRuntime(nuxt: any, options: FireuxSproochliModuleOptions) {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  const current =
    fireux.sproochli &&
    typeof fireux.sproochli === 'object' &&
    !Array.isArray(fireux.sproochli)
      ? fireux.sproochli
      : {}

  fireux.sproochli = {
    ...current,
    enabled: options.enabled ?? true,
  }
}

export default defineNuxtModule<FireuxSproochliModuleOptions>({
  meta: {
    name: 'fireux-sproochli',
    version: '0.1.0',
    configKey: 'fireuxSproochli',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => setSproochliRuntime(nuxt, options),
      composables: registerComposablesDir,
      components: configureComponents,
    })
  },
})
