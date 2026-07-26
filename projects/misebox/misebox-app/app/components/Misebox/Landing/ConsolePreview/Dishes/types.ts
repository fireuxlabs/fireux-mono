import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

export type ProductDemoDish =
  MiseboxProductDemo['console']['dishes'][number]

export type DishChildPage =
  | 'detail'
  | 'finance'
  | 'spec'
  | 'prep'
  | 'recipes'
  | 'mise'
