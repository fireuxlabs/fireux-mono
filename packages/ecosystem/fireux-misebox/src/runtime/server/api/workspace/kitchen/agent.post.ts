import { defineEventHandler } from 'h3'
import { runKitchenAgent } from '../../../agent/kitchen/run'
import { readKitchenAgentRequest } from '../../../agent/kitchen/request'

export default defineEventHandler(async (event) =>
  runKitchenAgent(event, await readKitchenAgentRequest(event))
)
