import type { DummyScenario } from './_shared/types'
import { brothBloomScenario } from './broth-bloom'
import { stackSizzleScenario } from './stack-sizzle'
import { takumiRamenScenario } from './takumi-ramen'

export type ScenarioKey = 'stack-sizzle' | 'takumi-ramen' | 'broth-bloom'

export const scenarioKeys: ScenarioKey[] = ['stack-sizzle', 'takumi-ramen', 'broth-bloom']

export const resolveScenario = (key: ScenarioKey): DummyScenario => {
  if (key === 'broth-bloom') return brothBloomScenario()
  if (key === 'takumi-ramen') return takumiRamenScenario()
  return stackSizzleScenario()
}

export const defaultScenario = (): DummyScenario => stackSizzleScenario()
