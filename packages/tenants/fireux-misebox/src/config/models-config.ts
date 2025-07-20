/**
 * Models Configuration for FireUX Misebox
 *
 * Auto-imports Chef and Supplier models
 */
import { Resolver, addTypeTemplate } from '@nuxt/kit'

export function configureModels(resolver: Resolver, nuxt: any) {
  // Add type imports for models
  addTypeTemplate({
    filename: 'types/misebox-models.d.ts',
    getContents: () => `
declare global {
  // Chef model types
  const Chef: typeof import('${resolver.resolve('./runtime/models/profiles/Chef.model')}').Chef
  
  // Supplier model types  
  const Supplier: typeof import('${resolver.resolve('./runtime/models/profiles/Supplier.model')}').Supplier
}

export {}
`,
  })
}
