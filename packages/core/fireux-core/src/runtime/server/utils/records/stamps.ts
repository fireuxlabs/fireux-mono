import { FieldValue } from 'firebase-admin/firestore'

export type ServerAuditStampOptions = {
  by: string
  appId?: string
}

export function serverAuditStamp(options: ServerAuditStampOptions) {
  return {
    at: FieldValue.serverTimestamp(),
    by: options.by,
    ...(options.appId ? { app_id: options.appId } : {}),
  }
}
