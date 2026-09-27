# TRACE

Temporal Reconstruction and Analysis of Cyber Evidence. TRACE turns evidence files into a structured, traceable incident record. It follows the required sequence: Unorganized Evidence → Information Extraction → Chronological Timeline → Missing Information → Contradiction Detection → Redaction → Incident Report.

## Requirements

- Node.js 20 or later
- npm 10 or later (pnpm is also supported)
- MongoDB 7 or later, local or hosted

## Install and configure

From this `TRACE` directory:

```powershell
Copy-Item .env.example backend/.env
```

Edit `backend/.env` and set a unique random `JWT_SECRET` (at least 24 characters), MongoDB URI, and admin password. Never commit `.env`.

Start local MongoDB using Docker:

```powershell
docker compose up -d mongo
```

Install dependencies and start both apps:

```powershell
npm install
npm run dev
```

Frontend: <http://localhost:5173>  
API: <http://localhost:4000/api/health>

Build and run tests:

```powershell
npm test
npm run build
```

If you prefer pnpm, install with `pnpm install`; run `pnpm --filter trace-backend dev` and `pnpm --filter trace-frontend dev` in separate terminals, and run the test/build scripts by workspace filter.

## First login

On first backend start, TRACE creates an `ADMIN` account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if that email does not exist. Change the example password before use. Regular signups always receive `AUTHORIZED_USER`; role selection is not available on signup. Admins can create accounts and change roles in the Admin page.

The demo scenario uses fictional TXT evidence and a reserved `.test` URL. From the dashboard, select **Load demo incident**. That action creates evidence files, hashes them, then runs the same extraction and processing services as uploaded evidence. No external AI/OCR service is needed for the demo.

## AI and OCR adapters

- `AIExtractionService` selects `DemoAIExtractionService` when `AI_API_KEY` is absent. With a key it uses a JSON-mode chat-completions endpoint configured by `AI_BASE_URL` and `AI_MODEL`; response data is schema validated before persistence.
- `OCRService` reads TXT/CSV files directly in demo mode. Image/PDF demo mode reports that text needs OCR rather than pretending to have recognized it. To enable an OCR service, set `OCR_API_KEY` and `OCR_API_URL`; the adapter sends a multipart `file` field with bearer authorization and expects JSON `{ "text": "..." }`.

## Project structure

```text
TRACE/
  backend/
    config/       Mongo connection
    middleware/   JWT, roles, incident access
    models/       User, Incident, Evidence, Entity, TimelineEvent, Finding
    routes/       auth, admin, incidents, demo
    services/     AI, OCR, processing, redaction, rule engines
    tests/        deterministic service and security tests
    server.js
  frontend/
    src/components/  layout, guards
    src/context/     auth state
    src/pages/       login, signup, dashboard, incident workspace, admin
    src/services/    Axios API client
  docker-compose.yml
  .env.example
```

## API routes

All `/api` routes except health and auth signup/login require `Authorization: Bearer <JWT>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Admin | `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id`, `GET /admin/incidents` |
| Incidents | `POST /incidents`, `GET /incidents`, `GET /incidents/:id`, `PATCH /incidents/:id` |
| Evidence | `POST /incidents/:id/evidence` (multipart `files`), `GET /incidents/:id/evidence`, `GET /evidence/:id`, `GET /evidence/:id/file` |
| Processing | `POST /incidents/:id/process` |
| Findings | `GET /incidents/:id/timeline`, `/missing`, `/conflicts`, `/relationships`, `/redacted` |
| Redaction | `POST /incidents/:id/redaction` |
| Reports | `GET /incidents/:id/report`, `/report/pdf`, `/export/csv` |
| Demo | `POST /demo` creates and processes the fictional incident |

## Judge walkthrough

1. Sign in with the admin account or create an authorized-user account.
2. Click **Load demo incident** on the dashboard.
3. Follow the seven stage bar. Open an event’s **View source** to inspect its source text, extracted facts, confidence, and SHA-256.
4. Review missing information and the explicitly linked amount inconsistency.
5. Review privacy-protected values and category controls. Original uploads remain separate; file access is authenticated.
6. Open the report to inspect provenance and direct relationship links; download the PDF and privacy-safe CSV.
7. For a live upload, create an incident, upload allowed files, then click **Process evidence**.

## Notes and limitations

- The supplied demo scenario files are synthetic and use `.test` domains. Real evidence requires configured OCR for image/PDF text recognition; the demo fallback does not invent OCR output.
- The LLM adapter validates returned JSON, but extraction still requires investigator review. It is not a forensic conclusion.
- The demo JWT is stored by the browser for the session; use HTTPS, a hardened deployment, secret rotation, restricted storage, and organization-specific retention controls before handling real sensitive evidence.
- Upload files are kept in `backend/uploads` and are excluded from version control. Back them up and apply retention controls appropriate to the deployment.
