# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paste2MD is a Next.js 15 application that converts raw text into formatted Markdown. It features both basic text-to-markdown conversion and optional AI-enhanced formatting via local LLM (Ollama).

## Core Architecture

### Text Processing Pipeline
The app uses a dual-mode conversion system:

1. **Basic Conversion** (`lib/markdown-converter.ts`): Pure TypeScript parser that detects patterns in raw text and converts to Markdown
   - Headers: ALL CAPS, title case, introductory lines with colons
   - Lists: bullet points, numbered lists with nested support
   - Tables: Detects tabular data via consistent spacing or pipes
   - Code blocks: Indented text (4 spaces or tabs)
   - URLs: Auto-conversion to `[domain](url)` format

2. **AI Enhancement** (`app/api/enhance/route.ts`): Optional LLM-powered formatting
   - Connects to local Ollama server (default: `http://localhost:11434`)
   - Sends prompts with strict instructions (especially for table preservation)
   - Supports custom user instructions and emoji insertion
   - Configurable model, temperature, top_p, and timeout

### State Management
- Client-side localStorage for persisting input text and LLM configuration
- React hooks for theme management (`hooks/use-custom-theme.ts`, `hooks/use-theme.ts`)
- Toast notifications via custom hook (`hooks/use-toast.ts`)

### API Routes
- `/api/enhance` (POST): Processes text through LLM, (GET): Checks LLM availability
- `/api/llm-config` (if exists): LLM configuration endpoint

### Component Structure
- `app/page.tsx`: Main converter UI with dual-pane (desktop) or tabbed (mobile) layout
- `components/llm-settings.tsx`: LLM configuration dialog
- `components/ui/*`: shadcn/ui components (Button, Card, Dialog, Select, etc.)
- `components/theme-toggle.tsx`: Dark/light mode switcher
- `lib/llm-config.ts`: LLM configuration utilities and defaults

## Development Commands

```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint check
npm run lint
```

Development server runs at `http://localhost:3000`

## Key Implementation Details

### Table Detection Heuristic
The markdown converter uses sophisticated table detection (`lib/markdown-converter.ts:36-86`):
- Detects both pipe-separated (`|`) and whitespace-separated columns
- Compares segment counts across adjacent rows to confirm table structure
- Automatically adds markdown table headers and separators

### LLM Integration
- **Dual Provider Support**: Local (Ollama) and Online (OpenAI)
  - Local default model: `llama3.1:8b` with fallback priority list (see `lib/llm-config.ts:42-55`)
  - OpenAI models: `gpt-4o-mini` (default), `gpt-4o`, `gpt-3.5-turbo`
- LLM config stored in localStorage with key `paste2md-llm-config`
- Models are cached for 5 minutes to reduce API calls
- Timeout default: 30 seconds
- **OpenAI Setup**: Requires `OPENAI_KEY` in `.env.local` (format: `sk-proj-...`)

### Theme System
- Uses `next-themes` for dark/light mode
- Custom theme configuration in `lib/theme-config.ts`
- Theme colors defined in `lib/theme-colors.ts`
- Tailwind configured with custom color system

### Text Persistence
- Input text auto-saved to localStorage with key `paste2md-input`
- Previous sessions automatically restored on mount
- Toast notification shown when restoring saved text

## Testing Approach

No formal test suite exists. Manual testing should cover:
- Text conversion with various input patterns (tables, lists, headers, code)
- AI enhancement with/without emojis and custom instructions
- LLM connectivity with different server URLs and models
- Theme switching
- File upload (drag & drop .txt files)
- Export functionality (copy, download)
- Mobile responsive layout (tabs vs split panes)

## Common Pitfalls

- **Table Preservation**: AI has tendency to convert tables to lists. The prompt in `app/api/enhance/route.ts:28-71` explicitly emphasizes table preservation
- **LLM Timeout**: Default 30s may be insufficient for large texts or slow models
- **Model Availability**: App checks for specific model names but Ollama tag formats vary (e.g., `llama3.1:8b` vs `llama3.1:8b-instruct-q4_0`)
- **localStorage Limits**: Very large texts may exceed browser localStorage quotas
- **OpenAI API Key**: Must be set in `.env.local` as `OPENAI_KEY=sk-proj-...` for OpenAI provider to work. App will show connection error if key is missing or invalid

## Path Aliases

Uses Next.js default: `@/*` maps to project root (configured in `tsconfig.json`)