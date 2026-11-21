import {
  documentClassifyPrimitive,
  fileStorePrimitive,
  fileUploadAcceptPrimitive,
  fileUploadsAcceptPrimitive,
  fileValidatePrimitive,
  storedFileDeletePrimitive,
} from './files'

export const coreToolPrimitives = [
  fileUploadAcceptPrimitive,
  fileUploadsAcceptPrimitive,
  fileValidatePrimitive,
  documentClassifyPrimitive,
  fileStorePrimitive,
  storedFileDeletePrimitive,
] as const
