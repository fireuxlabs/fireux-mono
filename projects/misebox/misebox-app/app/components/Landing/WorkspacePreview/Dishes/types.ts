import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

export type ProductDemoDish = MiseboxProductDemo['workspace']['dishes'][number]

export type DishChildPage = 'detail' | 'finance' | 'spec' | 'prep' | 'recipes'
