import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  experimental_generateImage as generateImage,
  UIMessage,
  UIMessageStreamWriter
} from 'ai'
import { randomUUID } from 'crypto'
import { Langfuse } from 'langfuse'

import { researcher } from '@/lib/agents/researcher'
import { getImageModel } from '@/lib/utils/registry'
import { isTracingEnabled } from '@/lib/utils/telemetry'

import { loadChat } from '../actions/chat'
import { generateChatTitle } from '../agents/title-generator'
import {
  getMaxAllowedTokens,
  shouldTruncateMessages,
  truncateMessages
} from '../utils/context-window'
import { getTextFromParts } from '../utils/message-utils'
import { perfLog, perfTime } from '../utils/perf-logging'

import { filterReasoningParts } from './helpers/filter-reasoning-parts'
import { persistStreamResults } from './helpers/persist-stream-results'
import { prepareMessages } from './helpers/prepare-messages'
import { streamRelatedQuestions } from './helpers/stream-related-questions'
import type { StreamContext } from './helpers/types'
import { BaseStreamConfig } from './types'

type ProviderTokenMetadata = {
  responseId?: string
  cachedPromptTokens?: number
  reasoningTokens?: number
}

// Constants
const DEFAULT_CHAT_TITLE = 'Untitled'

export async function createChatStreamResponse(
  config: BaseStreamConfig
): Promise<Response> {
  const {
    message,
    model,
    chatId,
    userId,
    trigger,
    messageId,
    abortSignal,
    isNewChat,
    searchMode
  } = config

  // Verify that chatId is provided
  if (!chatId) {
    return new Response('Chat ID is required', {
      status: 400,
      statusText: 'Bad Request'
    })
  }

  // Skip loading chat for new chats optimization
  let initialChat = null
  if (!isNewChat) {
    const loadChatStart = performance.now()
    // Fetch chat data for authorization check and cache it
    initialChat = await loadChat(chatId, userId)
    perfTime('loadChat completed', loadChatStart)

    // Authorization check: if chat exists, it must belong to the user
    if (initialChat && initialChat.userId !== userId) {
      return new Response('You are not allowed to access this chat', {
        status: 403,
        statusText: 'Forbidden'
      })
    }
  } else {
    perfLog('loadChat skipped for new chat')
  }

  // Create parent trace ID for grouping all operations
  let parentTraceId: string | undefined
  let langfuse: Langfuse | undefined

  if (isTracingEnabled()) {
    parentTraceId = randomUUID()
    langfuse = new Langfuse()

    // Create parent trace with name "research"
    langfuse.trace({
      id: parentTraceId,
      name: 'research',
      metadata: {
        chatId,
        userId,
        modelId: `${model.providerId}:${model.id}`,
        trigger
      }
    })
  }

  // Create stream context with trace ID
  const context: StreamContext = {
    chatId,
    userId,
    modelId: `${model.providerId}:${model.id}`,
    messageId,
    trigger,
    initialChat,
    abortSignal,
    parentTraceId, // Add parent trace ID to context
    isNewChat
  }

  // Declare titlePromise in outer scope for onFinish access
  let titlePromise: Promise<string> | undefined
  // Capture provider metadata (e.g., reasoning tokens) to attach on finish
  const defaultProviderMetadataKey =
    model.providerId === 'azure' ? 'azure' : 'openai'
  let providerTokenMetadata:
    | { providerKey: string; data: ProviderTokenMetadata }
    | undefined

  // Create the stream
  const stream = createUIMessageStream<UIMessage>({
    execute: async ({ writer }: { writer: UIMessageStreamWriter }) => {
      try {
        // Prepare messages for the model
        const prepareStart = performance.now()
        perfLog(
          `prepareMessages - Invoked: trigger=${trigger}, isNewChat=${isNewChat}`
        )
        const messagesToModel = await prepareMessages(context, message)
        perfTime('prepareMessages completed (stream)', prepareStart)

        // If the selected model is an image generation model, handle directly
        const isImageMode = model.id === 'gpt-image-1'
        if (isImageMode) {
          try {
            // Determine the prompt using the last user message
            const lastUser = [...messagesToModel]
              .reverse()
              .find(m => m.role === 'user')
            const prompt = lastUser ? getTextFromParts(lastUser.parts) : ''

            if (!prompt || prompt.trim().length === 0) {
              writer.write({
                type: 'text',
                text: 'Please provide a prompt to generate an image.'
              })
              return
            }

            // Start title generation in parallel for new chats
            if (!initialChat && message) {
              const userContent = getTextFromParts(message.parts)
              titlePromise = generateChatTitle({
                userMessageContent: userContent,
                modelId: context.modelId,
                abortSignal,
                parentTraceId
              }).catch(error => {
                console.error('Error generating title:', error)
                return DEFAULT_CHAT_TITLE
              })
            }

            const imgStart = performance.now()
            perfLog(
              `generateImage - Start: model=${context.modelId}, size=1024x1024`
            )
            const result = await generateImage({
              model: getImageModel(context.modelId),
              prompt,
              size: '1024x1024',
              // quality: 'standard', // optional
              abortSignal
            })

            const dataUrl = await result.toDataURL()

            // Stream the assistant image as a file part so it persists and renders in chat
            writer.write({
              type: 'file',
              mediaType: 'image/png',
              filename: 'image.png',
              url: dataUrl
            })

            perfTime('generateImage completed', imgStart)
            return
          } catch (err) {
            console.error('Image generation error:', err)
            writer.write({
              type: 'text',
              text: 'Failed to generate image. Please try again.'
            })
            return
          }
        }

        // Get the researcher agent with parent trace ID and search mode
        const researchAgent = researcher({
          model: context.modelId,
          modelConfig: model,
          abortSignal,
          writer,
          parentTraceId,
          searchMode
        })

        // Filter out reasoning parts from messages before converting to model messages
        // OpenAI API requires reasoning messages to be followed by assistant messages
        const filteredMessages = filterReasoningParts(messagesToModel)

        // Convert to model messages and apply context window management
        let modelMessages = convertToModelMessages(filteredMessages)

        if (shouldTruncateMessages(modelMessages, model)) {
          const maxTokens = getMaxAllowedTokens(model)
          const originalCount = modelMessages.length
          modelMessages = truncateMessages(modelMessages, maxTokens, model.id)

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `Context window limit reached. Truncating from ${originalCount} to ${modelMessages.length} messages`
            )
          }
        }

        // Start title generation in parallel if it's a new chat
        if (!initialChat && message) {
          const userContent = getTextFromParts(message.parts)
          titlePromise = generateChatTitle({
            userMessageContent: userContent,
            modelId: context.modelId,
            abortSignal,
            parentTraceId
          }).catch(error => {
            console.error('Error generating title:', error)
            return DEFAULT_CHAT_TITLE
          })
        }

        const llmStart = performance.now()
        perfLog(
          `researchAgent.stream - Start: model=${context.modelId}, searchMode=${searchMode}`
        )
        const result = researchAgent.stream({ messages: modelMessages })
        result.consumeStream()
        // Stream with the research agent, including metadata
        writer.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              // Send metadata when streaming starts
              if (part.type === 'start') {
                return {
                  traceId: parentTraceId,
                  searchMode,
                  modelId: context.modelId
                }
              }
            }
          })
        )

        const responseObj: any = await result.response
        const [usage, providerMetadataFromStream] = await Promise.all([
          result.usage.catch(() => undefined),
          result.providerMetadata.catch(() => undefined)
        ])
        const responseMessages = responseObj.messages

        const providerMetadata =
          providerMetadataFromStream ?? responseObj?.providerMetadata

        let providerKey = defaultProviderMetadataKey
        let providerSpecificMetadata: any

        if (providerMetadata && typeof providerMetadata === 'object') {
          if (providerMetadata.openai) {
            providerKey = 'openai'
            providerSpecificMetadata = providerMetadata.openai
          } else if (providerMetadata.azure) {
            providerKey = 'azure'
            providerSpecificMetadata = providerMetadata.azure
          } else if (providerMetadata[defaultProviderMetadataKey]) {
            providerSpecificMetadata =
              providerMetadata[defaultProviderMetadataKey]
          } else {
            const providerKeys = Object.keys(providerMetadata)
            if (providerKeys.length > 0) {
              providerKey = providerKeys[0]
              providerSpecificMetadata = providerMetadata[providerKey]
            }
          }
        }

        let combinedMetadata: ProviderTokenMetadata | undefined =
          providerTokenMetadata?.providerKey === providerKey
            ? { ...providerTokenMetadata.data }
            : undefined

        if (
          providerSpecificMetadata &&
          typeof providerSpecificMetadata === 'object'
        ) {
          const extracted: ProviderTokenMetadata = {
            responseId:
              providerSpecificMetadata.responseId ??
              providerSpecificMetadata.response_id ??
              providerSpecificMetadata.id,
            cachedPromptTokens:
              providerSpecificMetadata.cachedPromptTokens ??
              providerSpecificMetadata.cached_prompt_tokens,
            reasoningTokens:
              providerSpecificMetadata.reasoningTokens ??
              providerSpecificMetadata.reasoning_tokens
          }

          if (
            Object.values(extracted).some(
              value => value !== undefined && value !== null
            )
          ) {
            combinedMetadata = {
              ...(combinedMetadata ?? {}),
              ...extracted
            }
          }
        }

        if (usage && usage.reasoningTokens !== undefined) {
          combinedMetadata = {
            ...(combinedMetadata ?? {}),
            reasoningTokens: usage.reasoningTokens
          }
        }

        if (
          combinedMetadata &&
          Object.values(combinedMetadata).some(
            value => value !== undefined && value !== null
          )
        ) {
          providerTokenMetadata = {
            providerKey,
            data: combinedMetadata
          }
        }
        perfTime('researchAgent.stream completed', llmStart)
        // Generate related questions (skip for image mode)
        if (!isImageMode && responseMessages && responseMessages.length > 0) {
          // Find the last user message
          const lastUserMessage = [...modelMessages]
            .reverse()
            .find(msg => msg.role === 'user')
          const messagesForQuestions = lastUserMessage
            ? [lastUserMessage, ...responseMessages]
            : responseMessages

          await streamRelatedQuestions(
            writer,
            messagesForQuestions,
            abortSignal,
            parentTraceId
          )
        }
      } catch (error) {
        console.error('Stream execution error:', error)
        throw error // This error will be handled by the onError callback
      } finally {
        // Flush Langfuse traces if enabled
        if (langfuse) {
          await langfuse.flushAsync()
        }
      }
    },
    onError: (error: any) => {
      // console.error('Stream error:', error)
      return error instanceof Error ? error.message : String(error)
    },
    onFinish: async ({ responseMessage, isAborted }) => {
      if (isAborted || !responseMessage) return

      // Attach provider token metadata (thinking/reasoning tokens) to the UI message
      if (providerTokenMetadata) {
        const existingMetadata: any = (responseMessage.metadata ?? {}) as any
        const { providerKey, data } = providerTokenMetadata
        const updatedProviderMetadata = {
          ...(existingMetadata.provider ?? {}),
          [providerKey]: {
            ...(existingMetadata.provider?.[providerKey] ?? {}),
            ...data
          }
        }

        responseMessage.metadata = {
          ...existingMetadata,
          thinkingTokens:
            data.reasoningTokens ?? existingMetadata?.thinkingTokens,
          provider: updatedProviderMetadata
        }
      }

      // Persist stream results to database
      await persistStreamResults(
        responseMessage,
        chatId,
        userId,
        titlePromise,
        parentTraceId,
        searchMode,
        context.modelId,
        context.pendingInitialSave,
        context.pendingInitialUserMessage
      )
    }
  })

  return createUIMessageStreamResponse({
    stream,
    consumeSseStream: consumeStream
  })
}
