# PulseIQ.AI

> Live locally at: http://localhost:3000/

PulseIQ.AI is an observability and incident analysis platform for engineering teams. It collects service logs, correlates failures across environments, and uses Gemini-powered analysis to identify likely root causes, recommend recovery actions, and surface active incidents in a dashboard.

This project is built with Next.js, MongoDB, Redis, Better Auth, and Google Gemini.

## Start the app

Run the app locally with:

```bash
npm run dev
```

Then open http://localhost:3000/ in your browser.

## Features

- Centralized project dashboard for monitoring multiple services
- API-based log ingestion using a per-project API key
- Incident detection and severity classification
- AI-generated root cause summaries and mitigation recommendations
- Redis-backed rate limiting and error tracking
- Authentication with email/password and Google OAuth
- Project and log management through a Next.js app

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB / Mongoose
- Redis / ioredis
- Better Auth
- Google Generative AI (Gemini)

## Project Structure

```bash
.
├── app/
│   ├── api/
│   ├── components/
│   ├── docs/
│   ├── login/
│   ├── signup/
│   └── ...
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── mongodb.ts
│   ├── redisClient.ts
│   └── ...
├── src/
│   ├── DB/
│   └── utils/
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+ or newer
- MongoDB running locally or in a managed service
- Redis running locally or in a managed service
- A Google Cloud project with Gemini API access
- A Google OAuth app configured if you want social sign-in

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
DB_URL=mongodb://localhost:27017/pulseiq-ai
DB_NAME=pulseiq-ai

# Redis
REDIS_URL=redis://localhost:6379

# Gemini
GEMINI_API_KEY=your-google-gemini-api-key
```

Notes:

- `DB_URL` should point to your MongoDB instance.
- `REDIS_URL` should point to your Redis instance.
- `NEXT_PUBLIC_APP_URL` is used by the auth client for local development.
- If you do not enable Google OAuth, you can still use email/password auth.

## Installation

Install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Typical Workflow

1. Sign up or log in to the app.
2. Create a new project from the dashboard.
3. Copy the generated project API key.
4. Send logs to the ingestion API using the project key.
5. Review incidents, root cause suggestions, and service health in the dashboard.

## Log Ingestion API

The app exposes an endpoint for ingesting log events:

### Endpoint

```http
POST /api/logs
```

### Headers

```http
x-api-key: <project-api-key>
Content-Type: application/json
```

### Example request

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "x-api-key: YOUR_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "auth-service",
    "level": "ERROR",
    "message": "Connection pool exhausted while authenticating user",
    "environment": "production",
    "metadata": {
      "region": "us-east-1",
      "requestId": "req_123"
    }
  }'
```

### Supported levels

- INFO
- WARN
- ERROR
- DEBUG

## Auth and Project APIs

The app includes user and project APIs for authentication and project management, including:

- `/api/projects`
- `/api/projects/[id]`
- `/api/incidents`
- `/api/incidents/[id]`

These routes are protected by session validation and are used by the dashboard UI.

## Dashboard Features

The dashboard includes:

- project list and overview cards
- open incident counts
- total log counts and last activity
- project-level API key management
- incident and logs workspace pages

## AI Analysis

The application uses Gemini to generate incident insight using the service name, environment, severity, and collected logs. This logic lives in the AI utilities under `src/utils` and is used to summarize incidents and provide suggested remediation.

## Production Notes

- Use a real MongoDB connection string and Redis instance in production.
- Keep secrets in environment variables or your deployment platform secret manager.
- Configure Google OAuth credentials for social sign-in in production.
- Ensure your app URL is set correctly for auth callbacks.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # build the app for production
npm run start   # run the production build
npm run lint    # run ESLint
```

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant checks.
5. Open a pull request with a clear summary.

## License

This project is currently unlicensed unless you add a license file and specify terms for distribution.

## Notes

This repository is a custom observability product, not the default Next.js starter app. The README above reflects the actual implementation and runtime dependencies used in this project.
