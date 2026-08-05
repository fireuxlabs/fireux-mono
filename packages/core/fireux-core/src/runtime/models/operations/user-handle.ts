// User handle writes stay on the canonical User document.

export type UserHandleCreateInput = {
  display_name: string
  avatar?: string | null
}

export type UserHandleInput = {
  handle: string
  create?: UserHandleCreateInput
}

export type UserHandleResult = {
  uid: string
  handle: string
  created: boolean
  changed: boolean
}
