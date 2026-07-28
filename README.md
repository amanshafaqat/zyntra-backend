# Zyntra Backend

Production backend for Zyntra, built with Node.js, Express, TypeScript,
PostgreSQL, Prisma, and optional Redis, AI, SMTP, and ML integrations.

This repository contains everything required to create the database schema and
populate the initial university catalog. The separate source-data `DATABASE`
folder is not required at runtime and should not be added to this repository.

## Technology

- Node.js 22
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Optional Redis
- Docker
- Vitest

## Repository structure

```text
.
├── prisma/
│   ├── migrations/       Versioned PostgreSQL migrations
│   ├── schema.prisma     Database models
│   ├── seed.ts           Initial catalog data
│   └── catalog-data.ts   Catalog support data
├── src/
│   ├── config/           Environment and application configuration
│   ├── lib/              Prisma, Redis, mail, AI, and other integrations
│   ├── middlewares/      Express middleware
│   ├── modules/          Application features and API routes
│   ├── app.ts            Express application
│   └── server.ts         HTTP server entry point
├── tests/                Unit and integration tests
├── uploads/              Local upload directories
├── Dockerfile            Railway/production container
├── docker-compose.yml    Local PostgreSQL, Redis, ML, and API services
└── package.json
```

## Local requirements

- Node.js 22 LTS
- npm
- Docker Desktop with Docker Compose

Verify Node.js before installing:

```powershell
node --version
```

The version should start with `v22`.

## Local installation

Clone the repository and install dependencies:

```powershell
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm ci
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

The example configuration expects PostgreSQL on port `5432`.

Start PostgreSQL and Redis:

```powershell
docker compose up -d db redis
docker compose ps
```

Generate the Prisma client, apply migrations, and seed the catalog:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Start the development server:

```powershell
npm run dev
```

The API runs at:

```text
http://localhost:4000
```

Useful endpoints:

```text
GET http://localhost:4000/health
GET http://localhost:4000/api/v1/health
GET http://localhost:4000/docs
```

Check health from PowerShell:

```powershell
Invoke-RestMethod http://localhost:4000/health
```

## Commands

```powershell
npm run dev              # Development server with file watching
npm run build            # Compile production JavaScript
npm start                # Start compiled application
npm run typecheck        # Check TypeScript
npm test                 # Run tests
npm run prisma:generate  # Generate Prisma Client
npm run prisma:deploy    # Apply production migrations
npm run seed             # Seed local database
```

Integration tests require a running PostgreSQL database.

## Environment variables

Required:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL |
| `JWT_ACCESS_SECRET` | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| `CORS_ORIGINS` | Comma-separated trusted frontend origins |
| `PUBLIC_URL` | Public backend URL |

Production also requires valid SMTP configuration:

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | Use a secure SMTP connection |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `MAIL_FROM` | Sender name and address |

On Railway Free, Trial, and Hobby plans, outbound SMTP is disabled. Configure
`RESEND_API_KEY` instead; the backend will use Resend's HTTPS API and prefer it
over SMTP when both are present.

If you do not own a custom sending domain, `BREVO_API_KEY` is another HTTPS
option. Brevo can verify an individual sender address and is preferred after
Resend but before SMTP.

Optional integrations include:

```env
REDIS_URL=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
ML_SERVICE_URL=
EXTENSION_ORIGINS=
```

Never commit `.env` or production credentials. Commit only the example files.

## Deploying to Railway

### 1. Create the project

1. Push this repository to GitHub.
2. Create a Railway project.
3. Add a service from the GitHub repository.
4. Leave the Railway Root Directory empty when this backend is the repository
   root.
5. Railway will detect and build the included `Dockerfile`.

### 2. Add PostgreSQL

Inside the same Railway project:

1. Click **+ New**.
2. Select **Database → PostgreSQL**.
3. Add this variable to the backend service:

   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

If the database service has a different name, replace `Postgres` with its exact
Railway service name.

### 3. Configure migrations and seed data

Set the backend service's **Pre-Deploy Command** to:

```bash
npx prisma migrate deploy && node dist/prisma/seed.js
```

The production build compiles `prisma/seed.ts` to `dist/prisma/seed.js`.
Migrations create or update the tables, and the idempotent seed inserts or
updates the university catalog.

No SQL file, JSON upload, or separate `DATABASE` directory is required.

### 4. Configure variables

Add the following through Railway's Variables page:

```env
NODE_ENV=production
API_PREFIX=/api/v1
DATABASE_URL=${{Postgres.DATABASE_URL}}

JWT_ACCESS_SECRET=GENERATE_A_LONG_RANDOM_VALUE
JWT_REFRESH_SECRET=GENERATE_A_DIFFERENT_LONG_RANDOM_VALUE

CORS_ORIGINS=https://your-frontend.vercel.app
PUBLIC_URL=https://your-backend.up.railway.app

SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
MAIL_FROM="Zyntra <no-reply@yourdomain.com>"
RESEND_API_KEY=your-resend-api-key
BREVO_API_KEY=your-brevo-api-key
```

Railway supplies `PORT` automatically; do not hardcode it.

Generate two different JWT secrets locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Production secrets must be at least 32 characters, must be different, and must
not contain placeholder words such as `secret`, `test`, or `change-me`.

### 5. Networking and health

Generate a public Railway domain and set the healthcheck path to:

```text
/health
```

Verify the deployment:

```powershell
Invoke-RestMethod https://your-backend.up.railway.app/health
```

The expected response includes:

```text
status   : ok
database : up
```

### 6. Connect the frontend

Set this variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1
```

Set the exact Vercel origin in Railway:

```env
CORS_ORIGINS=https://your-frontend.vercel.app
```

Redeploy after changing environment variables.

## Persistent uploads

The backend stores uploaded avatars and documents under `uploads/`. Container
filesystems are not permanent, so attach a Railway Volume at:

```text
/app/uploads
```

Without a volume or external object storage, uploaded files may disappear after
a redeployment.

## Database files

The deployed database is not committed to Git. Railway runs PostgreSQL as a
managed service, while this repository provides:

```text
prisma/schema.prisma
prisma/migrations/
prisma/seed.ts
```

Together, these files reproduce the schema and initial catalog automatically.
The external archive/JSON `DATABASE` folder is useful only as an offline source
and validation reference.

## Security

- Never commit `.env`, database passwords, SMTP passwords, or API keys.
- Use different high-entropy JWT access and refresh secrets.
- Use HTTPS for production frontend and backend URLs.
- Configure exact trusted frontend origins instead of wildcard CORS.
- Back up the Railway PostgreSQL database regularly.
- Use a Railway Volume or object storage for uploaded documents.
