Deployment guide
================

This project includes a small Express backend and the static frontend in `public/`.

Quick start (Docker)
---------------------

1. Create a `.env` with your production values (MONGO_URI, JWT_SECRET, etc.).

2. Build and run with docker-compose (local dev with embedded Mongo):

   ```sh
   docker-compose up --build -d
   ```

3. The API will be available at `http://localhost:4000` and the frontend served from the same host.

Deploy to a cloud provider
--------------------------

- If you deploy to a PaaS (Heroku, Render, Railway), you can use `Procfile` and set environment variables in the dashboard.
- If you use a container service (AWS ECS, DigitalOcean App Platform), build the image using the included `Dockerfile` and push the image to a registry.

Environment variables
---------------------
- `PORT` (default 4000)
- `MONGO_URI` (required for production if you don't use docker-compose's mongo)
- `MONGO_DB_NAME` (optional, default `barver`)
- `USER_COLLECTION` (optional, default `users`)
- `JWT_SECRET` (required)

Notes
-----
- Do not commit `.env` to Git. Keep secrets in the host provider's secret store.
- For production use a managed MongoDB (Atlas). Set `MONGO_URI` accordingly.
