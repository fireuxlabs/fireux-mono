import type { FireuxStamped } from '../../models/utils/stamps.model.ts'

/** Public identity projection; its id comes from the document path. */
export type User = {
  id: string
  handle: string
  display_name: string
  bio: string
  avatar: string
}

/** Stored identity includes audit stamps but does not store its document id. */
export type UserDocument = Omit<User, 'id'> & FireuxStamped
