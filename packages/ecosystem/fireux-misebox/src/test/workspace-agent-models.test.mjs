import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { readFileSync, existsSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root=fileURLToPath(new URL('../../../../../',import.meta.url))
function load(file,deps,result){const source=readFileSync(file,'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${result}`,Object.keys(deps))(...Object.values(deps))}
test('Ecosystem agent model exports resolve and Misebox lookups retain explicit domain composition',()=>{
 for(const name of ['misebox','granite','buenohost','fireux','bringli']){const base=path.join(root,`packages/ecosystem/fireux-${name}`),require=createRequire(base+'/package.json');assert.equal(require.resolve(`fireux-${name}/runtime/models/workspace-agents`),base+'/src/runtime/models/workspace-agents.ts');assert.equal(existsSync(base+'/src/runtime/ai/workspace-agents.ts'),false)}
 const helpers=load(path.join(root,'packages/extensions/fireux-ai/src/runtime/models/agents/operation-agent.ts'),{},'({advisoryAgentCapabilities,defineFireuxAgentNode,defineFireuxWorkspaceAgent,findFireuxOperationAgent})')
 const menu={operationSlug:'menus',id:'kitchen.menus.ai'}
 const actual=load(new URL('../runtime/models/workspace-agents.ts',import.meta.url),{...helpers,kitchenCapabilityAgents:[menu]},'({miseboxAgent,findMiseboxWorkspaceAgent,findMiseboxOperationAgent})')
 assert.equal(actual.miseboxAgent.id,'misebox.ai');assert.equal(actual.findMiseboxWorkspaceAgent('kitchen').entityTarget.kind,'Kitchen');assert.equal(actual.findMiseboxOperationAgent('kitchen','menus'),menu);assert.equal(actual.findMiseboxWorkspaceAgent('unknown'),undefined)
})
