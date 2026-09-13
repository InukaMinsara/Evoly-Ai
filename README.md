# EVOLY AI — Robotics Engineering Platform

> Build. Simulate. Debug. Create.

EVOLY AI is a full-stack, AI-powered robotics engineering IDE. It combines an autonomous AI agent with robotics tooling: Arduino and ESP32 programming, Wokwi circuit simulation, wiring diagrams, component catalogs, hardware programming, and live serial telemetry.

---

## Centralized Environment Configuration

All application configuration is managed through a single centralized module: `apps/api/src/config/env.ts`.

```
.env (or apps/api/.env)
         ↓
  env loader (dotenv)
         ↓
  validated config (Zod)
         ↓
      services
         ↓
  providers & tools
```

Private secrets are **strictly server-side only** and are **never exposed to the browser** through `VITE_*` variables, localStorage, client-side bundles, or HTML.

---

## Environment Variable Reference

### 1. Core Application
| Variable | Required | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | String | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | Optional | Number | `3000` | Backend API server port |
| `APP_URL` | Optional | URL | `http://localhost:5173` | Frontend application URL for CORS validation |

### 2. Primary AI — Groq
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `GROQ_API_KEY` | **Required** | API Key | Obtain from [Groq Console](https://console.groq.com/keys) |
| `GROQ_MODEL` | **Required** | String | Default: `llama-3.3-70b-versatile` or `qwen/qwen3.6-27b` |

### 3. Secondary AI — Gemini
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | API Key | Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | Optional | String | Default: `gemini-3.8-flash` |

### 4. Image Generation — NVIDIA NIM
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `NVIDIA_API_KEY` | Optional | API Key | Obtain from [NVIDIA Build Console](https://build.nvidia.com/) |
| `NVIDIA_BASE_URL` | Optional | URL | Default: `https://ai.api.nvidia.com/v1` (or self-hosted e.g. `http://localhost:8000/v1`) |
| `NVIDIA_IMAGE_MODEL` | Optional | String | Default: `qwen-image` |
| `NVIDIA_IMAGE_EDIT_MODEL` | Optional | String | Default: `qwen-image-edit-nvpcb-ovsl2sl` |

### 5. Google OAuth (Shared Credentials)
Shared across Google Search Console, YouTube Data, and YouTube Analytics.
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | Optional | OAuth 2.0 | Created in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Optional | OAuth 2.0 | Created in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_REDIRECT_URI` | Optional | OAuth 2.0 | Callback URL (default: `http://localhost:3000/api/oauth/google/callback`) |

### 6. Google Search & Places
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `GOOGLE_SEARCH_API_KEY` | Optional | API Key | From [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_SEARCH_ENGINE_ID` | Optional | Engine ID | From [Programmable Search Engine](https://programmablesearchengine.google.com/) |
| `GOOGLE_MAPS_API_KEY` | Optional | API Key | From [Google Maps Platform](https://console.cloud.google.com/google/maps-apis) |

### 7. YouTube Data API
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `YOUTUBE_API_KEY` | Optional | API Key | From [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) (YouTube Data v3) |

### 8. GitHub OAuth
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `GITHUB_CLIENT_ID` | Optional | OAuth 2.0 | Register at [GitHub Developer Settings](https://github.com/settings/applications/new) |
| `GITHUB_CLIENT_SECRET` | Optional | OAuth 2.0 | Register at [GitHub Developer Settings](https://github.com/settings/applications/new) |
| `GITHUB_APP_ID` | Optional | App ID | Optional GitHub App ID for granular permissions |
| `GITHUB_PRIVATE_KEY` | Optional | RSA Key | Optional GitHub App private PEM key |

### 9. Database & Cloud Persistence — Supabase
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | Optional* | URL | Project settings at [Supabase Dashboard](https://supabase.com/dashboard) |
| `SUPABASE_ANON_KEY` | Optional* | JWT / Key | Required when `SUPABASE_URL` is set |
| `SUPABASE_SERVICE_ROLE_KEY`| Optional | Secret Key | For administrative backend operations |

*\*Note: When `SUPABASE_URL` is configured, `SUPABASE_ANON_KEY` is required. If omitted, the app operates in local-first storage mode.*

### 10. Simulation & Hardware Bridge
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `WOKWI_CLI_TOKEN` | Optional | Token | From [Wokwi CI Club](https://wokwi.com/dashboard/ci) |
| `HARDWARE_BRIDGE_URL` | Optional | URL | Default: `http://localhost:4242` |
| `HARDWARE_BRIDGE_SECRET` | Optional | Secret | Token for authenticating with local EVOLY Hardware Bridge |

### 11. Optional AI Providers & Observability
| Variable | Required | Auth Type | Source / How to Obtain |
| :--- | :--- | :--- | :--- |
| `OPENAI_API_KEY` | Optional | API Key | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `OPENAI_MODEL` | Optional | String | Default: `gpt-4o` |
| `ANTHROPIC_API_KEY` | Optional | API Key | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_MODEL` | Optional | String | Default: `claude-3-5-sonnet-20241022` |
| `SENTRY_DSN` | Optional | DSN | [Sentry Project Settings](https://sentry.io) |
| `LANGFUSE_PUBLIC_KEY` | Optional | Public Key | [Langfuse](https://langfuse.com) |
| `LANGFUSE_SECRET_KEY` | Optional | Secret Key | [Langfuse](https://langfuse.com) |

---

## Setup Guide

1. Clone or navigate to the project directory:
   ```bash
   cd evoly-ai
   ```

2. Copy the template:
   ```bash
   cp .env.example .env
   # Or for backend-only:
   cp .env.example apps/api/.env
   ```

3. Open `.env` and add your `GROQ_API_KEY`:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

---

## Safe Status Endpoint

The backend provides a safe, read-only endpoint:

```http
GET /api/system/status
```

**Example Response:**
```json
{
  "groq": { "configured": true },
  "gemini": { "configured": false },
  "nvidiaNim": { "configured": true },
  "googleSearch": { "configured": false },
  "places": { "configured": false },
  "googleOAuth": { "configured": true },
  "youtubeApi": { "configured": false },
  "githubOAuth": { "configured": false },
  "wokwi": { "configured": false },
  "hardwareBridge": { "configured": false }
}
```

This endpoint **never exposes credential values**, secrets, or keys.

---

## Testing & Validation

```bash
# Typecheck all packages
npm run typecheck

# Run test suites
npm run test

# Production build
npm run build
```
