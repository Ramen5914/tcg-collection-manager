# TCG Collection Manager

Dockerized Next.js application with a PostgreSQL database and self-hosted image delivery using MinIO plus imgproxy.

## Stack

- Next.js App Router
- PostgreSQL (data persistence)
- Prisma ORM
- MinIO (object storage)
- imgproxy (image transform plus delivery)
- Docker Compose (local orchestration)

## Services

- Web app: http://localhost:3000
- API health endpoint: http://localhost:3000/api/health
- PostgreSQL: localhost:5432
- MinIO API: http://localhost:9000
- MinIO console: http://localhost:9001
- imgproxy: http://localhost:8080

## First Setup

1. Create dual environment files:

	PowerShell:
	Copy-Item .env.example .env.host
	Copy-Item .env.example .env.docker

	Bash:
	cp .env.example .env.host
	cp .env.example .env.docker

	Then set connection host values:
	- .env.host should use localhost for DATABASE_URL and MINIO_ENDPOINT.
	- .env.docker should use db and minio hostnames.

2. Start the full stack:

	pnpm docker:up

3. Run migrations (host CLI defaults to .env.host):

	pnpm db:migrate

4. Open the app at http://localhost:3000

## Day-to-Day Commands

- Start stack: pnpm docker:up
- Stop stack: pnpm docker:down
- Follow logs: pnpm docker:logs
- Generate Prisma client: pnpm db:generate
- Open Prisma Studio: pnpm db:studio

Prisma env file override examples:

- PowerShell host default: pnpm db:migrate --name your_change
- PowerShell with docker env: $env:ENV_FILE=".env.docker"; pnpm db:migrate --name your_change

## Catalog Workflow

- Regular users can only add cards from the curated catalog shown in the app.
- Catalog management is restricted to the admin panel at /admin.
- Set ADMIN_ACCESS_KEY in your environment and open /admin?key=YOUR_ADMIN_ACCESS_KEY.
- Admin can create sets, create cards within sets, and upload/replace images for both sets and cards.

## Image Pipeline

1. Store card images in MinIO bucket configured by MINIO_BUCKET.
2. Persist object keys in the Card.imageKey database column.
3. Build signed imgproxy URLs from image keys.
4. Render signed URLs through Next Image component.

## Project Structure

- app/api/cards/route.ts: CRUD starter route for cards
- app/api/catalog/route.ts: public curated catalog (sets and cards)
- app/api/images/route.ts: multipart image upload to MinIO
- app/api/health/route.ts: runtime health check
- app/page.tsx: user collection UI with catalog-based picker
- app/admin/page.tsx: restricted catalog management UI
- lib/db.ts: Prisma singleton client
- lib/env.ts: typed environment validation
- lib/imgproxy.ts: signed imgproxy URL generation
- lib/storage.ts: MinIO upload helper
- prisma/schema.prisma: database schema for sets, catalog cards, and collection entries

## Production Notes

- Dockerfile uses Next standalone output for smaller runtime image.
- Set secure random IMGPROXY_KEY and IMGPROXY_SALT in production.
- Consider private MinIO buckets and signed object access once auth is added.
