// Public model/type exports - curated types for external consumption
export type { AppUser, SubscriptionInfo } from './core/appUser.model'
export type {
  Product,
  FirebaseProduct,
  ProductFeature,
  ProductImage,
  Price,
  DefaultPrice,
  StripePriceInput,
  ProductCreationInput,
  ProductId,
} from './objects/product.model'
export type { BaseObject, WithAuthor, Sluggable } from './objects/protocols'
export type { Profile, ProfileConfig } from './profiles/profile.model'
export type { FirestoreObject } from './objects/object.model'
