import { defineEventHandler } from 'h3'
import { runKitchenAgent } from '../../../../kitchen/server/agent/run'
import { readKitchenAgentRequest } from '../../../../kitchen/server/agent/request'

export default defineEventHandler(async (event) =>
  runKitchenAgent(event, await readKitchenAgentRequest(event))
)
