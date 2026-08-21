import {
  documentClassifyPrimitive,
  fileStorePrimitive,
  fileUploadAcceptPrimitive,
  fileUploadsAcceptPrimitive,
  fileValidatePrimitive,
  storedFileDeletePrimitive,
} from './files'
import { workspaceTeamMemberCreatePrimitive } from './workspace/team/create-member'

export const coreToolPrimitives = [
  workspaceTeamMemberCreatePrimitive,
  fileUploadAcceptPrimitive,
  fileUploadsAcceptPrimitive,
  fileValidatePrimitive,
  documentClassifyPrimitive,
  fileStorePrimitive,
  storedFileDeletePrimitive,
] as const
