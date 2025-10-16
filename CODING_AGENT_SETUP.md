# AI Coding Agent Setup Guide

## 🚀 Quick Setup

### 1. Generate JWE Secret (Already Done)
✅ **Completed**: JWE secret has been generated and added to your `.env.local`

### 2. Set Up GitHub OAuth App

**Create a GitHub OAuth App:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Social Forge AI Builder
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

**Update your `.env.local`:**
```bash
# Replace the placeholder values
NEXT_PUBLIC_GITHUB_CLIENT_ID="your_actual_github_client_id"
GITHUB_CLIENT_SECRET="your_actual_github_client_secret"
```

### 3. Get AI API Keys

You already have **OpenAI** set up. For the coding agent, you need at least one AI provider. Here are the options:

#### Anthropic (Claude) - Recommended
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env.local`:
```bash
ANTHROPIC_API_KEY="your_anthropic_api_key"
```

#### Google Gemini (Alternative)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env.local`:
```bash
GEMINI_API_KEY="your_gemini_api_key"
```

### 4. Restart Your Development Server

After updating the environment variables:

```bash
# Kill any existing servers
pkill -f "next dev"

# Start fresh
pnpm dev
```

## 🔐 Authentication Flow

The AI Coding Agent uses **separate authentication** from Social Forge:

1. **Social Forge Auth**: Uses Better Auth (Google login)
2. **Coding Agent Auth**: Uses GitHub OAuth

When you visit `/builder`, you'll need to:
1. Click "Connect GitHub" to authenticate with GitHub
2. Grant permissions for repository access
3. Then you can use the AI coding features

## ✅ Test the Setup

1. Visit `http://localhost:3000/builder`
2. You should see a "Connect GitHub" button
3. Click it and complete GitHub OAuth
4. You should then have access to the AI coding interface

## 🛠 Troubleshooting

### Still Getting 401 Errors?
- Make sure you've completed GitHub OAuth authentication
- Check that your GitHub OAuth app is properly configured
- Verify the callback URL matches exactly

### API Keys Not Working?
- Double-check your API keys are correctly copied
- Make sure you have credits/billing set up with your AI provider
- Test with a simple curl command to verify keys work

### Session Issues?
- Clear your browser cookies for localhost:3000
- Try a fresh browser session
- Check browser console for any JWE/session errors

## 📋 Required Environment Variables Summary

```env
# Already configured ✅
JWE_SECRET="fWA3j5vhLAR56Zmzq+n6aPUd806S+l2yDPpFauwZy9E="
OPENAI_API_KEY="sk-proj-..."  # Already set

# You need to configure these:
NEXT_PUBLIC_GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
ANTHROPIC_API_KEY="your_anthropic_api_key"  # Recommended
# OR
GEMINI_API_KEY="your_gemini_api_key"        # Alternative
```

The setup is almost complete - you just need to configure GitHub OAuth and get an AI API key!
