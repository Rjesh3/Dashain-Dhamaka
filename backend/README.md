# Backend deployment

The API is a FastAPI service. For Vercel, the repository-root `vercel.json`
routes `/v1/*` requests to this service and sends all other requests to the
frontend. The service entrypoint is `index.py`.

## Vercel environment

Create a Neon PostgreSQL database and add its connection string as the
`DATABASE_URL` environment variable for the Vercel project. Copy the connection
string from Neon without committing it to this repository. The backend accepts
Neon's standard `postgresql://` connection string and uses the Psycopg 3 driver.

The backend creates its tables and seeds the default wheel configuration when
the service starts. SQLite is intended for local development only; Vercel
function filesystems are not persistent storage.

## Local development

Install dependencies from `requirements.txt`, set `DATABASE_URL` if needed,
then run `python -m uvicorn app.main:app --reload --port 8000` from this
directory. The frontend's Vite development proxy forwards `/v1/*` to port 8000.
