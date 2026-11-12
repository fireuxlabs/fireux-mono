import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

export type ProductDemoItem = MiseboxProductDemo['workspace']['dishes'][number]

export type ItemChildPage = 'detail' | 'finance' | 'spec' | 'prep' | 'recipes'
