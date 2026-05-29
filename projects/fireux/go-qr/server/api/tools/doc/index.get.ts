import { defineEventHandler } from 'h3'
import { goQrTool } from '../../../utils/goQrTools'

export default defineEventHandler(() => ({
  ok: true,
  tool: goQrTool('doc'),
}))
