import { anthropic } from '@ai-sdk/anthropic'
import { createAzure } from '@ai-sdk/azure'
import { createGateway } from '@ai-sdk/gateway'
import { google } from '@ai-sdk/google'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { createProviderRegistry, LanguageModel } from 'ai'

// Azure configuration normalization
const azureResourceEnv = process.env.AZURE_RESOURCE_NAME?.trim()
const azureBaseUrlEnv = process.env.AZURE_BASE_URL?.trim()
const azureApiVersionEnv = process.env.AZURE_API_VERSION?.trim()

// If AZURE_RESOURCE_NAME looks like a full URL, treat it as baseURL and ensure '/openai'
const normalizedAzureBaseURL =
  azureBaseUrlEnv ??
  (azureResourceEnv && /^https?:\/\//.test(azureResourceEnv)
    ? azureResourceEnv.replace(/\/?$/, '').replace(/(\/openai)?$/, '/openai')
    : undefined)

// If only a resource name is provided, derive the base URL
const derivedAzureBaseURL =
  !normalizedAzureBaseURL && azureResourceEnv && !/^https?:\/\//.test(azureResourceEnv)
    ? `https://${azureResourceEnv}.openai.azure.com/openai`
    : undefined

const computedAzureBaseURL = normalizedAzureBaseURL || derivedAzureBaseURL
const computedAzureBaseURLV1 = computedAzureBaseURL
  ? computedAzureBaseURL.replace(/\/?$/, '') + '/v1'
  : undefined

const normalizedAzureResourceName = computedAzureBaseURL
  ? undefined
  : azureResourceEnv

// Use OpenAI client for Azure v1 GA (no api-version) when version is unset or explicitly v1
const azureUseV1 =
  !azureApiVersionEnv ||
  ['v1', 'none', 'skip', 'omit', 'ga'].includes(
    azureApiVersionEnv.toLowerCase()
  )

export const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
  'openai-compatible': createOpenAI({
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
    baseURL: process.env.OPENAI_COMPATIBLE_API_BASE_URL
  }),
  azure:
    azureUseV1
      ? createOpenAI({
          apiKey: process.env.AZURE_API_KEY,
          baseURL: computedAzureBaseURLV1
        })
      : createAzure({
          apiKey: process.env.AZURE_API_KEY,
          resourceName: normalizedAzureResourceName,
          baseURL: computedAzureBaseURL,
          apiVersion: azureApiVersionEnv
        }),
  gateway: createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY
  })
})

export function getModel(model: string): LanguageModel {
  return registry.languageModel(
    model as Parameters<typeof registry.languageModel>[0]
  )
}

export function isProviderEnabled(providerId: string): boolean {
  switch (providerId) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY
    case 'google':
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    case 'openai-compatible':
      return (
        !!process.env.OPENAI_COMPATIBLE_API_KEY &&
        !!process.env.OPENAI_COMPATIBLE_API_BASE_URL
      )
    case 'azure':
      return (
        !!process.env.AZURE_API_KEY &&
        (!!process.env.AZURE_RESOURCE_NAME || !!process.env.AZURE_BASE_URL)
      )
    case 'gateway':
      return !!process.env.AI_GATEWAY_API_KEY
    default:
      return false
  }
}
