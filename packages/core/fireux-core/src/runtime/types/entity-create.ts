/** Shared creation presentation mode and command result; domains retain write authority. */
export type FireuxEntityCreateMode = 'root' | 'workspace'

export type FireuxEntityCreateResult = {
  id: string
  createdRoot: boolean
  createdTeamMember: boolean
}
