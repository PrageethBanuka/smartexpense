# SmartExpense – Personal Expense Tracker Web App

SmartExpense is a simple and user-friendly web application for tracking personal expenses. Users can register, log in, add expenses with categories (food, transport, bills, etc.), and view monthly summaries with charts.

**Tech stack:**
- Frontend: React (Create React App), Chart.js (reports visualization)
- Backend: Node.js + Express (REST API)
- Database: PostgreSQL (via Sequelize ORM)
- DevOps: GitHub Actions (CI/CD), Docker + Docker Compose, Terraform, Ansible
- Cloud: AWS EC2 deployment

## Feature Summary

- Auth: Register & login (JWT + bcrypt)
- Expenses: Add, list, edit, delete expenses (amount, category, date, optional note)
- Monthly Summary: Category distribution + last 6 months totals (Reports page)
- Charts: Pie (category % for selected month) & Bar (monthly totals)
- Protected Routes: Dashboard, Expenses, Reports require authentication

## Quick Start

### Local Development (Recommended for testing)

**Option A — Docker Compose:**
1. Ensure Docker Desktop is installed and running.
2. Start the stack:
   ```bash
   docker compose up --build
   ```
3. Open:
   - Frontend: http://localhost:3000
   - Backend health: http://localhost:4000/health
   - Postgres: localhost:5433

**Option B — Run locally without Docker:**
1. Backend:
   ```bash
   cd backend && npm install && npm run dev
   ```
2. Frontend:
   ```bash
   cd frontend && npm install && npm start
   ```
3. Visit http://localhost:3000

### Production Deployment (AWS)

**Quick deployment with automated script:**
```bash
./deploy.sh
```

**Manual deployment (see detailed guide):**
1. [Deploy Infrastructure with Terraform](terraform/README.md)
2. [Deploy Application with Ansible](ansible/README.md)
3. [Complete Deployment Guide](DEPLOYMENT.md)

## Repository Layout
- `backend/` — Express server, Sequelize models/migrations, auth routes
- `frontend/` — React app (CRA), pages/components for auth and dashboard
- `terraform/` — Infrastructure as Code (AWS)
- `ansible/` — Configuration management and deployment
- `.github/workflows/` — CI/CD pipelines
- `deploy.sh` — Automated deployment script

## CI/CD Pipeline

Automated GitHub Actions workflows:
1. **CI Workflow** (`.github/workflows/ci.yml`) - Build and test
2. **Docker GHCR** (`.github/workflows/docker-images.yml`) - Build and push to GitHub Container Registry
3. **Docker Hub** (`.github/workflows/dockerhub-images.yml`) - Build and push to Docker Hub

**Triggers:** Push to main/master branch or Pull Request

## API Endpoints (backend)

Auth:
- POST `/api/auth/register` { name, email, password }
- POST `/api/auth/login` { email, password }

Expenses (JWT required – send header `Authorization: Bearer <token>`):
- GET `/api/expenses` (optional `?month=YYYY-MM` to filter) – list user expenses
- POST `/api/expenses` { amount, category, occurredOn, note? } – create
- PUT `/api/expenses/:id` { amount?, category?, occurredOn?, note? } – update
- DELETE `/api/expenses/:id` – remove
- GET `/api/expenses/summary/month?month=YYYY-MM` – monthly category totals

Categories supported (frontend constants): `food`, `transport`, `bills`, `entertainment`, `other`

## Using the Expenses Page (frontend)
1. Log in (or register then login).
2. Navigate to Expenses.
3. Select month (defaults to current). Add new expense via the form.
4. Edit: click Edit, form populates, save updates.
5. Delete: click Delete, confirm.
6. Total for the month shown next to month selector.

## Reports Page
1. Choose month with the month input.
2. Pie chart shows category distribution for that month.
3. Bar chart shows totals for the last 6 months (including current).

## Example curl calls

Register:
```
curl -X POST http://localhost:4000/api/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"name":"Test","email":"test@example.com","password":"secret123"}'
```

Login (capture token):
```
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"test@example.com","password":"secret123"}' | jq -r .token)
```

Add Expense:
```
curl -X POST http://localhost:4000/api/expenses \
	-H "Authorization: Bearer $TOKEN" \
	-H 'Content-Type: application/json' \
	-d '{"amount":12.50,"category":"food","occurredOn":"2025-11-01","note":"Lunch"}'
```

List Current Month:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/expenses?month=$(date +%Y-%m)
```

Monthly Summary:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/expenses/summary/month?month=$(date +%Y-%m)
```

## Jenkins CI/CD (optional)

This repo includes a `Jenkinsfile` for a simple CI/CD pipeline that:
- Checks out code on GitHub push (via webhook)
- Installs backend deps and runs tests (placeholder)
- Builds frontend production bundle
- Builds Docker images for backend and frontend using `Dockerfile.prod`
- Tags images as `latest` and `sha-<commit>`
- Pushes to Docker Hub under your namespace (default `banukarajapaksha`)

Prereqs on Jenkins agent:
- Docker CLI/daemon available to the agent
- Node.js 18+ (for npm ci/build steps)

Jenkins setup:
- Create Credentials → `dockerhub` (Kind: Username with password; Username: your Docker Hub username; Password: Docker Hub Access Token)
- Create a Pipeline (or Multibranch) job pointing to this repo
- Install GitHub plugin and add a webhook in GitHub:
	- Payload URL: `https://<your-jenkins>/github-webhook/`
	- Content type: `application/json`
	- Event: `Just the push event`

Change Docker Hub namespace:
- Edit `Jenkinsfile` env `DOCKERHUB_USER` if your username differs.

### Expose Jenkins via ngrok (for GitHub webhooks)

If your Jenkins runs on `http://localhost:8080`, expose it with ngrok so GitHub can reach it:

1) Install and auth ngrok (macOS):
```
brew install --cask ngrok
ngrok config add-authtoken <YOUR_NGROK_TOKEN>
```

2) Start the tunnel using the helper script:
```
bash scripts/start-ngrok-jenkins.sh 8080
```

3) Copy the printed public URL and set:
- Jenkins URL (Manage Jenkins → Configure System): `https://<your-ngrok-domain>/`
- GitHub Webhook Payload URL: `https://<your-ngrok-domain>/github-webhook/`

Notes:
- Keep ngrok running while you want webhooks to work.
- Free ngrok domains change each run—update the webhook if it changes.


## Demo talking points
- Clear separation of concerns (frontend/backend)
- Environment-driven configuration (.env) for DB, API URLs, JWT secret
- Security basics: bcrypt password hashing, JWT-based sessions, CORS
- DevOps: containerized services, reproducible dev with Compose, CI checks

## DevOps additions
- Dockerfiles for backend and frontend
- docker-compose.yml orchestrating Postgres + API + UI
- Basic CI (GitHub Actions) to install and build on push/PR

## Troubleshooting
- Port 5432 already in use: the compose file maps Postgres to host port 5433 to avoid conflicts. If you need to connect from your host, use `-p 5433` in psql or set the connection string to `postgres://user:pass@localhost:5433/db`.

Connect to Postgres container psql:
```
docker exec -it smartexpense-postgres psql -U smartexpense -d smartexpense
```

### Jenkins/GitHub Webhook Troubleshooting

If Jenkins only builds after a manual "Scan Repository Now" and not immediately on push, use this checklist:

1. Jenkins Root URL
	- Manage Jenkins → Configure System → Jenkins URL must exactly match the public ngrok (or reverse proxy) URL, e.g. `https://example-tunnel.ngrok-free.dev/` (include trailing slash). Save after changing.
2. GitHub Webhook
	- In GitHub repo Settings → Webhooks, Payload URL must be `https://<public-domain>/github-webhook/` (trailing slash required). Content type: `application/json`. Event: push (or all if desired).
3. Webhook Deliveries
	- Open the latest delivery. A push should yield 200/201/204. A 302 followed by 200 is fine. 405 means HEAD/GET was sent (normal if you manually curl with -I). 403/404 indicates URL or secret issues.
4. Secret Consistency (optional)
	- If you set a secret in GitHub, configure the same secret in Jenkins GitHub plugin global settings; mismatch can drop events silently.
5. Required Plugins
	- Ensure these are installed & up to date: GitHub Branch Source, GitHub Integration, GitHub plugin. Restart Jenkins after installation.
6. Multibranch Job Configuration
	- In the job: Source → GitHub. Add credentials (PAT or GitHub App) with repo + hooks scope. No restrictive branch filters excluding `dev`. Jenkinsfile path matches `Jenkinsfile` at repo root.
7. Credentials Scope
	- PAT must have `repo` and `admin:repo_hook` (or use a GitHub App with appropriate permissions). Without hook permission Jenkins may not register reliably.
8. Logs
	- Manage Jenkins → System Log. Add a recorder for `org.jenkinsci.plugins.github`. Push a commit; look for "Received POST /github-webhook/". Absence means request never reached Jenkins.
9. Ngrok Rotation
	- Free ngrok URLs change each start; update BOTH Jenkins Root URL and GitHub webhook each time. A stale webhook keeps pointing to the old domain.
10. Manual Test POST
	- Simulate GitHub push: `curl -X POST https://<public-domain>/github-webhook/ -H 'Content-Type: application/json' -d '{"zen":"test","hook_id":0}'` – expect 200/201/204 (may 403 if secret enforced). This confirms network reachability.
11. CSRF Protection
	- Default Jenkins CSRF (crumb) should not block GitHub plugin endpoint. If customized security breaks it, temporarily disable crumb protection (only for diagnosis) then re-enable.
12. Fallback Strategy
	- If webhook reliability remains poor, schedule periodic scans (e.g. every 1 minute) as a stopgap: job configuration → "Scan Repository Triggers". Webhooks are still preferred for immediate builds.

After fixing, push a no-op commit:
```
git commit --allow-empty -m "chore: webhook test"
git push origin dev
```
Then re-check webhook delivery and Jenkins build list for `dev`.



