# The Daily Pulse - News Aggregator

## Overview

A full-stack news aggregator web application that scrapes trending articles from multiple news sources across five categories: International, Sports, Technology, Health, and Science. The application provides a clean, newspaper-style interface for browsing and reading news articles with live web scraping capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **UI Components**: Radix UI primitives wrapped with custom styling, Framer Motion for animations
- **Typography**: Playfair Display for headings (serif), Inter for body text (sans-serif)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints under `/api/` prefix
- **Web Scraping**: Axios for HTTP requests, Cheerio for HTML parsing
- **Caching**: Persistent in-memory article cache that survives navigation and page refreshes, until manually triggered

### Data Flow
1. **On First Page Load**: Frontend requests articles via `/api/scrape-all` endpoint
2. **Cache Check**: Backend checks in-memory cache
3. **Initial Scrape** (if cache empty): Scraper fetches from news sources (BBC, Reuters, TechCrunch, etc.)
4. **Cache Storage**: Articles are parsed, normalized, and stored in persistent in-memory cache
5. **Subsequent Requests**: All navigation and page refreshes return cached articles instantly
6. **Manual Refresh Only**: User explicitly calls `POST /api/trigger-scrape` to refresh articles
7. **Vercel Compatible**: Caching works within serverless function lifetime; first request triggers scrape

### Data Flow Diagram
```
User navigates → Frontend requests /api/scrape-all
                     ↓
              Backend checks cache
                     ↓
         Is cache populated? YES → Return cached articles → NO heavy scraping
                     ↓ NO
              Scrape news sources
                     ↓
         Store in cache, return articles
                     ↓
        User navigates/refreshes
                     ↓
        Returns SAME cached articles (no re-scrape!)
                     ↓
        User clicks "Manual Trigger" (future feature)
                     ↓
         POST /api/trigger-scrape
                     ↓
        Clear cache, perform fresh scrape
```

### Key Design Decisions

**Persistent In-Memory Caching with Manual Refresh**
- Articles are scraped content, not user-generated data
- Cache persists across page navigation and refreshes (eliminates wasteful re-scraping)
- Only manual `/api/trigger-scrape` endpoint initiates scraping (prevents hammering news sources)
- Frontend uses `staleTime: Infinity` in React Query for zero re-fetches
- Reduces server load and improves user experience with instant page loads
- Vercel-compatible: cache works within single serverless function invocation

**Monorepo Structure**
- `client/` - React frontend application
- `server/` - Express backend with scraping logic
- `shared/` - Shared TypeScript types and database schema

**Database Schema (PostgreSQL with Drizzle ORM)**
- Currently minimal schema with users table for potential future authentication
- Schema defined in `shared/schema.ts` using Drizzle ORM
- Migrations stored in `migrations/` directory

## API Endpoints

### Cache-Aware Endpoints (Read-Only, No Scraping)
- `GET /api/scrape-all` - Returns all cached articles (performs initial scrape if cache empty)
- `GET /api/scrape/:category` - Returns cached articles for specific category
- `GET /api/featured` - Returns top 10 cached articles
- `GET /api/articles/:id` - Returns single article from cache
- `GET /api/articles` - Legacy endpoint with optional `?category=X` query param

### Manual Trigger Endpoint
- `POST /api/trigger-scrape` - **ONLY** endpoint that initiates scraping
  - Clears cache and performs fresh scrape of all categories
  - Returns newly scraped articles
  - Use this to manually refresh news content

### Health Check
- `GET /api/health` - Returns API status

## External Dependencies

### Database
- **PostgreSQL**: Primary database configured via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database access with schema defined in `shared/schema.ts`
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### News Sources (Scraping Targets)
- BBC News World section
- Reuters World news
- Additional sources per category defined in `server/scraper.ts`

### Third-Party Services
- No external API keys required for core functionality
- Scraping relies on public news websites

### Key NPM Packages
- **axios**: HTTP client for scraping requests
- **cheerio**: jQuery-like HTML parsing for server-side scraping
- **date-fns**: Date formatting and manipulation
- **framer-motion**: Animation library for UI transitions
- **zod**: Runtime type validation for API payloads