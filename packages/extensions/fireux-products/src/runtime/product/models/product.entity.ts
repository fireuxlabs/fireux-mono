import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { ProductStorage } from '../utils/product.ts'

export const ProductEntity = defineFireuxEntity({ kind: 'entity', name: 'Product', family: 'commerce', identity: 'root', authority: 'domain-database', appSupport: 'none', workspace: false, root: ProductStorage.path })
