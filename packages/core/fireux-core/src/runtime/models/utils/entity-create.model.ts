export type FireuxEntityCreateMode = 'root' | 'workspace'

export type FireuxEntityCreateResult = {
  id: string
  createdRoot: boolean
  createdTeamMember: boolean
}

export type FireuxRootCreateResult = {
  id: string
  created: boolean
}
