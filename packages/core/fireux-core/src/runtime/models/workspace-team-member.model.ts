/** A roster entry. Document identity and workspace access are separate. */
export type WorkspaceTeamMemberRecord = {
  name: string
  user_id: string
  role_ids: string[]
}

/** A fetched roster entry includes its document id. */
export type WorkspaceTeamMemberDocument = WorkspaceTeamMemberRecord & { id: string }
