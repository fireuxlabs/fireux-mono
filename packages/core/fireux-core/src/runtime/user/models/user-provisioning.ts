/** Inputs and result of canonical User provisioning, separate from App membership. */
export type UserProvisioningOptions = {
  displayName?: string
  avatar?: string | null
}

export type UserProvisioningResult = {
  created: boolean
  displayName: string
  handle: string
}
