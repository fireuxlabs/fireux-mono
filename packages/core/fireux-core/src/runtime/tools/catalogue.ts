import {
  documentClassifyPrimitive,
  fileStorePrimitive,
  fileUploadAcceptPrimitive,
  fileUploadsAcceptPrimitive,
  fileValidatePrimitive,
  storedFileDeletePrimitive,
} from './files'
import { workspaceTeamMemberCreatePrimitive } from '../workspace/tools/team/create-member'

export const coreToolPrimitives = [
  workspaceTeamMemberCreatePrimitive,
  fileUploadAcceptPrimitive,
  fileUploadsAcceptPrimitive,
  fileValidatePrimitive,
  documentClassifyPrimitive,
  fileStorePrimitive,
  storedFileDeletePrimitive,
] as const
