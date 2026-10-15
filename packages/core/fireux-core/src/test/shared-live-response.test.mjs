import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

test('identical live reads share transport and last disposal closes it', async () => {
  let requests = 0,
    reads,
    server,
    transportSignal
  const source = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/composables/fireux/firestore/sharedLiveResponse.ts',
        import.meta.url
      ),
      'utf8'
    )
  ).replace(/^export /gm, '')
  const open = compileFunction(`${source}; return sharedLiveResponse`, [
    'fetch',
  ])(async (url, options) => {
    assert.equal(url, '/api/fireux/live')
    requests++
    reads = JSON.parse(options.body).reads
    transportSignal = options.signal
    return new Response(
      new ReadableStream({
        start(controller) {
          server = controller
          options.signal.addEventListener('abort', () =>
            controller.error(new Error('closed'))
          )
        },
      }),
      { headers: { 'content-type': 'text/event-stream' } }
    )
  })
  const a = new AbortController(),
    b = new AbortController(),
    headers = new Headers({ accept: 'text/event-stream' })
  const first = await open(new URL('http://localhost/api/users'), {
    headers,
    signal: a.signal,
  })
  const second = await open(new URL('http://localhost/api/users'), {
    headers,
    signal: b.signal,
  })
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal(requests, 1)
  const r1 = first.body.getReader(),
    r2 = second.body.getReader()
  server.enqueue(
    new TextEncoder().encode(
      `data: ${JSON.stringify({ id: reads[0].id, data: '[]' })}\n\n`
    )
  )
  assert.equal(
    new TextDecoder().decode((await r1.read()).value),
    'data: []\n\n'
  )
  assert.equal(
    new TextDecoder().decode((await r2.read()).value),
    'data: []\n\n'
  )
  a.abort()
  assert.equal(transportSignal.aborted, false)
  server.enqueue(
    new TextEncoder().encode(
      `data: ${JSON.stringify({ id: reads[0].id, data: '[1]' })}\n\n`
    )
  )
  assert.equal(
    new TextDecoder().decode((await r2.read()).value),
    'data: [1]\n\n'
  )
  b.abort()
  assert.equal(transportSignal.aborted, true)
})

test('distinct projections use one connection and retain independent event delivery', async () => {
  const source = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/composables/fireux/firestore/sharedLiveResponse.ts',
        import.meta.url
      ),
      'utf8'
    )
  ).replace(/^export /gm, '')
  const requests = []
  const open = compileFunction(`${source}; return sharedLiveResponse`, [
    'fetch',
  ])(async (url, options) => {
    assert.equal(url, 'https://stream.example/api/fireux/live')
    const request = {
      signal: options.signal,
      reads: JSON.parse(options.body).reads,
    }
    requests.push(request)
    return new Response(
      new ReadableStream({
        start(controller) {
          request.controller = controller
          options.signal.addEventListener('abort', () =>
            controller.error(new Error('closed'))
          )
        },
      }),
      { headers: { 'content-type': 'text/event-stream' } }
    )
  })
  const consumers = await Promise.all(
    Array.from({ length: 20 }, async (_, i) => {
      const abort = new AbortController()
      const response = await open(
        new URL(`http://localhost/api/records/${i}`),
        {
          endpoint: 'https://stream.example/api/fireux/live',
          headers: new Headers({ authorization: 'Bearer test' }),
          signal: abort.signal,
        }
      )
      return { abort, reader: response.body.getReader() }
    })
  )
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal(
    requests.length,
    1,
    'twenty distinct projections occupy one HTTP connection'
  )
  assert.equal(requests[0].reads.length, 20)
  for (let i = 0; i < 20; i++) {
    const read = requests[0].reads[i]
    assert.equal(read.headers.authorization, 'Bearer test')
    requests[0].controller.enqueue(
      new TextEncoder().encode(
        `data: ${JSON.stringify({ id: read.id, data: String(i) })}\n\n`
      )
    )
  }
  for (let i = 0; i < 20; i++)
    assert.equal(
      new TextDecoder().decode((await consumers[i].reader.read()).value),
      `data: ${i}\n\n`
    )
  consumers[0].abort.abort()
  assert.equal(
    requests[0].signal.aborted,
    true,
    'replacement closes the old connection first'
  )
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal(requests.length, 2)
  assert.equal(requests[1].reads.length, 19)
  consumers.slice(1).forEach(({ abort }) => abort.abort())
  assert.equal(requests[1].signal.aborted, true)
})

test('order capabilities remain separate while identical authority shares a projection', async () => {
  const source = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/composables/fireux/firestore/sharedLiveResponse.ts',
        import.meta.url
      ),
      'utf8'
    )
  ).replace(/^export /gm, '')
  let reads, server
  const open = compileFunction(`${source}; return sharedLiveResponse`, [
    'fetch',
  ])(async (_url, options) => {
    reads = JSON.parse(options.body).reads
    return new Response(
      new ReadableStream({
        start(controller) {
          server = controller
          options.signal.addEventListener('abort', () =>
            controller.error(new Error('closed'))
          )
        },
      }),
      { headers: { 'content-type': 'text/event-stream' } }
    )
  })
  const capabilityA = 'a'.repeat(43)
  const capabilityB = 'b'.repeat(43)
  const consumers = await Promise.all(
    [capabilityA, capabilityA, capabilityB].map(async (capability, index) => {
      const abort = new AbortController()
      const response = await open(
        new URL('http://localhost/api/menus/menu/orders/order'),
        {
          headers: new Headers({
            'x-fireux-order-capability': capability,
            'x-untrusted-header': String(index),
          }),
          signal: abort.signal,
        }
      )
      return { abort, reader: response.body.getReader() }
    })
  )
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal(
    reads.length,
    2,
    'different capabilities cannot share a projection'
  )
  assert.notEqual(reads[0].id, reads[1].id)
  assert.deepEqual(
    reads.map(({ headers }) => headers),
    [capabilityA, capabilityB].map((capability) => ({
      authorization: '',
      'x-fireux-order-capability': capability,
    }))
  )
  for (const [index, read] of reads.entries())
    server.enqueue(
      new TextEncoder().encode(
        `data: ${JSON.stringify({ id: read.id, data: String(index) })}\n\n`
      )
    )
  for (const [index, consumer] of consumers.entries())
    assert.equal(
      new TextDecoder().decode((await consumer.reader.read()).value),
      `data: ${index === 2 ? 1 : 0}\n\n`
    )
  consumers.forEach(({ abort }) => abort.abort())
})

test('background pages release live HTTP slots, load a snapshot and reconnect on return', async () => {
  const listeners = new Map()
  const document = {visibilityState:'hidden',addEventListener:(event,fn)=>listeners.set(event,fn),removeEventListener:event=>listeners.delete(event)}
  let streams = 0, snapshotReads = 0, streamSignal
  const source = stripTypeScriptTypes(readFileSync(new URL('../runtime/composables/fireux/firestore/sharedLiveResponse.ts',import.meta.url),'utf8')).replace(/^export /gm,'')
  const open = compileFunction(`${source}; return sharedLiveResponse`,['fetch','document'])(async (url, options) => {
    if (options.method !== 'POST') { snapshotReads++; return Response.json({name:'Menu'}) }
    streams++; streamSignal=options.signal
    const id=JSON.parse(options.body).reads[0].id
    return new Response(new ReadableStream({start(controller){
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({id,data:JSON.stringify({name:'Updated menu'})})}\n\n`))
      options.signal.addEventListener('abort',()=>controller.error(new Error('closed')))
    }}),{headers:{'content-type':'text/event-stream'}})
  }, document)
  const abort=new AbortController()
  const response=await open(new URL('http://localhost/api/menus/food'),{headers:new Headers(),signal:abort.signal})
  const reader=response.body.getReader(), decoder=new TextDecoder()
  assert.match(decoder.decode((await reader.read()).value),/Menu/)
  assert.equal(snapshotReads,1); assert.equal(streams,0)
  document.visibilityState='visible'; listeners.get('visibilitychange')()
  assert.match(decoder.decode((await reader.read()).value),/Updated menu/)
  assert.equal(streams,1)
  document.visibilityState='hidden'; listeners.get('visibilitychange')()
  assert.equal(streamSignal.aborted,true)
  assert.equal(snapshotReads,1)
  abort.abort(); assert.equal(listeners.size,0)
})

test('plain HTTP shares scoped snapshots, refreshes without streaming and disposes timers', async () => {
  let requests=0, value='ready', sequence=0
  const timers=new Map()
  const source=stripTypeScriptTypes(readFileSync(new URL('../runtime/composables/fireux/firestore/sharedLiveResponse.ts',import.meta.url),'utf8')).replace(/^export /gm,'')
  const open=compileFunction(`${source}; return sharedLiveResponse`,['fetch','window','setTimeout','clearTimeout'])(async (url,options)=>{
    assert.equal(url,'/api/menu')
    assert.equal(options.method,undefined)
    requests++
    return Response.json({state:value})
  },{location:{protocol:'http:'}},(callback,delay)=>{const id=++sequence;timers.set(id,{callback,delay});return id},id=>timers.delete(id))
  const owner=new AbortController(), other=new AbortController()
  const response=await open(new URL('http://localhost/api/menu'),{headers:new Headers(),signal:owner.signal})
  const duplicate=await open(new URL('http://localhost/api/menu'),{headers:new Headers(),signal:other.signal})
  const reader=response.body.getReader(), second=duplicate.body.getReader(), decoder=new TextDecoder()
  assert.match(decoder.decode((await reader.read()).value),/ready/)
  assert.match(decoder.decode((await second.read()).value),/ready/)
  assert.equal(requests,1)
  value='updated'
  const [id,timer]=[...timers].find(([,timer])=>timer.delay===4000)
  timers.delete(id);timer.callback()
  assert.match(decoder.decode((await reader.read()).value),/updated/)
  assert.equal(requests,2)
  owner.abort();other.abort()
  assert.equal(timers.size,0)
})
