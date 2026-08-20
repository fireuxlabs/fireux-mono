export { kitchenMisePrepTaskCreateTool } from './create-prep-task'
export { kitchenMisePrepTaskUpdateTool } from './update-prep-task'
export { kitchenMisePrepStatusChangeTool } from './change-prep-status'
export { kitchenMisePrepTaskDeleteTool } from './delete-prep-task'

import { kitchenMisePrepTaskCreateTool } from './create-prep-task'
import { kitchenMisePrepTaskUpdateTool } from './update-prep-task'
import { kitchenMisePrepStatusChangeTool } from './change-prep-status'
import { kitchenMisePrepTaskDeleteTool } from './delete-prep-task'

export const kitchenMiseHumanTools = [
  kitchenMisePrepTaskCreateTool,
  kitchenMisePrepTaskUpdateTool,
  kitchenMisePrepStatusChangeTool,
  kitchenMisePrepTaskDeleteTool,
] as const
