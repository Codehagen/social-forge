# Open Lovable Builder Integration

This document describes the integration of Open Lovable (https://github.com/firecrawl/open-lovable) as an in-app website builder for Social Forge.

## Overview

Open Lovable has been integrated as a vendored dependency under the `/builder` route, allowing users to create websites from scratch using AI-powered tools.

## Architecture

### Structure
- `external/open-lovable/` - Git submodule containing the upstream Open Lovable repository
- `app/(builder)/builder/` - Vendored app routes and pages
- `components/lovable/` - Namespaced UI components
- `lib/lovable/` - Namespaced utilities and sandbox providers
- `styles/lovable/` - Namespaced stylesheets
- `public/lovable/` - Static assets
- `lib/publish/` - Publish service for deploying generated sites

### Key Integration Points
- Authentication: Protected by middleware and layout guards
- Navigation: "Create from Scratch" button in dashboard links to `/builder`
- Publishing: Vercel-based deployment (configurable)
- Styling: Integrated with existing Tailwind setup

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Required API Keys
FIRECRAWL_API_KEY=your_firecrawl_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Sandbox Configuration
SANDBOX_PROVIDER=vercel
VERCEL_OIDC_TOKEN=auto_generated_by_vercel_env_pull
# OR for production:
# VERCEL_TOKEN=vercel_xxxxxxxxxxxx
# VERCEL_TEAM_ID=team_xxxxxxxxx
# VERCEL_PROJECT_ID=prj_xxxxxxxxx

# Publish Strategy
PUBLISH_STRATEGY=vercel
```

### 2. Dependencies

Install the required dependencies (some may already be installed):

```bash
npm install @ai-sdk/anthropic @ai-sdk/google @ai-sdk/groq @ai-sdk/openai \
           @anthropic-ai/sdk @e2b/code-interpreter @mendable/firecrawl-js \
           @tailwindcss/typography @vercel/sandbox ai pixi.js \
           react-syntax-highlighter tailwind-gradient-mask-image \
           tailwindcss-animate framer-motion jotai lodash-es nanoid \
           react-icons
```

### 3. Sync Process

The builder code is kept in sync with upstream using a scripted process:

```bash
# Update submodule
git submodule update --remote external/open-lovable

# Run sync script
./sync-lovable.sh

# Update imports if needed
./namespace-imports.sh
```

## Usage

1. **Access Builder**: Click "Create from Scratch" in the dashboard or navigate to `/builder`
2. **Create Website**: Use the AI-powered interface to describe and generate your website
3. **Preview**: Test the generated site in the built-in preview
4. **Publish**: Deploy to Vercel with one click

## Publishing

### Vercel Integration

The default publish strategy deploys generated websites to Vercel:

1. Generated project is packaged
2. Vercel API is called to create a new project
3. Deployment URL is returned to the user

### Configuration

Publishing behavior can be configured via the `PUBLISH_STRATEGY` environment variable:

- `vercel` - Deploy to Vercel (default)
- `zip` - Download ZIP file (not implemented)
- `workspaceSave` - Save to workspace storage (not implemented)

## Maintenance

### Updating from Upstream

To update the builder to the latest version:

```bash
# Update submodule to latest
git submodule update --remote external/open-lovable

# Sync files
./sync-lovable.sh

# Update imports if needed
./namespace-imports.sh

# Test the integration
npm run build
npm run dev
```

### Troubleshooting

**Build Errors**: Ensure all dependencies are installed. Some upstream dependencies may conflict with existing ones.

**Auth Issues**: Verify middleware and layout guards are correctly configured.

**Styling Issues**: Check that Tailwind config includes lovable paths.

**Publishing Issues**: Ensure Vercel tokens and API keys are correctly configured.

## Security Considerations

- Builder routes are protected by authentication middleware
- API keys are server-side only (not exposed to client)
- Sandbox execution is isolated through Vercel/E2B providers
- Generated code is validated before deployment

## Future Enhancements

- Multiple publish strategies (ZIP download, internal hosting)
- Workspace integration for project management
- Template library
- Collaboration features
- Advanced AI model selection
