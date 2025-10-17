<a href="https://github.com/Codehagen/social-forge">
  <h1 align="center">Social Forge</h1>
</a>

<p align="center">
  Transform any website into a modern masterpiece in minutes, no coding expertise required.
</p>

<p align="center">
  <a href="https://github.com/Codehagen/social-forge/blob/main/LICENSE.md">
    <img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License: AGPL-3.0" />
  </a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>
<br/>

## Introduction

**Social Forge** is an AI-powered website builder that makes professional web development accessible to everyone. Whether you're redesigning an outdated website or creating a brand new one from scratch, Social Forge guides you through an intuitive process with smart questions and guardrails—so you get stunning results without needing to be a prompt engineering expert.

### Who is Social Forge For?

**Individual Entrepreneurs & Small Business Owners**
Need a website fast but don't know how to code or write effective AI prompts? Social Forge gets you online quickly with professional results.

**Web Design Agencies**
Scale your business by delivering more websites in less time. Use Social Forge as your secret weapon to serve multiple clients efficiently while maintaining high quality standards.

**Freelancers**
Increase your project capacity and profits by leveraging AI-assisted development with the reliability of guided workflows.

## Features

### 🔄 Website Transformation
Enter any URL of an existing website, and Social Forge will analyze and recreate it as a modern, responsive React application with improved design and functionality.

### ✨ Guided Creation
Start from scratch by answering simple questions about your vision. Our AI asks the right questions to understand your needs—colors, layout preferences, content structure—and builds your website accordingly.

### 🎯 Built-in Guardrails
Unlike raw AI tools that require perfect prompts, Social Forge provides structure and guidance throughout the process, ensuring quality results even for non-technical users.

### 🏢 Multi-Client Management
Perfect for agencies: manage multiple client websites from a single dashboard, streamline your workflow, and deliver professional sites faster than ever. Built-in workspace system with role-based access control (Owner, Admin, Member, Viewer).

## Why Social Forge?

- **Speed**: Build complete websites in minutes, not weeks
- **Quality**: Professional, modern designs powered by AI
- **Simplicity**: No coding knowledge or prompt engineering skills required
- **Scalability**: Manage unlimited projects and clients from one platform
- **Agency-Ready**: Built-in features for businesses selling websites to other businesses

## AI Coding Agent

Social Forge includes a **comprehensive AI coding agent** that enables users to generate, modify, and manage code through natural language instructions. The system integrates multiple AI providers and provides a complete development workflow from prompt to deployable code.

### Coding Agent Features

- **🤖 Multi-Provider AI Support**: Seamlessly switch between Claude, OpenAI (GPT-4), and Gemini based on your needs
- **⚡ Live Code Generation**: Real-time progress tracking with detailed logging and status updates
- **🔐 Secure GitHub Integration**: OAuth-based authentication ensuring safe repository access
- **📋 Comprehensive Task Management**: Create, monitor, and organize coding tasks with full lifecycle tracking
- **💻 Professional Code Output**: Clean, well-documented, and immediately usable code with syntax highlighting
- **🔄 Interactive Development**: Live updates and progress indicators throughout the coding process
- **🛠️ Advanced Configuration**: Customizable agent settings, model selection, and development parameters
- **📊 Usage Analytics**: Track performance, costs, and productivity metrics across all coding tasks

### Using the Coding Agent

1. **Access the Builder**: Navigate to the dedicated coding interface in your application
2. **Connect Repositories**: Authenticate with GitHub OAuth for secure repository access
3. **Define Requirements**: Write clear, natural language descriptions of your coding needs
4. **Select AI Provider**: Choose the most suitable AI model for your specific use case
5. **Configure Options**: Set parameters like dependency installation, sandbox duration, and output preferences
6. **Execute & Monitor**: Watch real-time progress with detailed logs and status updates
7. **Review & Deploy**: Receive production-ready code that can be immediately integrated

### Coding Agent Architecture

The coding agent implements a robust, scalable architecture designed for enterprise-grade AI-assisted development:

- **Database Layer**: Dedicated schema for users, coding tasks, API keys, and session management
- **Authentication System**: Multi-layered security with JWE encryption and OAuth provider integration
- **API Infrastructure**: RESTful endpoints supporting real-time task management and streaming updates
- **UI Framework**: Intuitive components for task creation, progress monitoring, and code review
- **Agent Orchestration**: Intelligent routing between AI providers with fallback mechanisms
- **Sandbox Environment**: Isolated execution environments with comprehensive error handling
- **Integration Layer**: Seamless connection with version control systems and deployment platforms

### Environment Variables

Add these to your `.env.local` for coding agent functionality:

```env
# GitHub OAuth (required)
NEXT_PUBLIC_GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# AI API Keys (at least one required)
ANTHROPIC_API_KEY="your_anthropic_api_key"      # For Claude
OPENAI_API_KEY="your_openai_api_key"            # For OpenAI/GPT
GEMINI_API_KEY="your_gemini_api_key"            # For Gemini

# Security (generate securely)
JWE_SECRET="generate_with_openssl_rand_base64_32"
```

## Tech Stack

### Frameworks

- [Next.js 15](https://nextjs.org/) – React framework with App Router for optimal performance
- [Better-auth](https://better-auth.com/) – Modern authentication with OAuth providers (Google, GitHub)
- [Prisma](https://www.prisma.io/) – Type-safe ORM with PostgreSQL
- [TypeScript](https://www.typescriptlang.org/) – End-to-end type safety

### Platforms

- [Vercel](https://vercel.com/) – Seamless deployment and preview environments
- [Neon](https://neon.tech/) / [Supabase](https://supabase.com/) – Serverless PostgreSQL options

### UI & Design

- [Shadcn/ui](https://ui.shadcn.com/) – Beautiful components built on Radix UI and Tailwind CSS
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS for rapid development
- [Lucide Icons](https://lucide.dev/) – Consistent, beautiful icons
- [next-themes](https://github.com/pacocoursey/next-themes) – Dark mode support

### Core Features

- **Multi-tenant Workspace System** - Role-based access control for agencies
- **Authentication Layer** - Secure OAuth integration with Google and GitHub
- **Modern UI/UX** - Responsive design with shadcn/ui components
- **Type Safety** - Full TypeScript implementation
- **Database Management** - Prisma ORM with PostgreSQL

## Installation

Clone the repository:

```bash
git clone https://github.com/Codehagen/social-forge
cd social-forge
```

1. Install dependencies using pnpm:

```bash
pnpm install
```

2. Copy `.env.example` to `.env.local` and update the variables:

```bash
cp .env.example .env.local
```

3. Set up your environment variables:

   The `.env.example` file contains detailed explanations for each variable. Key requirements:

   **Database**: Configure PostgreSQL connection
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

   **Authentication**: Configure Better-auth
   ```
   BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Google OAuth** (Optional):
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   To use Google as a social provider, create a new project in the [Google Cloud Console](https://console.cloud.google.com/).

   In **Google Cloud Console > Credentials > Authorized redirect URIs**, set:
   - **Local development**: `http://localhost:3000/api/auth/callback/google`
   - **Production**: `https://yourdomain.com/api/auth/callback/google`

4. Generate Prisma client and push database schema:

```bash
pnpm prisma:generate
pnpm prisma:push
```

5. Start the development server:

```bash
pnpm dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000)

## Directory Structure

Social Forge follows a clean, scalable architecture:

```
.
├── app                          # Next.js App Router structure
│   ├── (marketing)              # Public marketing pages
│   ├── (auth)                   # Authentication pages
│   ├── dashboard                # Protected dashboard area
│   ├── actions                  # Server actions
│   ├── api                      # API routes
│   └── generated                # Generated Prisma client
├── components                   # Reusable UI components
│   ├── auth                     # Authentication components
│   ├── ui                       # Shadcn/ui components
│   └── [shared components]      # App-specific components
├── lib                          # Utilities and configurations
├── prisma                       # Database schema and migrations
└── public                       # Static assets
```

## Architecture

Social Forge implements a **dual-layer architecture** with clean separation between authentication and business logic:

### Authentication Layer
- User identity and session management via **Better-auth**
- OAuth provider integration (Google, GitHub, etc.)
- Independent of business domain

### Application Layer
- Multi-tenant workspace system for client management
- Role-based access control (Owner, Admin, Member, Viewer)
- AI-powered website generation and transformation
- Project and client organization
- Core application business logic

### Workspace System
- **Workspaces**: Isolated environments for each client or project
- **Members**: Team collaboration with role-based permissions
- **Invitations**: Email-based workspace invitations with expiration
- **Session Context**: Active workspace tracking per user session

## Contributing

We love our contributors! Here's how you can contribute:

- [Open an issue](https://github.com/Codehagen/social-forge/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/Codehagen/social-forge/pull) to add new features/make quality-of-life improvements/fix bugs.

<a href="https://github.com/Codehagen/social-forge/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Codehagen/social-forge" />
</a>

## License

Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE.md) for more information.



