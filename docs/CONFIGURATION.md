# Configuration Guide

This guide covers the optional features and their configuration in Morphic.

## Table of Contents

- [Search Providers](#search-providers)
- [Additional AI Providers](#additional-ai-providers)
- [Other Features](#other-features)

## Search Providers

### SearXNG Configuration

SearXNG can be used as an alternative search backend with advanced search capabilities.

#### Basic Setup

1. Set up SearXNG as your search provider:

```bash
SEARCH_API=searxng
SEARXNG_API_URL=http://localhost:8080
SEARXNG_SECRET=""  # generate with: openssl rand -base64 32
```

#### Docker Setup

1. Ensure you have Docker and Docker Compose installed
2. Two configuration files are provided in the root directory:
   - `searxng-settings.yml`: Contains main configuration for SearXNG
   - `searxng-limiter.toml`: Configures rate limiting and bot detection

#### Advanced Configuration

1. Configure environment variables in your `.env.local`:

```bash
# SearXNG Base Configuration
SEARXNG_PORT=8080
SEARXNG_BIND_ADDRESS=0.0.0.0
SEARXNG_IMAGE_PROXY=true

# Search Behavior
SEARXNG_DEFAULT_DEPTH=basic  # Set to 'basic' or 'advanced'
SEARXNG_MAX_RESULTS=50  # Maximum number of results to return
SEARXNG_ENGINES=google,bing,duckduckgo,wikipedia  # Comma-separated list of search engines
SEARXNG_TIME_RANGE=None  # Time range: day, week, month, year, or None
SEARXNG_SAFESEARCH=0  # 0: off, 1: moderate, 2: strict

# Rate Limiting
SEARXNG_LIMITER=false  # Enable to limit requests per IP
```

#### Advanced Search Features

- `SEARXNG_DEFAULT_DEPTH`: Controls search depth
  - `basic`: Standard search
  - `advanced`: Includes content crawling and relevance scoring
- `SEARXNG_MAX_RESULTS`: Maximum results to return
- `SEARXNG_CRAWL_MULTIPLIER`: In advanced mode, determines how many results to crawl
  - Example: If `MAX_RESULTS=10` and `CRAWL_MULTIPLIER=4`, up to 40 results will be crawled

#### Customizing SearXNG

You can modify `searxng-settings.yml` to:

- Enable/disable specific search engines
- Change UI settings
- Adjust server options

Example of disabling specific engines:

```yaml
engines:
  - name: wikidata
    disabled: true
```

For detailed configuration options, refer to the [SearXNG documentation](https://docs.searxng.org/admin/settings/settings.html#settings-yml)

#### Troubleshooting

- If specific search engines aren't working, try disabling them in `searxng-settings.yml`
- For rate limiting issues, adjust settings in `searxng-limiter.toml`
- Check Docker logs for potential configuration errors:

```bash
docker-compose logs searxng
```

## Additional AI Providers

Models are configured in `config/models/*.json` files. Each provider requires its corresponding API key to be set in the environment variables.

### Model Configuration

Model configuration files use the following structure:

```json
{
  "version": 1,
  "models": {
    "types": {
      "speed": {
        "id": "model-id",
        "name": "Model Name",
        "provider": "Provider Name",
        "providerId": "provider-id",
        "providerOptions": {}
      },
      "quality": {
        "id": "model-id",
        "name": "Model Name",
        "provider": "Provider Name",
        "providerId": "provider-id",
        "providerOptions": {}
      }
    },
    "relatedQuestions": {
      "id": "model-id",
      "name": "Model Name",
      "provider": "Provider Name",
      "providerId": "provider-id"
    }
  }
}
```

### Supported Providers

#### OpenAI (Default)

```bash
OPENAI_API_KEY=[YOUR_API_KEY]
```

#### Google Generative AI

```bash
GOOGLE_GENERATIVE_AI_API_KEY=[YOUR_API_KEY]
```

#### Anthropic

```bash
ANTHROPIC_API_KEY=[YOUR_API_KEY]
```

#### Vercel AI Gateway

[Vercel AI Gateway](https://vercel.com/docs/ai-gateway) allows you to use multiple AI providers through a single endpoint with automatic failover and load balancing.

```bash
AI_GATEWAY_API_KEY=[YOUR_AI_GATEWAY_API_KEY]
```

## Other Features

### LLM Observability

Enable tracing and monitoring with Langfuse:

```bash
LANGFUSE_SECRET_KEY=[YOUR_SECRET_KEY]
LANGFUSE_PUBLIC_KEY=[YOUR_PUBLIC_KEY]
LANGFUSE_HOST=https://cloud.langfuse.com
```

### File Upload

Enable file upload with Cloudflare R2:

```bash
CLOUDFLARE_R2_ACCESS_KEY_ID=[YOUR_ACCESS_KEY]
CLOUDFLARE_R2_SECRET_ACCESS_KEY=[YOUR_SECRET_KEY]
CLOUDFLARE_R2_ACCOUNT_ID=[YOUR_ACCOUNT_ID]
CLOUDFLARE_R2_BUCKET_NAME=[YOUR_BUCKET_NAME]
```

### Alternative Fetch Tool

Use Jina for enhanced content extraction:

```bash
JINA_API_KEY=[YOUR_API_KEY]
```
#### Azure OpenAI

Environment variables (choose one of resource name or base URL):

```bash
AZURE_API_KEY=[YOUR_AZURE_API_KEY]

# Option A: resource name only (subdomain, no protocol)
# Example: ujao-ai
AZURE_RESOURCE_NAME=ujao-ai

# Option B: explicit base URL (preferred when behind proxies)
# Include '/openai' suffix
# Example: https://ujao-ai.openai.azure.com/openai
AZURE_BASE_URL=https://ujao-ai.openai.azure.com/openai

# Optional: API version
# - Leave unset or set to 'v1' to use the GA v1 API (no api-version query)
# - Set to a preview version if required, e.g. 2025-04-01-preview
AZURE_API_VERSION=
```

Model profile:

- Set `MORPHIC_MODELS_PROFILE=azure` to use Azure-specific model IDs.
- In Azure, the model ID refers to your deployment name.
- Edit `config/models/azure.json` and replace the `id` fields with your deployment names.
