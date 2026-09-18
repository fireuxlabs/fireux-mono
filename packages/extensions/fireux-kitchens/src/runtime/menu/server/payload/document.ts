import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readKitchenPublicServices } from '../../../kitchen/utils/public-services'
import type {
  MenuDetailPayload,
  MenuDocumentFileKind,
} from '../../models/menu-detail.model'
import {
  compactMenuFile,
  hasMenuFile,
  menuFileKind,
  readMenuDocumentKind,
  readMenuFile,
} from './file'
import { menuPayloadPresentation } from './presentation'
import type { MenuPayloadScope } from './types'
export function buildMenuDocumentPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): MenuDetailPayload {
  const file = readMenuFile(
    data,
    scope.sourceKind === 'kitchen-menu' ? 'doc' : 'file'
  )
  const fileKind = menuFileKind({
    file,
    storedKind: readMenuDocumentKind(data),
  }) as MenuDocumentFileKind
  return {
    kind: 'document',
    document: {
      id: menuId,
      name: readRecordString(data, 'name') || menuId,
      description: readRecordString(data, 'description'),
      ...(scope.kitchenId
        ? {
            services: readKitchenPublicServices(
              scope.kitchen_services,
              scope.kitchenMenuId || ''
            ),
          }
        : {}),
      ...menuPayloadPresentation(data, scope, Boolean(scope.kitchenId)),
      fileKind,
      ...(hasMenuFile(file) ? { file: compactMenuFile(file) } : {}),
    },
  }
}
