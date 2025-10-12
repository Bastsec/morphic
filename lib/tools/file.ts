import { tool } from 'ai'
import { z } from 'zod'

import {
  getR2Client,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL
} from '@/lib/storage/r2-client'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const fileReadSchema = z.object({
  // Either provide a fully-qualified public URL or the R2 object key
  url: z.string().url().optional(),
  key: z.string().optional(),
  // Optional byte limit to avoid huge payloads
  maxBytes: z.number().int().positive().max(10 * 1024 * 1024).default(2 * 1024 * 1024),
  // If true and content is text, return as text; otherwise base64
  preferText: z.boolean().default(true)
})

const fileWriteSchema = z.object({
  // R2 object key to write to. If omitted, a key will be generated under the provided chat/user folder.
  key: z.string().optional(),
  chatId: z.string().min(1),
  userId: z.string().min(1),
  // Either raw base64 data URL or plain text content
  dataUrl: z.string().startsWith('data:').optional(),
  text: z.string().optional(),
  // Required when using text
  mediaType: z.string().min(1).default('text/plain'),
  filename: z.string().optional()
})

function extractKeyFromUrl(url: string): string | null {
  if (!R2_PUBLIC_URL) return null
  const normalized = R2_PUBLIC_URL.replace(/\/$/, '')
  if (url.startsWith(normalized + '/')) {
    return url.substring(normalized.length + 1)
  }
  return null
}

export const fileReadTool = tool({
  description:
    'Read bytes from a user-uploaded file in R2. Prefer this for user attachments instead of fetching external URLs. Accepts a public URL (from chat file parts) or an R2 key. Returns small files as text when possible, else base64.',
  inputSchema: fileReadSchema,
  async execute({ url, key, maxBytes, preferText }) {
    const r2Key = key ?? (url ? extractKeyFromUrl(url) : undefined)
    if (!r2Key) {
      // Fallback: if a non-R2 URL was provided, return it so the model can decide next step
      return {
        state: 'unsupported-url',
        url,
        reason: 'URL is not under configured R2 public base URL.'
      }
    }

    const client = getR2Client()
    const res = await client.send(
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key })
    )

    const contentType = res.ContentType || 'application/octet-stream'
    const contentLength = Number(res.ContentLength || 0)
    const stream = res.Body as any

    const chunks: Uint8Array[] = []
    let received = 0
    for await (const chunk of stream) {
      const c = chunk as Uint8Array
      chunks.push(c)
      received += c.length
      if (received > maxBytes) break
    }
    const buffer = Buffer.concat(chunks)

    const isText = preferText && /^text\//.test(contentType)
    return {
      state: 'ok' as const,
      key: r2Key,
      url: `${R2_PUBLIC_URL.replace(/\/$/, '')}/${r2Key}`,
      size: contentLength,
      mediaType: contentType,
      content: isText
        ? buffer.toString('utf8')
        : `data:${contentType};base64,${buffer.toString('base64')}`
    }
  }
})

export const fileWriteTool = tool({
  description:
    'Write a small file to the user R2 uploads folder. Use to persist generated outputs (notes, summaries). Provide chatId and userId. Accepts dataUrl or plain text.',
  inputSchema: fileWriteSchema,
  async execute({ key, chatId, userId, dataUrl, text, mediaType, filename }) {
    if (!dataUrl && !text) {
      throw new Error('Provide either dataUrl or text')
    }

    const baseFolder = `${userId}/chats/${chatId}`
    const name =
      key ||
      `${baseFolder}/${Date.now()}-${(filename || 'output').replace(/[^a-z0-9.\-_]/gi, '_')}`

    let body: Buffer
    let contentType = mediaType
    if (dataUrl) {
      const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
      if (!match) throw new Error('Invalid dataUrl format')
      contentType = match[1]
      body = Buffer.from(match[2], 'base64')
    } else {
      body = Buffer.from(text!, 'utf8')
    }

    const client = getR2Client()
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: name,
        Body: body,
        ContentType: contentType,
        CacheControl: 'max-age=3600'
      })
    )

    const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${name}`
    return {
      state: 'ok' as const,
      key: name,
      url: publicUrl,
      mediaType: contentType
    }
  }
})

export function createFileTools() {
  return { fileRead: fileReadTool, fileWrite: fileWriteTool }
}

