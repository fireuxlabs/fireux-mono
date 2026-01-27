#!/usr/bin/env node
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const projectId =
  process.env.FIREUX_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  ''

if (!projectId) {
  throw new Error(
    'Missing FIREUX_PROJECT_ID (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).'
  )
}

const resolveCredential = async () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

const getDb = async () => {
  if (!getApps().length) {
    initializeApp({ credential: await resolveCredential(), projectId })
  }
  return getFirestore()
}

const isPlainObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value)

const serialize = (value) => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (Array.isArray(value)) {
    return value.map((entry) => serialize(entry))
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serialize(entry)])
    )
  }
  return value
}

const server = new Server(
  {
    name: 'fireux-mcp-firestore',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_collections',
      description: 'List top-level Firestore collections for the project.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: 'get_document',
      description: 'Get a Firestore document by path.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Document path (e.g. collection/docId).' },
        },
        required: ['path'],
        additionalProperties: false,
      },
    },
    {
      name: 'dump_collection',
      description: 'Dump a collection as JSON (optionally limited).',
      inputSchema: {
        type: 'object',
        properties: {
          collection: { type: 'string', description: 'Collection name or path.' },
          limit: { type: 'integer', description: 'Max documents to return.' },
        },
        required: ['collection'],
        additionalProperties: false,
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const db = await getDb()
  const { name, arguments: args } = request.params

  if (name === 'list_collections') {
    const cols = await db.listCollections()
    const list = cols.map((col) => col.id)
    return {
      content: [{ type: 'text', text: JSON.stringify(list, null, 2) }],
    }
  }

  if (name === 'get_document') {
    const path = String(args?.path || '')
    if (!path) throw new Error('Missing document path.')
    const snap = await db.doc(path).get()
    const data = snap.exists ? serialize(snap.data()) : null
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ id: snap.id, exists: snap.exists, data }, null, 2),
        },
      ],
    }
  }

  if (name === 'dump_collection') {
    const collection = String(args?.collection || '')
    if (!collection) throw new Error('Missing collection name.')
    const limit = args?.limit ? Number(args.limit) : null
    let query = db.collection(collection)
    if (limit && Number.isFinite(limit)) {
      query = query.limit(limit)
    }
    const snap = await query.get()
    const docs = snap.docs.map((doc) => ({
      id: doc.id,
      ...serialize(doc.data()),
    }))
    return {
      content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }],
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
