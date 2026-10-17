import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
const source = readFileSync(new URL('../runtime/pages/menus/index.vue',import.meta.url),'utf8')
async function page(changes={}) {
  let request, retries=0
  const state={collection:ref([]),pending:ref(false),error:ref(null),loadMoreError:ref(null),hasMore:ref(false),loadingMore:ref(false),loadMore:()=>{},refresh:()=>{retries++},...changes}
  const script=source.split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import.*\n/gm,'')
  const deps={ref,definePageMeta:()=>{},useSeo:()=>{},useFireUXConfig:()=>({appName:'Test'}),useMenuDirectory: options=>{request=options;return state}}
  const api=compileFunction(`${stripTypeScriptTypes(script)};return {service,pending,error,refresh,loadMoreError,menus,hasMore,loadingMore,loadMore}`,Object.keys(deps))(...Object.values(deps))
  const app=createSSRApp({setup:()=>api,render:compile(source.slice(10,source.lastIndexOf('</template>')))})
  for(const name of ['UPage','UPageBody']) app.component(name,{setup:(_,ctx)=>()=>h('div',ctx.slots.default?.())})
  app.component('MenuCollectionHeader',{render:()=>null})
  app.component('DiagnosticsDebugPanel',{render:()=>null})
  app.component('CollectionPagination',{render:()=>null})
  app.component('MenuCollectionResults',{props:['hideResults'],setup:(props,ctx)=>()=>h('section',{...ctx.attrs,style:props.hideResults ? {display:'none'} : undefined,'data-results':''},'Loaded menus')})
  for(const name of ['MoleculesStateCard','UAlert']) app.component(name,{props:['title','description'],setup:(props,ctx)=>()=>h('div',[props.title,props.description,ctx.slots.actions?.()])})
  let retry
  app.component('UButton',{props:['label'],setup:(props,ctx)=>{retry=ctx.attrs.onClick;return()=>h('button',props.label)}})
  const html=await renderToString(app)
  return {html,api,request,retry, retries:()=>retries}
}
test('portal uses server online filtering and renders loading separately from empty',async()=>{
  const result=await page({pending:ref(true)})
  assert.equal(result.request.service.value,'online')
  assert.match(result.html,/Loading menus/)
  assert.match(result.html,/display:none/)
  assert.doesNotMatch(result.html,/Menus unavailable/)
  result.api.service.value='delivery'
  assert.equal(result.request.service.value,'delivery')
})
test('failed initial read shows retry and hides result empty state',async()=>{
  const result=await page({error:ref(new Error('Offline'))})
  assert.match(result.html,/Menus unavailable/)
  assert.match(result.html,/Try again/)
  assert.match(result.html,/display:none/)
  result.retry()
  assert.equal(result.retries(),1)
})
test('settled empty read reaches the result owner and later-page read failures show retry',async()=>{
  const empty=await page()
  assert.doesNotMatch(empty.html,/display:none|Menus unavailable|Loading menus/)
  const failed=await page({collection:ref([{id:'food'}]),error:ref(new Error('Offline')),loadMoreError:ref(new Error('Offline'))})
  assert.match(failed.html,/Menus unavailable/)
  assert.match(failed.html,/Try again/)
  assert.match(failed.html,/display:none/)
})

test('result template distinguishes a genuinely empty service from an unmatched search', async()=>{
  const resultSource=readFileSync(new URL('../runtime/menu/components/Collection/Results.vue',import.meta.url),'utf8')
  const template=resultSource.slice(10,resultSource.lastIndexOf('</template>'))
  async function empty(query) {
    const app=createSSRApp({setup:()=>({query,groups:[],visibleItems:[],choices:[],service:'',hideResults:false}),render:compile(template)})
    app.component('UInput',{render:()=>null})
    app.component('UAlert',{props:['title','description'],setup:props=>()=>h('div',props.title+' '+props.description)})
    return renderToString(app)
  }
  assert.match(await empty(''),/No menus available for this service/)
  assert.match(await empty('sushi'),/No matching menus/)
})
