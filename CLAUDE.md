# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 application using the App Router architecture that creates a GitHub issue submission form with OAuth authentication.

### Core Components:
- **Authentication**: NextAuth.js with GitHub OAuth provider requiring `repo` scope
- **API Routes**: 
  - `/api/auth/[...nextauth]` - Handles GitHub OAuth flow
  - `/api/create-issue` - Creates GitHub issues using authenticated user's token
- **Main Page**: Form interface for submitting GitHub issues with title/body fields

### Key Dependencies:
- `@octokit/rest` - GitHub API client for issue creation
- `next-auth` - Authentication with GitHub OAuth
- `tailwindcss` - Styling framework

### Environment Variables Required:
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret  
- `GITHUB_REPO` - Target repository in "owner/repo" format

### TypeScript Configuration:
- Path alias `@/*` maps to `./src/*`
- Strict TypeScript settings enabled
- Next.js plugin configured for optimal bundling