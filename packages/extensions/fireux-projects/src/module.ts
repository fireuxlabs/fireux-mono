import { createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  registerComposablesDirs,
} from 'fireux-core/config/module/module-helpers'
import { configureComponents } from './config/module/components-config'

const module = defineNuxtModule({
  meta: {
    name: 'fireux-projects',
    version: '0.1.0',
    configKey: 'fireuxProjects',
  },
  setup() {
    const resolver = createResolver(import.meta.url)
    registerComposablesDirs(resolver, ['./runtime/project/composables'])
    configureComponents(resolver)
  },
})

export default module
